import mongoose, { model } from "mongoose";
const {Schema} = mongoose;

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },
    password:{
        type:String,
        minLength:8,
        select:false,
        required:false,
    },
    googleId:{
        type:String,
        index:{
            unique:true,
            sparse:true
        }
    },
    githubId:{
        type:String,
        index:{
            unique:true,
            sparse:true
        }
    },
    avatar:{
        type:String,
    },


    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    plan:{
        type:String,
        enum:["free","premium"],
        default:"free",
    },
    interviewsUsed:{
        type:Number,
        default:0,
    },
    interviewsAllowed:{
        type:Number,
        default:1,
    },
    planExpiresAt:{
        type:Date,
        default:null
    },
    razorpayCustomerId:{
        type:String,
        default:null
    }
},{timestamps:true})

const User = model("User",userSchema);

export default User;