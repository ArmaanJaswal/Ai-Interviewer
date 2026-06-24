import express from "express"
import dotenv from 'dotenv'
import connectDB from "./config/db.js";
import candidateRoutes from "./routes/candidate.route.js"
import cors from "cors"
dotenv.config();
const app = express();

connectDB();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use(express.json())

app.get("/",(req,res)=>{
    res.send("Server Running")
})

app.use("/api/candidate/",candidateRoutes)

const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log(`Server running on port: ${port}`)
})