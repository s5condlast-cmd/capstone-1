import { NextRequest, NextResponse } from "next/server";
import { rephraseWord } from "@/lib/analyzers/rephrase-analyzer";
import { aiRateLimiter } from "@/lib/ai/rate-limiter";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "anonymous";
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimit = aiRateLimiter.check(clientIP);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait." },
      { status: 429 }
    );
  }

  try {
    const { word, sentence } = await request.json();

    if (!word?.trim() || !sentence?.trim()) {
      return NextResponse.json(
        { error: "Word and sentence are required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured" },
        { status: 500 }
      );
    }

    const suggestions = await rephraseWord(word, sentence, process.env.GROQ_API_KEY);

    return NextResponse.json({
      suggestions,
    });
  } catch (error: unknown) {
    console.error("Rephrase suggestions error:", error);
    const message = error instanceof Error ? error.message : "Failed to get suggestions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
