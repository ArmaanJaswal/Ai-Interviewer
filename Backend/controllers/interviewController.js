import Candidate from "../models/candidate.model.js";
import Interview from "../models/interview.model.js";
import { generateFirstQuestion } from "../services/questionGenerationService.js";

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

export default createInterview;