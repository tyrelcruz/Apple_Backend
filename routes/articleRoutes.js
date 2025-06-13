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
const upload = require("../middleware/upload");

// Public routes
router.get("/", getArticles);
router.get("/:id", getArticle);

// Protected routes
router.post("/", auth, upload.single("image"), createArticle);
router.put("/:id", auth, upload.single("image"), updateArticle);
router.delete("/:id", auth, deleteArticle);

module.exports = router;
