const { Course } = require("../models/Course");
const { User } = require("../models/User");

async function addToFavController(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json("User not found");
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json("Course not found");
    }
    if (user.favorite.includes(req.params.id)) {
      return res.status(400).json("Course already in favorites");
    }
    user.favorite.push(req.params.id);
    await user.save();
    const fav = await User.findById(req.userId)
      .populate("favorite")
      .select("favorite");
    return res.status(200).json(fav);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function removeFavController(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json("User not found");
    }
    const course = user.favorite.indexOf(req.params.id);
    if (course !== -1) {
      user.favorite.splice(course, 1);
      await user.save();
    }
    const fav = await User.findById(req.userId)
      .populate("favorite")
      .select("favorite");
    return res.status(200).json(fav);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getFavController(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json("User not found");
    }
    const fav = await User.findById(req.userId)
      .populate("favorite")
      .select("favorite");
    return res.status(200).json(fav);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { addToFavController, getFavController, removeFavController };
