var express = require("express");
const {
  signupInstructorController,
  signupResendOTPController,
  verifySignupController,
  loginInstructorController,
  resendLoginOTPController,
  verifyLoginController,
  uploadPapersController,
} = require("../controllers/instructorAuth");
var router = express.Router();
const upload = require("../utils/uploadImage");
const InstructorPrivileges = require("../middlewares/protectV6");
const InstructorPrivilegesV2 = require("../middlewares/protectV7");
const InstructorPrivilegesV3 = require("../middlewares/protectV8");
const instructorConfirmedCheck = require("../middlewares/instructorConfirmed");
const { addCourseController } = require("../controllers/coursesController");

router.post("/signup", upload.single("image"), signupInstructorController);
router.post(
  "/signup/resendOTP",
  InstructorPrivileges,
  signupResendOTPController
);
router.post("/signup/verify", InstructorPrivileges, verifySignupController);

router.post("/login", loginInstructorController);
router.post(
  "/login/resendOTP",
  InstructorPrivilegesV2,
  resendLoginOTPController
);
router.post("/login/verify", InstructorPrivilegesV2, verifyLoginController);
router.post(
  "/uploadPapers",
  upload.fields([
    { name: "CV", maxCount: 1 },
    { name: "ID", maxCount: 1 },
    { name: "Graduation_Certificate", maxCount: 1 },
  ]),
  InstructorPrivilegesV3,
  uploadPapersController
);
router.post(
  "/courses/add",
  upload.single("image"),
  InstructorPrivilegesV3,
  instructorConfirmedCheck,
  addCourseController
);

module.exports = router;
