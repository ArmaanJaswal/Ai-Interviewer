export function buildFirstQuestionPrompt({ name, role, skills, experience }) {
  const systemPrompt = `You are a professional technical interviewer. Generate an initial interview question matching the candidate's profile. Your output must conform exactly to the required JSON schema.`;

  const userPrompt = `Candidate Profile:
    -Name:${name},
    -Role:${role},
    -Skills:${skills.join(", ")},
    -Experience:${experience} years
    Generate the first question.`;
  return { systemPrompt, userPrompt };
}

export const questionSchema = {
  type: "object",
  properties: {
    questionText: {
      type: "string",
    },
    topic: {
      type: "string",
    },
    difficulty: {
      type: "string",
      enum: ["easy", "medium", "hard"],
    },
  },
  required: ["questionText", "topic", "difficulty"],
};


export function buildEvaluation({questionText,answer,role}){

  const userPrompt = `The question to the user was ${questionText} and the user answered it as ${answer} and the role for which the interview is being conducted is ${role}`
  const systemPrompt = `You are a professional technical interviewer.Evaluate the answer according to the given question and the given role.Your output must be within the given output schema`

  const answerSchema ={
    type:"object",
    properties:{
      technical:{
        type:"number",
        minimum:0,
        maximum:10,
      },
      communication:{
        type:"number",
        minimum:0,
        maximum:10,
      },
      confidence:{
        type:"number",
        minimum:0,
        maximum:10,
      },
      feedback:{
        type:"string",
      }
    },
     required: ["technical", "communication", "confidence","feedback"],
  }

  return { systemPrompt, userPrompt, answerSchema };
}