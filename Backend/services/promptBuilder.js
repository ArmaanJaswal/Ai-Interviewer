// Shared internal helper — not exported, used by both buildNextQuestion and buildReportPrompt
function formatConversationHistory(conversationHistory) {
  return conversationHistory
    .map(
      (entry) =>
        `Q${entry.questionNumber}: ${entry.questionText}
Topic: ${entry.topic} | Difficulty: ${entry.difficulty}
Answer: ${entry.answer}
Scores — Technical: ${entry.evaluation?.technical ?? "N/A"}, Communication: ${entry.evaluation?.communication ?? "N/A"}, Confidence: ${entry.evaluation?.confidence ?? "N/A"}`
    )
    .join("\n\n");
}

export function buildFirstQuestionPrompt({ name, role, skills, experience }) {
  const systemPrompt = `You are a professional technical interviewer. Generate an initial interview question matching the candidate's profile. Your output must conform exactly to the required JSON schema.`;

  const userPrompt = `Candidate Profile:
- Name: ${name}
- Role: ${role}
- Skills: ${skills.join(", ")}
- Experience: ${experience} years
Generate the first question.`;

  return { systemPrompt, userPrompt };
}

export const questionSchema = {
  type: "object",
  properties: {
    questionText: { type: "string" },
    topic: { type: "string" },
    difficulty: {
      type: "string",
      enum: ["easy", "medium", "hard"],
    },
  },
  required: ["questionText", "topic", "difficulty"],
};

export function buildEvaluation({ questionText, answer, role }) {
  const systemPrompt = `You are a professional technical interviewer. Evaluate the candidate's answer based on the question asked and the role they are applying for. Your output must conform exactly to the required JSON schema.`;

  const userPrompt = `Role: ${role}
Question: ${questionText}
Candidate's Answer: ${answer}
Evaluate this answer.`;

  const answerSchema = {
    type: "object",
    properties: {
      technical: { type: "number", minimum: 0, maximum: 10 },
      communication: { type: "number", minimum: 0, maximum: 10 },
      confidence: { type: "number", minimum: 0, maximum: 10 },
      feedback: { type: "string" },
    },
    required: ["technical", "communication", "confidence", "feedback"],
  };

  return { systemPrompt, userPrompt, answerSchema };
}

const nextQuestionSchema = {
  type: "object",
  properties: {
    questionText: { type: "string" },
    topic: { type: "string" },
    difficulty: {
      type: "string",
      enum: ["easy", "medium", "hard"],
    },
    shouldEndInterview: { type: "boolean" },
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

  const historyText = formatConversationHistory(conversationHistory);

  const userPrompt = `Candidate Profile:
- Role: ${role}
- Skills: ${skills.join(", ")}
- Experience: ${experience} years

Conversation History:
${historyText}

Generate the next interview question.`;

  return { systemPrompt, userPrompt, nextQuestionSchema };
}

const reportSchema = {
  type: "object",
  properties: {
    overallScore: { type: "number", minimum: 0, maximum: 10 },
    technicalSummary: { type: "string" },
    communicationSummary: { type: "string" },
    confidenceSummary: { type: "string" },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    weaknesses: {
      type: "array",
      items: { type: "string" },
    },
    recommendation: {
      type: "string",
      enum: ["strong hire", "hire", "consider", "reject"],
    },
    summary: { type: "string" },
  },
  required: [
    "overallScore",
    "technicalSummary",
    "communicationSummary",
    "confidenceSummary",
    "strengths",
    "weaknesses",
    "recommendation",
    "summary",
  ],
};

export function buildReportPrompt({ role, skills, experience, conversationHistory }) {
  const systemPrompt = `You are a senior hiring manager writing a post-interview assessment report. 
Be honest, specific, and base your assessment only on what is in the transcript provided.
Do not make assumptions beyond what the candidate actually said.
Your output must conform exactly to the required JSON schema.`;

  const historyText = formatConversationHistory(conversationHistory);

  const userPrompt = `Candidate Profile:
- Role: ${role}
- Skills: ${skills.join(", ")}
- Experience: ${experience} years

Full Interview Transcript:
${historyText}

Generate a complete post-interview assessment report.`;

  return { systemPrompt, userPrompt, reportSchema };
}