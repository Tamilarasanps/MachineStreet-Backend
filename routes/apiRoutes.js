const express = require('express');
const router = express.Router();
const secureRoute = require('../middlewares/secureRoute');
const profilePageController = require('../controllers/ProfilePage.controller');         
const adminPageController = require('../controllers/AdminPage.controller');         
const landingPageController = require('../controllers/LandingPage.controller')();         
const mediaUpload = require('../middlewares/mediaUpload')

const homepageController = require('../controllers/HomePage.controller')() 


// login routes

router.patch('/forgotPassword', profilePageController.resetPassword);


// profile routes
router.post('/postUpload',secureRoute,mediaUpload,profilePageController.postUpload)
router.get('/mediaDownload/:id',profilePageController.mediaDownload)
router.get('/getSelectedMechanic/:user',secureRoute,profilePageController.getSelectedMechanic)
router.post('/postLikes',secureRoute,profilePageController.postLikes)
router.post('/postComment',secureRoute,profilePageController.postComment)
router.delete('/deletePost',secureRoute,profilePageController.deletePost)
router.patch('/userDetailsUpdate',secureRoute,profilePageController.userDetailsUpdate)
router.patch("/passwordReset", secureRoute, profilePageController.resetPassword);
router.post("/logout",secureRoute, profilePageController.logout );

// homepage routes
router.post('/postReview',secureRoute,homepageController.postReviews)
router.get('/search',secureRoute,homepageController.getSearchResult)

// admin routes
router.post('/admin/adminCategories/',secureRoute,adminPageController.createIndustry)
router.patch('/admin/adminCategories/edit',secureRoute,adminPageController.editIndustry)
router.get('/admin/getIndustries/',secureRoute,adminPageController.getIndustries)
router.delete('/admin/deleteIndustry',secureRoute,adminPageController.deleteIndustry)
router.delete('/admin/deleteCategory',secureRoute,adminPageController.deleteCategory)
router.get('/admin/getQrs/',secureRoute,adminPageController.getQrs)

// landing page

router.get('/landingpage/',landingPageController.getCounts)


module.exports = router;







