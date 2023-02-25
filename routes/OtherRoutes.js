import express from "express"
import { adminStats, Contact, RequestAcourse } from "../controllers/OtherContollers.js";
import { AuthorizeByAdmin, isAuthorized } from "../middleware/Auth.js";

const router=express.Router();

//contact us
router.route("/contact").post(Contact)

//request a course
router.route("/requestcourse").post(RequestAcourse)

//get Admin stats
router.route("/admin/stats").get(isAuthorized,AuthorizeByAdmin,adminStats)


export default router;
