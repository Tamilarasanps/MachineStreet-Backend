const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema({
  // qrConfig: qrConfigSchema,
  qr: { type: String, required: true },
  address: { type: String, required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const QrModel = mongoose.model("QrCode", qrSchema);
module.exports = QrModel;
