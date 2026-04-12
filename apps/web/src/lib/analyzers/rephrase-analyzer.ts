import { recordImprovement, canImprove } from "@/lib/usage-tracker";

export interface WordSuggestion {
  originalWord: string;
  sentence: string;
  suggestions: string[];
  grammarFix?: {
    original: string;
    fixed: string;
    explanation: string;
  };
  scores: {
    wordScore: number;
    grammarScore: number;
  };
}

async function generateWithGroq(
  prompt: string,
  apiKey: string,
  maxTokens: number = 1000
): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "AI generation failed");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function analyzeWords(
  text: string,
  apiKey: string
): Promise<WordSuggestion[]> {
  const canImproveResult = canImprove();
  if (!canImproveResult.allowed) {
    throw new Error(canImproveResult.message);
  }

  const systemPrompt = `You are a writing improvement assistant. Analyze text and identify words/phrases that can be improved.

Return ONLY a valid JSON array. Each object should have:
{
  "originalWord": "the word/phrase to improve",
  "sentence": "the full sentence containing this word",
  "suggestions": ["alt1", "alt2", ..., "alt10"],
  "grammarFix": {
    "original": "grammatically incorrect phrase",
    "fixed": "corrected phrase",
    "explanation": "brief grammar explanation"
  },
  "scores": {
    "wordScore": 1-10,
    "grammarScore": 1-10
  }
}

Rules:
- Return 5-10 word suggestions per text (prioritize weak/common words)
- suggestions: exactly 10 alternatives, variety of formality levels
- Include 1-3 grammar fixes if found, otherwise null
- wordScore: how good is the original word (lower = more needs improvement)
- grammarScore: how grammatically correct is the sentence
- Identify: verbs, adjectives, adverbs, weak phrases, repetition
- Do NOT suggest changes for: proper nouns, technical terms, required vocabulary`;

  const userPrompt = `Analyze this text for improvement:\n\n"${text}"`;

  try {
    const response = await generateWithGroq(
      `${systemPrompt}\n\n${userPrompt}`,
      apiKey,
      1000
    );

    let cleanResponse = response
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Handle if response is just a single object instead of array
    if (!cleanResponse.startsWith("[")) {
      cleanResponse = `[${cleanResponse}]`;
    }

    let parsedData: WordSuggestion[];
    
    try {
      parsedData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Response:", cleanResponse);
      parsedData = [];
    }

    recordImprovement();
    return parsedData;
  } catch (error) {
    console.error("Word analysis error:", error);
    throw error;
  }
}

export async function rephraseWord(
  word: string,
  sentence: string,
  apiKey: string
): Promise<string[]> {
  const systemPrompt = `You are a writing assistant. Provide alternative phrases for a word in context.

Return ONLY a JSON array of 10 alternative phrases/words:
["alt1", "alt2", "alt3", ..., "alt10"]

Rules:
- Give 10 diverse alternatives
- Include different formality levels (formal, casual, professional)
- Include synonyms and related phrases
- Keep same meaning as original word
- Short phrases only (1-3 words max)
- No explanations, just the array`;

  const userPrompt = `Word: "${word}"\nSentence: "${sentence}"\n\nProvide 10 alternative phrases:`;

  try {
    const response = await generateWithGroq(
      `${systemPrompt}\n\n${userPrompt}`,
      apiKey,
      300
    );

    let cleanResponse = response
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let suggestions: string[];
    
    try {
      suggestions = JSON.parse(cleanResponse);
    } catch {
      // Try to extract suggestions from text
      suggestions = cleanResponse
        .split(/[,\n]/)
        .map((s: string) => s.trim().replace(/^["']|["']$/g, ""))
        .filter((s: string) => s.length > 0)
        .slice(0, 10);
    }

    return suggestions;
  } catch (error) {
    console.error("Rephrase error:", error);
    throw error;
  }
}
