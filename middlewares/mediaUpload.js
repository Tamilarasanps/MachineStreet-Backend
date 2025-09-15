// const mongoose = require("mongoose");
// require("dotenv").config({ path: "../utils/.env" });
// const multer = require("multer");
// const { GridFsStorage } = require("multer-gridfs-storage");
// // const Grid = require("gridfs-stream");
// const crypto = require("crypto"); // to create unique file names
// const path = require("path");

// // Create storage engine
// const storage = new GridFsStorage({
//   url: process.env.Mongo_URI,
//   options: { useNewUrlParser: true, useUnifiedTopology: true },
//   // create file info
//   file: (req, file) => {
//     console.log('file :', file)
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(16, (err, buf) => {
//         console.log(err)
//         if (err) {
//           return reject(err);
//         }
//         const filename = buf.toString("hex") + path.extname(file.originalname);
//         const fileInfo = {
//           _id: new mongoose.Types.ObjectId(), // ✅ add this
//           filename: filename,
//           bucketName: "media",
//           chunkSizeBytes: 1 * 1024 * 1024, // 1MB
//         };
//         resolve(fileInfo);
//       });
//     });
//   },
// });

// // multer setup
// const mediaUpload = multer({
//   storage,
//   limits: { fileSize: 25 * 1024 * 1024 },
//   fileFilter: (req, file, callback) => {
//     console.log('files :', file)
//     const allowedTypes = [
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//       "image/webp",
//       "video/mp4",
//       "video/quicktime",
//     ];
//     console.log('file.mimetype :', file   )
//     if (allowedTypes.includes(file.mimetype)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Invalid file format."));
//     }
//   },
// });

// module.exports = mediaUpload;

const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
require("dotenv").config();
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) =>
    new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);

        const filename = `${buf.toString("hex")}-${file.originalname}`;

        const fileInfo = {
          filename,
          bucketName: "media", // ✅ use "media" bucket for all files
          chunkSizeBytes: 1 * 1024 * 1024, // 1MB chunk size
        };
        resolve(fileInfo);
      });
    }),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];

    if (allowedTypes.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Invalid file format."));
  },
}).array("media", 10); // ✅ expect frontend to send files as "media"

const mediaUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        message: err.message || "File upload failed",
        error: err.message,
      });
    }

    // Attach only the file IDs for controller usage
    req.mediaIds = (req.files || []).map((file) => file.id);
    next();
  });
};

module.exports = mediaUpload;
