import { generateReport } from "./services/reportGenerationService.js";

const fakeInterview = {
  role: "Software Developer",
  skills: ["React", "Node.js", "MongoDB", "JavaScript"],
  experience: 2,
  conversationHistory: [
    {
      questionNumber: 1,
      questionText: "Describe a situation where you optimized a React application.",
      topic: "React Performance",
      difficulty: "medium",
      answer: "I used React.memo and useMemo to reduce re-renders. Lazy loaded routes with React.lazy which cut bundle size by 40%.",
      evaluation: { technical: 8, communication: 9, confidence: 8, feedback: "Strong answer." },
    },
    {
      questionNumber: 2,
      questionText: "How does the Node.js event loop work?",
      topic: "Node.js Internals",
      difficulty: "medium",
      answer: "The event loop checks the call stack and callback queue, moving callbacks when the stack is empty.",
      evaluation: { technical: 7, communication: 8, confidence: 7, feedback: "Good but missed phases." },
    },
    {
      questionNumber: 3,
      questionText: "Explain event delegation in JavaScript.",
      topic: "JavaScript DOM",
      difficulty: "hard",
      answer: "I am not really sure how this works to be honest.",
      evaluation: { technical: 2, communication: 4, confidence: 2, feedback: "Very weak answer." },
    },
    {
      questionNumber: 4,
      questionText: "How do you design a MongoDB schema for a social media app?",
      topic: "MongoDB Schema Design",
      difficulty: "hard",
      answer: "I would embed frequently accessed data and reference rarely accessed data. For posts I would embed likes count but reference comments as a separate collection.",
      evaluation: { technical: 8, communication: 7, confidence: 8, feedback: "Good grasp of embedding vs referencing." },
    },
  ],
};

const runTest = async () => {
  console.log("--- Generating Interview Report ---\n");

  const report = await generateReport({
    role: fakeInterview.role,
    skills: fakeInterview.skills,
    experience: fakeInterview.experience,
    conversationHistory: fakeInterview.conversationHistory,
  });

  console.log(JSON.stringify(report, null, 2));
};

runTest();