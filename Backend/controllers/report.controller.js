import Interview from "../models/interview.model.js";
import Report from "../models/report.model.js";
import { generateReport } from "../services/reportGenerationService.js";

export const generateInterviewReport = async (req, res) => {
  try {
    const interviewId = req.params.id;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview Not Found" });
    }

    if (interview.status !== "completed") {
      return res.status(400).json({ message: "Interview Not Completed Yet" });
    }

    
    if (interview.reportId !== null) {
      const existingReport = await Report.findById(interview.reportId);
      if (existingReport) {
        return res.status(200).json(existingReport);
      }
    }

    
    const reportData = await generateReport({
      role: interview.role,
      skills: interview.skills,
      experience: interview.experience,
      conversationHistory: interview.conversation,
    });

    
    const newReport = new Report({
      interviewId: interview._id,
      overallScore: reportData.overallScore,
      technicalSummary: reportData.technicalSummary,
      communicationSummary: reportData.communicationSummary,
      confidenceSummary: reportData.confidenceSummary,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendation: reportData.recommendation,
      summary: reportData.summary,
    });

    await newReport.save();

    
    interview.reportId = newReport._id;
    await interview.save();

    return res.status(201).json(newReport);
  } catch (error) {
    console.log("Error in generateInterviewReport:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interviewId = req.params.id;

    const report = await Report.findOne({ interviewId });

    if (!report) {
      return res.status(404).json({ message: "No Report Found" });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.log("Error in getInterviewReport:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};