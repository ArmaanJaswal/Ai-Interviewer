import mongoose, { model, Schema } from "mongoose";
import Interview from "./interview.model";

const reportSchema = new Schema({
    interviewId:{
        type:Schema.Types.ObjectId,
        ref:"Interview",
        required:true,
    },
    overallScore:{
        type:Number,
        required:true,
    },
    technicalScore:{
        type:Number,
        required:true,
    },
    communicationScore:{
        type:Number,
        required:true,
    },
    confidenceScore:{
        type:Number,
        required:true,
    },
    recommendation:{
        type:String,
        required:true,
    },
    strengths:{
        type:[String],
        default:[],
    },
    weaknesses:{
        type:[String],
        default:[],
    },
    improvementAreas:{
        type:[String],
        default:[],
    },
    improvementAreas:{
        type:[String],
        required:true,
        default:[],
    },
    summary:{
        type:String,
        required:true,
    }
},{timestamps:true});

const Report = model("Report",reportSchema);
export default Report;