import express from "express";
import createInterview, { submitAnswer } from "../controllers/interviewController.js";
import { generateInterviewReport, getInterviewReport } from "../controllers/report.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import checkInterviewLimit from "../middlewares/interview.middleware.js";
const router = express.Router();

router.post("/", verifyToken,checkInterviewLimit,createInterview);
router.post("/:id/answer", verifyToken,submitAnswer);
router.post("/:id/report",verifyToken,generateInterviewReport);
router.get("/:id/report",verifyToken,getInterviewReport);

export default router;