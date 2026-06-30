import { ai } from "../config/aiClient.js";
import { MODEL_NAME } from "../config/interviewConfig.js";

export async function generateStructuredCompletion({systemPrompt,userPrompt,schema}){
    try{
        const response = await ai.models.generateContent({
            model:MODEL_NAME,
            contents:userPrompt,
            config:{
                systemInstruction:systemPrompt,
                responseMimeType:"application/json",
                responseSchema:schema
            }
        });
        const text = response.text;
        if(!text){
            throw new Error("No response text returned from the model.");
        }

        return JSON.parse(text);
    }catch(error){
        console.log("Error in generateStructuredCompletion:",error);
        throw error;
    }
}