const db = require("../../data/dbConfig");
const bcrypt = require("bcryptjs");

const checkPayload = async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    next({ status: 401, message: "username and password required" });
  } else {
    next();
  }
};

const usernameExists = async (req, res, next) => {
  const exists = await db("users")
    .select("username")
    .where("username", req.body.username)
    .first();
  if (exists) {
    next({ status: 401, message: "username taken" });
  } else {
    next();
  }
};

const checkUsername = async (req, res, next) => {
  try {
    const exists = await db("users")
      .select("username", "password")
      .where("username", req.body.username)
      .first();
    if (exists) {
      if (bcrypt.compareSync(req.body.password, exists.password)) {
        req.username = exists;
        next();
      }
    } else {
      next({ status: 401, message: "invalid credentials" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { usernameExists, checkUsername, checkPayload };
