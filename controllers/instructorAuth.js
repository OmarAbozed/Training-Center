const { Instructor } = require("../models/Instructor");
const { OTP } = require("../models/OTP");
const path = require("path");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const ejs = require("ejs");

async function signupInstructorController(req, res) {
  try {
    if (!req.body.email) {
      return res.status(400).json("Please Provide a valid email");
    }
    let instructor = await Instructor.findOne({ email: req.body.email });
    if (instructor) {
      return res.status(400).json("Instructor Already Exist");
    }
    instructor = new Instructor({
      name: req.body.name,
      email: req.body.email,
      image: `http://165.232.129.48:3000/${req.file.filename}`,
      password: bcrypt.hashSync(req.body.password, 10),
      title: req.body.title,
      experience: req.body.experience,
      bio: req.body.bio,
    });

    await instructor.save();
    await OTP.deleteMany({ email: req.body.email });
    const d1 = new Date();
    /////////////////////////////////////////////////// EXPIRE //////////////////
    d1.setMinutes(d1.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 5);
    /////////////////////////////////////////////////// EXPIRE //////////////////
    let otp = Math.floor(1000 + Math.random() * 9000);
    let otpObj = new OTP({
      code: bcrypt.hashSync(String(otp), 10),
      email: req.body.email,
      createdAt: Number(d1),
      expiresAt: Number(d2),
    });
    await otpObj.save();
    const data = {
      name: instructor.name,
      email: instructor.email,
      otp: otp,
    };
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "mail-template",
      "index2.ejs"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    const modifiedEmailTemplate = ejs.render(fileContent, data);
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    let message = {
      from: "Training Center",
      to: instructor.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    const token = jwt.sign({ _id: instructor._id }, process.env.JWT_SECRET_V6, {
      expiresIn: process.env.JWT_EXPIRE_V6,
    });
    const instructorWithoutPassword = { ...instructor };
    delete instructorWithoutPassword._doc.password;
    return res
      .status(201)
      .json({ user: instructorWithoutPassword._doc, token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function signupResendOTPController(req, res) {
  try {
    const instructor = await Instructor.findById(req.instructorId);
    if (!instructor) {
      return res.status(404).json({ error: "instructor not found.." });
    }
    await OTP.deleteMany({ email: instructor.email });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    //////////////////////////////////////EXPIRES////////////////////////////////////////////
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 5);
    //////////////////////////////////////EXPIRES////////////////////////////////////////////

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: instructor.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: instructor.name,
      email: instructor.email,
      otp: otp,
    };
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "mail-template",
      "index2.ejs"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    const modifiedEmailTemplate = ejs.render(fileContent, data);
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    let message = {
      from: "Training Center",
      to: instructor.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    const token = jwt.sign({ _id: instructor._id }, process.env.JWT_SECRET_V6, {
      expiresIn: process.env.JWT_EXPIRE_V6,
    });
    res.status(201).json({ msg: "code sent..", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function verifySignupController(req, res) {
  try {
    if (!req.body.otp) {
      return res.status(401).json("Must provide otp..");
    }
    const instructor = await Instructor.findById(req.instructorId);
    if (!instructor) {
      return res.status(404).json({ msg: "Instructor not found." });
    }
    if (instructor.verified) {
      return res.status(400).json({ msg: "Instructor already verified." });
    }
    const otp = await OTP.findOne({ email: instructor.email });
    if (!otp) {
      return res.status(404).json({ msg: "No OTP was sent." });
    }
    if (!(await bcrypt.compare(req.body.otp, otp.code))) {
      return res.status(401).json({ msg: "Wrong code." });
    }
    let d = new Date();
    if (Number(d) > Number(otp.expiresAt)) {
      return res.status(400).json({ msg: "OTP has expired." });
    }
    instructor.verified = true;
    await instructor.save();
    await OTP.deleteMany({ email: instructor.email });
    return res.status(200).json({ msg: "Instructor verified successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function loginInstructorController(req, res) {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json("Invalid Credentials");
    }
    const instructor = await Instructor.findOne({ email: req.body.email });
    if (!instructor) {
      return res.status(404).json("instructor not found..");
    }
    const valid = await bcrypt.compare(req.body.password, instructor.password);
    if (!valid) {
      return res.status(404).json("Wrong Email or Password");
    }
    if (!instructor.verified) {
      return res.status(401).json("Account is not verified");
    }
    const token = jwt.sign({ _id: instructor._id }, process.env.JWT_SECRET_V7, {
      expiresIn: process.env.JWT_EXPIRE_V7,
    });
    await OTP.deleteMany({ email: instructor.email });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    ///////////////////////////////////EXPIRES////////////////////////////////////////
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 50);
    ///////////////////////////////////EXPIRES////////////////////////////////////////
    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: instructor.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: instructor.name,
      email: instructor.email,
      otp: otp,
    };
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "mail-template",
      "index2.ejs"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    const modifiedEmailTemplate = ejs.render(fileContent, data);
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    let message = {
      from: "Training Center",
      to: instructor.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    res.status(200).json({ msg: "code sent..", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function resendLoginOTPController(req, res) {
  try {
    const instructor = await Instructor.findById(req.instructorId);
    if (!instructor) {
      return res.status(404).json({ error: "instructor not found.." });
    }
    await OTP.deleteMany({ email: instructor.email });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    ////////////////////////////////////////////////EXPIRES///////////////////////////////
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 50);
    ////////////////////////////////////////////////EXPIRES///////////////////////////////

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: instructor.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: instructor.name,
      email: instructor.email,
      otp: otp,
    };
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "mail-template",
      "index2.ejs"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    const modifiedEmailTemplate = ejs.render(fileContent, data);
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    let message = {
      from: "Training Center",
      to: instructor.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    const token = jwt.sign({ _id: instructor._id }, process.env.JWT_SECRET_V7, {
      expiresIn: process.env.JWT_EXPIRE_V7,
    });
    res.status(201).json({ msg: "code sent..", token: token });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function verifyLoginController(req, res) {
  try {
    if (!req.body.otp) {
      return res.status(401).json("Must provide otp..");
    }
    const instructor = await Instructor.findById(req.instructorId);
    if (!instructor) {
      return res.status(404).json({ msg: "Instructor not found." });
    }
    const otp = await OTP.findOne({ email: instructor.email });
    if (!otp) {
      return res.status(404).json({ msg: "No OTP was sent." });
    }
    if (!(await bcrypt.compare(req.body.otp, otp.code))) {
      return res.status(401).json({ msg: "Wrong code." });
    }
    let d = new Date();
    if (Number(d) > Number(otp.expiresAt)) {
      return res.status(400).json({ msg: "OTP has expired." });
    }
    await OTP.deleteMany({ email: instructor.email });
    let instructorWithoutPassword = { ...instructor };
    delete instructorWithoutPassword._doc.password;
    const token = jwt.sign({ _id: instructor._id }, process.env.JWT_SECRET_V8, {
      expiresIn: process.env.JWT_EXPIRE_V8,
    });
    return res
      .status(200)
      .json({ user: instructorWithoutPassword._doc, token: token });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function uploadPapersController(req, res) {
  try {
    let instructor = await Instructor.findById(req.instructorId);
    if (!instructor) {
      return res.status(404).json("Instructor not found");
    }
    instructor.CV = `http://165.232.129.48:3000/${req.files["CV"][0].filename}`;
    instructor.ID = `http://165.232.129.48:3000/${req.files["ID"][0].filename}`;
    instructor.Graduation_Certificate = `http://165.232.129.48:3000/${req.files["Graduation_Certificate"][0].filename}`;

    await instructor.save();
    return res.status(200).json("Papers Sent");
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  signupInstructorController,
  signupResendOTPController,
  verifySignupController,
  loginInstructorController,
  resendLoginOTPController,
  verifyLoginController,
  uploadPapersController,
};
