const { Instructor } = require("../models/Instructor");

async function getApplicationsController(req, res) {
  try {
    const applications = await Instructor.find({
      papers_confirmed: false,
    }).select("_id name ID CV Graduation_Certificate verified createdAt");
    console.log(applications);
    if (!applications) {
      return res.status(404).json("No applications found");
    }
    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function acceptApplicationsController(req, res) {
  try {
    let instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json("Instructor not found");
    }
    if (instructor.papers_confirmed) {
      return res.status(400).json("Instructor already accepted");
    }
    instructor.papers_confirmed = true;
    instructor.rejected = false;
    instructor.rejectComment = "Rejection Reason Fulfilled";
    await instructor.save();
    return res.status(200).json("Instructor approved");
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function rejectApplicationsController(req, res) {
  try {
    if (!req.body.comment) {
      return res.status(400).json("Provide a reject comment");
    }
    let instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json("Instructor not found");
    }
    if (instructor.rejected) {
      return res.status(400).json("Instructor already rejected");
    }
    instructor.papers_confirmed = false;
    instructor.rejected = true;
    instructor.rejectComment = req.body.comment;
    await instructor.save();
    return res.status(200).json("Instructor rejected");
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  getApplicationsController,
  acceptApplicationsController,
  rejectApplicationsController,
};
