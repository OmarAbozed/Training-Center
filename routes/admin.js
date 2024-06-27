var express = require("express");
const {
  getApplicationsController,
  acceptApplicationsController,
  rejectApplicationsController,
} = require("../controllers/adminDashboard");
const { adminLogin, adminVerifyLogin } = require("../controllers/adminAuth");
const AdminPrivileges = require("../middlewares/adminPrivileges");

var router = express.Router();

router.post("/login", adminLogin);
router.post("/verifyLogin", AdminPrivileges, adminVerifyLogin);
router.get("/applications", AdminPrivileges, getApplicationsController);
router.patch(
  "/applications/approve/:id",
  AdminPrivileges,
  acceptApplicationsController
);
router.patch(
  "/applications/reject/:id",
  AdminPrivileges,
  rejectApplicationsController
);

module.exports = router;
