import express from "express"
import dotenv from 'dotenv'
import passport from "passport"
import connectDB from "./config/db.js";
import setupPassport from "./config/passport.js";
import candidateRoutes from "./routes/candidate.route.js"
import interviewRoutes from "./routes/interview.route.js"
import authRoutes from "./routes/auth.route.js"
import paymentRoutes from "./routes/payment.route.js"
import cors from "cors"
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

connectDB();
setupPassport();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json())
app.use(cookieParser());
app.use(passport.initialize());

app.get("/",(req,res)=>{
    res.send("Server Running")
})

app.use("/api/candidate/",candidateRoutes)
app.use("/api/interview/",interviewRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);


const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log(`Server running on port: ${port}`)
})