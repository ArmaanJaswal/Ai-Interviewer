import { generateNextQuestion } from "./services/questionGenerationService.js";

const fakeConversationHistory = [
  {
    questionNumber: 1,
    questionText: "Describe a situation where you had to optimize the performance of a React application. What steps did you take, and what was the impact?",
    topic: "React Performance",
    difficulty: "medium",
    answer: "I used React.memo and useMemo to reduce unnecessary re-renders. I also lazy loaded routes using React.lazy and Suspense which reduced initial bundle size by 40%.",
    evaluation: {
      technical: 8,
      communication: 9,
      confidence: 8,
      feedback: "Strong answer with quantified impact and correct use of React optimization tools."
    }
  },
  {
    questionNumber: 2,
    questionText: "How does the Node.js event loop work?",
    topic: "Node.js Internals",
    difficulty: "medium",
    answer: "The event loop is what allows Node.js to perform non-blocking operations. It continuously checks the call stack and the callback queue, moving callbacks to the stack when it is empty.",
    evaluation: {
      technical: 7,
      communication: 8,
      confidence: 7,
      feedback: "Good foundational understanding. Could have mentioned the different phases of the event loop like timers, I/O callbacks, and poll phase."
    }
  }
];

const fakeCandidate = {
  role: "Software Developer",
  skills: ["React", "NodeJs", "MongoDB", "C++", "Data Structures"],
  experience: 2,
};

const runTest = async () => {
  console.log("--- Testing Next Question Generation ---");
  console.log("Topics already covered: React Performance, Node.js Internals");
  console.log("Recent scores are high — expecting harder difficulty on a NEW topic\n");

  const result = await generateNextQuestion({
    role: fakeCandidate.role,
    skills: fakeCandidate.skills,
    experience: fakeCandidate.experience,
    conversationHistory: fakeConversationHistory,
  });

  console.log(JSON.stringify(result, null, 2));
};

runTest();