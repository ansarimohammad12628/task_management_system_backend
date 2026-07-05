const Joi = require("joi");

// =============================
// Create Employee Validation
// =============================
const  addEmployeeValidation = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "First Name is required.",
      "string.min": "First Name must be at least 2 characters.",
      "string.max": "First Name must not exceed 100 characters.",
      "any.required": "First Name is required.",
    }),

    last_name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Last Name is required.",
      "string.min": "Last Name must be at least 2 characters.",
      "string.max": "Last Name must not exceed 100 characters.",
      "any.required": "Last Name is required.",
    }),

    email: Joi.string().trim().email().required().messages({
      "string.empty": "Email is required.",
      "string.email": "Please enter a valid email address.",
      "any.required": "Email is required.",
    }),

    phone: Joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.empty": "Phone Number is required.",
        "string.pattern.base": "Phone Number must be 10 digits.",
        "any.required": "Phone Number is required.",
      }),

    department: Joi.string().trim().max(100).required().messages({
      "string.empty": "Department is required.",
      "string.max": "Department must not exceed 100 characters.",
      "any.required": "Department is required.",
    }),

    designation: Joi.string().trim().max(100).required().messages({
      "string.empty": "Designation is required.",
      "string.max": "Designation must not exceed 100 characters.",
      "any.required": "Designation is required.",
    }),

    salary: Joi.number().positive().precision(2).required().messages({
      "number.base": "Salary must be a valid number.",
      "number.positive": "Salary must be greater than zero.",
      "any.required": "Salary is required.",
    }),

    joining_date: Joi.date().required().messages({
      "date.base": "Joining Date is invalid.",
      "any.required": "Joining Date is required.",
    }),
  });

  return schema.validate(data);
};

// =============================
// Update Employee Validation
// =============================
const updateEmployeeValidation = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().trim().min(2).max(100).required(),

    last_name: Joi.string().trim().min(2).max(100).required(),

    email: Joi.string().trim().email().required(),

    phone: Joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/)
      .required(),

    department: Joi.string().trim().max(100).required(),

    designation: Joi.string().trim().max(100).required(),

    salary: Joi.number().positive().precision(2).required(),

    joining_date: Joi.date().required(),
  });

  return schema.validate(data);
};

// =============================
// Employee ID Validation
// =============================
const employeeIdValidation = (data) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Employee ID must be a number.",
      "number.integer": "Employee ID must be an integer.",
      "number.positive": "Employee ID must be greater than zero.",
      "any.required": "Employee ID is required.",
    }),
  });

  return schema.validate(data);
};

module.exports = {
   addEmployeeValidation,
  updateEmployeeValidation,
  employeeIdValidation,
};