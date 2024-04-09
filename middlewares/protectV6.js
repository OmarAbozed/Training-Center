const jwt = require("jsonwebtoken");
const { Instructor } = require("../models/Instructor");

async function InstructorPrivileges(req, res, next) {
  try {
    if (!req.header("Authorization")) {
      return res.status(401).json("FORBIDDEN");
    }
    const key = req.header("Authorization").split(" ")[0];
    const token = req.header("Authorization").split(" ")[1];
    if (key !== process.env.JWT_KEYWORD) {
      console.log("flag1");
      return res.status(401).json("FORBIDDEN");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_V6);
    console.log(decoded._id);
    const instructor = await Instructor.findById(decoded._id);
    if (!instructor) {
      console.log(instructor);
      return res.status(401).json("FORBIDDEN");
    }
    req.instructorId = decoded._id;
    next();
  } catch (error) {
    console.log("flag3");
    return res.status(401).json("FORBIDDEN");
  }
}

module.exports = InstructorPrivileges;
