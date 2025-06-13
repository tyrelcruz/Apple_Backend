const mongoose = require("mongoose");
const Article = require("../models/Article");

// Get all articles
const getArticles = async (req, res) => {
  try {
    console.log("Attempting to fetch articles...");

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.error(
        "MongoDB is not connected. Current state:",
        mongoose.connection.readyState
      );
      return res.status(500).json({
        message: "Database connection is not ready",
        state: mongoose.connection.readyState,
      });
    }

    const articles = await Article.find().populate(
      "author",
      "firstName lastName"
    );
    console.log("Articles fetched successfully:", articles.length);
    res.json(articles);
  } catch (error) {
    console.error("Error in getArticles:", error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      code: error.code,
      name: error.name,
    });
  }
};

// Create article
const createArticle = async (req, res) => {
  try {
    // Log incoming form data
    console.log("req.body:", req.body);
    // Build article data from req.body
    const articleData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      status: req.body.status,
      author: new mongoose.Types.ObjectId(req.body.author),
    };
    // If there's an uploaded file, add its path to the article data
    if (req.file) {
      articleData.image = `/uploads/${req.file.filename}`;
    }
    console.log("articleData to create:", articleData);
    const article = await Article.create(articleData);
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update article
const updateArticle = async (req, res) => {
  try {
    const articleData = { ...req.body };

    // If there's an uploaded file, add its path to the article data
    if (req.file) {
      articleData.image = `/uploads/${req.file.filename}`;
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      articleData,
      { new: true }
    );
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete article
const deleteArticle = async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get single article
const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      "author",
      "firstName lastName"
    );
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticle,
};
