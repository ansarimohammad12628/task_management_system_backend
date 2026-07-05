const express = require("express");
const router = express.Router();

const NotificationController = require("./NotificationController");
const CommonValidator = require("../../../Validator/CommonValidator");

// Get All Notifications
router.get(
  "/getAllNotifications",
  CommonValidator.validateJWTToken,
  NotificationController.getAllNotifications
);

// Read Notification
router.put(
  "/readNotification/:id",
  CommonValidator.validateJWTToken,
  NotificationController.readNotification
);

// Delete Notification
router.delete(
  "/deleteNotification/:id",
  CommonValidator.validateJWTToken,
  NotificationController.deleteNotification
);

module.exports = router;