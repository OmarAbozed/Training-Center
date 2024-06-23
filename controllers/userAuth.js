const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { OTP } = require("../models/OTP");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const { error } = require("console");

async function userSignupController(req, res) {
  try {
    if (!req.body.email) {
      return res.status(400).json("Please Provide a valid email");
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json("User Already Exist");
    }
    user = new User({
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      image: req.body.image,
      password: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      github: req.body.github,
      linkedin: req.body.linkedin,
    });
    await user.save();
    await OTP.deleteMany({ email: req.body.email });
    const d1 = new Date();
    d1.setMinutes(d1.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 5);
    let otp = Math.floor(1000 + Math.random() * 9000);
    let otpObj = new OTP({
      code: bcrypt.hashSync(String(otp), 10),
      email: req.body.email,
      createdAt: Number(d1),
      expiresAt: Number(d2),
    });
    await otpObj.save();
    const data = {
      name: user.name,
      email: user.email,
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
      to: user.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_V3, {
      expiresIn: process.env.JWT_EXPIRE_V3,
    });
    const userWithoutPassword = { ...user };
    delete userWithoutPassword._doc.password;
    return res
      .status(201)
      .json({ user: userWithoutPassword._doc, token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function resendOTPSignup(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "user not found.." });
    }
    await OTP.deleteMany({ email: user.email });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 5);

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: user.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: user.name,
      email: user.email,
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
      to: user.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_V3, {
      expiresIn: process.env.JWT_EXPIRE_V3,
    });
    res.status(201).json({ msg: "code sent..", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function resendOTPLogin(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "user not found.." });
    }
    await OTP.deleteMany({ email: user.email });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 5);

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: user.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: user.name,
      email: user.email,
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
      to: user.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_V2, {
      expiresIn: process.env.JWT_EXPIRE_V2,
    });
    res.status(201).json({ msg: "code sent..", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function verifyUser(req, res) {
  try {
    if (!req.body.otp) {
      return res.status(401).json("Must provide otp..");
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    if (user.verified) {
      return res.status(400).json({ msg: "User already verified." });
    }
    const otp = await OTP.findOne({ email: user.email });
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
    user.verified = true;
    await user.save();
    await OTP.deleteMany({ email: user.email });
    return res.status(200).json({ msg: "User verified successfully." });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function loginController(req, res) {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json("Invalid Credentials");
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("User not found..");
    }
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(404).json("Wrong Email or Password");
    }
    if (!user.verified) {
      return res.status(401).json("Account is not verified");
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_V2, {
      expiresIn: process.env.JWT_EXPIRE_V2,
    });
    await OTP.deleteMany({ email: user.email });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 5);

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: user.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: user.name,
      email: user.email,
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
      to: user.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    res.status(200).json({ msg: "code sent..", token: token });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function verifyLogin(req, res) {
  try {
    if (!req.body.otp) {
      return res.status(401).json("Must provide otp..");
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    const otp = await OTP.findOne({ email: user.email });
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
    await OTP.deleteMany({ email: user.email });
    let userWithoutPassword = { ...user };
    delete userWithoutPassword._doc.password;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    return res
      .status(200)
      .json({ user: userWithoutPassword._doc, token: token });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function forgotPasswordRequestController(req, res) {
  try {
    if (!req.body.email) {
      return res.status(422).json("Invalid Credentials");
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("User not found");
    }
    await OTP.deleteMany({ email: user.email });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 5);

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: user.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: user.name,
      email: user.email,
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
      to: user.email,
      subject: "Change Password!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_V4, {
      expiresIn: process.env.JWT_EXPIRE_V4,
    });
    res.status(201).json({ msg: "code sent..", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function verifyForgotPassword(req, res) {
  try {
    if (!req.body.otp) {
      return res.status(401).json("Must provide otp..");
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    const otp = await OTP.findOne({ email: user.email });
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
    await OTP.deleteMany({ email: user.email });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_V5, {
      expiresIn: process.env.JWT_EXPIRE_V5,
    });
    return res
      .status(200)
      .json({ msg: "Proceed to change your password", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function changePassword(req, res) {
  try {
    if (!req.body.password) {
      return res.status(422).json("Invalid Credentials");
    }
    const user = await User.findById(req.userId);
    if (!user) {
      throw error;
    }
    user.password = bcrypt.hashSync(req.body.password, 10);
    await user.save();
    return res.status(200).json("Password Changed Successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function updateUserController(req, res) {
  try {
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json("user not found");
    }

    if (req.file) {
      req.body.image = `https://165.232.129.48:3000/${req.file.filename}`;
    }

    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    if (req.body.verified) {
      return res.status(401).json("FORBIDDEN");
    }

    let updatedUser = await User.findByIdAndUpdate(req.userId, req.body);
    let newUser = await User.findById(req.userId);
    let userWithoutPassword = { ...newUser };
    delete userWithoutPassword._doc.password;
    return res.status(200).json(userWithoutPassword._doc);
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

module.exports = {
  userSignupController,
  resendOTPSignup,
  verifyUser,
  loginController,
  verifyLogin,
  forgotPasswordRequestController,
  verifyForgotPassword,
  changePassword,
  resendOTPLogin,
  updateUserController,
};

/**
 * after signup => send otp => store otp in database (id, code, email, created at, expires at)
 *
 */
