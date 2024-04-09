const mongoose = require("mongoose");
const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    email: {
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
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    experience: {
      type: Number,
      required: true,
    },
    linkedin: {
      type: String,
      required: false,
      default: "N/A",
      maxLength: 255,
    },
    bio: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    ID: {
      type: String,
      required: false,
    },
    CV: {
      type: String,
      required: false,
    },
    Graduation_Certificate: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      required: false,
      default: false,
    },
    papers_confirmed: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

const Instructor = mongoose.model("Instructor", instructorSchema);
exports.Instructor = Instructor;
