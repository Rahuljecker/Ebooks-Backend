import multer from "multer";

const storage = multer.memoryStorage();

const SingleUpload = multer({
  storage
}).single("file");

export default SingleUpload;
