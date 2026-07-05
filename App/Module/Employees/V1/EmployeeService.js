const pool = require("../../../Config/db.poolingConnection");

const getAllEmployees = async () => {
  let connection;

  try {
    connection = await pool.getConnection();

    const query = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            phone,
            department,
            designation,
            salary,
            joining_date,
            status,
            created_at,
            updated_at
        FROM employees
        WHERE status = 1
        ORDER BY id DESC
    `;

    const [employees] = await connection.query(query);

    return {
      success: true,
      response_code: 200,
      message: "Employees fetched successfully.",
      data: employees,
    };
  } catch (error) {
    console.log("Employee Service Error :", error);

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

const getEmployeeById = async (employeeId) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const query = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            phone,
            department,
            designation,
            salary,
            joining_date,
            status,
            created_at,
            updated_at
        FROM employees
        WHERE id = ?
        LIMIT 1
    `;

    const [employee] = await connection.query(query, [employeeId]);

    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Employee not found.",
        data: {},
      };
    }

    return {
      success: true,
      response_code: 200,
      message: "Employee fetched successfully.",
      data: employee[0],
    };
  } catch (error) {
    logger.error(`Employee Service => getEmployeeById : ${error.message}`);

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

const addEmployee = async (employeeData) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Email Exists Check
    const checkEmailQuery = `
        SELECT id
        FROM employees
        WHERE email = ?
    `;

    const [emailExists] = await connection.query(checkEmailQuery, [
      employeeData.email,
    ]);

    if (emailExists.length > 0) {
      return {
        success: false,
        response_code: 409,
        message: "Email already exists.",
        data: {},
      };
    }

    // Insert Employee
    const insertQuery = `
        INSERT INTO employees
        (
            first_name,
            last_name,
            email,
            phone,
            department,
            designation,
            salary,
            joining_date,
            status,
            created_by,
            updated_by
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `;

    const values = [
      employeeData.first_name,
      employeeData.last_name,
      employeeData.email,
      employeeData.phone,
      employeeData.department,
      employeeData.designation,
      employeeData.salary,
      employeeData.joining_date,
      1,
      1,
      1,
    ];

    const [result] = await connection.query(insertQuery, values);

    return {
      success: true,
      response_code: 201,
      message: "Employee created successfully.",
      data: {
        employee_id: result.insertId,
      },
    };
  } catch (error) {
    logger.error(`Employee Service => createEmployee : ${error.message}`);

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

const updateEmployee = async (employeeId, employeeData) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Employee Exists Check
    const checkEmployeeQuery = `
      SELECT id
      FROM employees
      WHERE id = ?
    `;

    const [employee] = await connection.query(checkEmployeeQuery, [employeeId]);

    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Employee not found.",
        data: {},
      };
    }

    // Duplicate Email Check
    const checkEmailQuery = `
      SELECT id
      FROM employees
      WHERE email = ?
      AND id <> ?
    `;

    const [email] = await connection.query(checkEmailQuery, [
      employeeData.email,
      employeeId,
    ]);

    if (email.length > 0) {
      return {
        success: false,
        response_code: 409,
        message: "Email already exists.",
        data: {},
      };
    }

    // Update Query
    const updateQuery = `
      UPDATE employees
      SET
        first_name = ?,
        last_name = ?,
        email = ?,
        phone = ?,
        department = ?,
        designation = ?,
        salary = ?,
        joining_date = ?,
        updated_by = ?
      WHERE id = ?
    `;

    const values = [
      employeeData.first_name,
      employeeData.last_name,
      employeeData.email,
      employeeData.phone,
      employeeData.department,
      employeeData.designation,
      employeeData.salary,
      employeeData.joining_date,
      1,
      employeeId,
    ];

    await connection.query(updateQuery, values);

    return {
      success: true,
      response_code: 200,
      message: "Employee updated successfully.",
      data: {},
    };
  } catch (error) {
    logger.error(`Employee Service => updateEmployee : ${error.message}`);

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

const updateEmployeeStatus = async (employeeId, status) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Employee Exists Check
    const [employee] = await connection.query(
      `SELECT id FROM employees WHERE id = ?`,
      [employeeId],
    );

    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Employee not found.",
        data: {},
      };
    }

    // Status Validation
    if (status != 0 && status != 1) {
      return {
        success: false,
        response_code: 400,
        message: "Status must be 0 or 1.",
        data: {},
      };
    }

    // Update Status
    await connection.query(
      `UPDATE employees SET status = ?, updated_by = ? WHERE id = ?`,
      [status, 1, employeeId],
    );

    return {
      success: true,
      response_code: 200,
      message: "Employee status updated successfully.",
      data: {},
    };
  } catch (error) {
    logger.error(`Employee Service => updateEmployeeStatus : ${error.message}`);

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

const deleteEmployee = async (employeeId) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Check Employee Exists
    const [employee] = await connection.query(
      `SELECT id FROM employees WHERE id = ?`,
      [employeeId],
    );

    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: "Employee not found.",
        data: {},
      };
    }

    // Delete Employee
    await connection.query(`DELETE FROM employees WHERE id = ?`, [employeeId]);

    return {
      success: true,
      response_code: 200,
      message: "Employee deleted successfully.",
      data: {},
    };
  } catch (error) {
    logger.error(`Employee Service => deleteEmployee : ${error.message}`);

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
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
};
