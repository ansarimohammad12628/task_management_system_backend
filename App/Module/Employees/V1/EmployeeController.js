const logger = require("../../../Config/logger.config");
const EmployeeService = require("./EmployeeService");
const EmployeeValidation = require("./EmployeeValidation");

getAllEmployees = async (req, res) => {
  logger.info("Employee Controller => getAllEmployees");

  try {
    const response = await EmployeeService.getAllEmployees();

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(error.message);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: [],
    });
  }
};

getEmployeeById = async (req, res) => {
  logger.info("Employee Controller => getEmployeeById");

  try {
    const response = await EmployeeService.getEmployeeById(req.params.id);

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Employee Controller => getEmployeeById : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

addEmployee = async (req, res) => {
  logger.info("Employee Controller =>  addEmployee");

  try {
    const { error } = EmployeeValidation.addEmployeeValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        response_code: 400,
        message: error.details[0].message,
        data: {},
      });
    }

    const response = await EmployeeService.addEmployee(req.body);

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Employee Controller =>  addEmployee : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

updateEmployee = async (req, res) => {
  logger.info("Employee Controller => updateEmployee");

  try {
    const { error } = EmployeeValidation.updateEmployeeValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        response_code: 400,
        message: error.details[0].message,
        data: {},
      });
    }

    const response = await EmployeeService.updateEmployee(
      req.params.id,
      req.body,
    );

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Employee Controller => updateEmployee : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

updateEmployeeStatus = async (req, res) => {
  logger.info("Employee Controller => updateEmployeeStatus");

  try {
    const response = await EmployeeService.updateEmployeeStatus(
      req.params.id,
      req.body.status,
    );

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(
      `Employee Controller => updateEmployeeStatus : ${error.message}`,
    );

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

deleteEmployee = async (req, res) => {
  logger.info("Employee Controller => deleteEmployee");

  try {
    const response = await EmployeeService.deleteEmployee(req.params.id);

    return res.status(response.response_code).json(response);
  } catch (error) {
    logger.error(`Employee Controller => deleteEmployee : ${error.message}`);

    return res.status(500).json({
      success: false,
      response_code: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee
};
