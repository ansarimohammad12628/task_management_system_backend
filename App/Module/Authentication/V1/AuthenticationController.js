const logger = require("../../../Config/logger.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const AuthenticationService = require("./AuthenticationService");
const AuthenticationValidation = require("./AuthenticationValidation");
const pool = require("../../../Config/db.poolingConnection");

// Register
register = async (req, res, next) => {
  logger.info("Authentication Controller => register");

  let validateData =
    AuthenticationValidation.registerValidation.validate(req.body);

  if (validateData.error) {
    return res.status(422).json({
      status: 0,
      message: validateData.error.details[0].message,
    });
  }

  try {
    let { full_name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await AuthenticationService.register({
      full_name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// Login
login = async (req, res, next) => {
  logger.info("Authentication Controller => login");

  let validateData =
    AuthenticationValidation.loginValidation.validate(req.body);

  if (validateData.error) {
    return res.status(422).json({
      status: 0,
      message: validateData.error.details[0].message,
    });
  }

  try {
    const { email, password } = req.body;

    const data = await AuthenticationService.login({
      email,
      password,
    });

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  register,
  login,
};