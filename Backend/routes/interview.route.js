import express from "express";
import createInterview, { submitAnswer, getInterview, getUserInterviews } from "../controllers/interviewController.js";
import { generateInterviewReport, getInterviewReport } from "../controllers/report.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import checkInterviewLimit from "../middlewares/interview.middleware.js";
import { uploadAudio } from "../middlewares/upload.middleware.js";
const router = express.Router();

router.post("/", verifyToken, checkInterviewLimit, createInterview);
router.get("/user/history", verifyToken, getUserInterviews);
router.get("/:id", verifyToken, getInterview);
router.post("/:id/answer", verifyToken, uploadAudio.single("audio"), submitAnswer);
router.post("/:id/report", verifyToken, generateInterviewReport);
router.get("/:id/report", verifyToken, getInterviewReport);


export default router;