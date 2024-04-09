var express = require("express");
var router = express.Router();
// const upload = require("../utils/uploadImage");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// router.post("/upload", upload.single("image"), (req, res) => {
//   try {
//     console.log(req.file);
//     console.log(req.file.filename);
//     res.send("ok");
//   } catch (error) {
//     return res.status(500).json(error);
//   }
// });

module.exports = router;
