const Otp = require('../models/Otp.model')

const signUpRepo = require('../repositories/SignUp.repository')

const signUpService = () => ({
    getIndustry: async () => {
        try {

            const result = await signUpRepo().getIndustry();
            return result;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    sendOtp: async (userDetails,page) => {
        try {

            const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            
            const result = await signUpRepo().sendOtp(userDetails,newOtp,page)           

            return (result)
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    register: async (userDetails) => {
        try {

            const result = await signUpRepo().register(userDetails)

            return (result)
        }
        catch (err) {
            throw err;
        }
    }
})

module.exports = signUpService