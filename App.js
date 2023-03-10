import express from "express";
import { config } from "dotenv";
import ErrorMiddleWare from "./middleware/Error.js"
import cookieParser from "cookie-parser";
import cors from "cors"

config({
  path: "./config/config.env",
});

const app = express();


//using middlewares
app.use(express.json())
app.use(express.urlencoded({
  extended:true,
}))
app.use(cookieParser());
app.use(cors({
  origin:process.env.FRONTEND_URL,
  credentials:true,
  methods:["GET","POST","PUT","DELETE"],
}))


// importing and using routes
import course from "./routes/courseRoutes.js"
import users from "./routes/userRoutes.js"
import other from "./routes/OtherRoutes.js"
import payment from "./routes/paymentRoute.js"

app.use("/api/v1",course) 
app.use("/api/v1",users)
app.use("/api/v1",payment)
app.use("/api/v1",other)

export default app;


app.get("/",(req,res)=>{
 res.send(` <h1>Server is working <a href=${process.env.FRONTEND_URL}>click here</a> to enter the frontend part</h1>`)
})
//last mai error ka message hamdle karana hai
app.use(ErrorMiddleWare)