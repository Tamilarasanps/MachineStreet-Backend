require("dotenv").config();
const axios = require("axios");
const qs = require("qs");

const mobileOtp = async (phone, otp, dialCode) => {
  try {
    if (!phone || !otp || !dialCode) {
      throw new Error("OTP Error|Please try again later");
    }
    // Fill your template exactly as approved in DLT
    const message = `Your OTP is ${otp} to complete your account registration in https://machinestreets.com/. Do not share this with anyone -CHINNAMMAL ENTERPRISES`;

    const params = {
      key: process.env.PIN4SMS_KEY,
      route: process.env.PIN4SMS_ROUTE,       // e.g. 4 for Trans OTP
      sender: process.env.PIN4SMS_SENDER_ID, // your header
      number: `${dialCode}${phone}`,
      sms: message,
      templateid: process.env.PIN4SMS_TEMPLATE_ID,
    };

    const url = "https://site.ping4sms.com/api/smsapi?" + qs.stringify(params);

    const resp = await axios.get(url);

    // Success check
    if (!isNaN(resp.data)) {
      return { success: true, message: "OTP sent", messageId: resp.data };
    } else {
      throw new Error(resp.data || "Failed to send via Ping4SMS");
    }
  } catch (err) {
    console.error("Error sending OTP:", err);
    return { success: false, error: err.message };
  }
};

module.exports = mobileOtp;
