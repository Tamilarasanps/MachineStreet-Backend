// controllers

const signUpService = require("../services/SignUp.service");
const jwt = require("jsonwebtoken");

const signUpController = () => ({
  getIndustry: async (req, res) => {
    try {
      const result = await signUpService().getIndustry();
      return res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },
  sendOtp: async (req, res) => {
    try {
      const { userDetails, page } = await req.body;

      if (!userDetails) {
        throw new Error("userDetails are required");
      }

      const result = await signUpService().sendOtp(userDetails, page);

      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        err: err,
        message: err.message,
        description: err?.description || "",
      });
    }
  },
  register: async (req, res) => {
    try {
      const { userDetails } = req.body;

      if (!req.otpVerified) {
        return res.status(400).json({ error: "OTP not verified" });
      }

      // call service to register
      const result = await signUpService().register(userDetails);

      const secretKey = process.env.JWT_SECRET;
      const token = jwt.sign({ userId: result._id.toString() }, secretKey, {
        expiresIn: "90d",
      });

      if (result) {
        res.cookie("authToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 90 * 24 * 60 * 60 * 1000,
        });
      }

      return res.status(201).json({
        message: "User Registered Successfully",
        user: result,
        role: result.role,
        userId: result._id.toString(),
        token: token,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        err: err,
        message: err.message,
        description: err?.description || "",
      });
    }
  },
});

module.exports = signUpController;
