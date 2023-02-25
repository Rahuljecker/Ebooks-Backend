import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your name"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [6, "password must be at least 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  subscription: {
    id: String,
    status: String,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  playlist: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      poster: String,
    },
  ],
  createdate: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

//compare passwords
schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//for forgot passsword
schema.methods.getResetToken = function () {
  //crypto is used
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash the token using algorithm
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)   
    .toString("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};
// console.log(crypto.randomBytes(20).toString("hex"))
// const resetToken=crypto.randomBytes(20).toString("hex")
// const hash=crypto.createHash("sha256").update(resetToken).toString("hex");
// console.log(hash)

export const User = mongoose.model("User", schema);
