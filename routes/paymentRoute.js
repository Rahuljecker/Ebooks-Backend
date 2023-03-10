import express from "express"
import { BuySubscription, cancelsubscription, getRazorpayKey, PaymentVerification } from "../controllers/PaymentController.js";
import { isAuthorized } from "../middleware/Auth.js";


const router=express.Router();

// Buy suvbscription
router.route("/subscription").get(isAuthorized,BuySubscription)

//verify Payment and Save reference in database
router.route("/paymentverification").post(isAuthorized,PaymentVerification)

//Get razorpaykey
router.route("/razorpaykey").get(getRazorpayKey)

//cancel Subscription
router.route("/subscription/cancel").delete(isAuthorized,cancelsubscription)


export default router;