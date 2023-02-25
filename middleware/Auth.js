import { CatchAsyncError } from "./CatchAsyncError.js";
import  Jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";


export const isAuthorized=CatchAsyncError(async(req,res,next)=>{
const {token}=req.cookies;
if(!token) return next(new ErrorHandler("You are not logged in!",401));
const decoded=Jwt.verify(token,process.env.JWT_SECRET);
req.user=await User.findById(decoded._id);

next(); 
})


export const AuthorizeByAdmin=(req,res,next)=>{
if(req.user.role!=="admin") return next(new ErrorHandler("You have no access to enter this section",403));

next()
}