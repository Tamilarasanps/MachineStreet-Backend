const mechanicRepository = require("../repositories/mechanicRepository");

const mechanicService = {
  getMechanics: async (page, limit, userId) => {
    try {
      const mechanics = await mechanicRepository.getMechanics(page, limit, userId);

      const result = {
        location: {},
        otherThanIndia: {},
        industry: {},
        category: {},
        mechanics: mechanics,
      };

      mechanics.data.forEach((mech) => {
        // Location: Tamil Nadu => [districts]

        // Location: India => region: [districts]
        if (
          mech.region &&
          mech.district &&
          mech.country.toLowerCase() === "india"
        ) {
          if (!result.location[mech.region]) {
            result.location[mech.region] = new Set();
          }
          result.location[mech.region].add(mech.district);
        }

        // Location: Other than India => country: [region]
        if (
          mech.region &&
          !mech.district &&
          mech.country.toLowerCase() !== "india"
        ) {
          if (!result.otherThanIndia[mech.country]) {
            console.log("mech.region :", mech.region);
            result.otherThanIndia[mech.country] = new Set();
          }
          result.otherThanIndia[mech.country].add(mech.region);
        }

        // Industry: construction => [categories]
        if (mech.industry && mech.subcategory?.length > 0) {
          if (!result.industry[mech.industry]) {
            result.industry[mech.industry] = new Set();
          }
          mech.subcategory.forEach((sub) => {
            if (sub.name) {
              result.industry[mech.industry].add(sub.name);

              // Category: tools => [subcategories: drills, grinders]
              if (sub.services?.length > 0) {
                if (!result.category[sub.name]) {
                  result.category[sub.name] = new Set();
                }
                sub.services.forEach((srv) => {
                  result.category[sub.name].add(srv);
                });
              }
            }
          });
        }
      });

      // Convert sets to arrays
      Object.keys(result.location).forEach((region) => {
        result.location[region] = [...result.location[region]];
      });
      Object.keys(result.otherThanIndia).forEach((region) => {
        result.otherThanIndia[region] = [...result.otherThanIndia[region]];
      });
      Object.keys(result.industry).forEach((industry) => {
        result.industry[industry] = [...result.industry[industry]];
      });
      Object.keys(result.category).forEach((category) => {
        result.category[category] = [...result.category[category]];
      });
      console.log("result :", result);

      return result;
    } catch (err) {
      return err;
    }
  },

  getReviews: async (mechId) => {
    try {
      const reviews = await mechanicRepository.getReviews(mechId);

      return reviews;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getComments: async (postId) => {
    try {
      const comments = await mechanicRepository.getComments(postId);

      return comments;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getPosts: async (MechId, userId) => {

    try {
      const posts = await mechanicRepository.getPosts(MechId, userId);

      // const updatedPosts = posts.map((post) => ({
      //   ...post, // Convert Mongoose document to plain object
      //   like: post?.likes.includes(userId),
      // }));
      // console.log(updatedPosts);

      return posts;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  postmedia: async (media, bio, userId) => {
    try {
      const result = mechanicRepository.postMedia(media, bio, userId);
      return result;
    } catch (err) {
      return err;
    }
  },
  deletemedia: async (postId, userId) => {
    try {
      const result = mechanicRepository.deleteMedia(postId, userId);
      return result;
    } catch (err) {
      return err;
    }
  },

  postComment: async (post, comments, userId) => {
    try {
      const result = await mechanicRepository.postComment(
        post,
        comments,
        userId
      );
      return result;
    } catch (err) {
      console.log(err);
    }
  },
  postLikes: async (post, userId) => {
    try {
      const result = await mechanicRepository.postLikes(post, userId);
      return result;
    } catch (err) {
      console.log(err);
    }
  },
  editProfile: async (userData, userId) => {
    try {
      const result = await mechanicRepository.editProfile(userData, userId);
      return result;
    } catch (err) {
      console.log(err);
    }
  },
  postReviews: async (userReview, userId) => {
    try {
      const result = await mechanicRepository.postReviews(userReview, userId);
      return result;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = mechanicService;
