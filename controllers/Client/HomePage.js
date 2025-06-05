const express = require("express");
const CategoryService = require("../../services/categoryService");
const searchService = require("../../services/searchService");
const categoryModel = require("../../models/categoryCreation");
const machineRepository = require("../../repositories/machinerepository");
const User = require("../../models/userSIgnUp");
const AdminProductService = require("../../services/AdminProductService");
const router = express.Router();
const jwt = require("jsonwebtoken");

//get home page elements
router.get("/", async (req, res) => {
  try {
    let searchTerms;
    const { latitude, longitude } = req.query;
    const token = req.headers.authorization;
    let userId;

    // ✅ Verify token and get searchTerms

    if (token) {
      console.log(token);
      try {
        const retrivedToken = token.split(" ")[1]; // Extract the token
        const decoded = jwt.verify(retrivedToken, process.env.JWT_SECRET);
        userId = decoded.id;

        if (userId) {
          const user = await User.findById(userId);
          console.log("userId :", userId);
          searchTerms = user?.searchTerms || [];
          console.log("searchTerms :", searchTerms);
        }
      } catch (err) {
        console.log("Token verification failed:", err.message);
      }
    }
    let recommentations;
    let machinesCount;

    const locationProducts = await machineRepository.getProductsByLocation(
      parseInt(longitude),
      parseInt(latitude)
    );
    const categoryProducts = await machineRepository.getIndustries();

    if (categoryProducts.length === 0) {
      return res.status(200).json({ message: "No Proucts available" });
    } else {
      machinesCount = await CategoryService.machinesCount({
        industries: categoryProducts.shuffledIndustries,
      });
    }
    if (searchTerms.length>0) {
      recommentations = await machineRepository.getSearchTermProducts({
        searchTerms: searchTerms,
        page: "homePage",
      });
    } else {
      recommentations = await machineRepository.getSearchTermProducts({
        searchTerms: categoryProducts.shuffledIndustries,
        page: "homePage",
      });
    }

    const banners = await AdminProductService.getbanners();
    // if(location){
    //   const nearbyProducts = machineRepository.getProductsByLocation()
    // }

    const updatedCategoryProducts = categoryProducts.productsWithFiles.map(
      (cp) => {
        for (let i = 0; i < machinesCount.length; i++) {
          const key = Object.keys(machinesCount[i])[0];

          if (key.toLowerCase().trim() === cp.industry.toLowerCase().trim()) {
            return {
              ...cp,
              count: Object.values(machinesCount[i])[0] || 0,
            };
          }
        }
        return cp;
      }
    );

    return res.status(200).json({
      category: updatedCategoryProducts,
      recommentedProducts: recommentations,
      locationProducts: locationProducts,
      banners: banners,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", err: err });
  }
});

//get search results
router.get("/searchResult", async (req, res) => {
  try {
    const { searchTerms, industry, category, _id } = req.query;
    const searchArray = Array.isArray(searchTerms)
      ? searchTerms
      : [searchTerms];
    const limit = 0;
    const machines = await searchService.getSearchResults(
      searchTerms
        ? { searchTerms: searchArray, limit }
        : _id
        ? { _id }
        : { industry, category }
    );
    return res.status(200).json({ machines });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", err: err });
  }
});

// get search suggestions
router.get("/search/:searchBar", async (req, res) => {
  try {
    const { searchBar } = req.params;

    if (!searchBar) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const result = await Promise.all(
      ["industry", "data.category", "data.brands"].map(async (field) => {
        const query = {};
        if (field === "industry") {
          query[field] = { $regex: searchBar, $options: "i" }; // Removed "^"
        } else if (field === "data.category") {
          query["data.category"] = { $regex: searchBar, $options: "i" };
        } else if (field === "data.brands") {
          query["data.brands"] = { $regex: searchBar, $options: "i" };
        }

        const projection = { [field]: 1, _id: 0 };
        const response = await categoryModel.find(query, projection).lean();

        let updated;

        if (field === "industry") {
          updated = response.map((item) => item.industry);
        } else if (field === "data.category") {
          updated = response.flatMap(
            (item) =>
              item.data
                ?.filter((subItem) => subItem.category?.startsWith(searchBar))
                .map((subItem) => subItem.category) || []
          );
        } else if (field === "data.brands") {
          updated = response.flatMap(
            (item) =>
              item.data?.flatMap((subItem) =>
                subItem.brands?.filter((brand) => brand.startsWith(searchBar))
              ) || []
          );
        }

        return updated;
      })
    );
    console.log(result);

    const structuredResult = result.flat();
    return res.json({ structuredResult });
  } catch (err) {
    return res.status(500).json({ message: err.message, err: err });
  }
});

module.exports = router;
