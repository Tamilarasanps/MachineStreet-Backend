const User = require("../models/user.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const mongoose = require("mongoose");
const { Types } = require("mongoose");
const { io } = require("../socket.server");

const profilePageRepository = {
  postUpload: async (fileId, description, userId, type, contentType) => {
    try {
      // let savedPost;
      const updateQuery = {};

      if (type === "posts") {
        const newPost = new Post({
          media: fileId,
          contentType: contentType,
          bio: description,
        });
        const savedPost = await newPost.save();
        updateQuery[type] = savedPost._id; // $push for posts
      } else {
        updateQuery[type] = fileId; // direct set
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        type === "posts" ? { $push: updateQuery } : updateQuery,
        { new: true }
      )
        .populate({
          path: "posts",
          options: { sort: { createdAt: -1 } }, // newest first
          populate: {
            path: "comments",
            populate: { path: "userId", select: "username profileImage" },
          },
        })
        .lean();

      if (!updatedUser) throw new Error("User not found");

      // socket emit
      io.emit("post-update", updatedUser, type);
      return updatedUser;
    } catch (err) {
      throw err;
    }
  },

  deletePost: async (postId, userId) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { posts: postId } },
        { new: true }
      ).populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "comments",
          populate: { path: "userId", select: "username profileImage" },
        },
      }).lean();
  
      if (!updatedUser) throw new Error("User not found");
  
      await Post.deleteOne({ _id: postId });
      await Comment.deleteMany({ postId });
  
      io.emit("post-delete", updatedUser);
      return updatedUser;
    } catch (err) {
      throw err;
    }
  },

  getSelectedMechanic: async (id) => {
 
    try {
      const result = await User.findOne({ _id: id })
        .populate({
          path: "posts",
          options: { sort: { createdAt: -1 } }, // newest first
          populate: {
            path: "comments",
            populate: { path: "userId", select: "username profileImage" },
          },
        })
        .populate({
          path: "reviews",
          populate: { path: "userId", select: "username profileImage" },
        })
        .lean();

      return result;
    } catch (err) {
      console.log('err :', err)
      throw err;
    }
  },

  findMediaFileById: async (id) => {
    console.log('triggered')
    const db = mongoose.connection.db;
    const fileId = new Types.ObjectId(id);
    return await db.collection("media.files").findOne({ _id: fileId });
  },

  getMediaBucket: () => {
    const db = mongoose.connection.db;
    return new mongoose.mongo.GridFSBucket(db, {
      bucketName: "media",
    });
  },

  postLikes: async (postId, userId) => {
    try {
      const updatedPost = await Post.findOneAndUpdate(
        { _id: postId },
        [
          {
            $set: {
              likes: {
                $cond: [
                  { $in: [userId, "$likes"] }, // if userId already in array
                  { $setDifference: ["$likes", [userId]] }, // remove it
                  { $concatArrays: ["$likes", [userId]] }, // add it
                ],
              },
            },
          },
        ],
        { new: true }
      ).populate({
        path: "comments",
            populate: { path: "userId", select: "username profileImage" },
      }).lean();

      if (!updatedPost) {
        throw new Error("User not found");
      }
      // emits socket
      // io.emit("likes-update", updatedPost);
      return updatedPost;
    } catch (err) {
      throw err;
    }
  },

  postComment: async (comment, postId) => {
    try {
      // Create the comment
      const result = await Comment.create(comment);

      // Update post and populate comments + user details inside each comment
      const updatedPost = await Post.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: result._id } },
        { new: true }
      ).populate({
        path: "comments",
        populate: { path: "userId", select: "username profileImage" },
      });

      if (!updatedPost) {
        throw new Error("Post not found");
      }

      // Emit socket event
      io.emit("comment-update", updatedPost);

      return updatedPost;
    } catch (err) {
      throw err;
    }
  },

  userDetailsUpdate: async (userDetails, userId) => {
    try {
      const result = await User.findByIdAndUpdate(
        userId,
        {
          username: userDetails.username,
          bio: userDetails.bio,
          organization: userDetails.organization,
          industry: userDetails.industry,
          subcategory: userDetails.subcategory,
          services: userDetails.services,
          mobile: userDetails.mobile,
          country: userDetails.country,
          region: userDetails.region,
          city: userDetails?.city,
          street: userDetails?.street,
          pincode: userDetails?.pincode,
        },
        { new: true } // return the updated document
      );
      return result;
    } catch (err) {
      throw err;
    }
  },

  resetPassword: async (userId, hashedPassword) => {
    try {
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
    } catch (error) {
      console.error("Error in updatePassword repo:", error);
      throw error;
    }
  },
};

module.exports = profilePageRepository;
