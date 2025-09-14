const adminRepository = require("../repositories/AdminPage.repository");

const adminPageController = {
  createIndustry: async (req, res) => {
    try {
      const { industryData, categoryData, subCategoriesData } = req.body;

      if (!industryData || !categoryData || !subCategoriesData) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await adminRepository.createIndustry(
        industryData,
        categoryData,
        subCategoriesData
      );

      res.status(200).json({ message: "Data created successfully" }, result);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  editIndustry: async (req, res) => {
    try {
      const { industryData, categoryData, subCategoriesData } = req.body;

      if (!industryData || !categoryData || !subCategoriesData) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      console.log(industryData, categoryData, subCategoriesData);
      const result = await adminRepository.editIndustry(
        industryData,
        categoryData,
        subCategoriesData
      );

      res.status(200).json({ message: "Data updated successfully" }, result);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  deleteIndustry: async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Delete failed" });
      }

      const result = await adminRepository.deleteIndustry(id);

      res.status(200).json({ message: "Data deleted successfully" });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ message: "Delete failed" });
      }

      const result = await adminRepository.deleteCategory(id);

      res.status(200).json({ message: "Data deleted successfully" });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getIndustries: async (req, res) => {
    try {
      
      const role = req.role;
      if (role !== "admin") {
        throw new Error("Access denied");
      }

      const result = await adminRepository.getIndustries();

      res.status(200).json(result);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  getQrs: async (req, res) => {
    try {
      
      const role = req.role;
      if (role !== "admin") {
        throw new Error("Access denied");
      }

      const result = await adminRepository.getQrs();

      res.status(200).json(result);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = adminPageController;
