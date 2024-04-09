var express = require("express");
const {
  signupInstructorController,
  signupResendOTPController,
  verifySignupController,
  loginInstructorController,
  resendLoginOTPController,
  verifyLoginController,
} = require("../controllers/instructorAuth");
var router = express.Router();
const upload = require("../utils/uploadImage");
const InstructorPrivileges = require("../middlewares/protectV6");
const InstructorPrivilegesV2 = require("../middlewares/protectV7");
const InstructorPrivilegesV3 = require("../middlewares/protectV8");

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

module.exports = router;
