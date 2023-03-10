import express from "express";
import {
  AddLectures,
  createCourse,
  DeleteCourse,
  DeleteLecture,
  getAllcourses,
  getCourseLectures,
} from "../controllers/courseController.js";
import { AuthorizeByAdmin, isAuthorized,AuthorizeBySubscribers } from "../middleware/Auth.js";
import SingleUpload from "../middleware/Multer.js";
const router = express.Router();

//get all courses without lectures
router.route("/courses").get(getAllcourses);
//create all courses only admin
router.route("/createcourse").post(isAuthorized, AuthorizeByAdmin,SingleUpload,createCourse);

//add lectures,Delete course and get course Deatails
router.route("/course/:id").get(isAuthorized,AuthorizeBySubscribers,getCourseLectures).post(isAuthorized, AuthorizeByAdmin,SingleUpload,AddLectures).delete(isAuthorized,AuthorizeByAdmin,DeleteCourse);

//Delete Lecture
router.route("/lecture").get(isAuthorized,AuthorizeByAdmin,DeleteLecture)



export default router;
