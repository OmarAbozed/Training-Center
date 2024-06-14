const mongoose = require("mongoose");
const contentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    media: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);
exports.Content = Content;
