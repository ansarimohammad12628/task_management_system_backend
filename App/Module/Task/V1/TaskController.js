const logger = require("../../../Config/logger.config");
const TaskService = require("./TaskService");
const TaskValidation = require("./TaskValidation");

getAllTasks = async (req, res) => {
  logger.info("Task Controller => getAllTasks");

  try {
    const response = await TaskService.getAllTasks();

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => getAllTasks : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: [],
    });
  }
};

getTaskById = async (req, res) => {
  logger.info("Task Controller => getTaskById");

  try {
    const response = await TaskService.getTaskById(req.params.id);

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => getTaskById : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

addTask = async (req, res) => {
  logger.info("Task Controller => addTask");

  try {
    const { error } = TaskValidation.addTaskValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        response_code: 400,
        message: error.details[0].message,
        data: {},
      });
    }

    const response = await TaskService.addTask(
      req.body,
      req.file
    );

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => addTask : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

updateTask = async (req, res) => {
  logger.info("Task Controller => updateTask");

  try {
    const { error } = TaskValidation.updateTaskValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        response_code: 400,
        message: error.details[0].message,
        data: {},
      });
    }

    const response = await TaskService.updateTask(
      req.params.id, 
      req.body,
      req.file
    );

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => updateTask : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

updateTaskStatus = async (req, res) => {
  logger.info("Task Controller => updateTaskStatus");

  try {
    const response = await TaskService.updateTaskStatus(
      req.params.id,
      req.body.status,
    );

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => updateTaskStatus : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

deleteTask = async (req, res) => {
  logger.info("Task Controller => deleteTask");

  try {
    const response = await TaskService.deleteTask(req.params.id);

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Task Controller => deleteTask : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};


 getTaskAttachmentById = async (req, res, next) => {
  
  try {
    const { id } = req.params;

    const result = await TaskService.getTaskAttachmentById({ id });

    if (!result.success) {
      return res.status(result.status || 500).json(result);
    }

    res.setHeader("Content-Type", result.contentType);
    result.stream.pipe(res);
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Something went wrong",
    });

    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  addTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskAttachmentById

};
