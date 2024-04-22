const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    subtitle: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      minLength: 2,
    },
    topics: {
      type: [String],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      required: true,
    },
    update_eligibility: {
      type: Boolean,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    prerequisite: {
      type: [String],
      required: false,
    },
    skills_accrued: {
      type: [String],
      required: true,
    },
    language: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    level: {
      type: String,
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.ObjectId,
      ref: "Instructor",
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    slug: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
      required: false,
    },
    sellings: {
      type: Number,
      required: false,
      default: 0,
    },
    students: {
      type: [mongoose.Schema.ObjectId],
      required: false,
      default: [],
      ref: "User",
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
exports.Course = Course;
