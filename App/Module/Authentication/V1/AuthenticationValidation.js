const Joi = require("joi");

const registerValidation = Joi.object({
  full_name: Joi.string().min(3).max(100).required(),

  email: Joi.string().email().required(),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase and number.",
    }),

  confirm_password: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Confirm Password does not match.",
    }),

  role: Joi.string().valid("Admin", "Employee").required(),
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
   remember_me: Joi.boolean().optional(),
});

module.exports = {
  registerValidation,
  loginValidation,
};