// Import Express
const express = require("express");

// Create Router Instance
const router = express.Router();

// Import Controller
const DashboardController = require("./DashboardController");

// Import JWT Validator Middleware
const CommonValidator = require("../../../Validator/CommonValidator");

/////////////////////////////////////////////////////////////////////////////////////////
// Dashboard Routes
/////////////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// Dashboard
// Method : GET
// -----------------------------------------------------------------------------
router.get(
  "/getDashboard",
  CommonValidator.validateJWTToken,
  DashboardController.getDashboard
);

// Export Router
module.exports = router;