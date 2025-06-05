const profileRepository = require("../repositories/profileRepository");

const profileService = {
  getProfile: async (userId) => {
    try {
      const userProfile = await profileRepository.getProfile(userId);

      return(userProfile)
    } 
    catch (err) {
       throw new Error(err.message)
    }
  },
  updateProfile: async (userId,userData) => {
    try {
      const userProfile = await profileRepository.updateProfile(userId,userData);

      return(userProfile)
    } 
    catch (err) {
       throw new Error(err.message)
    }
  },
  passwordReset: async (userId,newPass) => {
    try {

      const userProfile = await profileRepository.passwordReset(userId,newPass);
      return(userProfile)
    } 
    catch (err) {
       throw new Error(err.message)
    }
  },
};

module.exports = profileService;
