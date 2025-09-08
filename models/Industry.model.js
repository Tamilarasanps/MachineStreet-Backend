const mongoose = require("mongoose");

// Industry Schema
const industrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for categories
industrySchema.virtual("categories", {
  ref: "Category",
  localField: "_id",
  foreignField: "industry",
});

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    industry: { type: mongoose.Schema.Types.ObjectId, ref: "Industry", required: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for subCategories
categorySchema.virtual("subCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "category",
});

// SubCategory Schema
const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for brands
subCategorySchema.virtual("brands", {
  ref: "Brand",
  localField: "_id",
  foreignField: "subCategory",
});

// Brand Schema
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },
});

// Models
const industry = mongoose.model("Industry", industrySchema);
const category = mongoose.model("Category", categorySchema);
const subCategory = mongoose.model("SubCategory", subCategorySchema);
const brand = mongoose.model("Brand", brandSchema);

module.exports = {
  industry,
  category,
  subCategory,
  brand,
};
