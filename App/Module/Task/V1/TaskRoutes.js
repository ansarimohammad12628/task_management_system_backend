const express = require("express");
const router = express.Router();

const TaskController = require("./TaskController");
const upload = require("../../../Utils/UploadFile");
const CommonValidator = require("../../../Validator/CommonValidator");

router.get(
  "/getAllTasks",
  CommonValidator.validateJWTToken,
  TaskController.getAllTasks
);

router.get(
  "/getTaskById/:id",
  CommonValidator.validateJWTToken,
  TaskController.getTaskById
);

router.post(
  "/addTask",
  CommonValidator.validateJWTToken,
  upload.single("attachment"),
  TaskController.addTask
);

router.put(
  "/updateTask/:id",
  CommonValidator.validateJWTToken,
  upload.single("attachment"),
  TaskController.updateTask
);

router.put(
  "/updateTaskStatus/:id",
  CommonValidator.validateJWTToken,
  TaskController.updateTaskStatus
);

router.delete(
  "/deleteTask/:id",
  CommonValidator.validateJWTToken,
  TaskController.deleteTask
);

router.get(
  "/getTaskAttachmentById/:id",
  CommonValidator.validateJWTToken,
  TaskController.getTaskAttachmentById
);

module.exports = router;