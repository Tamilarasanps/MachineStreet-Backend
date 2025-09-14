// ReposlandingPageRepositorys/landingPageRepository.js
const Mechanics = require("../models/user.model");
const {industry} = require("../models/Industry.model");

const landingPageRepository = {
  getCounts: async () => {
    try {
      const [mechanicCount, industryCount] = await Promise.all([
        Mechanics.countDocuments().catch(() => 0),
        industry.countDocuments().catch(() => 0),
      ]);

      return {
        success: true,
        data: {
          mechanicCount: mechanicCount || 0,
          industryCount: industryCount || 0,
        },
        error: null,
      };
    } catch (err) {
      console.error( err);

      return {
        success: false,
        data: {
          mechanicCount: 0,
          machineCount: 0,
        },
        error: err.message || "Internal Server Error",
      };
    }
  },
};

module.exports = landingPageRepository;
