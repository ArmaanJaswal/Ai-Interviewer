import { model, Schema } from "mongoose";
import evaluationSchema from "./evaluation.model";

const conversationSchema = new Schema({
    questionNumber:{
        type:Number,
        required:true,
    },
    question:{
        type:String,
        required:true,
        trim:true,
    },
    answer:{
        type:String,
        default:"",
        trim:true,
    },
    evaluation:{
        type:evaluationSchema,
        default:null,
    }
},{_id:false})


export default conversationSchema