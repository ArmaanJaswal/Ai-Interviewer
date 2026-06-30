import { Schema } from "mongoose";
import evaluationSchema from "./evaluation.model.js";

const conversationSchema = new Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
    answer: {
      type: String,
      default: "",
      trim: true,
    },
    evaluation: {
      type: evaluationSchema,
      default: null,
    },
  },
  { _id: false }
);

export { conversationSchema };