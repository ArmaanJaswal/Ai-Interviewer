import { generateStructuredCompletion } from "./aiServices.js";
import { buildFirstQuestionPrompt, buildNextQuestion } from "./promptBuilder.js";
import { questionSchema} from "./promptBuilder.js";

export const generateFirstQuestion= async ({name,role,skills,experience})=>{
    const {systemPrompt,userPrompt}=  buildFirstQuestionPrompt({name,role,skills,experience});

    const result =await  generateStructuredCompletion({systemPrompt,userPrompt,schema:questionSchema});

    return result;

}

export const generateNextQuestion = async ({role,skills,experience,conversationHistory})=>{

    const {systemPrompt,userPrompt,nextQuestionSchema}=  buildNextQuestion({role,skills,experience,conversationHistory});

    const result = await generateStructuredCompletion({systemPrompt,userPrompt,schema:nextQuestionSchema});

    return result;
}