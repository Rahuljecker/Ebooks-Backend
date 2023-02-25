import { CatchAsyncError } from "../middleware/CatchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Stats } from "../models/Stats.js";

export const Contact = CatchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return next(
      new ErrorHandler("All fileds Required! please fill all the fields", 400)
    );

  const to = process.env.MY_MAIL;
  const subject = "Contact from Ebooks";
  const text = `I am ${name} and my Email is ${email} \n ${message}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your message has been sent successfully ",
  });
});

export const RequestAcourse = CatchAsyncError(async (req, res, next) => {
  const { name, email, requestMessage } = req.body;
  if (!name || !email || !requestMessage)
    return next(
      new ErrorHandler("All fileds Required! please fill all the fields", 400)
    );
  const to = process.env.MY_MAIL;
  const subject = "Requestform for a Course from Ebooks";
  const text = `I am ${name} and my Email is ${email} \n ${requestMessage}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "your Request for a Course has been sent Successfully!",
  });
});

//Admin stats
export const adminStats = CatchAsyncError(async (req, res, next) => {
  const stats =await Stats.find({}).sort({ createdAt: "desc" }).limit(12);
  const statsData = [];

  const requiredLength = 12 - stats.length;
  for (let i = 0; i < stats.length; i++) {
    statsData.unshift(stats[i]);  
  }
  for (let i = 0; i < requiredLength; i++) {
    statsData.unshift({
      users: 0,
      subscription: 0,
      views: 0,
    });
  }

  const userData = statsData[11].users;
  const subscriptionData = statsData[11].subscription;
  const viewsData = statsData[11].views;

  let userProfit = true;
  let viewsProfit = true;
  let subscriptionProfit = true;

  let userPercentage = 0;
  let viewsPercentage = 0;
  let subscriptionPercentage = 0;

  if (statsData[10].userData === 0) userPercentage = userData * 100;
  if (statsData[10].viewsData === 0) viewsPercentage = viewsData * 100;
  if (statsData[10].subscriptionData === 0)
    subscriptionPercentage = subscriptionData * 100;
  else {
    const difference = {
      users: statsData[11].users - statsData[10].users,
      views: statsData[11].views - statsData[10].views,
      subscription: statsData[11].subscription - statsData[10].subscription,
    };
    userPercentage = (difference.users / statsData[10].users) * 100;
    viewsPercentage = (difference.views / statsData[10].views) * 100;
    subscriptionPercentage =
      (difference.subscription / statsData[10].subscription) * 100;

    if (userPercentage < 0) userProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
    if (subscriptionPercentage < 0) subscriptionProfit = false;
  }

  res.status(200).json({
    success: true,
    stats: statsData,
    userData,
    subscriptionData,
    viewsData,
    userPercentage,
    subscriptionPercentage,
    viewsPercentage,
    userProfit,
    subscriptionProfit,
    viewsProfit,
  });
});
