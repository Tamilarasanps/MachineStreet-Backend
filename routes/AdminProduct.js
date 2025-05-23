const express = require('express')
const router = express.Router()
const {getPendingProduct,updateAdminApprovalProduct,bannerupload,getbanners,deleteBanner} = require('../controllers/Admin/AdminProduct')
const {getQr} = require('../controllers/Admin/QrController')
const secureRoute = require('../middlewares/secureRoute')
const uploadImages = require("../middlewares/productUpload");

router.get('/getPendingProducts/:status',getPendingProduct)
router.patch('/updateAdminApproval',updateAdminApprovalProduct)
router.post('/bannerupload',secureRoute,uploadImages,bannerupload)
router.get('/getbanners',secureRoute,getbanners)
router.delete('/deletebanners',secureRoute,deleteBanner)

router.get('/adminQr',secureRoute,getQr)


module.exports = router