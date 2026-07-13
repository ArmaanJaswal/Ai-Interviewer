import Candidate from "../models/candidate.model.js";
import Interview from "../models/interview.model.js";
import { generateFirstQuestion, generateNextQuestion } from "../services/questionGenerationService.js";
import { generateEvaluation } from "../services/evaluationService.js";

const createInterview = async (req, res) => {
  try {
    const { candidateId } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate Not Found" });
    }

    const firstQuestion = await generateFirstQuestion({
      name: candidate.name,
      role: candidate.role,
      skills: candidate.skills,
      experience: candidate.experience,
    });

    const newInterview = new Interview({
      candidateId,
      role: candidate.role,
      skills: candidate.skills,
      experience: candidate.experience,
      status: "in-progress",
      currentQuestionNumber: 1,
      maxQuestions: 10,
      startedAt: new Date(),
      conversation: [
        {
          questionNumber: 1,
          questionText: firstQuestion.questionText,
          topic: firstQuestion.topic,
          difficulty: firstQuestion.difficulty,
          answer: "",
        },
      ],
    });

    await newInterview.save();

    return res.status(201).json({
      interviewId: newInterview._id,
      questionNumber: 1,
      questionText: firstQuestion.questionText,
      topic: firstQuestion.topic,
      difficulty: firstQuestion.difficulty,
    });
  } catch (error) {
    console.log("Error in createInterview:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { interviewId, answerText } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview Not Found" });
    }

    
    const currentEntry = interview.conversation.find(
      (entry) => entry.questionNumber === interview.currentQuestionNumber
    );

    if (!currentEntry) {
      return res.status(400).json({ message: "Current question entry not found" });
    }

    
    currentEntry.answer = answerText;

    
    const evaluation = await generateEvaluation({
      questionText: currentEntry.questionText,
      answer: answerText,
      role: interview.role,
    });

    currentEntry.evaluation = evaluation;

    
    if (interview.currentQuestionNumber >= interview.maxQuestions) {
      interview.status = "completed";
      interview.completedAt = new Date();
      await interview.save();
      return res.status(200).json({ interviewEnded: true });
    }

    
    const nextQuestion = await generateNextQuestion({
      role: interview.role,
      skills: interview.skills,
      experience: interview.experience,
      conversationHistory: interview.conversation,
    });

    
    if (nextQuestion.shouldEndInterview === true) {
      interview.status = "completed";
      interview.completedAt = new Date();
      await interview.save();
      return res.status(200).json({ interviewEnded: true });
    }

    
    interview.conversation.push({
      questionNumber: interview.currentQuestionNumber + 1,
      questionText: nextQuestion.questionText,
      topic: nextQuestion.topic,
      difficulty: nextQuestion.difficulty,
      answer: "",
    });

    interview.currentQuestionNumber += 1;

    
    await interview.save();

    return res.status(200).json({
      questionNumber: interview.currentQuestionNumber,
      questionText: nextQuestion.questionText,
      topic: nextQuestion.topic,
      difficulty: nextQuestion.difficulty,
    });
  } catch (error) {
    console.log("Error in submitAnswer:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { submitAnswer };
export default createInterview;