const checkInterviewLimit =async(req,res,next)=>{
    try{
        if(req.user.interviewsUsed>= req.user.interviewsAllowed){
            return res.status(403).json({message:"Interview Limit Reached.Please Upgrade your plan"})
        }

        next();
    }catch(err){
        return res.status(400).json({message:"Internal Server Error"})
    }
}

export default checkInterviewLimit;