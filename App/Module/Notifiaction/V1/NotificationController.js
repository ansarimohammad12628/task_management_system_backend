const logger = require("../../../Config/logger.config");
const NotificationService = require("./NotificationService");

 getAllNotifications = async (req, res) => {
  logger.info("Notification Controller => getAllNotifications");

  try {
    const response =
      await NotificationService.getAllNotifications(req.user.employee_id);

    return res
      .status(response.response_code)
      .json(response);

  } catch (error) {

    logger.error(error.message);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: [],
    });

  }
};

 readNotification = async (req, res) => {
  logger.info("Notification Controller => readNotification");

  try {

    const response =
      await NotificationService.readNotification(
        req.params.id
      );

    return res
      .status(response.response_code)
      .json(response);

  } catch (error) {

    logger.error(error.message);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });

  }
};

 deleteNotification = async (req, res) => {
  logger.info("Notification Controller => deleteNotification");

  try {

    const response =
      await NotificationService.deleteNotification(
        req.params.id
      );

    return res
      .status(response.response_code)
      .json(response);

  } catch (error) {

    logger.error(error.message);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });

  }
};

module.exports = {
  getAllNotifications,
  readNotification,
  deleteNotification,
};