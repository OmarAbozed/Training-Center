const { Admin } = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function adminLogin(req, res) {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json("Provide valid username or password");
    }
    let admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      return res.status(404).json("admin not found");
    }
    const valid = bcrypt.compareSync(req.body.password, admin.password);
    if (!valid) {
      return res.status(401).json("Wrong username or password");
    }
    let token = jwt.sign({ _id: admin._id }, process.env.JWT_ADMIN_SECRET, {
      expiresIn: process.env.JWT_ADMIN_EXPIRE,
    });
    return res.status(200).json(token);
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { adminLogin };
