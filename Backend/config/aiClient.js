import dotenv from "dotenv";
dotenv.config();
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if(!GEMINI_API_KEY){
  throw new Error("GEMINI_API_KEY is missing from environment variables.")
}

export const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

