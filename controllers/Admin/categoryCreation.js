const express = require("express");
const {
  Industry,
  Category,
  SubCategory,
  Brand,
} = require("../../models/CategoryModel");
const mongoose = require("mongoose");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { industry, category, subCategories } = req.body;

    if (!industry || !category || !subCategories) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Create/find Industry
    let industryDoc = await Industry.findOne({ name: industry });
    if (!industryDoc) {
      industryDoc = await Industry.create({ name: industry });
    }

    // 2. Create/find Category
    let categoryDoc = await Category.findOne({
      name: category,
      industry: industryDoc._id,
    });
    if (!categoryDoc) {
      categoryDoc = await Category.create({
        name: category,
        industry: industryDoc._id,
      });
    }

    // 3. Create SubCategories and Brands
    for (const sub of subCategories) {
      let subCat = await SubCategory.findOne({
        name: sub.name,
        category: categoryDoc._id,
      });
      if (!subCat) {
        subCat = await SubCategory.create({
          name: sub.name,
          category: categoryDoc._id,
        });
      }

      for (const brand of sub.services) {
        const existingBrand = await Brand.findOne({
          name: brand,
          subCategory: subCat._id,
        });
        if (!existingBrand) {
          await Brand.create({
            name: brand,
            subCategory: subCat._id,
          });
        }
      }
    }

    res.status(200).json({ message: "Data created successfully" });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.put("/editCategory", async (req, res) => {
  try {
    const {
      industry,
      category,
      subCategories,
      selectedIndustry,
      selectedCategory,
    } = req.body;

    if (!selectedIndustry || !selectedCategory || !subCategories) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Update Industry Name
    if (industry) {
      await Industry.findByIdAndUpdate(selectedIndustry, { name: industry });
    }

    // 2. Update Category Name
    if (category) {
      await Category.findByIdAndUpdate(selectedCategory, { name: category });
    }

    // 3. Fetch existing subcategories for the category
    const existingSubCategories = await SubCategory.find({
      category: selectedCategory,
    });

    const existingSubCatIds = existingSubCategories.map((sc) =>
      sc._id.toString()
    );

    const incomingSubCatIds = subCategories
      .filter((sc) => sc._id)
      .map((sc) => sc._id);

    // 4. Delete removed subcategories and their brands
    const subCatsToDelete = existingSubCatIds.filter(
      (id) => !incomingSubCatIds.includes(id)
    );

    for (const subCatId of subCatsToDelete) {
      await Brand.deleteMany({ subCategory: subCatId });
      await SubCategory.findByIdAndDelete(subCatId);
    }

    // 5. Process subcategories
    for (const sub of subCategories) {
      let subCat;

      if (sub._id) {
        // Update existing subcategory
        subCat = await SubCategory.findByIdAndUpdate(
          sub._id,
          { name: sub.name },
          { new: true }
        );
      } else {
        // Create new subcategory
        subCat = await SubCategory.create({
          name: sub.name,
          category: selectedCategory,
        });
      }

      // Fetch existing brands of subcategory
      const existingBrands = await Brand.find({ subCategory: subCat._id });
      const existingBrandIds = existingBrands.map((b) => b._id.toString());

      const incomingBrandIds = sub.brands
        .filter((b) => typeof b !== "string" && b._id)
        .map((b) => b._id);

      // Delete removed brands
      const brandsToDelete = existingBrandIds.filter(
        (id) => !incomingBrandIds.includes(id)
      );

      await Brand.deleteMany({ _id: { $in: brandsToDelete } });

      // Update/create brands
      for (const brand of sub.brands) {
        if (typeof brand === "string") {
          await Brand.create({
            name: brand,
            subCategory: subCat._id,
          });
        } else if (brand._id && brand.name) {
          await Brand.findByIdAndUpdate(brand._id, { name: brand.name });
        }
      }
    }

    return res.status(200).json({ message: "Data updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/:id/:field", async (req, res) => {
  try {
    const { id, field } = req.params;
    console.log(id, field);

    if (!id) return res.status(400).json({ message: "id is required" });
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ObjectId" });

    if (field === "industry") {
      // Delete categories linked to industry
      const categories = await Category.find({ industry: id });

      for (const category of categories) {
        const subCategories = await SubCategory.find({
          category: category._id,
        });

        for (const sub of subCategories) {
          await Brand.deleteMany({ subCategory: sub._id });
        }

        await SubCategory.deleteMany({ category: category._id });
      }

      await Category.deleteMany({ industry: id });
      await Industry.findByIdAndDelete(id);

      return res
        .status(200)
        .json({ message: "Industry and all related data deleted." });
    } else if (field === "category") {
      const subCategories = await SubCategory.find({ category: id });

      for (const sub of subCategories) {
        await Brand.deleteMany({ subCategory: sub._id });
      }

      await SubCategory.deleteMany({ category: id });
      await Category.findByIdAndDelete(id);

      return res
        .status(200)
        .json({ message: "Category and all related data deleted." });
    }

    return res
      .status(400)
      .json({ message: "Invalid field. Must be 'industry' or 'category'." });
  } catch (err) {
    console.error("Delete error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});
router.get("/getCategory/:selectedData?/:fetchdata?", async (req, res) => {
  try {
    const { selectedData, fetchdata } = req.params;
    let response;

    if (!selectedData) {
      // Get all industries
      response = await Industry.find().lean();
    } else {
      if (fetchdata === "category") {
        // Get categories for an industry
        response = await Category.find({ industry: selectedData }).lean();
      }

      if (fetchdata === "subcategory") {
        // Use selectedData as category ID
        const category = await Category.findById(selectedData)
          .populate("industry")
          .lean();

        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }

        const subCategories = await SubCategory.find({
          category: selectedData,
        }).lean();

        const subCategoriesWithBrands = await Promise.all(
          subCategories.map(async (sub) => {
            const brands = await Brand.find({ subCategory: sub._id }).lean();
            return { ...sub, brands };
          })
        );

        response = {
          category,
          industry: category.industry,
          subCategories: subCategoriesWithBrands,
        };
      }
    }
    if (response) {
      return res.status(200).json({
        message: "Data fetched successfully",
        category: response,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message, error: err });
  }
});

module.exports = router;
