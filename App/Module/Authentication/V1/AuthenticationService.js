const pool = require("../../../Config/db.poolingConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async ({ full_name, email, password, role }) => {
  let result = {
    status: 0,
    message: "",
    data: "",
  };

  const conn = await pool.getConnection();

  try {
    let [checkEmail] = await conn.query("SELECT id FROM users WHERE email=?", [
      email,
    ]);

    if (checkEmail.length > 0) {
      result.message = "Email Already Exists";
      return result;
    }

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

    let [res] = await conn.query(query, [full_name, email, password, role]);

    if (res.insertId) {
      result.status = 1;
      result.message = "User Registered Successfully";
      result.data = {
        id: res.insertId,
      };
    } else {
      result.message = "Something Went Wrong";
    }
  } catch (error) {
    result.message = error.message;
  } finally {
    conn.release();
  }

  return result;
};

const login = async ({ email, password }) => {
  let result = {
    status: 0,
    message: "",
    data: "",
  };

  const conn = await pool.getConnection();

  try {
    let [res] = await conn.query("SELECT * FROM users WHERE email=?", [email]);

    if (!res.length) {
      result.message = "Invalid Email";
      return result;
    }

    const match = await bcrypt.compare(password, res[0].password);

    if (!match) {
      result.message = "Invalid Password";
      return result;
    }

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
      },
    );

    result.status = 1;
    result.message = "Login Successful";
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
    result.message = error.message;
  } finally {
    conn.release();
  }

  return result;
};

module.exports = {
  register,
  login,
};
