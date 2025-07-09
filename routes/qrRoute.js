const express = require("express");
const {
 postQr
} = require("../controllers/Client/QrController");
const secureRoute = require("../middlewares/secureRoute");
const uploadFiles = require("../middlewares/productUpload");
const router = express.Router();
console.log("route reached")
router.post("/:userId", uploadFiles, postQr);

module.exports = router;
