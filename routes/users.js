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
  updateUserController,
} = require("../controllers/userAuth");
const UserPrivileges = require("../middlewares/protect");
const UserPrivilegesV2 = require("../middlewares/protectV2");
const UserPrivilegesV3 = require("../middlewares/protectV3");
const UserPrivilegesV4 = require("../middlewares/protectV4");
const UserPrivilegesV5 = require("../middlewares/protectV5");
const {
  getCoursesController,
  getCourseById,
} = require("../controllers/coursesController");
const upload = require("../utils/uploadImage");
const {
  getCartController,
  addToCartController,
  removeItemFromCartController,
  checkoutCartController,
  handlePayment,
  paymentUserEndPoint,
  paymentSuccess,
} = require("../controllers/shoppingCourses");
const {
  getFavController,
  addToFavController,
  removeFavController,
} = require("../controllers/favoriteCoursesController");
const {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
} = require("../controllers/wishlistController");
const {
  getMyCoursesController,
} = require("../controllers/userCoursesController");
var router = express.Router();

router.post("/login", loginController);
router.post("/verifyLogin", UserPrivilegesV2, verifyLogin);
router.post("/login/resendOTP", UserPrivilegesV2, resendOTPLogin);

router.post("/signup", userSignupController);
router.post("/resendOTP", UserPrivilegesV3, resendOTPSignup);
router.post("/verify", UserPrivilegesV3, verifyUser);

router.post("/requestPasswordReset", forgotPasswordRequestController);
router.post("/verifyResetPassword", UserPrivilegesV4, verifyForgotPassword);
router.post("/changePassword", UserPrivilegesV5, changePassword);

router.patch(
  "/updateProfile",
  upload.single("image"),
  UserPrivileges,
  updateUserController
);

router.get("/courses", getCoursesController);
router.get("/courses/:id", getCourseById);

router.get("/cart", UserPrivileges, getCartController);
router.post("/cart/:id", UserPrivileges, addToCartController);
router.delete("/cart/:id", UserPrivileges, removeItemFromCartController);
router.get(
  "/cart/checkout",
  UserPrivileges,
  checkoutCartController,
  handlePayment,
  paymentUserEndPoint
);
router.get("/success", paymentSuccess);

router.get("/favorite", UserPrivileges, getFavController);
router.post("/favorite/:id", UserPrivileges, addToFavController);
router.delete("/favorite/:id", UserPrivileges, removeFavController);

router.get("/wishlist", UserPrivileges, getWishlistController);
router.post("/wishlist/:id", UserPrivileges, addToWishlistController);
router.delete("/wishlist/:id", UserPrivileges, removeFromWishlistController);

router.get("/courses", UserPrivileges, getMyCoursesController);

/** MAIL TEMPLATE */
// router.get("/", (req, res) => {
//   res.render("../public/mail-template/index2.ejs", {
//     name: "Yusuf",
//     email: "joeshirf@gmail.com",
//     otp: 1234,
//   });
// });

module.exports = router;
