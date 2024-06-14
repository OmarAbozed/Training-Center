const { Course } = require("../models/Course");
const { Content } = require("../models/CourseContent");
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

async function getCourseContentController(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json("Course Not Found");
    }
    const user = await User.findById(req.userId);
    if (!(course._id in user.courses)) {
      return res.status(401).json("This Course is not on your list");
    }
    const content = await Content.find({ courseId: course._id });
    if (!content[0]) {
      return res.status(404).json("No Content Available");
    }
    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { getMyCoursesController, getCourseContentController };
