const express = require("express");
const router = express.Router();

const ReportController = require("./ReportController");
const CommonValidator = require("../../../Validator/CommonValidator");

// Task Report
router.get(
  "/taskReport",
  CommonValidator.validateJWTToken,
  ReportController.taskReport
);

// Export Excel
router.get(
  "/exportExcel",
  CommonValidator.validateJWTToken,
  ReportController.exportExcel
);

// Export CSV
router.get(
  "/exportCSV",
  CommonValidator.validateJWTToken,
  ReportController.exportCSV
);

module.exports = router;