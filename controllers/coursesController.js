const { Course } = require("../models/Course");
const coursesData = require("../data.json");

async function addCourseController(req, res) {
  try {
    const course = new Course({
      title: req.body.title,
      subtitle: req.body.title,
      image: `http://165.232.129.48:3000/${req.file.filename}`,
      description: req.body.description,
      topics: req.body.topics.map((topic) => topic.toLowerCase()),
      duration: req.body.duration,
      available: req.body.available,
      update_eligibility: req.body.update_eligibility,
      price: req.body.price,
      prerequisite: req.body.prerequisite,
      skills_accrued: req.body.skills_accrued,
      language: req.body.language,
      instructorId: req.instructorId,
      level: req.body.level,
      slug: req.body.title.trim().split(" ").join("").toLowerCase(),
      keywords: req.body.keywords,
    });
    await course.save();
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getCoursesController(req, res) {
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    let sort = req.query.sort || "rating";
    let topics = req.query.topics || "All";

    const courses = await Course.find({}, { topics: 1, keywords: 1 });
    const uniqueWords = new Set();

    courses.forEach((course) => {
      course.topics.forEach((topic) => {
        const words = topic.split(" ");
        words.forEach((word) => uniqueWords.add(word.toLowerCase()));
      });
    });

    topics === "All"
      ? (topics = [...uniqueWords])
      : (topics = req.query.topics.split(","));

    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

    let sortBy = {};
    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    const searchResults = await Course.find({
      title: { $regex: search, $options: "i" },
    })
      .where("topics")
      .in([...topics])
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit);

    const total = await Course.countDocuments({
      topics: { $in: [...topics] },
      title: { $regex: search, $options: "i" },
    });

    const response = {
      total,
      page: page + 1,
      limit,
      topics: topics,
      searchResults,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}
async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructorId"
    );
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

// const seedCourses = async () => {
//   try {
//     const docs = await Course.insertMany(coursesData, {
//       writeConcern: { wtimeout: 0 },
//     });
//     return Promise.resolve(docs);
//   } catch (error) {
//     return Promise.reject(error);
//   }
// };

// seedCourses()
//   .then((docs) => console.log(docs))
//   .catch((err) => console.log(err));

module.exports = { addCourseController, getCoursesController, getCourseById };
