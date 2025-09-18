const homepageService = require("../services/HomePage.service");
// const location = require('../middlewares/getCurrentLocation')

const homepageController = () => ({
  getMechanics: async (req, res) => {
    try {
      const userId = req.userId;
      const limit = req.query.limit;
      const page = req.query.page;

      // const currentlocation = await location();
      
      let result = await homepageService().getMechanics(userId,page,limit);
      result.qr = req.qr;

      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "failed to fetch data",
        error: err.message,
      });
    }
  },

  getSearchResult: async (req, res) => {

    try {
      const { page, searchQuery } = req.query;

      if (!searchQuery || !page) {
        throw new Error("search results not found");
      }

      const searchResult = await homepageService().getSearchResult(
        searchQuery,
        page
      );

      res.status(200).json(searchResult);
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        err: err,
        message: err.message,
        description: err?.description || "Internal server error",
      });
    }
  },

  postReviews: async (req, res) => {
    try {
      const reviewer = req.userId; //reviewer
      let review = req.body.review;

      const userId = review?.userId;
      console.log('userId :',userId)
      review = {
        ...review,
        userId: reviewer,
      };

      if (!userId || !review) throw new Error("review submission failed");

      const result = await homepageService().postReviews(userId, review);

      res
        .status(200)
        .json({ message: "Review submitted successfully!!!", review: result });
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  },
  getReviews: async (req, res) => {
    try {
    } catch (err) {}
  },
});

module.exports = homepageController;
