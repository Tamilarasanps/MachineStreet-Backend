const CategoryModel = require("../models/categoryCreation");
const {
  Industry,
  Category,
  SubCategory,
  Brand,
} = require("../models/CategoryModel");
const machines = require("../models/productUpload");
const mongoose = require("mongoose");

const CategoryRepository = {
  getIndustries: async () => {
    try {
      const db = mongoose.connection.db;
      console.log(db);
      // const states = await db
      //   .collection("states")
      //   .find({
      //     _id: {
      //       $in: ["6846c228b2a889fa645ef28d", "6846c641b2a889fa645ef28f"],
      //     },
      //   })
      //   .toArray();

      const states = await db
        .collection("states")
        .find({
          _id: {
            $in: [
              new mongoose.Types.ObjectId("6828db2e5b39026cc95691ca"),
              new mongoose.Types.ObjectId("6828e0fa5b39026cc9569208"),
            ],
          },
        })
        .toArray();
      // Step 1: Get all industries
      let industries = await Industry.find({}, "name").lean();

      // Step 2: Get all categories and group by industry
      const categories = await Category.find({}, "name industry").lean();
      const industryCategoryMap = {};
      industries.forEach((ind) => {
        industryCategoryMap[ind.name] = categories
          .filter((cat) => String(cat.industry) === String(ind._id))
          .map((cat) => cat.name);
      });

      // Step 3: Get all subcategories and group by category
      const subcategories = await SubCategory.find({}, "name category").lean();
      const categorySubMap = {};
      categories.forEach((cat) => {
        categorySubMap[cat.name] = subcategories
          .filter((sub) => String(sub.category) === String(cat._id))
          .map((sub) => sub.name);
      });

      // Return structured data
      industries = {
        industries: industries.map((ind) => ind.name),
        categories: Object.entries(industryCategoryMap).map(([k, v]) => ({
          [k]: v,
        })),
        subcategories: Object.entries(categorySubMap).map(([k, v]) => ({
          [k]: v,
        })),
      };

      return { states: states, industries: industries };
    } catch (error) {
      console.error("Error fetching industries:", error);
      throw error; // Rethrow the error to handle it where the function is called
    }
  },

  getCategories: async (industry) => {
    try {
      if (!industry) {
        throw new Error("Industry value is needed");
      }
      const industryId = await Industry.findOne({ name: industry }, { _id: 1 });

      const categories = await Category.find(
        { industry: industryId._id },
        { name: 1, _id: 0 }
      ).lean();

      const categoryNames = categories.map((cat) => cat.name);
      const industries = await Industry.find({}, "name").lean();
      return { categoryNames, industries };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  getSubCategories: async (category) => {
    try {
      if (!category) {
        throw new Error("Industry value is needed");
      }
      const categoryId = await Category.findOne({ name: category }, { _id: 1 });

      const subcategories = await SubCategory.find(
        { category: categoryId._id },
        { name: 1, _id: 0 }
      ).lean();

      const subcategoryNames = subcategories.map((cat) => cat.name);
      return subcategoryNames;
    } catch (err) {
      throw new Error(err.message);
    }
  },

  getMakes: async (subcategory, page) => {
    try {
      if (typeof subcategory !== "string") {
        throw new Error("Category must be a valid string");
      }

      const subcategoryPattern = new RegExp(`^${subcategory.trim()}$`, "i");

      const subCategory = await SubCategory.findOne({
        name: subcategoryPattern,
      });

      if (!subCategory) {
        throw new Error("Subcategory not found");
      }

      const makes = await Brand.find({ subCategory: subCategory._id }).lean();

      if (!makes || makes.length === 0) {
        throw new Error("No matching brands found in the database");
      }

      return makes.map((make) => make.name); // or adjust based on your schema
    } catch (err) {
      console.error("Error fetching makes:", err.message);
      throw err;
    }
  },

  machinesCount: async (industry) => {
    const count = await machines.countDocuments({ industry }); // Query filter corrected
    return { [industry]: count }; // Return the count associated with the industry name
  },
};

module.exports = CategoryRepository;
