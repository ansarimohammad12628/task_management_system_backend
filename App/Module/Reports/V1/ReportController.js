const logger = require("../../../Config/logger.config");
const ReportService = require("./ReportService");

taskReport = async (req, res) => {
  logger.info("Report Controller => taskReport");

  try {
    const response = await ReportService.taskReport(req.query);

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Report Controller => ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: [],
    });
  }
};

exportExcel = async (req, res) => {
  logger.info("Report Controller => exportExcel");

  try {
    await ReportService.exportExcel(req, res);
  } catch (error) {
    logger.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exportCSV = async (req, res) => {
  logger.info("Report Controller => exportCSV");

  try {
    await ReportService.exportCSV(req, res);
  } catch (error) {
    logger.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  taskReport,
 exportExcel,
  exportCSV,
};
