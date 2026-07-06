const logger = require("../../../Config/logger.config");
const pool = require("../../../Config/db.poolingConnection");
const RESPONSE = require("../../../Utils/ResponseMessagesColllection");
const utils = require("../../../Utils/Utils");

const {
  getGithubFileUrl,
  uploadFileToGithub,
  deleteFileFromGithub,
  getServerRawUrl,
  fetchServerFileStream,
} = require("../../../Utils/githubStorage");

/////////////////////////////////////////////////////////////////////////////////////////
// Get All Tasks Service
// Purpose : Fetch All Tasks
/////////////////////////////////////////////////////////////////////////////////////////

const getAllTasks = async () => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Fetch All Tasks
    /////////////////////////////////////////////////////////////////////////////

    const query = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.start_date,
        t.due_date,
        t.created_at,
        t.updated_at,
        e.id AS employee_id,
        CONCAT(e.first_name,' ',e.last_name) AS employee_name,
        e.department,
        e.designation
      FROM tasks t
      INNER JOIN employees e
      ON t.employee_id = e.id
      ORDER BY t.id DESC
    `;

    const [tasks] = await connection.query(query);

    const formattedTasks = tasks.map((task) => ({
      ...task,
      start_date: task.start_date
        ? utils.commonFormateDateOnly(task.start_date)
        : null,
      due_date: task.due_date
        ? utils.commonFormateDateOnly(task.due_date)
        : null,
      created_at: task.created_at
        ? utils.commonFormateDate(task.created_at)
        : null,
      updated_at: task.updated_at
        ? utils.commonFormateDate(task.updated_at)
        : null,
      from_date: task.created_at ? utils.fromDate(task.created_at) : null,
    }));

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.TASKS_FETCHED_SUCCESSFULLY,
      data: formattedTasks,
    };
  } catch (error) {
    // Log Error
    logger.error(`Task Service => getAllTasks : ${error.message}`);

    /////////////////////////////////////////////////////////////////////////////
    // Error Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: [],
    };
  } finally {
    /////////////////////////////////////////////////////////////////////////////
    // Release Database Connection
    /////////////////////////////////////////////////////////////////////////////

    if (connection) {
      connection.release();
    }
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Get Task By Id Service
// Purpose : Fetch Task Details By Task Id
/////////////////////////////////////////////////////////////////////////////////////////

const getTaskById = async (taskId) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Fetch Task Details
    /////////////////////////////////////////////////////////////////////////////

    const query = `
      SELECT
        t.id,
        t.employee_id,
        CONCAT(e.first_name,' ',e.last_name) AS employee_name,
        e.department,
        e.designation,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.start_date,
        t.due_date,
        t.attachment,
        t.created_at,
        t.updated_at
      FROM tasks t
      INNER JOIN employees e
      ON t.employee_id = e.id
      WHERE t.id = ?
      LIMIT 1
    `;

    const [task] = await connection.query(query, [taskId]);

    const formattedTasks = task.map((task) => ({
      ...task,
      start_date: task.start_date
        ? utils.commonFormateDateOnly(task.start_date)
        : null,
      due_date: task.due_date
        ? utils.commonFormateDateOnly(task.due_date)
        : null,
      created_at: task.created_at
        ? utils.commonFormateDate(task.created_at)
        : null,
      updated_at: task.updated_at
        ? utils.commonFormateDate(task.updated_at)
        : null,
      from_date: task.created_at ? utils.fromDate(task.created_at) : null,
    }));

    /////////////////////////////////////////////////////////////////////////////
    // Check Task Exists
    /////////////////////////////////////////////////////////////////////////////

    if (task.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: RESPONSE.TASK_NOT_FOUND,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Generate GitHub File URL
    /////////////////////////////////////////////////////////////////////////////

    task[0].attachment = task[0].attachment
      ? getGithubFileUrl(task[0].attachment)
      : null;

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.TASK_FETCHED_SUCCESSFULLY,
      data: formattedTasks,
    };
  } catch (error) {
    // Log Error
    logger.error(`Task Service => getTaskById : ${error.message}`);

    /////////////////////////////////////////////////////////////////////////////
    // Error Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    };
  } finally {
    /////////////////////////////////////////////////////////////////////////////
    // Release Database Connection
    /////////////////////////////////////////////////////////////////////////////

    if (connection) {
      connection.release();
    }
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Add Task Service
// Purpose : Create New Task
/////////////////////////////////////////////////////////////////////////////////////////

const addTask = async (taskData, file) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Check Employee Exists
    /////////////////////////////////////////////////////////////////////////////

    const [employee] = await connection.query(
      `SELECT id FROM employees WHERE id = ?`,
      [taskData.employee_id],
    );

    // Return If Employee Not Found
    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: RESPONSE.EMPLOYEE_NOT_FOUND,
        data: {},
      };
    }

    let attachment = null;

    /////////////////////////////////////////////////////////////////////////////
    // Upload Attachment To GitHub
    /////////////////////////////////////////////////////////////////////////////

    if (file) {
      const upload = await uploadFileToGithub({
        file,
        folder: "tasks",
        subfolder: String(taskData.employee_id),
        customFileName: `Task_${Date.now()}`,
        commitMessage: "Task Attachment Upload",
      });

      // Return If Upload Failed
      if (!upload.success) {
        return {
          success: false,
          response_code: 500,
          message: upload.message,
          data: {},
        };
      }

      attachment = upload.data.relativePath;
    }

    /////////////////////////////////////////////////////////////////////////////
    // Insert Task
    /////////////////////////////////////////////////////////////////////////////

    const query = `
        INSERT INTO tasks
        (
            employee_id,
            title,
            description,
            priority,
            status,
            start_date,
            due_date,
            attachment,
            created_by,
            updated_by
        )
        VALUES
        (
            ?,?,?,?,?,?,?,?,?,?
        )
    `;

    const values = [
      taskData.employee_id,
      taskData.title,
      taskData.description,
      taskData.priority,
      taskData.status,
      taskData.start_date,
      taskData.due_date,
      attachment,
      1,
      1,
    ];

    const [result] = await connection.query(query, values);

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.TASK_CREATED_SUCCESSFULLY,
      data: {
        task_id: result.insertId,
      },
    };
  } catch (error) {
    // Log Error
    logger.error(`Task Service => addTask : ${error.message}`);

    /////////////////////////////////////////////////////////////////////////////
    // Error Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    };
  } finally {
    /////////////////////////////////////////////////////////////////////////////
    // Release Database Connection
    /////////////////////////////////////////////////////////////////////////////

    if (connection) {
      connection.release();
    }
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Update Task Service
// Purpose : Update Existing Task
/////////////////////////////////////////////////////////////////////////////////////////

const updateTask = async (taskId, taskData, file) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Check Task Exists
    /////////////////////////////////////////////////////////////////////////////

    const [task] = await connection.query(
      "SELECT id, attachment,status FROM tasks WHERE id = ?",
      [taskId],
    );

    // Return If Task Not Found
    if (task.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: RESPONSE.TASK_NOT_FOUND,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Check Task Status
    /////////////////////////////////////////////////////////////////////////////

    if (task[0].status === "Completed") {
      return {
        success: false,
        response_code: 400,
        message: RESPONSE.TASK_ALREADY_COMPLETED,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Check Employee Exists
    /////////////////////////////////////////////////////////////////////////////

    const [employee] = await connection.query(
      "SELECT id FROM employees WHERE id = ?",
      [taskData.employee_id],
    );

    // Return If Employee Not Found
    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: RESPONSE.EMPLOYEE_NOT_FOUND,
        data: {},
      };
    }

    let attachment = task[0].attachment;

    /////////////////////////////////////////////////////////////////////////////
    // Upload New Attachment
    /////////////////////////////////////////////////////////////////////////////

    if (file) {
      // Delete Old Attachment
      if (attachment) {
        await deleteFileFromGithub(attachment);
      }

      // Upload New Attachment
      const upload = await uploadFileToGithub({
        file,
        folder: "tasks",
        subfolder: String(taskData.employee_id),
        customFileName: `Task_${Date.now()}`,
        commitMessage: "Update Task Attachment",
      });

      // Return If Upload Failed
      if (!upload.success) {
        return {
          success: false,
          response_code: 500,
          message: upload.message,
          data: {},
        };
      }

      attachment = upload.data.relativePath;
    }

    /////////////////////////////////////////////////////////////////////////////
    // Update Task
    /////////////////////////////////////////////////////////////////////////////

    const query = `
      UPDATE tasks
      SET
        employee_id = ?,
        title = ?,
        description = ?,
        priority = ?,
        status = ?,
        start_date = ?,
        due_date = ?,
        attachment = ?,
        updated_by = ?
      WHERE id = ?
    `;

    const values = [
      taskData.employee_id,
      taskData.title,
      taskData.description,
      taskData.priority,
      taskData.status,
      taskData.start_date,
      taskData.due_date,
      attachment,
      1,
      taskId,
    ];

    await connection.query(query, values);

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.TASK_UPDATED_SUCCESSFULLY,
      data: {},
    };
  } catch (error) {
    // Log Error
    logger.error(`Task Service => updateTask : ${error.message}`);

    /////////////////////////////////////////////////////////////////////////////
    // Error Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    };
  } finally {
    /////////////////////////////////////////////////////////////////////////////
    // Release Database Connection
    /////////////////////////////////////////////////////////////////////////////

    if (connection) {
      connection.release();
    }
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Update Task Status Service
// Purpose : Update Task Status
/////////////////////////////////////////////////////////////////////////////////////////

const updateTaskStatus = async (taskId, status) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Check Task Exists
    /////////////////////////////////////////////////////////////////////////////

    const [task] = await connection.query(`SELECT id FROM tasks WHERE id = ?`, [
      taskId,
    ]);

    // Return If Task Not Found
    if (task.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: RESPONSE.TASK_NOT_FOUND,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Validate Task Status
    /////////////////////////////////////////////////////////////////////////////

    const validStatus = ["Pending", "In Progress", "Completed"];

    if (!validStatus.includes(status)) {
      return {
        success: false,
        response_code: 400,
        message: RESPONSE.INVALID_TASK_STATUS,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Update Task Status
    /////////////////////////////////////////////////////////////////////////////

    await connection.query(
      `
      UPDATE tasks
      SET
        status = ?,
        updated_by = ?
      WHERE id = ?
      `,
      [status, 1, taskId],
    );

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.TASK_STATUS_UPDATED_SUCCESSFULLY,
      data: {},
    };
  } catch (error) {
    // Log Error
    logger.error(`Task Service => updateTaskStatus : ${error.message}`);

    /////////////////////////////////////////////////////////////////////////////
    // Error Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    };
  } finally {
    /////////////////////////////////////////////////////////////////////////////
    // Release Database Connection
    /////////////////////////////////////////////////////////////////////////////

    if (connection) {
      connection.release();
    }
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Delete Task Service
// Purpose : Delete Task By Id
/////////////////////////////////////////////////////////////////////////////////////////

const deleteTask = async (taskId) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Check Task Exists
    /////////////////////////////////////////////////////////////////////////////

    const [task] = await connection.query(
      `SELECT id, attachment FROM tasks WHERE id = ?`,
      [taskId],
    );

    // Return If Task Not Found
    if (task.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: RESPONSE.TASK_NOT_FOUND,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Delete Attachment From GitHub
    /////////////////////////////////////////////////////////////////////////////

    if (task[0].attachment) {
      const deleteFile = await deleteFileFromGithub(task[0].attachment);

      // Log Error If Attachment Delete Failed
      if (!deleteFile.success) {
        logger.error(deleteFile.error);
      }
    }

    /////////////////////////////////////////////////////////////////////////////
    // Delete Related Notifications
    /////////////////////////////////////////////////////////////////////////////

    await connection.query(
      `
      DELETE FROM notifications
      WHERE task_id = ?
      `,
      [taskId],
    );

    /////////////////////////////////////////////////////////////////////////////
    // Delete Task
    /////////////////////////////////////////////////////////////////////////////

    await connection.query(`DELETE FROM tasks WHERE id = ?`, [taskId]);

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.TASK_DELETED_SUCCESSFULLY,
      data: {},
    };
  } catch (error) {
    // Log Error
    logger.error(`Task Service => deleteTask : ${error.message}`);

    /////////////////////////////////////////////////////////////////////////////
    // Error Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    };
  } finally {
    /////////////////////////////////////////////////////////////////////////////
    // Release Database Connection
    /////////////////////////////////////////////////////////////////////////////

    if (connection) {
      connection.release();
    }
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Get Task Attachment By Id Service
// Purpose : Fetch Task Attachment File
/////////////////////////////////////////////////////////////////////////////////////////

const getTaskAttachmentById = async ({ id }) => {
  /////////////////////////////////////////////////////////////////////////////
  // Validate Task Id
  /////////////////////////////////////////////////////////////////////////////

  if (!id) {
    return {
      success: false,
      status: 400,
      error: RESPONSE.TASK_ID_REQUIRED,
    };
  }

  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Fetch Task Attachment
    /////////////////////////////////////////////////////////////////////////////

    const [rows] = await connection.query(
      `SELECT attachment
       FROM tasks
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    /////////////////////////////////////////////////////////////////////////////
    // Check Attachment Exists
    /////////////////////////////////////////////////////////////////////////////

    if (!rows.length || !rows[0].attachment) {
      return {
        success: false,
        status: 404,
        error: RESPONSE.ATTACHMENT_NOT_FOUND,
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Generate Server Raw URL
    /////////////////////////////////////////////////////////////////////////////

    const serverUrl = getServerRawUrl(rows[0].attachment);

    /////////////////////////////////////////////////////////////////////////////
    // Return File Stream
    /////////////////////////////////////////////////////////////////////////////

    return await fetchServerFileStream(serverUrl);
  } catch (error) {
    // Log Error
    console.error(error);

    /////////////////////////////////////////////////////////////////////////////
    // Error Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: false,
      status: 500,
      error: RESPONSE.SOMETHING_WENT_WRONG,
    };
  } finally {
    /////////////////////////////////////////////////////////////////////////////
    // Release Database Connection
    /////////////////////////////////////////////////////////////////////////////

    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  addTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskAttachmentById,
};
