const Joi = require("joi");

// ==============================
// Add Task Validation
// ==============================
const addTaskValidation = (data) => {
  const schema = Joi.object({
    employee_id: Joi.number().integer().positive().required().messages({
      "number.base": "Employee is required.",
      "number.integer": "Employee ID must be an integer.",
      "number.positive": "Employee ID must be greater than 0.",
      "any.required": "Employee is required.",
    }),

    title: Joi.string().trim().min(3).max(255).required().messages({
      "string.empty": "Title is required.",
      "string.min": "Title must be at least 3 characters.",
      "string.max": "Title must not exceed 255 characters.",
      "any.required": "Title is required.",
    }),

    description: Joi.string().trim().allow("").max(1000).messages({
      "string.max": "Description must not exceed 1000 characters.",
    }),

    priority: Joi.string()
      .valid("Low", "Medium", "High")
      .required()
      .messages({
        "any.only": "Priority must be Low, Medium or High.",
        "any.required": "Priority is required.",
      }),

    status: Joi.string()
      .valid("Pending", "In Progress", "Completed")
      .required()
      .messages({
        "any.only":
          "Status must be Pending, In Progress or Completed.",
        "any.required": "Status is required.",
      }),

    start_date: Joi.date().required().messages({
      "date.base": "Start Date is invalid.",
      "any.required": "Start Date is required.",
    }),

    due_date: Joi.date()
      .min(Joi.ref("start_date"))
      .required()
      .messages({
        "date.base": "Due Date is invalid.",
        "date.min": "Due Date cannot be earlier than Start Date.",
        "any.required": "Due Date is required.",
      }),
  });

  return schema.validate(data);
};

// ==============================
// Update Task Validation
// ==============================
const updateTaskValidation = (data) => {
  const schema = Joi.object({
    employee_id: Joi.number().integer().positive().required(),

    title: Joi.string().trim().min(3).max(255).required(),

    description: Joi.string().trim().allow("").max(1000),

    priority: Joi.string()
      .valid("Low", "Medium", "High")
      .required(),

    status: Joi.string()
      .valid("Pending", "In Progress", "Completed")
      .required(),

    start_date: Joi.date().required(),

    due_date: Joi.date()
      .min(Joi.ref("start_date"))
      .required(),
  });

  return schema.validate(data);
};

// ==============================
// Task ID Validation
// ==============================
const taskIdValidation = (data) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Task ID must be a number.",
      "number.integer": "Task ID must be an integer.",
      "number.positive": "Task ID must be greater than 0.",
      "any.required": "Task ID is required.",
    }),
  });

  return schema.validate(data);
};

module.exports = {
  addTaskValidation,
  updateTaskValidation,
  taskIdValidation,
};