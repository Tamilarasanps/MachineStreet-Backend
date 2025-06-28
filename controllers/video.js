const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

const video = async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);
console.log('reached video')
    const db = mongoose.connection.db;

    const file = await db.collection("videos.files").findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({ error: "Video not found" });
    }

    // ✅ Create bucket here inside the request
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "videos",
    });

    res.set("Content-Type", file.contentType);
    res.setHeader("Access-Control-Allow-Origin", "*"); // or restrict to your frontend

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error streaming video" });
  }
};

module.exports = video;
