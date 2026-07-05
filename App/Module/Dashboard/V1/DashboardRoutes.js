const express = require("express");
const router = express.Router();

const DashboardController = require("./DashboardController");
const CommonValidator = require("../../../Validator/CommonValidator");

// Dashboard
router.get(
  "/getDashboard",
  CommonValidator.validateJWTToken,
  DashboardController.getDashboard
);

module.exports = router;