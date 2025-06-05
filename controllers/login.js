const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usermodel = require("../models/userSIgnUp");
const mobileOrEmailCheck = require("../middlewares/mobileOrEmailCheck");
const router = express.Router();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

router.post("/", mobileOrEmailCheck, async (req, res) => {
  try {
    const { mailOrphone, password } = req.body;

    // Search for user by email/mobile
    const user = await usermodel.collection.findOne({
      [req.recipient]: mailOrphone,
    });

    // Check if user exists and password matches
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Generate JWT Token
        const token = jwt.sign(
          { id: user._id, email: user.email || user.phone },
          JWT_SECRET
        );
        res.status(200).json({
          message: "Logged In Successfully",
          token, // Return the token
          role: user.role,
          qr: user.qr,
        });
      } else {
        console.log("Invalid Password");
        res.status(401).json({ message: "Invalid Password" });
      }
    } else {
      console.log("User not found");
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "An error occurred",
      error: err.message,
    });
  }
});

module.exports = router;
