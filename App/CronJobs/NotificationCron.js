const cron = require("node-cron");
const pool = require("../Config/db.poolingConnection");
const logger = require("../Config/logger.config");

// Every Minute (Testing)
cron.schedule("* * * * *", async () => {
  let connection;

  try {
    connection = await pool.getConnection();

    const query = `
      SELECT
        t.id,
        t.employee_id,
        t.title,
        CONCAT(e.first_name,' ',e.last_name) AS employee_name
      FROM tasks t
      INNER JOIN employees e
      ON t.employee_id = e.id
      WHERE DATE(t.due_date) = DATE(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
    `;

    const [tasks] = await connection.query(query);

    for (const task of tasks) {

      // Check duplicate notification
      const [notification] = await connection.query(
        `
        SELECT id
        FROM notifications
        WHERE task_id = ?
        AND title = ?
        `,
        [task.id, "Task Due Tomorrow"]
      );

      if (notification.length === 0) {

        await connection.query(
          `
          INSERT INTO notifications
          (
            task_id,
            employee_id,
            title,
            message
          )
          VALUES (?,?,?,?)
          `,
          [
            task.id,
            task.employee_id,
            "Task Due Tomorrow",
            `Task "${task.title}" assigned to ${task.employee_name} is due tomorrow.`
          ]
        );

        logger.info(
          `Notification Created For Task ID : ${task.id}`
        );

      }

    }

  } catch (error) {

    logger.error(`Cron Job Error : ${error.message}`);

  } finally {

    if (connection) {
      connection.release();
    }

  }

});