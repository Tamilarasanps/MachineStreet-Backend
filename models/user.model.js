const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: function () {
      return this.role === "mechanic";
    },
  },
  services: {
    type: [String],
    sparse: true,
    required: function () {
      return this.role === "mechanic";
    },
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      validate: {
        validator: function (value) {
          if (this.role === "mechanic") {
            return value && value.length >= 3;
          }
          return true;
        },
        message: "Username must be at least 3 characters long.",
      },
    },
    profileImage: { type: String, sparse: true },
    banner: { type: String, sparse: true },
    password: { type: String, required: [true, "Password must be created"], minlength: [8, "Password must be at least 8 characters long"] },
    mobile: {
      countryCode: { type: String, match: [/^\+\d+$/, "Invalid country code format"] },
      number: { type: String, match: [/^\d{6,15}$/, "Invalid phone number"] },
    },
    role: { type: String, enum: ["recruiter", "mechanic"], required: true },
    industry: { type: String, required: function () { return this.role === "mechanic"; } },
    bio: { type: String, maxlength: 50, sparse: true },
    qr: { type: Boolean, default: false },
    subcategory: { type: [subCategorySchema], required: function () { return this.role === "mechanic"; } },
    services: { type: [String], sparse: true },
    lat: { type: Number, sparse: true },
    lon: { type: Number, sparse: true },

    // ✅ New GeoJSON location field for $geoNear
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },

    country: { type: String, required: function () { return this.role === "mechanic"; } },
    region: { type: String, required: function () { return this.role === "mechanic"; } },
    city: { type: String, sparse: true },
    street: { type: String, sparse: true },
    pincode: { type: Number, sparse: true },
    organization: { type: String, required: function () { return this.role === "mechanic"; } },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post", required: function () { return this.role === "mechanic"; } }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review", required: function () { return this.role === "mechanic"; } }],
    averageRating: { type: Number, default: 0 },
    searchTerms: { type: [String], validate: { validator: (arr) => arr.length <= 5 }, sparse: true },
    viewedProducts: { type: [String], validate: { validator: (arr) => arr.length <= 5 }, sparse: true },
    favourites: { type: [String], sparse: true },
    chats: { type: [mongoose.Schema.Types.ObjectId], ref: "User", sparse: true },
  },
  { timestamps: true }
);

// ✅ 2dsphere index for geospatial queries
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

module.exports = User;
