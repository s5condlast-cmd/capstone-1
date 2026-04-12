import { NextRequest, NextResponse } from "next/server";
import { analyzeWords } from "@/lib/analyzers/rephrase-analyzer";
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
    const { text, fieldName } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured" },
        { status: 500 }
      );
    }

    const suggestions = await analyzeWords(text, process.env.GROQ_API_KEY);

    return NextResponse.json({
      suggestions,
      fieldName,
    });
  } catch (error: unknown) {
    console.error("Rephrase analyze error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
