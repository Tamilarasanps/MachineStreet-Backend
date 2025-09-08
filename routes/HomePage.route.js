const express = require('express');
const router = express.Router();
const secureRoute = require('../middlewares/secureRoute')

const homepageController = require('../controllers/HomePage.controller')() 

router.get('/getmechanics',secureRoute,homepageController.getMechanics)



module.exports = router;