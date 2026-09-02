import Candidate from "../models/candidate.model.js";
import Interview from "../models/interview.model.js";
import { generateFirstQuestion, generateNextQuestion } from "../services/questionGenerationService.js";
import { generateEvaluation } from "../services/evaluationService.js";
import { transcribeAudio } from "../services/transcriptionService.js";
import { MAX_QUESTIONS } from "../config/interviewConfig.js";

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

    const maxQuestions = MAX_QUESTIONS || 10;

    const newInterview = new Interview({
      userId: req.user._id,
      candidateId,
      role: candidate.role,
      skills: candidate.skills,
      experience: candidate.experience,
      status: "in-progress",
      currentQuestionNumber: 1,
      maxQuestions: maxQuestions,
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


    req.user.interviewsUsed += 1;
    await req.user.save();
    return res.status(201).json({
      interviewId: newInterview._id,
      questionNumber: 1,
      maxQuestions: maxQuestions,
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
    const interviewId = req.params.id || req.body.interviewId;
    let answerText = req.body.answerText;

    // If an audio file was uploaded, transcribe it using OpenAI Whisper
    if (req.file) {
      try {
        const transcribed = await transcribeAudio(req.file);
        if (transcribed) {
          answerText = transcribed;
        }
      } catch (whisperErr) {
        console.error("Whisper transcription error:", whisperErr);
        return res.status(500).json({ 
          message: whisperErr.message || "Failed to transcribe audio answer with OpenAI Whisper." 
        });
      }
    }

    if (!answerText || !answerText.trim()) {
      return res.status(400).json({ 
        message: "No answer provided or speech was inaudible. Please speak clearly and try again." 
      });
    }

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
      return res.status(200).json({ 
        interviewEnded: true,
        transcribedText: answerText 
      });
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
      return res.status(200).json({ 
        interviewEnded: true,
        transcribedText: answerText 
      });
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
      transcribedText: answerText,
    });
  } catch (error) {
    console.log("Error in submitAnswer:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview Not Found" });
    }

    // Find the current question from conversation
    const currentQuestion = interview.conversation.find(
      (entry) => entry.questionNumber === interview.currentQuestionNumber
    );

    if (!currentQuestion) {
      return res.status(404).json({ message: "Current question not found" });
    }

    return res.status(200).json({
      interviewId: interview._id,
      status: interview.status,
      questionNumber: interview.currentQuestionNumber,
      maxQuestions: interview.maxQuestions || 10,
      questionText: currentQuestion.questionText,
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
    });
  } catch (error) {
    console.log("Error in getInterview:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/interview/user/history - Returns only interviews belonging to the logged-in user
export const getUserInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .populate("candidateId")
      .populate("reportId")
      .sort({ createdAt: -1 });

    const formatted = interviews.map((inv) => ({
      id: inv._id.toString(),
      name: inv.candidateId?.name || "Candidate",
      role: inv.role,
      skills: inv.skills,
      experience: inv.experience,
      date: new Date(inv.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      score: inv.reportId?.overallScore != null ? Math.round(Number(inv.reportId.overallScore) * 10) : null,
      status: inv.status === "completed" ? "Completed" : "In Progress",
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error in getUserInterviews:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { submitAnswer, getInterview };
export default createInterview;