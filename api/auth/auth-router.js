const router = require("express").Router();
const db = require("../../data/dbConfig");
const { JWT_SECRET } = require("../secrets/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  checkUsername,
  checkPayload,
  usernameExists,
} = require("./auth-middleware");

// BUILD TOKEN FUNCTION
function buildToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  const token = jwt.sign(payload, JWT_SECRET, options);
  return token;
}

// ADD MODEL
async function add(user) {
  const result = await db("users").insert(user);
  const id = result[0];
  return findById(id);
}
// FIND BY ID MODEL
async function findById(id) {
  const result = await db("users")
    .select("username", "id", "password")
    .where("id", id);
  return result;
}

router.post("/register", checkPayload, usernameExists, (req, res, next) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 8);
  add({ username, password: hash })
    .then((user) => {
      res.status(201).json(user[0]);
    })
    .catch((error) => {
      next(error);
    });
});

router.post("/login", checkPayload, checkUsername, (req, res, next) => {
  try {
    const token = buildToken(req.username);
    res.status(200).json({
      message: `${req.username.username} is back!`,
      token,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
