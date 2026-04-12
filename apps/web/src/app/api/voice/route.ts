import { NextRequest, NextResponse } from "next/server";
import { transcribeWithWhisper } from "@/lib/ai/whisper";
import { aiRateLimiter } from "@/lib/ai/rate-limiter";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "anonymous";
}

async function summarizeWithGroq(text: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes daily journal entries. Create a concise bullet-point summary of the activities mentioned. Keep it brief and clear."
        },
        {
          role: "user",
          content: `Please summarize the following journal entry into bullet points:\n\n${text}`
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to summarize with Groq");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function generateJournalWithGroq(summary: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a professional journal writer. Generate a detailed, well-structured daily journal entry from the provided summary. Write it in a professional but personal tone, as if writing a reflective diary entry about workplace practicum activities."
        },
        {
          role: "user",
          content: `Generate a detailed journal entry from this summary:\n\n${summary}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate journal with Groq");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimit = aiRateLimiter.check(clientIP);

  const headers = {
    "X-RateLimit-Limit": aiRateLimiter.config.maxRequests.toString(),
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": rateLimit.resetIn.toString(),
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json();
    const { mode, audioData, summary } = body;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured" },
        { status: 500, headers }
      );
    }

    // Mode 1: Voice recording - transcribe and summarize
    if (mode === "transcribe") {
      if (!audioData) {
        return NextResponse.json(
          { error: "Audio data is required" },
          { status: 400, headers }
        );
      }

      // Convert base64 to blob
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: "audio/webm" });

      // Transcribe with Whisper
      const transcription = await transcribeWithWhisper(
        audioBlob,
        process.env.GROQ_API_KEY,
        "en"
      );

      // Summarize with Llama
      const summarized = await summarizeWithGroq(
        transcription.text,
        process.env.GROQ_API_KEY
      );

      return NextResponse.json(
        {
          transcription: transcription.text,
          summary: summarized,
          language: transcription.language,
        },
        { headers }
      );
    }

    // Mode 2: Generate full journal from summary
    if (mode === "generate") {
      if (!summary) {
        return NextResponse.json(
          { error: "Summary is required" },
          { status: 400, headers }
        );
      }

      const journal = await generateJournalWithGroq(
        summary,
        process.env.GROQ_API_KEY
      );

      return NextResponse.json(
        { journal },
        { headers }
      );
    }

    return NextResponse.json(
      { error: "Invalid mode. Use 'transcribe' or 'generate'" },
      { status: 400, headers }
    );
  } catch (error: unknown) {
    console.error("Voice API error:", error);
    const message = error instanceof Error ? error.message : "Operation failed";
    return NextResponse.json({ error: message }, { status: 500, headers });
  }
}