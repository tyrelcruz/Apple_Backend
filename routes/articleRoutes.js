const express = require("express");
const router = express.Router();
const {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticle,
} = require("../controllers/articleController");
const auth = require("../middleware/auth");

// Public routes
router.get("/", getArticles);
router.get("/:id", getArticle);

// Protected routes
router.post("/", auth, createArticle);
router.put("/:id", auth, updateArticle);
router.delete("/:id", auth, deleteArticle);

module.exports = router;
