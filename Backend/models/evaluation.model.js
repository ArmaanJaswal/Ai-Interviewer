import { model, Schema } from "mongoose";

const evaluationSchema = new Schema({
    technical:{
        type:Number,
        min:0,
        max:10,
    },
    communication:{
        type:Number,
        min:0,
        max:10,
    },
    confidence:{
        type:Number,
        min:0,
        max:10,
    },
    feedback:{
        type:String,
        trim:true,
    }
},{_id:false})

export default evaluationSchema