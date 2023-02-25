import mongoose from "mongoose";
import app from "./App.js";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary"
import nodecron from "node-cron";
import { Stats } from "./models/Stats.js";


mongoose.set('strictQuery',true)


//cloudinary 
cloudinary.v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET,
})
// ..mongodb
connectDB();
nodecron.schedule("0 0 0 1 * *",async()=>{
    try {
       await Stats.create();
        
    } catch (error) {
        console.log(error)
    }
})
app.listen(process.env.PORT,()=>{
    console.log(`server listening on port ${process.env.PORT}`);
})