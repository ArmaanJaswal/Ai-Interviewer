import { generateStructuredCompletion } from "./aiServices.js";
import { buildReportPrompt } from "./promptBuilder.js";

export const generateReport = async ({ role, skills, experience, conversationHistory }) => {
  const { systemPrompt, userPrompt, reportSchema } = buildReportPrompt({
    role,
    skills,
    experience,
    conversationHistory,
  });

  const result = await generateStructuredCompletion({
    systemPrompt,
    userPrompt,
    schema: reportSchema,
  });

  return result;
};