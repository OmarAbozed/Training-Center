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
      slug: req.body.title ? req.body.title.trim().split(" ").join("").toLowerCase() : null,
      keywords: req.body.keywords.map((keyword) => keyword.toLowerCase()),
    });
    await course.save();
    return res.status(200).json(course);
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).send(errors);
    }
    console.log(error)
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
    let keywords = req.query.keywords || "";

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

    const keywordQuery = keywords ? { keywords: { $in: keywords } } : {};

    const searchResults = await Course.find({
      title: { $regex: search, $options: "i" },
      ...keywordQuery,
    })
      .where("topics")
      .in([...topics])
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit);

    const total = await Course.countDocuments({
      topics: { $in: [...topics] },
      title: { $regex: search, $options: "i" },
      ...keywordQuery,
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
    if (!req.params.id) {
      return res.status(400).json("Please provide a valid id");
    }
    const course = await Course.findById(req.params.id).populate(
      "instructorId"
    );
    if (!course) {
      return res.status(404).json("Course not found");
    }
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function updateCourseController(req, res) {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json("Course not found");
    }

    if (req.file) {
      req.body.image = `http://165.232.129.48:3000/${req.file.filename}`;
    }

    for (let key in req.body) {
      if (Array.isArray(course[key]) && Array.isArray(req.body[key])) {
        const mergedArray = [...course[key], ...req.body[key]];
        course[key] = [...new Set(mergedArray)];
      } else if (Array.isArray(course[key]) && req.body[key] === null) {
        course[key] = [];
      } else if (Array.isArray(course[key]) && req.body[key] !== undefined) {
        course[key] = course[key].filter(
          (item) => !req.body[key].includes(item)
        );
      } else {
        course[key] = req.body[key];
      }
    }

    let updatedCourse = await course.save();
    return res.status(200).json(updatedCourse);
  } catch (error) {
    if (error.name === "ValidationError") {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).send(errors);
    }
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

module.exports = {
  addCourseController,
  getCoursesController,
  getCourseById,
  updateCourseController,
};
