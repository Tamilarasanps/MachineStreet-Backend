const express = require("express");
const router = express.Router();
const uploadImages = require("../middlewares/productUpload");
const uploadModel = require("../models/productUpload");

router.post("/", uploadImages, async (req, res) => {
  try {
    if (!req.files || (!req.files.images && !req.files.videos)) {
      return res.status(300).json({ message: "No images or videos uploaded" });
    }
    const videos = req.files.videos
      ? req.files.videos.map((video) => video.id)
      : [];
    const images = req.files.images
      ? req.files.images.map((image) => image.id)
      : [];

    if (
      !req.body.industry ||
      !req.body.category ||
      !req.body.subcategory ||
      !req.body.make ||
      !req.body.price ||
      !req.body.description ||
      !req.body.priceType ||
      !req.body.condition ||
      !req.body.yearOfMake ||
      !req.body.countryCode ||
      !req.body.number ||
      !req.body.location
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const location = JSON.parse(req.body.location);
    // const contact = JSON.parse(req.body.mobile);
    // console.log(JSON.stringify(req.body.mobile));
    const newMachine = {
      userId: req.user.id,
      machineImages: images,
      machineVideos: videos,
      industry: req.body.industry?.trim(),
      category: req.body.category?.trim(),
      subcategory: req.body.subcategory?.trim(),
      make: req.body.make?.trim(),
      price: Number(req.body.price),
      priceType : req.body.priceType,
      adminApproval: "pending",
      contact: {
        countryCode: req.body.countryCode,
        number: req.body.number,
      },
      condition: req.body.condition?.trim(),
      yearOfMake: Number(req.body.yearOfMake),
      description: req.body.description?.trim(),
      priceType: req.body.priceType?.trim(),
      // location:typeof req.body.location === "string" ? JSON.parse(req.body.location) : req.body.location,
      geoCoords: {
        // ✅ Corrected format
        type: "Point",
        coordinates: [
          Number(location.coords.longitude),
          Number(location.coords.latitude),
        ],
      },
      country: location.country,
      region: location.region,
      district: location.district,
    };

    const result = await uploadModel.create(newMachine);
    console.log(result);

    if (result) {
      return res.status(201).json({
        message: "Machine details uploaded successfully",
      });
    }
  } catch (err) {
    console.error("Error uploading machine details:", err);
    return res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: err.message,
    });
  }
});

module.exports = router;
