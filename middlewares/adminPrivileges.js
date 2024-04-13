const jwt = require("jsonwebtoken");
const { Admin } = require("../models/Admin");

async function AdminPrivileges(req, res, next) {
  try {
    if (!req.header("Authorization")) {
      return res.status(401).json("FORBIDDEN");
    }
    const key = req.header("Authorization").split(" ")[0];
    const token = req.header("Authorization").split(" ")[1];
    if (key !== process.env.JWT_KEYWORD_ADMIN) {
      console.log("flag1");
      return res.status(401).json("FORBIDDEN");
    }
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    console.log(decoded._id);
    const user = await Admin.findById(decoded._id);
    if (!user) {
      console.log("flag2");
      return res.status(401).json("FORBIDDEN");
    }
    req.adminId = decoded._id;
    next();
  } catch (error) {
    console.log("flag3");
    console.log(error);
    return res.status(401).json("FORBIDDEN");
  }
}

module.exports = AdminPrivileges;
