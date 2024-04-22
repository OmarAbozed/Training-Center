const { User } = require("../models/User");

async function getMyCoursesController(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json("User not found");
    }
    const courses = await User.findById(user._id)
      .populate("courses")
      .select("courses");
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { getMyCoursesController };
