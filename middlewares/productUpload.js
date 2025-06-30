const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
require("dotenv").config();

// ✅ GridFS storage with 1MB chunk
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);

        const filename = buf.toString("hex") + "-" + file.originalname;
        const bucketName = file.mimetype.startsWith("image/")
          ? "images"
          : "videos";

        const fileInfo = {
          filename,
          bucketName,
          chunkSizeBytes: 1024 * 1024, // ✅ 1MB
        };

        resolve(fileInfo);
      });
    });
  },
});

// ✅ Multer setup with 250MB limit
const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024, // 250MB
  },
  fileFilter: (req, file, callback) => {
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
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 2 },
]);

// ✅ Middleware to upload and pass IDs
const uploadFiles = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({
        message: err.message || "File upload failed",
        error: err.message,
      });
    }

    const images = req.files?.images || [];
    const videos = req.files?.videos || [];

    // ✅ Attach only the file IDs for use in next middleware/controller
    req.imageIds = images.map((f) => f.id);
    req.videoIds = videos.map((f) => f.id);

    // ✅ Call next to continue request
    next();
  });
};

module.exports = uploadFiles;
