const { Admin } = require("../models/Admin");
const { OTP } = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

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
    await OTP.deleteMany({ email: admin.username });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 5);

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: admin.username,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: admin.username,
      email: admin.username,
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
      to: admin.username,
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

async function adminVerifyLogin(req, res) {
  try {
    if (!req.body.otp) {
      return res.status(401).json("Must provide otp..");
    }
    const user = await Admin.findById(req.adminId);
    if (!user) {
      return res.status(404).json({ msg: "Admin not found." });
    }
    const otp = await OTP.findOne({ email: user.username });
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
    await OTP.deleteMany({ email: user.username });
    let userWithoutPassword = { ...user };
    delete userWithoutPassword._doc.password;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_ADMIN_SECRET, {
      expiresIn: process.env.JWT_ADMIN_EXPIRE,
    });
    return res
      .status(200)
      .json({ user: userWithoutPassword._doc, token: token });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}
module.exports = { adminLogin, adminVerifyLogin };
