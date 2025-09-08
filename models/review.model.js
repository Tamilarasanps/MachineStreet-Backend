const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    star: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      maxlength: 500, // Adjusted the length to a more reasonable limit
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
