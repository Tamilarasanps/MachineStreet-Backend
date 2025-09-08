const mongoose = require("mongoose");
require("dotenv").config({ path: "../utils/.env" });
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
// const Grid = require("gridfs-stream");
const crypto = require("crypto"); // to create unique file names
const path = require("path");

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.Mongo_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  // create file info
  file: (req, file) => {
    console.log(file)
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        console.log(err)
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          _id: new mongoose.Types.ObjectId(), // ✅ add this
          filename: filename,
          bucketName: "media",
          chunkSizeBytes: 1 * 1024 * 1024, // 1MB
        };
        resolve(fileInfo);
      });
    });
  },
});

// multer setup
const mediaUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];
    console.log('file.mimetype :', file   )
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Invalid file format."));
    }
  },
});

module.exports = mediaUpload;
