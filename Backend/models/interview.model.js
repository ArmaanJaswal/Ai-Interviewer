import { model, Schema } from "mongoose";
import { conversationSchema } from "./conversation.model.js";

const interviewSessionSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String, // confirm this matches Candidate.model.js — change to Number if needed
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    currentQuestionNumber: {
      type: Number,
      default: 0,
    },
    maxQuestions: {
      type: Number,
      default: 10,
    },
    conversation: {
      type: [conversationSchema],
      default: [],
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Interview = model("Interview", interviewSessionSchema);
export default Interview;