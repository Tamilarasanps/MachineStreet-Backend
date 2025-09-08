const homepageRepository = require("../repositories/HomePage.repository");

const homepageService = () => ({
  getMechanics: async (userId,page,limit) => {
    try {
      const result = await homepageRepository().getMechanics(userId,page,limit);

      return result;
    } catch (err) {
      throw new Error("Error fetching mechanics");
    }
  },

  // get Search results

  getSearchResult: async (searchQuery, page) => {
    try {
      const result = await homepageRepository().getSearchResult(searchQuery, page);
      return result;
    } catch (err) {
      throw err;
    }
  },

  postReviews: async (userId, review) => {
    try {
      const result = await homepageRepository().postReviews(userId, review);
      return result;
    } catch (err) {
      throw err;
    }
  },
});

module.exports = homepageService;
