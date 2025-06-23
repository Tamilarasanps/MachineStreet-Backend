const express = require("express");
const nodemailer = require("nodemailer");
const NodeCache = require("node-cache");
const user = require("../models/userSIgnUp");
const mobileOrEmailCheck = require("../middlewares/mobileOrEmailCheck");
const bcrypt = require("bcryptjs");
const getGeoCoords = require("../middlewares/geocoords");
const twilio = require("twilio");
const axios = require("axios");
const { countries } = require("country-data");
require("dotenv").config();

const router = express.Router();
const myCache = new NodeCache({ stdTTL: 60 });

// Utility Functions
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mobileClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const sendMobileOtp = async (phone, otp, dialCode) => {
  try {
    // Send SMS
    await mobileClient.messages.create({
      body: `🔐 Your verification code is ${otp}. It is valid for the next 1 minutes. Do not share this code with anyone.`,
      to: `${dialCode}${phone}`,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return { success: true, message: "OTP sent to mobile and email successfully" };
  } catch (err) {
    return { success: false, error: err.message };
  }
};


// Utility to send OTP via Email
const sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your One-Time Verification Code",
    text: `Hello,\n\nYour one-time verification code is: ${otp}\n\nThis code is valid for the next 1 minutes.\n\nIf you did not request this code, it may mean someone else is trying to access your account. Please secure your account or contact support if this wasn't you.\n\nStay safe,\n\nMachineStreets Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent to email successfully" };
  } catch (err) {
    console.error("Error sending OTP via email:", err);
    return { success: false, error: err.message };
  }
};

// Cache Helper Functions
const cacheStore = async (
  username,
  recipient,
  dialCode,
  mailOrphone,
  role,
  mechanicDetails,
  otp,
  ip
) => {
  let response;
  if (recipient === "email") {
    response = await sendEmailOTP(mailOrphone, otp);
  } else {
    response = await sendMobileOtp(mailOrphone, otp, dialCode);
  }

  const userData = {
    username,
    dialCode: dialCode,
    ip:ip,
    [recipient]: mailOrphone,
    OTP: otp,
    role: role,
    mechanicDetails: mechanicDetails,
  };
  console.log("otp :", otp);
  const userOtp = {
    username,
    OTP: otp,
  };
  myCache.set(mailOrphone + "otp", userOtp, 60);
  myCache.set(mailOrphone, userData, 300);
  return response;
};

const getCachedOtp = (req, res, next) => {
  const { mailOrphone } = req.body;
  const cachedData = myCache.get(mailOrphone + "otp");

  if (!myCache.has(mailOrphone)) {
    return res.status(404).json({ message: "Otp expired." });
  } else if (!cachedData) {
    return res.status(410).json({ message: "OTP has expired." });
  }
  next();
};

const getCache = (req, res, next) => {
  const { mailOrphone } = req.body;
  // const cachedData = myCache.get(mailOrphone+"otp");
  const userData = myCache.get(mailOrphone);
  // console.log("cached :", cachedData);

  if (!myCache.has(mailOrphone)) {
    return res.status(404).json({ message: "Session has expired." });
  } else if (!userData) {
    return res.status(410).json({ message: "Session has expired." });
  }

  req.user = userData;
  console.log(req.user);
  next();
};

// Routes
router.post("/", mobileOrEmailCheck, async (req, res) => {
  const { mailOrphone, username, role, mechanicDetails } = req.body;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;

  const url = `https://api.ipinfo.io/lite/${ip}?token=${process.env.IPINFO_AUTH_TOKEN}`;

  let dialCode = "";

  if (req.recipient === "mobile") {
    const response = await axios.get(url);
    const countryCode = response.data.country_code; // e.g., 'IN'
    console.log("countryCode :", countryCode);
    dialCode = countries[countryCode].countryCallingCodes[0]; // '+91'
    console.log("dialCode :", dialCode);
  }

  const existingUser = await user.findOne({
    $or: [{ email: mailOrphone }, { "mobile.number": mailOrphone }],
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ message: `${req.recipient} already exists. Please log in.` });
  }

  try {
    const otp = generateOTP();
    const response = await cacheStore(
      username,
      req.recipient,
      dialCode,
      mailOrphone,
      role,
      mechanicDetails,
      otp,
      ip
    );

    if (
      response.status === "sent" ||
      response.status === "queued" ||
      response.status === "delivered" ||
      response.success
    ) {
      return res.status(200).json({
        message: response.message,
        [req.recipient]: mailOrphone,
        username,
      });
    } else {
      throw new Error(response.error);
    }
  } catch (err) {
    console.error("Error in sending OTP:", err);
    return res
      .status(500)
      .json({ message: "Error in sending OTP", error: err.message });
  }
});
router.post(
  "/otpcheck",
  mobileOrEmailCheck,
  getCachedOtp,
  getCache,
  async (req, res) => {
    try {
      const { otp, mailOrphone } = req.body;

      // Validate input
      if (!otp || !mailOrphone) {
        console.error("Missing OTP or email/mobile.");
        return res
          .status(400)
          .json({ message: "OTP and email/mobile are required." });
      }

      // Check OTP and mailOrphone against user data
      if (
        req.user &&
        mailOrphone === req.user[req.recipient] &&
        otp === req.user.OTP
      ) {
        return res
          .status(200)
          .json({ message: "OTP verification successful." });
      } else {
        return res
          .status(401)
          .json({ message: "Incorrect Otp. OTP verfication failed !" });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error during OTP verification:", error);
      return res
        .status(500)
        .json({ message: "Internal server error. Please try again later." });
    }
  }
);

router.post("/resendotp", mobileOrEmailCheck, getCache, async (req, res) => {
  try {
    const { mailOrphone } = req.body;
    const newOtp = generateOTP();
    const response = await cacheStore(
      req.user.username,
      req.recipient,
      req.user.dialCode,
      mailOrphone,
      req.user.role,
      req.user.mechanicDetails,
      newOtp,
      req.user.ip
    );

    if ( response.status === "sent" ||
      response.status === "queued" ||
      response.status === "delivered" ||
      response.success) {
      return res.status(200).json({
        message: response.message,
        [req.recipient]: mailOrphone,
        username: req.user.username,
        OTP: newOtp,
      });
    } else {
      throw new Error(response.error);
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { password, confirmpass, mailOrphone } = req.body;
    console.log(mailOrphone);
    // Validate input
    if (!password || !confirmpass || !mailOrphone) {
      return res.status(400).json({
        message: "Password, confirm password, and email/phone are required.",
      });
    }

    // Check if passwords match
    if (password !== confirmpass) {
      return res
        .status(400)
        .json({ message: "Password and confirm password do not match." });
    }

    // Check if cache exists for the provided email or phone
    const cachedUser = myCache.get(mailOrphone);
    if (!cachedUser) {
      return res.status(404).json({
        message: "Something went wrong please try again later",
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user object
    const newUserData = {
      username: cachedUser.username,
      role: cachedUser.role,
      password: hashedPassword,
    };

    if (cachedUser.email) newUserData.email = cachedUser.email;
    if (cachedUser.mobile) {
      newUserData.mobile = {
        countryCode: cachedUser.dialCode,
        number: cachedUser.mobile,
      };
    }

    // Check if the role is "mechanic" and add additional fields
    if (cachedUser.role === "mechanic") {
      const location = JSON.parse(cachedUser.mechanicDetails.location);

      // If coords missing, get from state/district
      let coords = location?.coords;
      if (!coords?.latitude || !coords?.longitude) {
        const locationQuery =
          location.district || location.region || location.country;
        const geo = await getGeoCoords(locationQuery);

        if (!geo) {
          return res.status(400).json({
            message: "Could not fetch geo coordinates from location.",
          });
        }

        coords = {
          latitude: geo.lat,
          longitude: geo.lon,
        };
      }

      newUserData.organization =
        cachedUser.mechanicDetails.organization || null;
      newUserData.services = cachedUser.mechanicDetails.services || null;
      newUserData.industry = cachedUser.mechanicDetails.industry || null;
      // newUserData.category = cachedUser.mechanicDetails.category || null;
      newUserData.subcategory = cachedUser.mechanicDetails.subcategory || null;
      newUserData.contact = cachedUser.mechanicDetails.contact;
      newUserData.bio = cachedUser.mechanicDetails.bio;
      newUserData.geoCoords = {
        type: "Point",
        coordinates: [Number(coords.longitude), Number(coords.latitude)],
      };
      newUserData.country = location.country;
      newUserData.region = location.region;
      newUserData.district = location.district;
    }

    // Create a new user object with the updated data
    const newUser = new user(newUserData);

    myCache.del(`${cachedUser.Email}`);

    // Save to the database
    await newUser.save();

    // Success response
    res.status(200).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error in user registration:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

module.exports = router;
