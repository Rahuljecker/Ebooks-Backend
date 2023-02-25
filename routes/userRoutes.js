import express from 'express';
import { AddToPlaylist, getAllUsersAdmin, ChangePassword, Forgotpassword, getAlluser, GetMYProfile, login, logout, RemoveFromplaylist, ResetPassword, signup, UpdateProfile, UpdateProfilePicture, ChangeRole, DeleteUser } from '../controllers/userController.js';
import { AuthorizeByAdmin, isAuthorized } from '../middleware/Auth.js';
import singleUpload from "../middleware/Multer.js"





const router=express.Router();
router.route("/user").get(getAlluser)

//sign up
router.route("/signup").post(singleUpload, signup);

//login
router.route("/login").post(login);


//Logout
router.route("/logout").get(logout);
//getmyProfile
router.route("/getmyprofile").get(isAuthorized,GetMYProfile);

//change password
router.route("/changepassword").put(isAuthorized,ChangePassword);

//updateprofile
router.route("/updateprofile").put(isAuthorized,UpdateProfile);


//updateProfilePicture
router.route("/updateprofilepicture").put(isAuthorized,singleUpload,UpdateProfilePicture);

//forget password
router.route("/forgotpassword").post(Forgotpassword);
//Reset password
router.route("/resetpassword/:token").put(ResetPassword);


//Addtoplaylist
router.route("/addtoplaylist").post(isAuthorized,AddToPlaylist);


//Removefromplaylist
router.route("/removefromplaylist").delete(isAuthorized,RemoveFromplaylist);


//Admin Routes
//get all users
router.route("/admin/users").get(isAuthorized,AuthorizeByAdmin,getAllUsersAdmin)

//CHnage role to admin and vice versa
router.route("/admin/users/:id").put(isAuthorized,AuthorizeByAdmin,ChangeRole).delete(isAuthorized,AuthorizeByAdmin,DeleteUser)
export default router



