const express = require("express");
const QrCode = require("../../models/QrModel");
const User = require("../../models/userSIgnUp");

const postQr = async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ message: "No images or videos uploaded" });
    }

    const userId = req.params.userId;
  
    const user = await User.findById(userId);

    if (!user) {
      console.log("user");
      return res.status(404).json({ message: "User not found" });
    }

    if (user.qr) {
      console.log("qr");
      return res.status(500).json({ message: "You hve already applied" });
    }

    // const images = req.files.images.map((image) => image.id.toString());

    // let { qrConfig, address } = req.body;

    // if (typeof qrConfig === "string") {
    //   qrConfig = JSON.parse(qrConfig);
    // }

    // if (typeof address === "string") {
    //   address = JSON.parse(address);
    // }

    // qrConfig.backgroundImage = images[0];

    const newQr = new QrCode({
      qr: req.files.images[0].id,
      name: req.body.name,
      address: req.body.address,
      contact: req.body.contact,
    });
    await newQr.save();

    user.qr = true;
    await user.save();

    res.status(200).json({ message: "QR sent successfully", id: newQr._id });
  } catch (err) {
    console.error("Failed to save QR data:", err);
    res.status(500).json({ error: "Failed to save QR data" });
  }
};

module.exports = { postQr };
