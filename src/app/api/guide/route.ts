import { NextResponse } from "next/server";
import { buildGuideInstructions } from "@/lib/guide/knowledge";
import { isGuideLanguage, type GuideLanguage } from "@/lib/guide/languages";

type GuideMessage = {
  role: "user" | "assistant";
  content: string;
};

type GuideRequest = {
  messages?: GuideMessage[];
  language?: GuideLanguage;
};

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 4000;

function validMessages(value: unknown): value is GuideMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return false;
  return value.every((message) => {
    if (!message || typeof message !== "object") return false;
    const candidate = message as Partial<GuideMessage>;
    return (
      (candidate.role === "user" || candidate.role === "assistant") &&
      typeof candidate.content === "string" &&
      candidate.content.trim().length > 0 &&
      candidate.content.length <= MAX_MESSAGE_LENGTH
    );
  });
}

function extractText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const result = payload as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown }> }>;
  };

  if (typeof result.output_text === "string" && result.output_text.trim()) {
    return result.output_text.trim();
  }

  const text = result.output?.[0]?.content?.[0]?.text;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

export async function POST(request: Request) {
  let body: GuideRequest;

  try {
    body = (await request.json()) as GuideRequest;
  } catch {
    return NextResponse.json({ error: "I could not read that request. Please try again." }, { status: 400 });
  }

  if (!validMessages(body.messages)) {
    return NextResponse.json(
      { error: "Please send a short question or message to BiasLens Guide." },
      { status: 400 },
    );
  }

  const language: GuideLanguage = isGuideLanguage(body.language) ? body.language : "en";
  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  const openAIKey = process.env.OPENAI_API_KEY;

  if (!gatewayToken && !openAIKey) {
    return NextResponse.json(
      { error: "BiasLens Guide is temporarily unavailable. Please contact hello@beaccessible.co.za if you need assistance." },
      { status: 503 },
    );
  }

  const usingGateway = Boolean(gatewayToken);
  const endpoint = usingGateway
    ? "https://ai-gateway.vercel.sh/v1/responses"
    : "https://api.openai.com/v1/responses";
  const token = gatewayToken || openAIKey;
  const model = usingGateway
    ? process.env.BIASLENS_GUIDE_MODEL || "openai/gpt-5.6-luna"
    : process.env.BIASLENS_GUIDE_OPENAI_MODEL || "gpt-5.6";

  const input = body.messages.map((message) => ({
    type: "message",
    role: message.role,
    content: message.content,
  }));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        instructions: buildGuideInstructions(language),
        input,
        max_output_tokens: 900,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.error("BiasLens Guide model request failed", response.status, await response.text());
      return NextResponse.json(
        { error: "BiasLens Guide could not answer just now. Please try again, or contact hello@beaccessible.co.za." },
        { status: 502 },
      );
    }

    const payload: unknown = await response.json();
    const text = extractText(payload);

    if (!text) {
      return NextResponse.json(
        { error: "BiasLens Guide did not return a readable answer. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ text, language });
  } catch (error) {
    console.error("BiasLens Guide request error", error);
    return NextResponse.json(
      { error: "BiasLens Guide could not connect just now. Please try again, or contact hello@beaccessible.co.za." },
      { status: 502 },
    );
  }
}
