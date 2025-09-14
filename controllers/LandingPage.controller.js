const landingPageRepository = require("../repositories/landingPge.repository");

const landingPageController = () => ({
  getCounts: async (req, res) => {
    try {
      const result = await landingPageRepository.getCounts();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.message || "Unknown error occurred",
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("getCounts controller error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Server error while getting counts",
        error: error.message,
      });
    }
  },
});

module.exports = landingPageController;
