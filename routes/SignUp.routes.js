const express = require('express');
const router = express.Router();
const signUpController = require('../controllers/SignUp.controller')() 
const otpverification = require('../middlewares/OtpVerification')

router.get('/getIndustry',signUpController.getIndustry)
router.post('/sendOtp',signUpController.sendOtp)
router.post('/register',otpverification,signUpController.register)


module.exports = router;