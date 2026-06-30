import { generateStructuredCompletion } from "./aiServices.js";
import { buildFirstQuestionPrompt } from "./promptBuilder.js";
import { questionSchema } from "./promptBuilder.js";

export const generateFirstQuestion= async ({name,role,skills,experience})=>{
    const {systemPrompt,userPrompt}= await buildFirstQuestionPrompt({name,role,skills,experience});

    const result =await  generateStructuredCompletion({systemPrompt,userPrompt,schema:questionSchema});

    return result;

}