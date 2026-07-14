import { model, Schema } from "mongoose";

const reportSchema = new Schema(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
    },
    technicalSummary: {
      type: String,
      required: true,
    },
    communicationSummary: {
      type: String,
      required: true,
    },
    confidenceSummary: {
      type: String,
      required: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendation: {
      type: String,
      enum: ["strong hire", "hire", "consider", "reject"],
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Report = model("Report", reportSchema);
export default Report;