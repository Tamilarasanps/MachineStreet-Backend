const LogInRepository = require("../repositories/LogIn.repository");
const LogInService = require("../services/LogIn.service");
const jwt = require("jsonwebtoken");

const LogInController = () => ({
  login: async (req, res) => {
    try {
      const { mobile, password } = req.body;

      if (!mobile || !password) {
        throw new Error(
          `${!mobile ? "Mobile number" : "Password"} is required`
        );
      }

      const result = await LogInService().login({ mobile, password });

      if (result) {
        res.cookie("authToken", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 90 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          token: result.token,
          role: result.role,
          userId: result.userId,
          message: result.message,
        });
      }
    } catch (err) {
      return res.status(400).json({
        err: err,
        message: err.message,
        description: err?.description || "",
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      
      if (!req.otpVerified) {
        return res.status(400).json({ error: "OTP not verified" });
      }

      res.status(200).json({ message: "otp verified"  });
    } catch (err) {
      return res.status(400).json({
        err: err,
        message: err.message,
        description: err?.description || "",
      });
    }
  },
});

module.exports = LogInController;
