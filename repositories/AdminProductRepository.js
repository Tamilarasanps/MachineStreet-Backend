const product = require("../models/productUpload");
const banner = require("../models/AdminBanner");
const qr = require('../models/QrModel')
const machineRepository = require("./machinerepository");

const AdminProductRepository = {
  getPendingProduct: async (status) => {
    try {
      const pendingProducts = await product
        .find({ adminApproval: status })
        .lean(); // Removed `i`
      const productsWithFiles = await machineRepository.getProductFiles(
        pendingProducts
      );

      return productsWithFiles;
    } catch (err) {
      console.error("Error fetching pending products:", err);
    }
  },

  updateAdminApprovalProduct: async (productId, status) => {
    try {
      const updated = await product
        .findByIdAndUpdate(productId, {
          adminApproval: status,
        })
        .lean();
      const productWithFiles = machineRepository.getProductFiles(updated);
      return productWithFiles;
    } catch (err) {}
  },
  // Upload and store banner images
  getQr: async () => {
    try {
      // This will return plain JavaScript objects instead of Mongoose documents
      const qrCodes = await qr.find().lean();
      return qrCodes;
    } catch (err) {
      console.error("Error fetching banners:", err);
      throw err;
    }
  },
 getbanners: async () => {
  try {
    // This will return plain JavaScript objects instead of Mongoose documents
    const banners = await banner.find().lean();
    return banners;
  } catch (err) {
    console.error("Error fetching banners:", err);
    throw err;
  }
},
 deleteBanner: async (id) => {
  try {
    console.log(id)
    const deletedBanner = await banner.findByIdAndDelete(id);
    if (!deletedBanner) {
      throw new Error(`Banner with id ${id} not found`);
    }

    return deletedBanner;
  } catch (err) {
    console.error(`Error deleting banner with id ${id}:`, err);
    throw err;
  }
},

  bannerupload: async (images) => {
    try {
    // Create a new banner object with an array of image URLs
    const bannerPromises = images.map(async (image) => {
      const bannerData = {
        bannerImages: image, // Assuming 'image' is a single image URL
      };

      // Create and save the new banner for each image
      const newBanner = await banner.create(bannerData);

      // Return the created banner's ID and the image URL
      return {
        bannerId: newBanner._id, // The ID of the newly created banner document
        bannerImages: newBanner.bannerImages, // The image URL stored
      };
    });

    // Wait for all the promises to resolve
    const createdBanners = await Promise.all(bannerPromises);

    // Return all the newly created banners
    return createdBanners;
  } catch (err) {
    console.error("Error uploading banner images:", err);
    throw err; // Re-throw the error to be caught by the caller
  }
  },


};

module.exports = AdminProductRepository;
