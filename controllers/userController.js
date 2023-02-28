import { CatchAsyncError } from "../middleware/CatchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { SendToken } from "../utils/SendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import getDatauri from "../utils/DataUri.js";
import {Stats} from "../models/Stats.js";




export const getAlluser = (req, res, next) => {
  res.send("user is working");
};

export const signup = CatchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const file = req.file;
  if (!name || !email || !password || !file)
    return next(new ErrorHandler("please add all fields", 400));

  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("user already exist!", 409));

  
  const fileuri = getDatauri(file);

  //update in cloudinary
  const mycloud = await cloudinary.v2.uploader.upload(fileuri.content);
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });
  SendToken(res, user, "You have successfully Registered with Ebooks", 201);
});

//for login

export const login = CatchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // const file=req.file;
  if (!email || !password)
    return next(new ErrorHandler("please add all fields", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("user Does't exist!", 401));

  //upload file in clodinary
  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return next(new ErrorHandler("Incorrect email or password!", 401));

  SendToken(res, user, `Welcome Back ${user.name}`, 200);
});

//for logout
export const logout = CatchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure:true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logout successfully",
    });
});

//get My Profile
export const GetMYProfile = CatchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

//chamge password
export const ChangePassword = CatchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("please add all fields", 400));
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch)
    return next(new ErrorHandler("your old password is incorrect", 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully!",
  });
});

//update Profile
export const UpdateProfile = CatchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully!",
  });
});

//update profile picture
export const UpdateProfilePicture = CatchAsyncError(async (req, res, next) => {
  const file = req.file;
  const fileuri = getDatauri(file);
  const user = await User.findById(req.user._id);
  const mycloud = await cloudinary.v2.uploader.upload(fileuri.content);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  user.avatar={
    public_id:mycloud.public_id,
    url:mycloud.secure_url,
  }
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Picture Updated Successfully!",
  });
});

//forgot password
export const Forgotpassword = CatchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user)
    return next(
      new ErrorHandler(`User Not Found for this email address !`, 400)
    );
  const resetToken = await user.getResetToken();

  //save the function
  await user.save();
  //send token via mail
  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `Click on the given link for Reset your password ${url}.please Ignore if you don't request for the Forgot password`;

  await sendEmail(user.email, "Reset Pasword for Ebooks", message);

  res.status(200).json({
    success: true,
    message: `Reset token sent successfully send to ${user.email}`,
  });
});

//Reset password
export const ResetPassword = CatchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .toString("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expired"));

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed Successfully!",
  });
});

//add to playlist
export const AddToPlaylist = CatchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id);
  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const ItemExsist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });
  if (ItemExsist)
    return next(new ErrorHandler("Already in playllist.Try another!", 409));
  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });
  await user.save();

  res.status(200).json({
    success: true,
    message: "Add To playlist Successfully!",
  });
});
//remove from  playlist
export const RemoveFromplaylist = CatchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const newplaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });

  user.playlist = newplaylist;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Removed from playlist Successfully!",
  });
});



//Admin Routes
export const getAllUsersAdmin = CatchAsyncError(async (req, res, next) => {
    const users=await User.find({});


  res.status(200).json({
    success: true,
    users
  });
});
export const ChangeRole = CatchAsyncError(async (req, res, next) => {
    const user=await User.findById(req.params.id);
    if(!user) return next(new ErrorHandler("You are not a user please subscribe!",404)); 

    if(user.role==="user") user.role="admin"
    else user.role=="user"

    await user.save();


  res.status(200).json({
    success: true,
    message:"Role "
  });
});
export const DeleteUser = CatchAsyncError(async (req, res, next) => {
    const user=await User.findById(req.params.id);
    if(!user) return next(new ErrorHandler("You are not a user please subscribe!",404)); 

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    //cancel subscription
    await user.remove();


  res.status(200).json({
    success: true,
    message:"User Has been Deleted Successfully"
  });
});

//watcher bacause when any real world data changes weflect
User.watch().on("change",async()=>{
  const stats=await Stats.find({}).sort({createdAt:"desc"}).limit(1);
  const subscription=await User.find({"subscription.status":"active"});
  stats[0].users=await User.countDocuments();
  stats[0].subscription=subscription.length;
  stats[0].createdAt=new Date(Date.now());

  await stats[0].save();

})