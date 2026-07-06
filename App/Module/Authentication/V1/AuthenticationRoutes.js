// Import Express Framework
const express = require("express");

// Create Router Instance
const router = express.Router();

// Import Authentication Controller
const controller = require("./AuthenticationController");

/////////////////////////////////////////////////////////////////////////////////////////
// Authentication Routes
/////////////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// Register Route
// -----------------------------------------------------------------------------
router.post(
  "/register",
  controller.register
);

// -----------------------------------------------------------------------------
// Login Route
// -----------------------------------------------------------------------------
router.post(
  "/login",
  controller.login
);

// Export Router
module.exports = router;