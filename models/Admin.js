const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    password: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
  }
);

const Admin = mongoose.model("Admin", adminSchema);
exports.Admin = Admin;
