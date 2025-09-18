const profilePageService = require("../services/profilePage.service");

const profilePageController = {
  postUpload: async (req, res) => {
    try {
      const userId = req.userId;
      console.log("req.files :", req.files);
      if (!req.files || req.files.length === 0) {
        throw new Error("No files uploaded");
      }

      const description = req.body?.description;
      const type = req.body?.type;

      const result = await profilePageService.postUpload(
        req.files[0].id.toString(),
        description,
        userId,
        type,
        req.files[0].contentType.split("/")[0]
      );

      res.status(200).json({
        message: "Post uploaded successfully",
        post: result,
      });
    } catch (err) {
      console.error("Upload error:", err);
      return res
        .status(400)
        .json({
          err: err,
          message: err.message,
          description: err?.description || "",
        });
    }
    // });
  },

  deletePost: async (req, res) => {
    try {
      const userId = req.userId;
      const { postId } = req.body;

      if (!userId || !postId) {
        return res.status(400).json({ error: "Your actions is not done" });
      }

      const result = await profilePageService.deletePost(postId, userId);

      return res.status(200).json({
        message: "Post deleted successfully",
        updatedUser: result,
      });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getSelectedMechanic: async (req, res) => {
    try {
      const { user } = req.params;
      console.log("user :", user.length);
      console.log("user :", typeof user);
      if (!user) {
        throw new Error("user not found");
      }
      const result = await profilePageService.getSelectedMechanic(
        user.toString()
      );
      return res.status(200).json(result);
    } catch (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

mediaDownload: async (req, res) => {
  try {
    const { id } = req.params;
    console.log('id :',id)
    const { file, stream } = await profilePageService.getMediaStream(id);

    if (!file) {
      return res.status(404).json({ error: "file not found" });
    }

    // ❌ REMOVE these manual headers:
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Access-Control-Allow-Credentials", "true");
    // res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    // res.setHeader("Access-Control-Allow-Headers", "Range");
    console.log("Serving file with contentType:", file.contentType);

    // ✅ Keep only video-specific headers
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges");

    stream.pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
},


  postLikes: async (req, res) => {
    try {
      const { postId } = req.body;
      const userId = req.userId;

      if (!postId) {
        return res.status(404).json({ error: "your action not saved" });
      }
      const result = await profilePageService.postLikes(postId, userId);
      res.status(200).json(result);
    } catch (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  postComment: async (req, res) => {
    try {
      const { comment, postId } = req.body;

      if (!comment || !postId) {
        return res.status(404).json({ error: "your action not saved" });
      }
      const result = await profilePageService.postComment(comment, postId);
      res.status(200).json(result);
    } catch (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  userDetailsUpdate: async (req, res) => {
    try {
      const userId = req.userId;
      const userDetails = req.body.userDetails;

      if (!userId || !userDetails)
        throw new Error("UserDetails missing. Please try again later");

      const result = await profilePageService.userDetailsUpdate(
        userDetails,
        userId
      );

      res.status(200).json({
        message: "user details Updated successfully",
        userDetails: result,
      });
    } catch (err) {
      res.status(400).json({ error: err, message: err?.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      // from verifyToken middleware

      const { password, page, id } = req.body;
      const userId = page === "login" ? id : req.userId;
      console.log(password, page, id, userId);

      if (!password || password.length < 8) {
        return res.status(400).json({ message: "Invalid password" });
      }
      if (!userId) {
        throw new Error("Invalid password");
      }

      await profilePageService.resetPassword(userId, password);

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, error: "Logout failed" });
    }
  },
};

module.exports = profilePageController;
