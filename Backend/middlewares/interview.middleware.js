const checkInterviewLimit = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const allowed = user.interviewsAllowed || 1;
        const used = user.interviewsUsed || 0;

        if (used >= allowed) {
            return res.status(403).json({ 
                message: "Interview limit reached. Please purchase the 5 Premium Interviews package (₹179) to continue.",
                limitReached: true,
                used,
                allowed
            });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error during limit verification." });
    }
};


export default checkInterviewLimit;