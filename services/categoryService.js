const CategoryRepository = require("../repositories/categoryReposiroty");
const MachineCategory = require("../models/categoryCreation");
const categoryReposiroty = require("../repositories/categoryReposiroty");
const machineRepository = require("../repositories/machinerepository");

const CategoryService = {
  getIndustries: async (limit) => {
    try {
      const industries = await CategoryRepository.getIndustries(limit);
      return industries;
    } catch (error) {
      console.error(
        `[getIndustries] Error fetching industries with limit ${limit}:`,
        error
      );

      throw new Error("Unable to retrieve industry data at this time.");
    }
  },

  getCategories: async (industry, page) => {
    try {
      if (!industry) {
        throw new Error("Industry value is needed");
      }

      const categories = await CategoryRepository.getCategories(industry);

      if (page === "sell") {
        return categories;
      } else {
        const categoryProducts = await machineRepository.getCategories({
          categories: categories.categoryNames,
        });
        return {
          industries: categories.industries,
          categoryProducts,
        };
      }
    } catch (err) {
      throw new Error(err.message);
    }
  },

  getSubCategories: async (category, page) => {
    try {
      if (!category) {
        throw new Error("category value is needed");
      }
      const subcategories = await CategoryRepository.getSubCategories(category);
      console.log("sub reached :", subcategories);
      if (page === "sell") {
        return subcategories;
      } else {
        const subcategoryProducts = await machineRepository.getSubCategories(
          subcategories
        );
        return subcategoryProducts;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  },
  machinesCount: async ({ industries }) => {
    const totalCount = await Promise.all(
      industries.map(async (cat) => {
        const result = await categoryReposiroty.machinesCount(cat);
        return result;
      })
    );
    return totalCount;
  },
  getRecomments: async (searchterms) => {
    try {
      const result = await machineRepository.getProducts(searchterms); // Added 'await'
      return result;
    } catch (err) {
      throw new Error(err.message); // Throwing the error for route handling
    }
  },
};

module.exports = CategoryService;
