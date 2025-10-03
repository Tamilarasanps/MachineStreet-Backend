const Review = require("../models/review.model");
const User = require("../models/user.model");
const { io } = require("../socket.server");
const Fuse = require("fuse.js");

const homepageRepository = () => ({
  getMechanics: async (userId, page, limit, lat, long) => {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    try {
      let mechanicsQuery = { role: "mechanic" };

      let result = [];

      if (lat && long) {
        // ✅ Use geospatial query if user lat/long available
        result = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(long), parseFloat(lat)], // longitude first!
              },
              distanceField: "distance", // calculated distance
              spherical: true,
              query: mechanicsQuery,
            },
          },
          {
            $sort: { distance: 1 }, // nearest first
          },
          { $skip: skip },
          { $limit: limit },
        ]);
      } else {
        // ✅ Fallback: if lat/long not available → return mechanics without geospatial filter
        result = await User.find(mechanicsQuery)
          .populate({
            path: "reviews",
            populate: { path: "userId", select: "username profileImage" },
          })
          .sort({ averageRating: -1 }) // fallback sort
          .skip(skip)
          .limit(limit);
      }

      // ✅ total count (without disturbing flow)
      const totalDocs = await User.countDocuments(mechanicsQuery);
      const totalPages = Math.ceil(totalDocs / limit);

      // ✅ Filters (keep existing code)
      const locationData = await User.aggregate([
        { $match: { role: "mechanic" } },
        {
          $addFields: {
            groupRegion: {
              $cond: {
                if: { $eq: ["$country", "India"] },
                then: "$region",
                else: "$country",
              },
            },
            itemRegion: {
              $cond: {
                if: { $ne: ["$country", "India"] },
                then: "$region",
                else: "$city",
              },
            },
          },
        },
        {
          $group: {
            _id: "$groupRegion",
            district: { $addToSet: "$itemRegion" },
          },
        },
        {
          $project: {
            _id: 0,
            region: "$_id",
            district: { $sortArray: { input: "$district", sortBy: 1 } },
          },
        },
        { $sort: { region: 1 } },
      ]);

      const industryData = await User.aggregate([
        { $match: { role: "mechanic" } },
        { $unwind: "$subcategory" },
        {
          $group: {
            _id: "$industry",
            category: { $addToSet: "$subcategory.name" },
          },
        },
        { $project: { _id: 0, industry: "$_id", category: 1 } },
      ]);

      const categoryData = await User.aggregate([
        { $match: { role: "mechanic" } },
        { $unwind: "$subcategory" },
        { $unwind: "$subcategory.services" },
        {
          $group: {
            _id: "$subcategory.name",
            subcategories: { $addToSet: "$subcategory.services" },
          },
        },
        { $project: { _id: 0, category: "$_id", subcategories: 1 } },
      ]);

      return {
        userData: result,
        totalPages,
        filterData: {
          locationData,
          industryData,
          categoryData,
        },
      };
    } catch (err) {
      console.log(err);
      throw new Error("Error fetching mechanics");
    }
  },

  // search result

  getSearchResult: async (searchQuery, page) => {
    console.log("searchQuery :", searchQuery);
    try {
      if (page === "mech") {
        const mechanicUsers = await User.find({ role: "mechanic" });

        const fuse = new Fuse(mechanicUsers, {
          keys: [
            "username",
            "organization",
            "services",
            "industry",
            "subcategory.name",
            "subcategory.services",
            "district",
            "region",
            "country",
          ],
          threshold: 0.6,
          includeScore: true,
          ignoreLocation: true,
          minMatchCharLength: 2,
          findAllMatches: true,
        });

        const terms = searchQuery.split(" ");

        const results = terms.flatMap((term) => fuse.search(term));
        console.log("results :", results);
        const matchedUsers = results.map((r) => r.item).slice(0, 10);

        return { searchResults: matchedUsers }; // ✅ Always return, even if 0
      }
    } catch (err) {
      throw err;
    }
  },

  postReviews: async (userId, review) => {
    try {
      // Create the new review first
      const newReview = await Review.create(review);

      // Update the user by pushing new review & recalculate average rating
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          $push: { reviews: newReview._id },
          $set: {
            averageRating: await (async () => {
              // Get all reviews for user to calculate rating
              const reviews = await Review.find({
                _id: {
                  $in: [
                    ...(await User.findById(userId).select("reviews")).reviews,
                    newReview._id,
                  ],
                },
              });

              const totalStars = reviews.reduce((sum, r) => {
                console.log(
                  "sum so far:",
                  sum,
                  " | current review:",
                  r,
                  " | r.star:",
                  r.star
                );
                const star = Number(r.star) || 0;
                return sum + star;
              }, 0);
              console.log("totalStars :", totalStars);
              console.log("totalStars type :", typeof totalStars);

              const avgRating =
                reviews.length > 0
                  ? Number((totalStars / reviews.length).toFixed(1))
                  : newReview.star;

              return avgRating;
            })(),
          },
        },
        { new: true }
      ).populate({
        path: "reviews",
        populate: { path: "userId", select: "username profileImage" },
      });

      if (!updatedUser) {
        throw new Error("User not found");
      }

      // Emit socket event with fully populated data
      io.emit("update-review", updatedUser);

      return updatedUser;
    } catch (err) {
      throw err;
    }
  },
});

module.exports = homepageRepository;
