import { ai } from "../config/aiClient.js";
import { MODEL_NAME, FALLBACK_MODEL_NAME } from "../config/interviewConfig.js";

export async function generateStructuredCompletion({ systemPrompt, userPrompt, schema }) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const text = response.text;
    if (!text) {
      throw new Error("No response text returned from the model.");
    }
    return JSON.parse(text);
  } catch (error) {
    console.warn(`Primary model ${MODEL_NAME} failed, trying fallback ${FALLBACK_MODEL_NAME}:`, error.message);
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: FALLBACK_MODEL_NAME || "gemini-1.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      const fallbackText = fallbackResponse.text;
      if (!fallbackText) {
        throw new Error("No response text returned from the fallback model.");
      }
      return JSON.parse(fallbackText);
    } catch (fallbackErr) {
      console.error("Error in generateStructuredCompletion fallback:", fallbackErr);
      throw error;
    }
  }
}