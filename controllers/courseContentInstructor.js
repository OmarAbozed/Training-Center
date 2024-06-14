const { Course } = require("../models/Course");
const { Content } = require("../models/CourseContent");

async function addContentController(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json("Course Not Found");
    }
    const content = new Content({
      courseId: course._id,
      title: req.body.title,
      media: `https://165.232.129.48:3000/${req.file.filename}`,
    });
    await content.save();
    return res.status(201).json(content);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getCourseContentController(req, res) {
  try {
    const content = await Content.find({ courseId: req.params.id });
    if (!content[0]) {
      return res.status(404).json("No Content Found");
    }
    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { getCourseContentController, addContentController };
