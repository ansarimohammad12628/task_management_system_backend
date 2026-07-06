// Import Database Connection Pool
const pool = require("../../../Config/db.poolingConnection");

// Import Required Packages
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Import Response Messages
const RESPONSE = require("../../../Utils/ResponseMessagesColllection");

/////////////////////////////////////////////////////////////////////////////////////////
// Register Service
// Purpose : Register New User
/////////////////////////////////////////////////////////////////////////////////////////

const register = async ({ full_name, email, password, role }) => {
  // Default Response Object
  let result = {
    status: 0,
    message: "",
    data: "",
  };

  // Get Database Connection
  const conn = await pool.getConnection();

  try {
    /////////////////////////////////////////////////////////////////////////////
    // Check Email Already Exists
    /////////////////////////////////////////////////////////////////////////////

    let [checkEmail] = await conn.query(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if (checkEmail.length > 0) {
      result.message = RESPONSE.EMAIL_ALREADY_EXISTS;
      return result;
    }

    /////////////////////////////////////////////////////////////////////////////
    // Insert New User
    /////////////////////////////////////////////////////////////////////////////

    let query = `
      INSERT INTO users
      (
        full_name,
        email,
        password,
        role,
        status,
        created_at,
        updated_at
      )
      VALUES
      (
        ?,?,?,?,1,NOW(),NOW()
      )
    `;

    let [res] = await conn.query(query, [
      full_name,
      email,
      password,
      role,
    ]);

    /////////////////////////////////////////////////////////////////////////////
    // Success Response
    /////////////////////////////////////////////////////////////////////////////

    if (res.insertId) {
      result.status = 1;
      result.message = RESPONSE.USER_REGISTERED_SUCCESSFULLY;

      result.data = {
        id: res.insertId,
      };
    } else {
      result.message = RESPONSE.SOMETHING_WENT_WRONG;
    }
  } catch (error) {
    /////////////////////////////////////////////////////////////////////////////
    // Exception Handling
    /////////////////////////////////////////////////////////////////////////////

    result.message = error.message;
  } finally {
    /////////////////////////////////////////////////////////////////////////////
    // Release Database Connection
    /////////////////////////////////////////////////////////////////////////////

    conn.release();
  }

  return result;
};


// -----------------------------------------------------------------------------
// Login Service
// Purpose : Authenticate User And Generate JWT Token
// -----------------------------------------------------------------------------

const login = async ({ email, password }) => {

  let result = {
    status: 0,
    message: "",
    data: "",
  };

  const conn = await pool.getConnection();

  try {
    ////////////////////////////////////////////////////////////////////////////
    // Check User Exists By Email
    ////////////////////////////////////////////////////////////////////////////

    let [res] = await conn.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    // Return If Email Not Found
    if (!res.length) {
      result.message = RESPONSE.INVALID_EMAIL;
      return result;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Compare Password
    ////////////////////////////////////////////////////////////////////////////

    const match = await bcrypt.compare(password, res[0].password);

    // Return If Password Is Incorrect
    if (!match) {
      result.message = RESPONSE.INVALID_PASSWORD;
      return result;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Generate JWT Token
    ////////////////////////////////////////////////////////////////////////////

    const token = jwt.sign(
      {
        id: res[0].id,
        employee_id: res[0].employee_id,
        email: res[0].email,
        role: res[0].role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    ////////////////////////////////////////////////////////////////////////////
    // Success Response
    ////////////////////////////////////////////////////////////////////////////

    result.status = 1;
    result.message = RESPONSE.LOGIN_SUCCESSFULLY;

    result.data = {
      token,
      user: {
        id: res[0].id,
        full_name: res[0].full_name,
        email: res[0].email,
        role: res[0].role,
      },
    };
  } catch (error) {
    ////////////////////////////////////////////////////////////////////////////
    // Exception Handling
    ////////////////////////////////////////////////////////////////////////////

    result.message = error.message;
  } finally {
    ////////////////////////////////////////////////////////////////////////////
    // Release Database Connection
    ////////////////////////////////////////////////////////////////////////////

    conn.release();
  }

  return result;
};

module.exports = {
  register,
  login,
};


