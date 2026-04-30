import { ElevenLabsClient } from "elevenlabs";
import OpenAI from "openai";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Converts text to speech using ElevenLabs.
 * Returns a buffer of the audio.
 */
export async function speak(text: string, voiceId: string = "aria-voice-id") {
  try {
    const audio = await elevenlabs.generate({
      voice: voiceId,
      text: text,
      model_id: "eleven_multilingual_v2",
    });
    return audio;
  } catch (error) {
    console.error("ElevenLabs TTS failed:", error);
    throw error;
  }
}

/**
 * Transcribes audio using OpenAI Whisper.
 */
export async function transcribe(audioFile: File) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });
    return transcription.text;
  } catch (error) {
    console.error("Whisper STT failed:", error);
    throw error;
  }
}
