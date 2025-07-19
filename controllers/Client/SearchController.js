const express = require("express");
const router = express.Router();
const Fuse = require("fuse.js");
const { Brand, SubCategory } = require("../../models/CategoryModel");
const user = require("../../models/userSIgnUp"); // Assuming the User model is in this path

// Normalize user input
// const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, " ");
// console.log("nnn", normalize("textile ringframe")); // This should print: "textile ringframe"

// GET /search?q=some-term&page=mechanic|product
router.get("/search", async (req, res) => {
  try {
    const userInput = req.query.searchTerms;
    const page = req.query.page; // Page parameter (mechanic or product)

    if (!userInput || typeof userInput !== "string") {
      return res
        .status(400)
        .json({ error: "Query parameter 'searchTerms' is required" });
    }

    // Fetch all subcategories with populated category and industry
    const subcategories = await SubCategory.find().populate({
      path: "category",
      populate: { path: "industry" },
    });

    const allData = [];

    for (const sub of subcategories) {
      const brands = await Brand.find({ subCategory: sub._id });

      for (const brand of brands) {
        allData.push({
          industry: sub.category.industry.name,
          category: sub.category.name,
          subcategory: sub.name,
          make: brand.name,
          fullPath: `${sub.category.industry.name} > ${sub.category.name} > ${sub.name} > ${brand.name}`,
        });
      }
    }

    // Mechanic page logic: filter by user.username or organization and role must be "mechanic"
    if (page === "mechanic") {
      const mechanicUsers = await user.find({ role: "mechanic" });

      const fuse = new Fuse(mechanicUsers, {
        keys: [
          "username",
          "organization",
          "services",
          "industry",
          "category",
          "subcategory",
          "location",
        ],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
        findAllMatches: true,
      });

      const terms = userInput.split(" ");
      const results = terms.flatMap((term) => fuse.search(term));
      const matchedUsers = results.map((r) => r.item).slice(0, 10);

      return res.json({ users: matchedUsers }); // ✅ Always return, even if 0
    }


    // Product page logic: search based on all available data
    const fuse = new Fuse(allData, {
      keys: ["industry", "category", "subcategory", "make", "fullPath"],
      threshold: 0.4,
      tokenize: true,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
      findAllMatches: true,
    });

    const results = fuse.search(normalize(userInput));
    const suggestions = results.map((r) => r.item).slice(0, 10); // Limit to top 10
    res.json({ suggestions });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
404










