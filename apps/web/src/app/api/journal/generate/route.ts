import { NextRequest, NextResponse } from "next/server";
import { generateJournalFromSpeech } from "@/lib/analyzers/journal-parser";
import { aiRateLimiter } from "@/lib/ai/rate-limiter";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "anonymous";
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
    const { transcription } = await request.json();

    if (!transcription?.trim()) {
      return NextResponse.json(
        { error: "Transcription is required" },
        { status: 400, headers }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured" },
        { status: 500, headers }
      );
    }

    const result = await generateJournalFromSpeech(
      transcription,
      process.env.GROQ_API_KEY
    );

    return NextResponse.json(
      {
        data: result.data,
        cached: result.cached,
        message: result.cached
          ? "Retrieved from cache"
          : "Generated successfully",
      },
      { headers }
    );
  } catch (error: unknown) {
    console.error("Journal generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500, headers });
  }
}
