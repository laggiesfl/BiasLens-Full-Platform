import { generateText } from "ai";
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
const DEFAULT_GUIDE_MODEL = "inclusionai/ling-3.0-flash-free";

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

  try {
    const { text } = await generateText({
      model: process.env.BIASLENS_GUIDE_MODEL || DEFAULT_GUIDE_MODEL,
      system: buildGuideInstructions(language),
      messages: body.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      maxOutputTokens: 900,
    });

    if (!text.trim()) {
      return NextResponse.json(
        { error: "BiasLens Guide did not return a readable answer. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ text: text.trim(), language });
  } catch (error) {
    console.error("BiasLens Guide request error", error);
    return NextResponse.json(
      { error: "BiasLens Guide could not answer just now. Please try again, or contact hello@beaccessible.co.za." },
      { status: 502 },
    );
  }
}
