const logger = require("../../../Config/logger.config");
const DashboardService = require("./DashboardService");
const RESPONSE = require("../../../Utils/ResponseMessagesColllection");

/////////////////////////////////////////////////////////////////////////////////////////
// Dashboard Controller
// Purpose : Fetch Dashboard Summary Data
/////////////////////////////////////////////////////////////////////////////////////////

getDashboard = async (req, res) => {
  logger.info("Dashboard Controller => getDashboard");

  try {
    // Call Dashboard Service
    const response = await DashboardService.getDashboard();

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Dashboard Controller => ${error.message}`);

    // Internal Server Error Response
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    });
  }
};

module.exports = {
  getDashboard,
};