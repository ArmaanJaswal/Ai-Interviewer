import { generateFirstQuestion } from "./services/questionGenerationService.js";

const fake ={
    name:"Lakshya",
    role:"Software Developer",
    skills:["React", "NodeJs", "MongoDB","C++","Data Structures"],
    experience:0
}


   const response = await generateFirstQuestion(fake);

   console.log(response)


