var express = require("express");
const {
  userSignupController,
  resendOTPSignup,
  verifyUser,
  loginController,
  verifyLogin,
  changePassword,
  forgotPasswordRequestController,
  verifyForgotPassword,
  resendOTPLogin,
} = require("../controllers/userAuth");
const UserPrivileges = require("../middlewares/protect");
const UserPrivilegesV2 = require("../middlewares/protectV2");
const UserPrivilegesV3 = require("../middlewares/protectV3");
const UserPrivilegesV4 = require("../middlewares/protectV4");
const UserPrivilegesV5 = require("../middlewares/protectV5");
const { getCoursesController, getCourseById } = require("../controllers/coursesController");
var router = express.Router();

router.post("/login", loginController);
router.post("/verifyLogin", UserPrivilegesV2, verifyLogin);
router.post("/login/resendOTP", UserPrivilegesV2, resendOTPLogin);

router.post("/signup", userSignupController);
router.post("/resendOTP", UserPrivilegesV3, resendOTPSignup);
router.post("/verify", UserPrivilegesV3, verifyUser);

router.post("/requestPasswordReset", forgotPasswordRequestController);
router.post("/verifyResetPassword",UserPrivilegesV4, verifyForgotPassword);
router.post("/changePassword", UserPrivilegesV5, changePassword);

router.get("/courses", getCoursesController)
router.get("/courses/:id", getCourseById)

/** MAIL TEMPLATE */
// router.get("/", (req, res) => {
//   res.render("../public/mail-template/index2.ejs", {
//     name: "Yusuf",
//     email: "joeshirf@gmail.com",
//     otp: 1234,
//   });
// });

module.exports = router;
