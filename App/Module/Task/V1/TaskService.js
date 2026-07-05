const logger = require("../../../Config/logger.config");
const pool = require("../../../Config/db.poolingConnection");

const {
  getGithubFileUrl,
  uploadFileToGithub,
  deleteFileFromGithub,
  getServerRawUrl, 
  fetchServerFileStream 
} = require("../../../Utils/githubStorage");

const getAllTasks = async () => {
  let connection;

  try {
    connection = await pool.getConnection();

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

    return {
      success: true,
      response_code: 200,
      message: "Tasks fetched successfully.",
      data: tasks,
    };
  } catch (error) {
    logger.error(`Task Service => getAllTasks : ${error.message}`);

    return {
      success: false,
      response_code: 500,
      message: "Something went wrong.",
      data: [],
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getTaskById = async (taskId) => {
  let connection;

  try {
    connection = await pool.getConnection();

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

    if (task.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Task not found.",
        data: {},
      };
    }

    task[0].attachment = task[0].attachment
      ? getGithubFileUrl(task[0].attachment)
      : null;

    return {
      success: true,
      response_code: 200,
      message: "Task fetched successfully.",
      data: task[0],
    };
  } catch (error) {
    logger.error(`Task Service => getTaskById : ${error.message}`);

    return {
      success: false,
      response_code: 500,
      message: "Something went wrong.",
      data: {},
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const addTask = async (taskData, file) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Check Employee Exists
    const [employee] = await connection.query(
      `SELECT id FROM employees WHERE id = ?`,
      [taskData.employee_id],
    );

    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Employee not found.",
        data: {},
      };
    }

    let attachment = null;

    // Upload Attachment
    if (file) {
      const upload = await uploadFileToGithub({
        file,
        folder: "tasks",
        subfolder: String(taskData.employee_id),
        customFileName: `Task_${Date.now()}`,
        commitMessage: "Task Attachment Upload",
      });

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

    // Insert Task
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

    return {
      success: true,
      response_code: 200,
      message: "Task created successfully.",
      data: {
        task_id: result.insertId,
      },
    };
  } catch (error) {
    logger.error(`Task Service => addTask : ${error.message}`);

    return {
      success: false,
      response_code: 500,
      message: "Something went wrong.",
      data: {},
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const updateTask = async (taskId, taskData, file) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Check Task Exists
    const [task] = await connection.query(
      "SELECT id, attachment,status FROM tasks WHERE id = ?",
      [taskId],
    );

    if (task.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Task not found.",
        data: {},
      };
    }

    // Completed Task cannot be edited
    if (task[0].status === "Completed") {
      return {
        success: false,
        response_code: 400,
        message: "Completed task cannot be updated.",
        data: {},
      };
    }

    // Check Employee Exists
    const [employee] = await connection.query(
      "SELECT id FROM employees WHERE id = ?",
      [taskData.employee_id],
    );

    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Employee not found.",
        data: {},
      };
    }
    let attachment = task[0].attachment;

    // New Attachment Uploaded
    if (file) {
      // Delete Old File
      if (attachment) {
        await deleteFileFromGithub(attachment);
      }

      // Upload New File
      const upload = await uploadFileToGithub({
        file,
        folder: "tasks",
        subfolder: String(taskData.employee_id),
        customFileName: `Task_${Date.now()}`,
        commitMessage: "Update Task Attachment",
      });

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

    // Update Task
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

    return {
      success: true,
      response_code: 200,
      message: "Task updated successfully.",
      data: {},
    };
  } catch (error) {
    logger.error(`Task Service => updateTask : ${error.message}`);

    return {
      success: false,
      response_code: 500,
      message: "Something went wrong.",
      data: {},
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const updateTaskStatus = async (taskId, status) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Check Task Exists
    const [task] = await connection.query(`SELECT id FROM tasks WHERE id = ?`, [
      taskId,
    ]);

    if (task.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Task not found.",
        data: {},
      };
    }

    // Validate Status
    const validStatus = ["Pending", "In Progress", "Completed"];

    if (!validStatus.includes(status)) {
      return {
        success: false,
        response_code: 400,
        message: "Invalid task status.",
        data: {},
      };
    }

    // Update Status
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

    return {
      success: true,
      response_code: 200,
      message: "Task status updated successfully.",
      data: {},
    };
  } catch (error) {
    logger.error(`Task Service => updateTaskStatus : ${error.message}`);

    return {
      success: false,
      response_code: 500,
      message: "Something went wrong.",
      data: {},
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const deleteTask = async (taskId) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Check Task Exists
    const [task] = await connection.query(
      `SELECT id, attachment FROM tasks WHERE id = ?`,
      [taskId],
    );

    if (task.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Task not found.",
        data: {},
      };
    }

    // Delete Attachment From GitHub
    if (task[0].attachment) {
      const deleteFile = await deleteFileFromGithub(task[0].attachment);

      if (!deleteFile.success) {
        logger.error(deleteFile.error);
      }
    }

    await connection.query(
      `
      DELETE FROM notifications
      WHERE task_id = ?
      `,
      [taskId],
    );

    // Delete Task
    await connection.query(`DELETE FROM tasks WHERE id = ?`, [taskId]);

    return {
      success: true,
      response_code: 200,
      message: "Task deleted successfully.",
      data: {},
    };
  } catch (error) {
    logger.error(`Task Service => deleteTask : ${error.message}`);

    return {
      success: false,
      response_code: 500,
      message: "Something went wrong.",
      data: {},
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};



const getTaskAttachmentById = async ({ id }) => {
  if (!id) {
    return {
      success: false,
      status: 400,
      error: "Task ID is required",
    };
  }

  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      `SELECT attachment
       FROM tasks
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (!rows.length || !rows[0].attachment) {
      return {
        success: false,
        status: 404,
        error: "Attachment not found",
      };
    }

    const serverUrl = getServerRawUrl(rows[0].attachment);

    return await fetchServerFileStream(serverUrl);

  } catch (error) {
    console.error(error);

    return {
      success: false,
      status: 500,
      error: "Internal Server Error",
    };
  } finally {
    if (connection) connection.release();
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
