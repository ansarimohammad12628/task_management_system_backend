const logger = require("../../../Config/logger.config");
const TaskService = require("./TaskService");
const TaskValidation = require("./TaskValidation");
const RESPONSE = require("../../../Utils/ResponseMessagesColllection");

/////////////////////////////////////////////////////////////////////////////////////////
// Get All Tasks Controller
// Purpose : Fetch All Tasks
/////////////////////////////////////////////////////////////////////////////////////////

getAllTasks = async (req, res) => {
  logger.info("Task Controller => getAllTasks");

  try {
    // Call Service
    const response = await TaskService.getAllTasks();

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => getAllTasks : ${error.message}`);

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
// Get Task By Id Controller
// Purpose : Fetch Task Details By Id
/////////////////////////////////////////////////////////////////////////////////////////

getTaskById = async (req, res) => {
  logger.info("Task Controller => getTaskById");

  try {
    // Call Service
    const response = await TaskService.getTaskById(req.params.id);

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => getTaskById : ${error.message}`);

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
// Add Task Controller
// Purpose : Create New Task
/////////////////////////////////////////////////////////////////////////////////////////

addTask = async (req, res) => {
  logger.info("Task Controller => addTask");

  try {
    // Validate Request
    const { error } = TaskValidation.addTaskValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        response_code: 400,
        message: error.details[0].message,
        data: {},
      });
    }

    // Call Service
    const response = await TaskService.addTask(
      req.body,
      req.file
    );

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => addTask : ${error.message}`);

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
// Update Task Controller
// Purpose : Update Existing Task
/////////////////////////////////////////////////////////////////////////////////////////

updateTask = async (req, res) => {
  logger.info("Task Controller => updateTask");

  try {
    // Validate Request
    const { error } = TaskValidation.updateTaskValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        response_code: 400,
        message: error.details[0].message,
        data: {},
      });
    }

    // Call Service
    const response = await TaskService.updateTask(
      req.params.id,
      req.body,
      req.file
    );

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => updateTask : ${error.message}`);

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
// Delete Task Controller
// Purpose : Delete Task By Id
/////////////////////////////////////////////////////////////////////////////////////////

deleteTask = async (req, res) => {
  logger.info("Task Controller => deleteTask");

  try {
    // Call Service
    const response = await TaskService.deleteTask(req.params.id);

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => deleteTask : ${error.message}`);

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
// Get Task Attachment Controller
// Purpose : Download/View Task Attachment
/////////////////////////////////////////////////////////////////////////////////////////

getTaskAttachmentById = async (req, res, next) => {

  try {
    // Get Task Id
    const { id } = req.params;

    // Call Service
    const result = await TaskService.getTaskAttachmentById({ id });

    // Return Error Response
    if (!result.success) {
      return res.status(result.status || 500).json(result);
    }

    // Set Content Type And Stream File
    res.setHeader("Content-Type", result.contentType);
    result.stream.pipe(res);

  } catch (error) {
    console.error("Controller Error:", error.message);

    // Internal Server Error Response
    res.status(500).json({
      success: false,
      error: RESPONSE.SOMETHING_WENT_WRONG,
    });

    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  getTaskAttachmentById
};