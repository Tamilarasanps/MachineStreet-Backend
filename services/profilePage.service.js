const profilePageRepository = require("../repositories/profilePage.respository");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const profilePageService = {
  postUpload: async (fileId, description, userId, type, contentType) => {
    try {
      const result = await profilePageRepository.postUpload(
        fileId,
        description,
        userId,
        type,
        contentType
      );
      return result;
    } catch (err) {
      throw err;
    }
  },
  deletePost: async (postId, userId) => {
    try {
      const result = await profilePageRepository.deletePost(postId, userId);
      return result;
    } catch (err) {
      throw err;
    }
  },

  getSelectedMechanic: async (id) => {
    try {
      const result = await profilePageRepository.getSelectedMechanic(id);
      return result;
    } catch (err) {
      throw err;
    }
  },

  getMediaStream: async (id) => {
    const file = await profilePageRepository.findMediaFileById(id);
    if (!file) {
      return { file: null };
    }

    const bucket = profilePageRepository.getMediaBucket();
    const stream = bucket.openDownloadStream(file._id);

    const fileLength = file.length;
    let downloaded = 0;

    stream.on("data", (chunk) => {
      downloaded += chunk.length;
      const percent = ((downloaded / fileLength) * 100).toFixed(2);
      console.log(`Downloaded: ${percent}%`);
    });

    return { file, stream };
  },

  postLikes: async (postId, userId) => {
    try {
      const result = await profilePageRepository.postLikes(postId, userId);
      return result;
    } catch (err) {
      throw err;
    }
  },

  postComment: async (comment, postId) => {
    try {
      const result = await profilePageRepository.postComment(comment, postId);
      return result;
    } catch (err) {
      throw err;
    }
  },
  userDetailsUpdate: async (userDetails, userId) => {
    try {
      const result = await profilePageRepository.userDetailsUpdate(
        userDetails,
        userId
      );
      return result;
    } catch (err) {
      throw err;
    }
  },

  resetPassword: async (userId, newPassword) => {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await profilePageRepository.resetPassword(userId, hashedPassword);
    } catch (error) {
      console.error("Error in resetPassword service:", error);
      throw error;
    }
  },
};

module.exports = profilePageService;
