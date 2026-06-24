import express from "express"
import Candidate from "../models/candidate.model.js";

const newCandidate =async (req,res)=>{
    try{

        const {name,role,skills,experience}= req.body;
    
        if(!name || !role || !skills || experience===undefined){
           return res.status(400).json({message:"Enter all Details"});
        }
    
        const newCandidate = new Candidate({
            name,role,skills,experience
        })
        await newCandidate.save();
        res.status(200).json({message:"User Saved Successfully"})
    }catch(error){
        console.log(error.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export default newCandidate