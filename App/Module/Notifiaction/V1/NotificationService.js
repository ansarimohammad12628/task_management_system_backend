const pool = require("../../../Config/db.poolingConnection");
const logger = require("../../../Config/logger.config");

const getAllNotifications = async (employeeId) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const query = `
     SELECT
    id,
    task_id,
    employee_id,
    title,
    message,
    is_read,
    created_at
    FROM notifications
    WHERE employee_id = ?
    ORDER BY id DESC
    `;

    const [notifications] = await connection.query(query, [employeeId]);

    return {
      success: true,
      response_code: 200,
      message: "Notifications fetched successfully.",
      data: notifications,
    };
  } catch (error) {
    logger.error(error.message);

    return {
      success: false,
      response_code: 500,
      message: "Something went wrong.",
      data: [],
    };
  } finally {
    if (connection) connection.release();
  }
};

const readNotification = async (id) => {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?
      `,
      [id],
    );

    return {
      success: true,
      response_code: 200,
      message: "Notification marked as read.",
      data: {},
    };
  } catch (error) {
    logger.error(error.message);

    return {
      success: false,
      response_code: 500,
      message: "Something went wrong.",
      data: {},
    };
  } finally {
    if (connection) connection.release();
  }
};

const deleteNotification = async (id) => {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.query(
      `
      DELETE FROM notifications
      WHERE id = ?
      `,
      [id],
    );

    return {
      success: true,
      response_code: 200,
      message: "Notification deleted successfully.",
      data: {},
    };
  } catch (error) {
    logger.error(error.message);

    return {
      success: false,
      response_code: 500,
      message: "Something went wrong.",
      data: {},
    };
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getAllNotifications,
  readNotification,
  deleteNotification,
};
