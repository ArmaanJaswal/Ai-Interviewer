import express from "express";
import newCandidate from "../controllers/candidateController.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, newCandidate);

export default router;