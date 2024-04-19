const { Instructor } = require("../models/Instructor");
const jwt = require("jsonwebtoken");

async function instructorConfirmedCheck(req, res, next) {
  try {
    const instructor = await Instructor.findById(req.instructorId)
    if(!instructor.papers_confirmed){
        return res.status(401).json("FORBIDDEN");
    }
    next();
  } catch (error) {
    return res.status(401).json("FORBIDDEN");
  }
}

module.exports = instructorConfirmedCheck;
