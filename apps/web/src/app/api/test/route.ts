import { NextRequest, NextResponse } from "next/server";
import { aiRateLimiter } from "@/lib/ai/rate-limiter";
import { generateWithGroq } from "@/lib/ai/groq";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "anonymous";
  return ip;
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API is working",
    provider: "Groq",
    timestamp: new Date().toISOString(),
  });
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
      {
        error: "Rate limit exceeded",
        message: `Too many requests. Please wait ${rateLimit.resetIn} seconds.`,
        retryAfter: rateLimit.resetIn,
      },
      { status: 429, headers }
    );
  }

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400, headers });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500, headers }
      );
    }

    const response = await generateWithGroq(prompt, process.env.GROQ_API_KEY);

    return NextResponse.json(
      {
        response,
        provider: "Groq",
        model: "llama-3.1-8b-instant",
      },
      { headers }
    );
  } catch (error: unknown) {
    console.error("AI API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `AI API Error: ${errorMessage}` },
      { status: 500, headers }
    );
  }
}
