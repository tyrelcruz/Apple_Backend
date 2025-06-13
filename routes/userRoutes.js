const express = require("express");
// import functions
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

// Logging middleware for user routes
router.use((req, res, next) => {
  console.log("User Route:", req.method, req.path);
  next();
});

// Public routes
router.post("/login", loginUser);
router.post("/", createUser);

// Protected routes
router.get("/", auth, getUsers);
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteUser);

module.exports = router;
