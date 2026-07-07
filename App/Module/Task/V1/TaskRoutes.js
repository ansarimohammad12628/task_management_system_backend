// Import Express
const express = require("express");

// Create Router Instance
const router = express.Router();

// Import Task Controller
const TaskController = require("./TaskController");

// Import File Upload Middleware
const upload = require("../../../Utils/UploadFile");

// Import JWT Validation Middleware
const CommonValidator = require("../../../Validator/CommonValidator");

/////////////////////////////////////////////////////////////////////////////////////////
// Task Routes
/////////////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// Get All Tasks
// Method : GET
// URL    : /getAllTasks
// -----------------------------------------------------------------------------
router.get(
  "/getAllTasks",
  CommonValidator.validateJWTToken,
  TaskController.getAllTasks
);

// -----------------------------------------------------------------------------
// Get Task By Id
// Method : GET
// URL    : /getTaskById/:id
// -----------------------------------------------------------------------------
router.get(
  "/getTaskById/:id",
  CommonValidator.validateJWTToken,
  TaskController.getTaskById
);

// -----------------------------------------------------------------------------
// Add Task
// Method : POST
// URL    : /addTask
// -----------------------------------------------------------------------------
router.post(
  "/addTask",
  CommonValidator.validateJWTToken,
  upload.single("attachment"),
  TaskController.addTask
);

// -----------------------------------------------------------------------------
// Update Task
// Method : PUT
// URL    : /updateTask/:id
// Purpose: Update Existing Task
// -----------------------------------------------------------------------------
router.put(
  "/updateTask/:id",
  CommonValidator.validateJWTToken,
  upload.single("attachment"),
  TaskController.updateTask
);

// -----------------------------------------------------------------------------
// Delete Task
// Method : DELETE
// -----------------------------------------------------------------------------
router.delete(
  "/deleteTask/:id",
  CommonValidator.validateJWTToken,
  TaskController.deleteTask
);

// -----------------------------------------------------------------------------
// Get Task Attachment By Id
// Method : GET
// -----------------------------------------------------------------------------
router.get(
  "/getTaskAttachmentById/:id",
  CommonValidator.validateJWTToken,
  TaskController.getTaskAttachmentById
);

// Export Router
module.exports = router;