const wishlistService = require('../../services/wishlistService')
const wishlistRepository = require('../../repositories/wishlistRepository')

const addWishlist = async (req,res) => {
  try {
    const userId = req.user.id;
    const {productId} = req.body;
    const result =  await wishlistService.add(userId,productId)
    res.status(200).json(result)
  } catch (err) {}
};
const getWishlist = async (req,res) => {
  try {
    const userId = req.user.id;

    const result =  await wishlistRepository.getWishlist(userId)

    res.status(200).json(result)
  } catch (err) {}
};

module.exports = {addWishlist,getWishlist}