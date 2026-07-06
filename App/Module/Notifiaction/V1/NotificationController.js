const logger = require("../../../Config/logger.config");
const NotificationService = require("./NotificationService");
const RESPONSE = require("../../../Utils/ResponseMessagesColllection");

/////////////////////////////////////////////////////////////////////////////////////////
// Get All Notifications Controller
/////////////////////////////////////////////////////////////////////////////////////////

getAllNotifications = async (req, res) => {
  logger.info("Notification Controller => getAllNotifications");

  try {

    // Call Service
    const response =
      await NotificationService.getAllNotifications(req.user.employee_id);

    // Return Response
    return res
      .status(response.response_code)
      .json(response);

  } catch (error) {

    // Log Error
    logger.error(error.message);

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
// Read Notification Controller
/////////////////////////////////////////////////////////////////////////////////////////

readNotification = async (req, res) => {
  logger.info("Notification Controller => readNotification");

  try {

    // Call Service
    const response =
      await NotificationService.readNotification(
        req.params.id
      );

    // Return Response
    return res
      .status(response.response_code)
      .json(response);

  } catch (error) {

    // Log Error
    logger.error(error.message);

    // Internal Server Error Response
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    });

  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Delete Notification Controller
/////////////////////////////////////////////////////////////////////////////////////////

deleteNotification = async (req, res) => {
  logger.info("Notification Controller => deleteNotification");

  try {

    // Call Service
    const response =
      await NotificationService.deleteNotification(
        req.params.id
      );

    // Return Response
    return res
      .status(response.response_code)
      .json(response);

  } catch (error) {

    // Log Error
    logger.error(error.message);

    // Internal Server Error Response
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    });

  }
};

module.exports = {
  getAllNotifications,
  readNotification,
  deleteNotification,
};