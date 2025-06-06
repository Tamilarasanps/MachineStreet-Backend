const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    media: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      maxlength: 250,
      required: true,
    },
    likes: {
      type: [String],
      sparse: true,
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "comments", // This refers to the Post model
      sparse: true,
    },
  },
  { timestamps: true }
);

const post = mongoose.model("Post", postSchema);

module.exports = post;
