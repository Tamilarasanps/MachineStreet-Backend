require('dotenv').config()
const twilio = require("twilio");


const mobileOtp = async(phone, otp, dialCode)=>{
  console.log(phone, otp, dialCode)
    const mobileClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
  
    try {
        if(!phone || !otp || !dialCode){
            throw new Error('OTP Error|Please try again later');         
        }

        // Send SMS
        await mobileClient.messages.create({
          body: `🔐 Your verification code is ${otp}. It is valid for the next 1 minutes. Do not share this code with anyone.`,
          to: `${dialCode}${phone}`,
          from: process.env.TWILIO_PHONE_NUMBER,
        });
    
        return { success: true, message: "OTP sent to mobile successfully" };
      } catch (err) {
        console.log(err)
        return { success: false, error: err.message };
      }
}

module.exports = mobileOtp;