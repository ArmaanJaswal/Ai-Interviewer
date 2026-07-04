import { generateEvaluation } from "./services/evaluationService.js";

// Strong answer test
const strongTest = {
  role: "Software Developer",
  questionText: "Describe a situation where you had to optimize the performance of a React application. What steps did you take, and what was the impact?",
  answer: "I noticed our app was re-rendering unnecessarily on every state change. I used React DevTools to identify the components causing the issue, then wrapped expensive components with React.memo and moved heavy calculations into useMemo hooks. I also lazy-loaded routes using React.lazy and Suspense. The result was a 40% reduction in render time and noticeably smoother UI interactions."
};

// Weak answer test
const weakTest = {
  role: "Software Developer", 
  questionText: "Describe a situation where you had to optimize the performance of a React application. What steps did you take, and what was the impact?",
  answer: "I just refreshed the page and it worked fine. I don't really know much about performance optimization."
};

const runTest = async () => {
  console.log("--- Testing STRONG answer ---");
  const strongResult = await generateEvaluation(strongTest);
  console.log(JSON.stringify(strongResult, null, 2));

  console.log("\n--- Testing WEAK answer ---");
  const weakResult = await generateEvaluation(weakTest);
  console.log(JSON.stringify(weakResult, null, 2));
};

runTest();