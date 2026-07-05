const logger = require("../../../Config/logger.config");
const DashboardService = require("./DashboardService");

 getDashboard = async (req, res) => {
  logger.info("Dashboard Controller => getDashboard");

  try {
    const response = await DashboardService.getDashboard();

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Dashboard Controller => ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

module.exports = {
  getDashboard,
};