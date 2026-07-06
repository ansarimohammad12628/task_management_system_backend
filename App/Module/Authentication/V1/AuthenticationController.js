const logger = require("../../../Config/logger.config");
const bcrypt = require("bcrypt");
const AuthenticationService = require("./AuthenticationService");
const AuthenticationValidation = require("./AuthenticationValidation");

///////////////////////////////////////////////////////////////////////////////////////
// Register Controller
// Purpose : Validate request, hash password and register user.
///////////////////////////////////////////////////////////////////////////////////////

register = async (req, res, next) => {
  logger.info("Authentication Controller => register");

  // Validate Request Body
  let validateData =
    AuthenticationValidation.registerValidation.validate(req.body);

  // Return Validation Error
  if (validateData.error) {
    return res.status(422).json({
      status: 0,
      message: validateData.error.details[0].message,
    });
  }

  try {
    // Get Request Data
    let { full_name, email, password, role } = req.body;

    // Encrypt Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Call Register Service
    const data = await AuthenticationService.register({
      full_name,
      email,
      password: hashedPassword,
      role,
    });

    // Send Response
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

///////////////////////////////////////////////////////////////////////////////////////
// Login Controller
// Purpose : Validate request and authenticate user.
///////////////////////////////////////////////////////////////////////////////////////

login = async (req, res, next) => {
  logger.info("Authentication Controller => login");

  // Validate Request Body
  let validateData =
    AuthenticationValidation.loginValidation.validate(req.body);

  // Return Validation Error
  if (validateData.error) {
    return res.status(422).json({
      status: 0,
      message: validateData.error.details[0].message,
    });
  }

  try {
    // Get Login Credentials
    const { email, password } = req.body;

    // Call Login Service
    const data = await AuthenticationService.login({
      email,
      password,
    });

    // Send Response
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// Export Controllers

module.exports = {
  register,
  login,
};