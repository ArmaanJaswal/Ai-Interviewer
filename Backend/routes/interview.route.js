import express from "express";
import createInterview, { submitAnswer } from "../controllers/interviewController.js";

const router = express.Router();

router.post("/", createInterview);
router.post("/:id/answer", submitAnswer);

export default router;