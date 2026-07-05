const logger = require("../../../Config/logger.config");
const pool = require("../../../Config/db.poolingConnection");

const getDashboard = async () => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Total Employees
    const [employees] = await connection.query(`
      SELECT COUNT(*) AS totalEmployees
      FROM employees
    `);

    // Total Tasks
    const [tasks] = await connection.query(`
      SELECT COUNT(*) AS totalTasks
      FROM tasks
    `);

    // Pending Tasks
    const [pending] = await connection.query(`
      SELECT COUNT(*) AS pendingTasks
      FROM tasks
      WHERE status='Pending'
    `);

    // In Progress Tasks
    const [progress] = await connection.query(`
      SELECT COUNT(*) AS inProgressTasks
      FROM tasks
      WHERE status='In Progress'
    `);

    // Completed Tasks
    const [completed] = await connection.query(`
      SELECT COUNT(*) AS completedTasks
      FROM tasks
      WHERE status='Completed'
    `);

    // Recent Tasks
    const [recentTasks] = await connection.query(`
      SELECT
          t.id,
          t.title,
          t.priority,
          t.status,
          CONCAT(e.first_name,' ',e.last_name) AS employee_name
      FROM tasks t
      INNER JOIN employees e
      ON t.employee_id = e.id
      ORDER BY t.id DESC
      LIMIT 5
    `);

    return {
      success: true,
      response_code: 200,
      message: "Dashboard fetched successfully.",
      data: {
        totalEmployees: employees[0].totalEmployees,
        totalTasks: tasks[0].totalTasks,
        pendingTasks: pending[0].pendingTasks,
        inProgressTasks: progress[0].inProgressTasks,
        completedTasks: completed[0].completedTasks,
        recentTasks,
      },
    };
  } catch (error) {
    logger.error(`Dashboard Service => ${error.message}`);

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

module.exports = {
  getDashboard,
};