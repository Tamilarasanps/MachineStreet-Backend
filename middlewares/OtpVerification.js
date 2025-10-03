const Otp = require("../models/Otp.model.js");

const verifyOtp = async (req, res, next) => {
  try {
    const { userDetails, otp, page } = req.body;
    const mobileNumber =
      page === "login"
        ? userDetails.mobile // already string
        : userDetails.mobile.number; // object case

    const record = await Otp.findOne({
      mobile: mobileNumber,
      otp: otp,
    });

    if (!record) {
      throw new Error("Invalid or expired OTP");
    }

    // delete OTP after successful verification
    await Otp.deleteOne({ _id: record._id });

    // safer than overwriting req.status
    req.otpVerified = true;
    req.verifiedMobile = userDetails.mobile;

    next();
  } catch (err) {
    res.status(500).json({ message : err.message || "OTP verification failed" });
  }
};

module.exports = verifyOtp;
