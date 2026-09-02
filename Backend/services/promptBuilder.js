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
  const systemPrompt = `You are a professional technical interviewer. Generate an initial interview question matching the candidate's profile.
Formatting Rules for Speech:
- The question will be read aloud by an automated text-to-speech voice system.
- Write in clear, plain spoken conversational English.
- DO NOT use any markdown syntax (no backticks \`, no code blocks, no asterisks *, no slashes /, no hash symbols #, no bullet points).
- Your output must conform exactly to the required JSON schema.`;

  const userPrompt = `Candidate Profile:
- Name: ${name}
- Role: ${role}
- Skills: ${skills.join(", ")}
- Experience: ${experience} years
Generate the first question in plain spoken text without backticks or markdown symbols.`;

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
  const systemPrompt = `You are an expert technical interviewer conducting a live spoken voice interview for a ${role} position.
Evaluate the candidate's answer fairly, constructively, and realistically based on the question asked.

Evaluation & Scoring Rubric (Scale 0 to 10):
- **Technical (0-10)**:
  - 9-10 (Excellent): Accurate, clearly understands the core mechanisms and principles.
  - 7-8 (Good / Proficient): Correct understanding of the fundamental concepts; answers the core question accurately, even if concise.
  - 5-6 (Average / Partial): Understands parts of the concept but misses key aspects or has minor confusion.
  - 3-4 (Needs Improvement): Vague, superficial, or contains significant inaccuracies.
  - 0-2 (Poor): Completely incorrect, inaudible, or irrelevant answer.
- **Communication (0-10)**: Clarity, structure, and ability to convey technical ideas verbally.
- **Confidence (0-10)**: Directness and assurance in their explanation.

Important: This is a spoken voice interview. Candidates respond verbally and concisely. Do NOT penalize candidates for not reciting textbook definitions or code syntax as long as their conceptual explanation is correct.
Your output must conform exactly to the required JSON schema.`;

  const userPrompt = `Role: ${role}
Question: ${questionText}
Candidate's Spoken Answer: ${answer}
Evaluate this answer according to the rubric.`;

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
- Write in natural, plain spoken conversational English.
- DO NOT use markdown formatting, backticks (\`), asterisks (*), slashes (/), hashes (#), or code block symbols in questionText, as it is read aloud by a voice synthesizer.
- Set shouldEndInterview to true if 10 or more questions have been asked, or if the candidate has shown a clear and consistent performance pattern across enough topics to make a hiring judgment.
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
  const systemPrompt = `You are a senior technical hiring manager writing a post-interview assessment report for a ${role} candidate.
Follow these evaluation principles:
- Calculate overallScore (0.0 to 10.0 scale) as a fair composite reflecting the candidate's demonstrated technical proficiency, problem-solving, and communication across all questions.
- A score of 8.0-10.0 indicates strong proficiency (recommend: 'strong hire' or 'hire').
- A score of 6.0-7.9 indicates solid potential with minor areas for growth (recommend: 'hire' or 'consider').
- A score below 5.0 indicates significant gaps in core requirements (recommend: 'reject').
- Highlight both specific strengths and constructive areas for improvement based on their answers.
Your output must conform exactly to the required JSON schema.`;

  const historyText = formatConversationHistory(conversationHistory);

  const userPrompt = `Candidate Profile:
- Role: ${role}
- Skills: ${skills.join(", ")}
- Experience: ${experience} years

Full Interview Transcript:
${historyText}

Generate a complete, constructive post-interview assessment report.`;

  return { systemPrompt, userPrompt, reportSchema };
}