import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const candidateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: [String],
      required: true,
      default:[],
    },
    experience: {
      type: Number,
      required: true,
      min:0,
    },
  },
  {
    timestamps: true,
  },
);

const Candidate= model('Candidate',candidateSchema);

export default Candidate;