const logger = require("../../../Config/logger.config");
const EmployeeService = require("./EmployeeService");
const EmployeeValidation = require("./EmployeeValidation");
const RESPONSE = require("../../../Utils/ResponseMessagesColllection");

/////////////////////////////////////////////////////////////////////////////////////////
// Get All Employees Controller
// Purpose : Fetch All Employees
/////////////////////////////////////////////////////////////////////////////////////////

getAllEmployees = async (req, res) => {
  logger.info("Employee Controller => getAllEmployees");

  try {
    // Call Service
    const response = await EmployeeService.getAllEmployees();

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(error.message);

    // Internal Server Error
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: [],
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Get Employee By Id Controller
// Purpose : Fetch Employee Details
/////////////////////////////////////////////////////////////////////////////////////////

getEmployeeById = async (req, res) => {
  logger.info("Employee Controller => getEmployeeById");

  try {
    // Call Service
    const response = await EmployeeService.getEmployeeById(req.params.id);

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Employee Controller => getEmployeeById : ${error.message}`);

    // Internal Server Error
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Add Employee Controller
// Purpose : Create New Employee
/////////////////////////////////////////////////////////////////////////////////////////

addEmployee = async (req, res) => {
  logger.info("Employee Controller => addEmployee");

  try {
    // Validate Request
    const { error } = EmployeeValidation.addEmployeeValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        response_code: 400,
        message: error.details[0].message,
        data: {},
      });
    }

    // Call Service
    const response = await EmployeeService.addEmployee(req.body);

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Employee Controller => addEmployee : ${error.message}`);

    // Internal Server Error
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Update Employee Controller
// Purpose : Update Employee Details
/////////////////////////////////////////////////////////////////////////////////////////

updateEmployee = async (req, res) => {
  logger.info("Employee Controller => updateEmployee");

  try {
    // Validate Request
    const { error } = EmployeeValidation.updateEmployeeValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        response_code: 400,
        message: error.details[0].message,
        data: {},
      });
    }

    // Call Service
    const response = await EmployeeService.updateEmployee(
      req.params.id,
      req.body,
    );

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Employee Controller => updateEmployee : ${error.message}`);

    // Internal Server Error
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Update Employee Status Controller
// Purpose : Change Employee Status
/////////////////////////////////////////////////////////////////////////////////////////

updateEmployeeStatus = async (req, res) => {
  logger.info("Employee Controller => updateEmployeeStatus");

  try {
    // Call Service
    const response = await EmployeeService.updateEmployeeStatus(
      req.params.id,
      req.body.status,
    );

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(
      `Employee Controller => updateEmployeeStatus : ${error.message}`,
    );

    // Internal Server Error
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
// Delete Employee Controller
// Purpose : Delete Employee
/////////////////////////////////////////////////////////////////////////////////////////

deleteEmployee = async (req, res) => {
  logger.info("Employee Controller => deleteEmployee");

  try {
    // Call Service
    const response = await EmployeeService.deleteEmployee(req.params.id);

    // Return Response
    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Employee Controller => deleteEmployee : ${error.message}`);

    // Internal Server Error
    return res.status(500).json({
      success: false,
      response_code: 500,
      message: RESPONSE.SOMETHING_WENT_WRONG,
      data: {},
    });
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