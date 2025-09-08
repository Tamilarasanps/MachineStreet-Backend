const express = require('express');
const router = express.Router();
const OtpVerification = require('../middlewares/OtpVerification')

const logInController = require('../controllers/LogIn.controller')() 

router.post('/',logInController.login)
router.post('/otpverification',OtpVerification,logInController.forgotPassword)



module.exports = router;