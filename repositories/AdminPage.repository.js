const {
  industry,
  category,
  subCategory,
  brand,
} = require("../models/Industry.model");
const qr = require('../models/Qr.model')

const adminRepository = {
  createIndustry: async (industryData, categoryData, subCategoriesData) => {
    try {
      // 1. Create/find Industry
      let industryDoc = await industry.findOne({ name: industryData });
      if (!industryDoc) {
        industryDoc = await industry.create({ name: industryData });
      }

      // 2. Create/find Category
      let categoryDoc = await category.findOne({
        name: categoryData,
        industry: industryDoc._id,
      });
      if (!categoryDoc) {
        categoryDoc = await category.create({
          name: categoryData,
          industry: industryDoc._id,
        });
      }

      // 3. Create SubCategories and Brands
      for (const sub of subCategoriesData) {
        let subCat = await subCategory.findOne({
          name: sub.name,
          category: categoryDoc._id,
        });
        if (!subCat) {
          subCat = await subCategory.create({
            name: sub.name,
            category: categoryDoc._id,
          });
        }

        for (const brandData of sub.services) {
          const existingBrand = await brand.findOne({
            name: brandData,
            subCategory: subCat._id,
          });
          if (!existingBrand) {
            await brand.create({
              name: brandData,
              subCategory: subCat._id,
            });
          }
        }
      }
    } catch (err) {
      throw err;
    }
  },
  editIndustry: async (industryData, categoryData, subCategoriesData) => {
    try {
      // 1. Find Industry
      let industryDoc = await industry.findOne({ name: industryData });
      if (!industryDoc) throw new Error("Industry not found");

      // Update industry name
      industryDoc.name = industryData;
      await industryDoc.save();

      // 2. Find or Create Category
      let categoryDoc = await category.findOne({
        name: categoryData,
        industry: industryDoc._id,
      });

      if (!categoryDoc) {
        categoryDoc = await category.create({
          name: categoryData,
          industry: industryDoc._id,
        });
      } else {
        categoryDoc.name = categoryData;
        await categoryDoc.save();
      }

      // 3. Sync SubCategories
      const incomingSubIds = subCategoriesData.map((s) => s.id);

      // Find existing subCategories in DB
      const existingSubs = await subCategory.find({
        category: categoryDoc._id,
      });

      // Delete missing subcategories
      for (const dbSub of existingSubs) {
        if (!incomingSubIds.includes(dbSub._id.toString())) {
          await brand.deleteMany({ subCategory: dbSub._id }); // remove brands first
          await subCategory.findByIdAndDelete(dbSub._id);
        }
      }

      // Update or Insert subcategories
      for (const sub of subCategoriesData) {
        let subCat = await subCategory.findById(sub.id);

        if (!subCat) {
          subCat = await subCategory.create({
            _id: sub.id, // ensure consistency with API id
            name: sub.name,
            category: categoryDoc._id,
          });
        } else {
          subCat.name = sub.name;
          await subCat.save();
        }

        // ---- Sync Brands ----
        const incomingBrandNames = sub.services.map((s) => s.name);
        const existingBrands = await brand.find({ subCategory: subCat._id });

        // Delete missing brands
        for (const dbBrand of existingBrands) {
          if (!incomingBrandNames.includes(dbBrand.name)) {
            await brand.findByIdAndDelete(dbBrand._id);
          }
        }

        // Update or Insert brands
        for (const brandData of sub.services) {
          let brandDoc = await brand.findOne({
            _id: brandData.id,
            subCategory: subCat._id,
          });

          if (!brandDoc) {
            await brand.create({
              _id: brandData.id,
              name: brandData.name,
              subCategory: subCat._id,
            });
          } else {
            brandDoc.name = brandData.name;
            await brandDoc.save();
          }
        }
      }

      return { success: true, message: "Industry synced successfully" };
    } catch (err) {
      throw err;
    }
  },
  deleteIndustry: async (id) => {
    try {
      // Delete categories belonging to this industry
      const categories = await category.find({ industry: id });

      for (const cat of categories) {
        // Delete subcategories under each category
        const subCategories = await subCategory.find({ category: cat._id });

        for (const sub of subCategories) {
          // Delete brands under each subCategory
          await brand.deleteMany({ subCategory: sub._id });
        }

        // Delete subCategories
        await subCategory.deleteMany({ category: cat._id });
      }

      // Delete categories
      await category.deleteMany({ industry: id });

      // Finally delete industry
      await industry.findByIdAndDelete(id);

      return {
        success: true,
        message: "Industry and related data deleted successfully",
      };
    } catch (err) {
      throw err;
    }
  },
  deleteIndustry: async (id) => {
    try {
      // Delete categories belonging to this industry
      const categories = await category.find({ industry: id });

      for (const cat of categories) {
        // Delete subcategories under each category
        const subCategories = await subCategory.find({ category: cat._id });

        for (const sub of subCategories) {
          // Delete brands under each subCategory
          await brand.deleteMany({ subCategory: sub._id });
        }

        // Delete subCategories
        await subCategory.deleteMany({ category: cat._id });
      }

      // Delete categories
      await category.deleteMany({ industry: id });

      // Finally delete industry
      await industry.findByIdAndDelete(id);

      return {
        success: true,
        message: "Industry and related data deleted successfully",
      };
    } catch (err) {
      throw err;
    }
  },
  deleteCategory: async (id) => {
    try {
      // Find all subCategories under this category
      const subCategories = await subCategory.find({ category: id });

      for (const sub of subCategories) {
        // Delete all brands under each subCategory
        await brand.deleteMany({ subCategory: sub._id });
      }

      // Delete all subCategories of this category
      await subCategory.deleteMany({ category: id });

      // Delete the category itself
      await category.findByIdAndDelete(id);

      return {
        success: true,
        message: "Category and related data deleted successfully",
      };
    } catch (err) {
      throw err;
    }
  },

  getIndustries: async () => {
    try {
      const industries = await industry
        .find()
        .populate({
          path: "categories",
          populate: {
            path: "subCategories",
            populate: {
              path: "brands",
            },
          },
        })
        .lean();

      // Transform the data with IDs
      const formatted = industries.map((ind) => ({
        id: ind._id,
        industry: ind.name,
        categories: (ind.categories || []).map((cat) => ({
          id: cat._id,
          category: cat.name,
          subcategories: (cat.subCategories || []).map((sub) => ({
            id: sub._id,
            name: sub.name,
            services: (sub.brands || []).map((b) => ({
              id: b._id,
              name: b.name,
            })),
          })),
        })),
      }));

      return formatted;
    } catch (error) {
      console.error("Error fetching industries:", error);
      throw new Error("Failed to fetch industries.");
    }
  },
  getQrs: async () => {
  try {
    // Fetch all QR codes as plain JavaScript objects
    const qrCodes = await qr.find().lean();
    return qrCodes;
  } catch (error) {
    console.error("Error fetching QR codes:", error.message);
    throw new Error("Failed to fetch QR codes.");
  }
},

};

module.exports = adminRepository;
