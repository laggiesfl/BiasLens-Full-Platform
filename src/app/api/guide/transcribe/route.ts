import { gateway } from "@ai-sdk/gateway";
import { experimental_transcribe as transcribe } from "ai";
import { NextResponse } from "next/server";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const DEFAULT_TRANSCRIPTION_MODEL = "fish-audio/transcribe-1";

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "I could not read that recording. Please try again." }, { status: 400 });
  }

  const audio = formData.get("audio");

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "No voice recording was received." }, { status: 400 });
  }

  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "That recording is too long. Please keep voice questions short." }, { status: 413 });
  }

  try {
    const result = await transcribe({
      model: gateway.transcriptionModel(
        process.env.BIASLENS_GUIDE_TRANSCRIPTION_MODEL || DEFAULT_TRANSCRIPTION_MODEL,
      ),
      audio: new Uint8Array(await audio.arrayBuffer()),
      abortSignal: AbortSignal.timeout(30_000),
    });

    const text = result.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "I could not hear a clear question. Please try again." }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("BiasLens Guide transcription error", error);
    return NextResponse.json(
      { error: "Voice input could not be transcribed just now. You can still type your question." },
      { status: 502 },
    );
  }
}
