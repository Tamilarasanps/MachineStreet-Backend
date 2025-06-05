const express = require( "express");
const {getCounts} = require('../controllers/Client/landingPage')

const router = express.Router();
router.get("/", getCounts);


module.exports = router;