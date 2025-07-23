const profileRepository = require("../../repositories/profileRepository");
const profileService = require("../../services/profilePage");

const profilePage = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await profileService.getProfile(userId);
    res.status(200).json(userProfile);
  } catch (err) {
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = req.body;
    const userProfile = await profileService.updateProfile(userId, userData);
    res
      .status(200)
      .json({ message: "User Details updated Succesfully", userProfile });
  } catch (err) {
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
};
const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    // const {postId} = req.body;
    const { imagetype } = req.params;

    if ((!req.files.images)) {
      return res.status(300).json({ message: "No images or videos uploaded" });
    }

    const images = req.files.images
      ? req.files.images.map((image) => image.id)
      : [];
      console.log('imagetype :', imagetype)
      console.log('image :', images[0])
    const userProfileImage = await profileRepository.updateProfileImage(userId,images[0].toString(),imagetype);
    res.status(200).json({message : "Profile picture Succesfully updated",userProfileImage});
  } catch (err) {
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
};
const passwordReset = async (req, res) => {
  try {
    const userId = req.user.id;
    const password = req.body;

    console.log(userId, password);
    const userProfile = await profileService.passwordReset(userId, password);
    res
      .status(200)
      .json({ message: "Password updated Succesfully", userProfile });
  } catch (err) {
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
};

module.exports = {
  profilePage,
  updateProfile,
  passwordReset,
  updateProfileImage,
};
