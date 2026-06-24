import express, { Router } from "express"
import newCandidate from "../controllers/candidateController.js";

const router = express.Router();

router.post("/",newCandidate)

export default router