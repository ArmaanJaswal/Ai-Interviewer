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

  const answerSchema = {
    type: "object",
    properties: {
      technical: {
        type: "number",
        minimum: 0,
        maximum: 10,
      },
      communication: {
        type: "number",
        minimum: 0,
        maximum: 10,
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 10,
      },
      feedback: {
        type: "string",
      },
    },
    required: ["technical", "communication", "confidence", "feedback"],
  };

  return { systemPrompt, userPrompt, answerSchema };
}



const nextQuestionSchema = {
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
    shouldEndInterview: {
      type: "boolean",
    },
  },
  required: ["questionText", "topic", "difficulty", "shouldEndInterview"],
};

export function buildNextQuestion({ role, skills, experience, conversationHistory }) {
  const systemPrompt = `You are a professional technical interviewer conducting an adaptive interview. 
Follow these rules strictly:
- Look at the conversation history and do NOT repeat any topic already covered.
- Look at the most recent evaluation scores: if technical score is 7 or above, increase difficulty. If below 5, decrease or maintain difficulty.
- Generate exactly one next question.
- Set shouldEndInterview to true if 8 or more questions have been asked, or if the candidate has shown a clear and consistent performance pattern across enough topics to make a hiring judgment.
- Your output must conform exactly to the required JSON schema.`;

  const historyText = conversationHistory
    .map(
      (entry) =>
        `Q${entry.questionNumber}: ${entry.questionText}
         Topic: ${entry.topic} | Difficulty: ${entry.difficulty}
         Answer: ${entry.answer}
         Scores — Technical: ${entry.evaluation?.technical}, Communication: ${entry.evaluation?.communication}, Confidence: ${entry.evaluation?.confidence}
         Feedback: ${entry.evaluation?.feedback}`
    )
    .join("\n\n");

  const userPrompt = `Candidate Profile:
- Role: ${role}
- Skills: ${skills.join(", ")}
- Experience: ${experience} years

Conversation History:
${historyText}

Generate the next interview question.`;

  return { systemPrompt, userPrompt, nextQuestionSchema };
}