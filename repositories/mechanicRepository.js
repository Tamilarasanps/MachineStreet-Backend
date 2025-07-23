const User = require("../models/userSIgnUp");
const Post = require("../models/postModel");
const comment = require("../models/commentModel");
// const user = require("../models/userSIgnUp");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const ReviewModel = require("../models/ReviewModel");
const { io } = require("../socket/server");
const db = mongoose.connection;

const mechanicRepository = {
  getMechanics: async (page, limit, userId) => {
    console.log(page, limit, userId);
    try {
      const skip = (page - 1) * limit;

      const mechanics = await User.find({ role: "mechanic" })
        .skip(skip)
        .limit(limit);
      const user = await User.findById(userId);

      const total = await User.countDocuments({ role: "mechanic" });

      // Use map to create an array of promises for profile image updates
      const updatedMechanics = await Promise.all(
        mechanics.map(async (mechanic) => {
          // Fetch the profile image for each mechanic
          const profileImage = await mechanicRepository.getProductFiles(
            mechanic.profileImage
          );
          const bannerImage = await mechanicRepository.getProductFiles(
            mechanic.banner
          );

          // Return a new mechanic object with the updated profile image
          return {
            ...mechanic.toObject(), // Use toObject to get a plain object (Mongoose doc is not a plain object)
            profileImage: profileImage,
            banner: bannerImage,
          };
        })
      );

      return {
        data: updatedMechanics,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        qr: user.qr,
      };
    } catch (err) {
      console.error("Error fetching mechanics:", err);
      return err;
    }
  },

  getReviews: async (mechId) => {
    try {
      const reviewsData = await User.findById(mechId, { reviews: 1 })
        .populate({
          path: "reviews",
          populate: {
            path: "user",
            select: "username profileImage",
          },
        })
        .lean();

      const updatedReviews = await Promise.all(
        reviewsData.reviews
          .filter((review) => review?.user !== null)
          .map(async (review) => {
            const updatedProfileImage =
              await mechanicRepository.getProductFiles(
                review.user.profileImage
              );
            return {
              ...review,
              user: {
                ...review.user,
                profileImage: updatedProfileImage,
              },
            };
          })
      );

      console.log("updatedReviews :", updatedReviews);

      return updatedReviews;
    } catch (err) {
      console.log(err);
    }
  },

  getComments: async (postId) => {
    try {
      const comments = await Post.findById(postId, { comments: 1 })
        .populate({
          path: "comments",
          populate: {
            path: "userId",
            model: "User",
            select: "username profileImage",
          },
        })
        .lean();

      const updatedComments = await Promise.all(
        comments.comments.map(async (comment) => {
          const updatedProfileImage = await mechanicRepository.getProductFiles(
            comment.userId.profileImage
          );
          return {
            ...comment,
            userId: {
              ...comment.userId,
              profileImage: updatedProfileImage,
            },
          };
        })
      );

      return updatedComments;
    } catch (err) {
      console.log(err);
    }
  },

  getPosts: async (MechId, userId) => {
    console.log("mechId :", !MechId);
    let finalId;

    if (MechId === "undefined") finalId = userId;
    else finalId = MechId;

    console.log("Final ID:", finalId);
    console.log("useriD :", userId);

    // Ensure finalId is valid
    if (!finalId || typeof finalId !== "string" || finalId.length !== 24) {
      console.log("Invalid or missing ObjectId:", finalId);
      return []; // or throw an error if needed
    }

    try {
      const posts = await User.findById(finalId)
        .select("posts")
        .populate("posts")
        .lean();

      if (!posts || !posts.posts) return [];

      const postsWithMedia = await Promise.all(
        posts.posts.map(async (post) => {
          const mediaData = await mechanicRepository.getProductFiles(
            post.media
          );
          return {
            ...post,
            media: mediaData,
            userId: userId,
          };
        })
      );

      return postsWithMedia;
    } catch (err) {
      console.log("Error fetching posts:", err);
      return [];
    }
  },

  deleteMedia: async (postId, userId) => {
    try {
      // Step 1: Find the user
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      // Step 2: Find the post
      const post = await Post.findById(postId);
      if (!post) throw new Error("Post not found");

      // Step 3: Attempt to delete media from both GridFS buckets
      if (post.media) {
        const db = mongoose.connection.db;
        const mediaObjectId = new mongoose.Types.ObjectId(post.media);

        const imageBucket = new GridFSBucket(db, { bucketName: "images" });
        const videoBucket = new GridFSBucket(db, { bucketName: "videos" });

        // Try deleting from images bucket
        try {
          await imageBucket.delete(mediaObjectId);
          console.log("Deleted from images bucket");
        } catch (err) {
          if (err.code === "ENOENT" || err.message.includes("FileNotFound")) {
            console.log(
              "Media not found in images bucket, trying videos bucket..."
            );
          } else {
            console.warn("Error deleting from images bucket:", err);
          }
        }

        // Try deleting from videos bucket
        try {
          await videoBucket.delete(mediaObjectId);
          console.log("Deleted from videos bucket");
        } catch (err) {
          if (err.code === "ENOENT" || err.message.includes("FileNotFound")) {
            console.log("Media not found in videos bucket");
          } else {
            console.warn("Error deleting from videos bucket:", err);
          }
        }
      }

      // Step 4: Delete the post
      await Post.findByIdAndDelete(postId);

      // Step 5: Update the user's posts array if mechanic
      if (user.role === "mechanic") {
        user.posts = user.posts.filter((id) => id.toString() !== postId);
        await user.save();
        console.log("User updated after post deletion:", user);
      } else {
        console.log("User is not a mechanic, no user update needed.");
      }

      return { success: true, message: "Post and media deleted successfully" };
    } catch (err) {
      console.error("Error deleting post/media:", err);
      throw err;
    }
  },

  postMedia: async (media, bio, userId) => {
    console.log("repo reached");
    try {
      // Step 1: Create a new Post
      const newPost = new Post({
        media: media, // This could be a URL, base64 string, etc.
        bio: bio, // Bio text for the post
      });

      // Step 2: Save the Post document
      const savedPost = await newPost.save();

      // Step 3: Update the User's posts array
      // Check if the user is a mechanic and if they exist in the database
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role === "mechanic") {
        // Push the post's ObjectId into the user's posts array
        user.posts.push(savedPost._id);

        // Save the updated user document
        await user.save();
        console.log("User updated with new post:", user);
      } else {
        console.log("User is not a mechanic, no post added to user.");
      }
      return user.posts; // Return the saved post if needed
    } catch (err) {
      console.error("Error creating post or updating user:", err);
      throw err; // Propagate the error so it can be caught by a higher-level handler if needed
    }
  },
  editProfile: async (userData, userId) => {
    try {
      // Prevent _id overwrite
      if ("_id" in userData) {
        delete userData._id;
      }

      // Prepare mapped fields
      const updatedFields = {
        organization: userData.organization,
        industry: userData.industry,
        services: userData.services,
        subcategory: userData.subCategories, // renamed key
        geoCoords: {
          type: "Point",
          coordinates: [
            userData.location.coords.longitude,
            userData.location.coords.latitude,
          ],
        },
        country: userData.location.country,
        region: userData.location.region,
        district: userData.location.district,
        contact: userData.contact,
      };

      const updatedProfile = await User.findByIdAndUpdate(userId, updatedFields, {
        new: true,
      });

      if (!updatedProfile) {
        return { message: "User not found" };
      }

      return { message: "Profile updated", data: updatedProfile };
    } catch (err) {
      console.error("Edit profile error:", err);
      return { message: "Server error" };
    }
  },

  postReviews: async (userReview, userId) => {
    try {
      // Step 1: Create and save a new Review document
      const newReview = new ReviewModel({
        stars: userReview.star,
        reviewText: userReview.reviewText,
        user: userId,
      });
      const savedReview = await newReview.save();

      // Step 2: Find the mechanic (user with role 'mechanic') by ID
      const mechanic = await User.findById(userReview.mechId);

      if (!mechanic) {
        throw new Error("Mechanic not found");
      }

      if (mechanic.role === "mechanic") {
        // Step 3: Calculate the new average rating
        let numberOfReviews = mechanic.reviews.length;

        let totalReviewPoints = (mechanic.averageRating || 0) * numberOfReviews;

        // Calculate the new average rating
        const newAverage = (
          (totalReviewPoints + userReview.star) /
          (numberOfReviews + 1)
        ).toFixed(1);

        // Step 4: Update the mechanic's total review points and average rating
        mechanic.totalReviewPoints = totalReviewPoints; // Updated total points
        mechanic.averageRating = newAverage; // Store the average rating

        // Step 5: Add the review ID to the mechanic's reviews array
        mechanic.reviews.push(savedReview._id);
        await mechanic.save();
      } else {
        console.log("User is not a mechanic. Review not linked.");
      }

      const populatedReview = await ReviewModel.findById(
        savedReview._id
      ).populate("user", "username profileImage");

      const updatedProfileImage = await mechanicRepository.getProductFiles(
        populatedReview.user.profileImage
      );

      populatedReview.user.profileImage = updatedProfileImage;

      io.to(userReview.mechId).emit("review-updated", {
        mechanic: mechanic,
        review: populatedReview,
      });

      return savedReview;
    } catch (err) {
      console.error("Error posting review:", err);
      throw err;
    }
  },

  postComment: async (postId, commentText, userId) => {
    try {
      // Create and save new comment
      const newComment = new comment({
        userId: userId,
        comment: commentText,
      });

      await newComment.save();

      // Fetch user with profileImage
      let user = await User.findById(userId, "username profileImage").lean();

      // Update profile image using your custom function
      const updatedProfileImage = await mechanicRepository.getProductFiles(
        user.profileImage
      );

      user.profileImage = updatedProfileImage;

      // Add the comment ID to the post's comments array
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { comments: newComment._id },
        },
        { new: true }
      );

      // Emit new comment with populated user data
      io.to(postId).emit("comments-updated", {
        comment: {
          _id: newComment._id,
          comment: newComment.comment,
          createdAt: newComment.createdAt,
          userId: user,
        },
      });

      return updatedPost;
    } catch (err) {
      console.log(err);
    }
  },

  postLikes: async (postId, userId) => {
    try {
      const post = await Post.findById(postId).lean();

      const isLiked = post.likes.includes(userId);

      const updateQuery = isLiked
        ? { $pull: { likes: userId } } // Unlike
        : { $addToSet: { likes: userId } }; // Like

      const updatedPost = await Post.findByIdAndUpdate(postId, updateQuery, {
        new: true,
      });
      console.log({
        postId: updatedPost._id,
        likesCount: updatedPost.likes.length,
        likes: updatedPost.likes,
        userId: userId,
      });
      // Emit like update to all clients
      io.emit("like-updated", {
        postId: updatedPost._id,
        likesCount: updatedPost.likes.length,
        likes: updatedPost.likes,
        userId: userId,
      });

      return updatedPost;
    } catch (err) {
      console.log(err);
    }
  },

  getProductFiles: async (mediaId) => {
    try {
      const imageBucket = new GridFSBucket(db, { bucketName: "images" });
      const objectId = new mongoose.Types.ObjectId(mediaId);

      try {
        const imageStream = imageBucket.openDownloadStream(objectId);
        const chunks = [];

        for await (const chunk of imageStream) {
          chunks.push(chunk);
        }

        return Buffer.concat(chunks).toString("base64");
      } catch (err) {
        return mediaId; // fallback to original ID
      }
    } catch (err) {
      throw new Error(err.message);
    }
  },
};

module.exports = mechanicRepository;
