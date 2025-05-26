const mongoose = require("mongoose");
const User = require("./userSIgnUp");

const productupload = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  machineImages: {
    type: [String],
    required: true,
  },
  machineVideos: {
    type: [String],
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  yearOfMake: {
    type: Number,
    required: true,
  },
  price: {
    type: String, // Changed to String to allow regex validation
    required: true,
    match: [/^\d+(\.\d{1,2})?$/, "Price must be a valid number"], // Allows integers and decimals (e.g., 100 or 100.50)
  },
  priceType: {
    type: String, // Changed to String to allow regex validation
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  contact: {
    countryCode: {
      type: String,
      required: true,
      match: [/^\+\d+$/, "Invalid country code format"], // e.g., +91
    },
    number: {
      type: String,
      required: true,
      match: [/^\d{6,15}$/, "Invalid phone number"], // 6 to 15 digits
    },
  },
  adminApproval: {
    type: String,
    default: "pending",
    required: true,
  },
  geoCoords: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  country: { type: String, required: true },
  region: { type: String, required: true },
  district: {
    type: String,
    sparse: true,
    validate: {
      validator: function (value) {
        if (this.country === "India") {
          return value != null && value.trim() !== "";
        }
        return true; // Not required for other countries
      },
      message: "District is required when country is India.",
    },
  },

  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productupload.index({ "geoCoords.coordinates": "2dsphere" });

productupload.index({
  category: 1,
  industry: 1,
  make: 1,
  country: 1,
  region: 1,
  district: 1,
});

const uploadSchema = mongoose.model("productupload", productupload);

module.exports = uploadSchema;
