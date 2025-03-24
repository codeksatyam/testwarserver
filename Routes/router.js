const express = require("express");
const router = new express.Router();
const controllers = require("../controllers/userControllers");
const authenticate = require("../middlewares/authenticate");
const multer = require("multer");
const path = require("path");
// Set up storage for uploaded PDFs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store files in an "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, `TestResult_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage: storage });
// Routes
router.post("/user/register",controllers.userregister);
router.post("/user/sendotp",controllers.userOtpSend);
router.post("/user/login",controllers.userLogin);
router.get("/user/getuser", authenticate, controllers.getuser);
router.post("/user/submittest", authenticate, controllers.submittest);
router.post("/user/uploadpdf", upload.single("file"), controllers.uploadpdf);
module.exports = router;