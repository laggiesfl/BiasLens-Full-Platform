import { generateText } from "ai";
import { NextResponse } from "next/server";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const DEFAULT_AUDIO_MODEL = "google/gemini-2.5-flash-lite";
const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/ogg",
  "audio/wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/aac",
  "audio/flac",
  "audio/x-aiff",
  "audio/aiff",
]);

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "I could not read that recording. Please try again." }, { status: 400 });
  }

  const audio = formData.get("audio");
  const language = String(formData.get("language") || "").trim();

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "No voice recording was received." }, { status: 400 });
  }

  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "That recording is too long. Please keep voice questions short." }, { status: 413 });
  }

  const mediaType = (audio.type || "audio/ogg").split(";")[0].toLowerCase();
  if (!SUPPORTED_AUDIO_TYPES.has(mediaType)) {
    return NextResponse.json(
      { error: "That browser recording format is not supported yet. You can still type your question." },
      { status: 415 },
    );
  }

  try {
    const { text } = await generateText({
      model: process.env.BIASLENS_GUIDE_AUDIO_MODEL || DEFAULT_AUDIO_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Transcribe this short voice question accurately${language ? ` in ${language}` : ""}. Return only the spoken words as plain text. Do not answer the question and do not add commentary.`,
            },
            {
              type: "file",
              data: new Uint8Array(await audio.arrayBuffer()),
              mediaType,
              filename: audio.name || "biaslens-question.ogg",
            },
          ],
        },
      ],
      maxOutputTokens: 300,
      abortSignal: AbortSignal.timeout(30_000),
    });

    const transcript = text.trim();
    if (!transcript) {
      return NextResponse.json({ error: "I could not hear a clear question. Please try again." }, { status: 422 });
    }

    return NextResponse.json({ text: transcript });
  } catch (error) {
    console.error("BiasLens Guide transcription error", error);
    return NextResponse.json(
      { error: "Voice input could not be transcribed just now. You can still type your question." },
      { status: 502 },
    );
  }
}
