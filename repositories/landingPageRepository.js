const Mechanics = require("../models/userSIgnUp");
const Machines = require("../models/productUpload");

const landingPage = {
  getCounts: async () => {
    try {
      const [mechanicCount, machineCount] = await Promise.all([
        Mechanics.countDocuments(),
        Machines.countDocuments()
      ]);

      return {
        success: true,
        data: {
          mechanicCount,
          machineCount,
        },
      };
    } catch (err) {
      console.error("Error in getCounts:", err);
      return {
        mechanicCount: 0,
        machineCount: 0,
        error: true,
      };
    }
  },
};

module.exports = landingPage;
