import express from "express";
import createInterview, { submitAnswer } from "../controllers/interviewController.js";
import { generateInterviewReport, getInterviewReport } from "../controllers/report.controller.js";

const router = express.Router();

router.post("/", createInterview);
router.post("/:id/answer", submitAnswer);
router.post("/:id/report",generateInterviewReport);
router.get("/:id/report",getInterviewReport);

export default router;