
import { generateStructuredCompletion } from "./aiServices.js";
import { buildEvaluation } from "./promptBuilder.js";

export const generateEvaluation = async({questionText,answer,role})=>{
    const{systemPrompt,userPrompt,answerSchema}= buildEvaluation({questionText,answer,role})

    const result = await  generateStructuredCompletion({systemPrompt,userPrompt,schema:answerSchema});

    return result;
}