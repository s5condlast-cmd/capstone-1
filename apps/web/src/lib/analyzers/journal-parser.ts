import { getCachedResponse, recordAIUsage, canUseAI } from "@/lib/usage-tracker";

interface JournalData {
  activities: string;
  tools: string;
  problems: string;
  lessonsLearned: string;
  totalHours: string;
}

function compressText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/,+/g, ",")
    .replace(/\.+/g, ".")
    .trim();
}

async function generateWithGroqLimit(
  prompt: string,
  apiKey: string,
  maxTokens: number = 600
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

export async function generateJournalFromSpeech(
  transcription: string,
  apiKey: string
): Promise<{ data: JournalData; cached: boolean }> {
  const canUse = canUseAI();
  if (!canUse.allowed) {
    throw new Error(canUse.message);
  }

  const compressed = compressText(transcription);
  
  const cached = getCachedResponse(compressed);
  if (cached) {
    try {
      return {
        data: JSON.parse(cached),
        cached: true,
      };
    } catch {
      // If cache is corrupted, continue to generate
    }
  }

  const systemPrompt = `You are a journal formatter. Parse the student's voice transcription and extract daily journal data.

Return ONLY a valid JSON object with this exact structure - no markdown, no explanation:
{
  "activities": "What the student did today - be specific, list all tasks mentioned, start with 'I' or '- '",
  "tools": "Tools and technologies mentioned - programming languages, software, frameworks, tools, databases, etc.",
  "problems": "Problems or challenges encountered today",
  "lessonsLearned": "What the student learned today - new skills, insights, realizations",
  "totalHours": "How many hours did they work? Extract from speech or use 8 as default if not specified"
}

Rules:
- activities: List ALL tasks mentioned - be very detailed
- tools: Include ALL tools mentioned - languages, frameworks, software, hardware, databases
- problems: Describe challenges clearly
- lessonsLearned: Be specific about what was learned
- totalHours: Extract number from speech (e.g., '8 hours' = '8', 'half day' = '4', default to '8')
- Output valid JSON only, no markdown code blocks`;

  const userPrompt = `Parse this journal transcription:\n\n"${compressed}"`;

  try {
    const response = await generateWithGroqLimit(`${systemPrompt}\n\n${userPrompt}`, apiKey, 600);
    
    let cleanResponse = response
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedData: JournalData;
    
    try {
      parsedData = JSON.parse(cleanResponse);
      
      // Ensure all fields exist
      parsedData.activities = parsedData.activities || "";
      parsedData.tools = parsedData.tools || "";
      parsedData.problems = parsedData.problems || "";
      parsedData.lessonsLearned = parsedData.lessonsLearned || "";
      parsedData.totalHours = parsedData.totalHours || "8";
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Response:", cleanResponse);
      // Fallback: use transcription as activities
      parsedData = {
        activities: compressed,
        tools: "",
        problems: "",
        lessonsLearned: "",
        totalHours: "8",
      };
    }

    recordAIUsage(compressed, JSON.stringify(parsedData));

    return {
      data: parsedData,
      cached: false,
    };
  } catch (error) {
    console.error("Journal generation error:", error);
    throw error;
  }
}

export type { JournalData };
