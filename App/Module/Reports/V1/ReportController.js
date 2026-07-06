const logger = require("../../../Config/logger.config");
const ReportService = require("./ReportService");
const RESPONSE = require("../../../Utils/ResponseMessagesColllection");

/////////////////////////////////////////////////////////////////////////////////////////
// Task Report Controller
// Purpose : Fetch Task Report
/////////////////////////////////////////////////////////////////////////////////////////

taskReport = async (req, res) => {
  logger.info("Report Controller => taskReport");

  try {
    // Call Service
    const response = await ReportService.taskReport(req.query);

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    // Log Error
    logger.error(`Report Controller => ${error.message}`);

    // Internal Server Error Response
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: [],
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Export Excel Controller
// Purpose : Export Task Report In Excel Format
/////////////////////////////////////////////////////////////////////////////////////////

exportExcel = async (req, res) => {
  logger.info("Report Controller => exportExcel");

  try {
    // Call Service
    await ReportService.exportExcel(req, res);
  } catch (error) {
    // Log Error
    logger.error(error.message);

    // Internal Server Error Response
    return res.status(500).json({
      success: false,
      message: RESPONSE.SOMETHING_WENT_WRONG,
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Export CSV Controller
// Purpose : Export Task Report In CSV Format
/////////////////////////////////////////////////////////////////////////////////////////

exportCSV = async (req, res) => {
  logger.info("Report Controller => exportCSV");

  try {
    // Call Service
    await ReportService.exportCSV(req, res);
  } catch (error) {
    // Log Error
    logger.error(error.message);

    // Internal Server Error Response
    return res.status(500).json({
      success: false,
      message: RESPONSE.SOMETHING_WENT_WRONG,
    });
  }
};

module.exports = {
  taskReport,
  exportExcel,
  exportCSV,
};