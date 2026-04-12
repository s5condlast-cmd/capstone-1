import { recordImprovement } from "@/lib/usage-tracker";

export interface FieldSuggestion {
  field: "activities" | "tools" | "problems" | "lessonsLearned";
  originalText: string;
  improvedText: string;
  explanation: string;
  score: number;
}

export interface ImprovementAnalysis {
  suggestions: FieldSuggestion[];
  overallScore: number;
  summary: string;
}

async function generateWithGroq(
  prompt: string,
  apiKey: string,
  maxTokens: number = 800
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
      temperature: 0.3,
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

export async function analyzeImprovements(
  activities: string,
  tools: string,
  problems: string,
  lessonsLearned: string,
  apiKey: string
): Promise<ImprovementAnalysis> {
  const systemPrompt = `You are a journal writing assistant. Analyze the OJT daily journal entry and provide specific improvement suggestions.

Return ONLY a valid JSON object with this exact structure - no markdown, no explanation:
{
  "suggestions": [
    {
      "field": "activities",
      "originalText": "the original text to improve",
      "improvedText": "the improved version with more detail",
      "explanation": "brief explanation of what was improved",
      "score": 1-10
    },
    {
      "field": "tools",
      "originalText": "the original text",
      "improvedText": "the improved version",
      "explanation": "explanation",
      "score": 1-10
    },
    {
      "field": "problems", 
      "originalText": "the original text",
      "improvedText": "the improved version",
      "explanation": "explanation",
      "score": 1-10
    },
    {
      "field": "lessonsLearned",
      "originalText": "the original text",
      "improvedText": "the improved version", 
      "explanation": "explanation",
      "score": 1-10
    }
  ],
  "overallScore": 1-10,
  "summary": "Overall assessment and what to focus on"
}

Rules:
- Each field MUST have a suggestion (even if minimal improvement needed)
- Be specific about what to improve
- improvedText should be a direct replacement for originalText
- Score: 1-3 (needs major improvement), 4-6 (decent), 7-10 (excellent)
- If a field is empty or very short, score it low and provide guidance
- Only suggest improvements if genuinely helpful
- improvedText should be concise but detailed`;

  const userPrompt = `Analyze this OJT journal entry:

ACTIVITIES:
${activities || "[Empty - suggest to add activities]"}

TOOLS & TECHNOLOGIES:
${tools || "[Empty - suggest to list tools used]"}

PROBLEMS ENCOUNTERED:
${problems || "[Empty - suggest to add problems]"}

LESSONS LEARNED:
${lessonsLearned || "[Empty - suggest to add lessons]"}`;

  try {
    const response = await generateWithGroq(
      `${systemPrompt}\n\n${userPrompt}`,
      apiKey,
      800
    );

    let cleanResponse = response
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedData: ImprovementAnalysis;
    
    try {
      parsedData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Response:", cleanResponse);
      // Fallback
      parsedData = {
        suggestions: [],
        overallScore: 0,
        summary: "Unable to analyze. Please try again.",
      };
    }

    recordImprovement();

    return parsedData;
  } catch (error) {
    console.error("Improvement analysis error:", error);
    throw error;
  }
}
