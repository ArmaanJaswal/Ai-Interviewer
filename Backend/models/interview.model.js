import { model, Schema } from "mongoose";
import conversationSchema from "./conversation.model"
const interviewSessionSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
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
  {
    timestamps: true,
  }
);

const Interview = model("Interview",interviewSessionSchema);

export default Interview;
