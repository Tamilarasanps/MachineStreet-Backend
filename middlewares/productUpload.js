const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
require("dotenv").config();

const storage = new GridFsStorage({
  url: process.env.Mongo_URI,
  cache: true,
  disableMD5: false,

  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + file.originalname;
        const bucketName = file.mimetype.startsWith("image/")
          ? "images"
          : "videos"; // Separate bucket names

        const fileInfo = {
          filename: filename,
          bucketName: bucketName,
          //   metadata: { uploadedBy: req.userId },
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 100MB limit for files
  },
  fileFilter: (req, file, callback) => {
    console.log("file :", file);
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Invalid file format."));
    }
  },
}).fields([
  { name: "images", maxCount: 10 }, // Adjust maxCount as needed
  { name: "videos", maxCount: 2 },
]);

const uploadFiles = (req, res, next) => {
  //multer call
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message || "File upload failed",
        error: err.message,
      });
    }

    req.images = req.files?.images || [];
    req.videos = req.files?.videos || [];

    next();
  });
};

module.exports = uploadFiles;
