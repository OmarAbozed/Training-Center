const { Course } = require("../models/Course");
const { User } = require("../models/User");

async function addToWishlistController(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json("User not found");
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json("Course not found");
    }
    if (user.wishlist.includes(req.params.id)) {
      return res.status(400).json("Course already in wishlist");
    }
    user.wishlist.push(req.params.id);
    await user.save();
    const wishlist = await User.findById(req.userId)
      .populate("wishlist")
      .select("wishlist");
    return res.status(200).json(wishlist);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function removeFromWishlistController(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json("User not found");
    }
    const course = user.wishlist.indexOf(req.params.id);
    if (course !== -1) {
      user.wishlist.splice(course, 1);
      await user.save();
    }
    const wishlist = await User.findById(req.userId)
      .populate("wishlist")
      .select("wishlist");
    return res.status(200).json(wishlist);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getWishlistController(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json("User not found");
    }
    const wishlist = await User.findById(req.userId)
      .populate("wishlist")
      .select("wishlist");
    return res.status(200).json(wishlist);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  addToWishlistController,
  getWishlistController,
  removeFromWishlistController,
};
