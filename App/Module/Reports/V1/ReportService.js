const pool = require("../../../Config/db.poolingConnection");
const logger = require("../../../Config/logger.config");
const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");

const taskReport = async (filters) => {
  let connection;

  try {
    connection = await pool.getConnection();

    let query = `
      SELECT
        t.id,
        CONCAT(e.first_name,' ',e.last_name) AS employee_name,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.start_date,
        t.due_date
      FROM tasks t
      INNER JOIN employees e
      ON t.employee_id = e.id
      WHERE 1 = 1
    `;

    const values = [];

    // Status Filter
    if (
      filters.status &&
      filters.status !== "all"
    ) {
      query += ` AND t.status = ?`;
      values.push(filters.status);
    }

    // Employee Filter
    if (filters.employee_id) {
      query += ` AND t.employee_id = ?`;
      values.push(filters.employee_id);
    }

    query += ` ORDER BY t.id DESC`;

    const [tasks] = await connection.query(query, values);

    return {
      success: true,
      response_code: 200,
      message: "Report fetched successfully.",
      data: tasks,
    };
  } catch (error) {
    logger.error(`Report Service => ${error.message}`);

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



const exportExcel = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const [tasks] = await connection.query(`
      SELECT
        t.id,
        CONCAT(e.first_name,' ',e.last_name) AS employee_name,
        t.title,
        t.priority,
        t.status,
        t.start_date,
        t.due_date
      FROM tasks t
      INNER JOIN employees e
      ON t.employee_id = e.id
    `);

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Task Report");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Employee", key: "employee_name", width: 25 },
      { header: "Title", key: "title", width: 25 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Start Date", key: "start_date", width: 20 },
      { header: "Due Date", key: "due_date", width: 20 },
    ];

    worksheet.addRows(tasks);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Task_Report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong."
    });

  } finally {

    if (connection) connection.release();

  }
};


const exportCSV = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const [tasks] = await connection.query(`
      SELECT
        t.id,
        CONCAT(e.first_name,' ',e.last_name) AS employee_name,
        t.title,
        t.priority,
        t.status,
        t.start_date,
        t.due_date
      FROM tasks t
      INNER JOIN employees e
      ON t.employee_id = e.id
    `);

    const parser = new Parser();

    const csv = parser.parse(tasks);

    res.header("Content-Type", "text/csv");

    res.attachment("Task_Report.csv");

    return res.send(csv);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong."
    });

  } finally {

    if (connection) {
      connection.release();
    }

  }
};

module.exports = {
  taskReport,
  exportExcel,
  exportCSV,
};