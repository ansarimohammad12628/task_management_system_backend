const express = require("express");
const router = express.Router();
const EmployeeController = require("./EmployeeController");
const CommonValidator = require("../../../Validator/CommonValidator");

// Get All Employees
router.get(
  "/getAllEmployees",
  CommonValidator.validateJWTToken,
  EmployeeController.getAllEmployees
);

// Get Employee By Id
router.get(
  "/getEmployeesById/:id",
  CommonValidator.validateJWTToken,
  EmployeeController.getEmployeeById
);

// Add Employee
router.post(
  "/addEmployee",
  CommonValidator.validateJWTToken,
  EmployeeController.addEmployee
);

// Update Employee
router.put(
  "/updateEmployee/:id",
  CommonValidator.validateJWTToken,
  EmployeeController.updateEmployee
);

// Update Employee Status
router.put(
  "/updateEmployeeStatus/:id",
  CommonValidator.validateJWTToken,
  EmployeeController.updateEmployeeStatus
);

// Delete Employee
router.delete(
  "/deleteEmployee/:id",
  CommonValidator.validateJWTToken,
  EmployeeController.deleteEmployee
);

module.exports = router;