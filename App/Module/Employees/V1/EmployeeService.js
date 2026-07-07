const logger = require("../../../Config/logger.config");
const pool = require("../../../Config/db.poolingConnection");
const RESPONSE = require("../../../Utils/ResponseMessagesColllection");
const utils = require("../../../Utils/Utils");

/////////////////////////////////////////////////////////////////////////////////////////
// Get All Employees Service
// Purpose : Fetch All Active Employees
/////////////////////////////////////////////////////////////////////////////////////////

const getAllEmployees = async () => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Fetch All Active Employees
    /////////////////////////////////////////////////////////////////////////////

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
        ORDER BY id DESC
    `;

    const [employees] = await connection.query(query);

    const formattedEmployees = employees.map((employee) => ({
      ...employee,
      created_at: employee.created_at
        ? utils.commonFormateDate(employee.created_at)
        : null,
      updated_at: employee.updated_at
        ? utils.commonFormateDate(employee.updated_at)
        : null,
      from_date: employee.created_at
        ? utils.fromDate(employee.created_at)
        : null,
    }));

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.SUCCESS,
      data: formattedEmployees,
    };
  } catch (error) {
    // Log Error
    logger.error(`Employee Service => getAllEmployees : ${error.message}`);

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

    if (connection) connection.release();
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Get Employee By Id Service
// Purpose : Fetch Employee Details By Employee Id
/////////////////////////////////////////////////////////////////////////////////////////

const getEmployeeById = async (employeeId) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Fetch Employee Details
    /////////////////////////////////////////////////////////////////////////////

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

    const formattedEmployee = {
      ...employee[0],
      created_at: employee[0].created_at
        ? utils.commonFormateDate(employee[0].created_at)
        : null,
      updated_at: employee[0].updated_at
        ? utils.commonFormateDate(employee[0].updated_at)
        : null,
      from_date: employee[0].created_at
        ? utils.fromDate(employee[0].created_at)
        : null,
    };

    /////////////////////////////////////////////////////////////////////////////
    // Check Employee Exists
    /////////////////////////////////////////////////////////////////////////////

    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: RESPONSE.EMPLOYEE_NOT_FOUND,
        data:formattedEmployee,
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.SUCCESS,
      data: employee[0],
    };
  } catch (error) {
    // Log Error
    logger.error(`Employee Service => getEmployeeById : ${error.message}`);

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
// Add Employee Service
// Purpose : Create New Employee
/////////////////////////////////////////////////////////////////////////////////////////

const addEmployee = async (employeeData) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Check Email Already Exists
    /////////////////////////////////////////////////////////////////////////////

    const checkEmailQuery = `
        SELECT id
        FROM employees
        WHERE email = ?
    `;

    const [emailExists] = await connection.query(checkEmailQuery, [
      employeeData.email,
    ]);

    // Return If Email Already Exists
    if (emailExists.length > 0) {
      return {
        success: false,
        response_code: 409,
        message: RESPONSE.EMAIL_ALREADY_EXISTS,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Insert Employee
    /////////////////////////////////////////////////////////////////////////////

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
    

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 201,
      message: RESPONSE.EMPLOYEE_CREATED_SUCCESSFULLY,
      data: {
        employee_id: result.insertId,
      },
    };
  } catch (error) {
    // Log Error
    logger.error(`Employee Service => createEmployee : ${error.message}`);

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
// Update Employee Service
// Purpose : Update Employee Details
/////////////////////////////////////////////////////////////////////////////////////////

const updateEmployee = async (employeeId, employeeData) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Check Employee Exists
    /////////////////////////////////////////////////////////////////////////////

    const checkEmployeeQuery = `
      SELECT id
      FROM employees
      WHERE id = ?
    `;

    const [employee] = await connection.query(checkEmployeeQuery, [employeeId]);

    // Return If Employee Not Found
    if (employee.length === 0) {
      return {
        success: false,
        response_code: 404,
        message: RESPONSE.EMPLOYEE_NOT_FOUND,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Check Duplicate Email
    /////////////////////////////////////////////////////////////////////////////

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

    // Return If Email Already Exists
    if (email.length > 0) {
      return {
        success: false,
        response_code: 409,
        message: RESPONSE.EMAIL_ALREADY_EXISTS,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Update Employee Details
    /////////////////////////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.EMPLOYEE_UPDATED_SUCCESSFULLY,
      data: {},
    };
  } catch (error) {
    // Log Error
    logger.error(`Employee Service => updateEmployee : ${error.message}`);

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
// Update Employee Status Service
// Purpose : Update Employee Active / Inactive Status
/////////////////////////////////////////////////////////////////////////////////////////

const updateEmployeeStatus = async (employeeId, status) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Check Employee Exists
    /////////////////////////////////////////////////////////////////////////////

    const [employee] = await connection.query(
      `SELECT id FROM employees WHERE id = ?`,
      [employeeId],
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

    /////////////////////////////////////////////////////////////////////////////
    // Validate Status
    /////////////////////////////////////////////////////////////////////////////

    if (status != 0 && status != 1) {
      return {
        success: false,
        response_code: 400,
        message: RESPONSE.INVALID_REQUEST,
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Update Employee Status
    /////////////////////////////////////////////////////////////////////////////

    await connection.query(
      `UPDATE employees SET status = ?, updated_by = ? WHERE id = ?`,
      [status, 1, employeeId],
    );

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.EMPLOYEE_UPDATED_SUCCESSFULLY,
      data: {},
    };
  } catch (error) {
    // Log Error
    logger.error(`Employee Service => updateEmployeeStatus : ${error.message}`);

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
// Delete Employee Service
// Purpose : Delete Employee By Id
/////////////////////////////////////////////////////////////////////////////////////////

// const deleteEmployee = async (employeeId) => {
//   let connection;

//   try {
//     // Get Database Connection
//     connection = await pool.getConnection();

//     /////////////////////////////////////////////////////////////////////////////
//     // Check Employee Exists
//     /////////////////////////////////////////////////////////////////////////////

//     const [employee] = await connection.query(
//       `SELECT id FROM employees WHERE id = ?`,
//       [employeeId],
//     );

//     // Return If Employee Not Found
//     if (employee.length === 0) {
//       return {
//         success: false,
//         response_code: 404,
//         message: RESPONSE.EMPLOYEE_NOT_FOUND,
//         data: {},
//       };
//     }

//     /////////////////////////////////////////////////////////////////////////////
//     // Delete Employee
//     /////////////////////////////////////////////////////////////////////////////

//     await connection.query(`DELETE FROM employees WHERE id = ?`, [employeeId]);

//     /////////////////////////////////////////////////////////////////////////////
//     // Success Response
//     /////////////////////////////////////////////////////////////////////////////

//     return {
//       success: true,
//       response_code: 200,
//       message: RESPONSE.EMPLOYEE_DELETED_SUCCESSFULLY,
//       data: {},
//     };
//   } catch (error) {
//     // Log Error
//     logger.error(`Employee Service => deleteEmployee : ${error.message}`);

//     /////////////////////////////////////////////////////////////////////////////
//     // Error Response
//     /////////////////////////////////////////////////////////////////////////////

//     return {
//       success: false,
//       response_code: 500,
//       message: RESPONSE.SOMETHING_WENT_WRONG,
//       data: {},
//     };
//   } finally {
//     /////////////////////////////////////////////////////////////////////////////
//     // Release Database Connection
//     /////////////////////////////////////////////////////////////////////////////

//     if (connection) {
//       connection.release();
//     }
//   }
// };

const deleteEmployee = async (employeeId) => {
  let connection;

  try {
    // Get Database Connection
    connection = await pool.getConnection();

    /////////////////////////////////////////////////////////////////////////////
    // Check Employee Exists
    /////////////////////////////////////////////////////////////////////////////

    const [employee] = await connection.query(
      `SELECT id FROM employees WHERE id = ?`,
      [employeeId]
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

    /////////////////////////////////////////////////////////////////////////////
    // Check Employee Has Assigned Tasks
    /////////////////////////////////////////////////////////////////////////////

    const [assignedTasks] = await connection.query(
      `SELECT id FROM tasks WHERE employee_id = ? LIMIT 1`,
      [employeeId]
    );

    if (assignedTasks.length > 0) {
      return {
        success: false,
        response_code: 400,
        message:
          "This employee cannot be deleted because one or more tasks are assigned to this employee. Please reassign or delete the tasks first.",
        data: {},
      };
    }

    /////////////////////////////////////////////////////////////////////////////
    // Delete Employee
    /////////////////////////////////////////////////////////////////////////////

    await connection.query(
      `DELETE FROM employees WHERE id = ?`,
      [employeeId]
    );

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    return {
      success: true,
      response_code: 200,
      message: RESPONSE.EMPLOYEE_DELETED_SUCCESSFULLY,
      data: {},
    };
  } catch (error) {
    // Log Error
    logger.error(`Employee Service => deleteEmployee : ${error.message}`);

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

// Export Controllers
module.exports = {
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
};
