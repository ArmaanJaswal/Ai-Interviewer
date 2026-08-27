import openai from "../config/openaiClient.js";
import { toFile } from "openai";

/**
 * Transcribes an audio file buffer using OpenAI Whisper API (whisper-1).
 * @param {Express.Multer.File} file - The file object from Multer (with .buffer, .originalname, .mimetype)
 * @returns {Promise<string>} - The transcribed text
 */
export async function transcribeAudio(file) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured in the backend environment. Please set OPENAI_API_KEY in your .env file."
    );
  }

  if (!file || !file.buffer) {
    throw new Error("No audio file provided for transcription.");
  }

  try {
    const audioFile = await toFile(
      file.buffer,
      file.originalname || "answer.webm",
      { type: file.mimetype || "audio/webm" }
    );

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      temperature: 0,
      prompt: "Technical interview response covering software engineering, MERN stack, MongoDB, Express.js, React, Node.js, JavaScript, databases, APIs, and systems.",
    });

    const resultText = (transcription.text || "").trim();
    console.log("Whisper Transcribed Result:", resultText);
    return resultText;
  } catch (error) {
    console.error("OpenAI Whisper transcription error:", error);
    throw new Error(
      error.message || "Failed to transcribe audio with OpenAI Whisper."
    );
  }
}
