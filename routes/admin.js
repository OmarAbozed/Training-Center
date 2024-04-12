var express = require("express");
const {
  getApplicationsController,
  acceptApplicationsController,
  rejectApplicationsController,
} = require("../controllers/adminDashboard");
var router = express.Router();

router.get("/applications", getApplicationsController);
router.patch("/applications/approve/:id", acceptApplicationsController);
router.patch("/applications/reject/:id", rejectApplicationsController);

module.exports = router;
