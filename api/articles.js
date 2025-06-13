const express = require("express");
const cors = require("cors");
const Article = require("../models/Article");

const app = express();

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Get all articles
app.get("/", async (req, res) => {
  try {
    const articles = await Article.find().populate(
      "author",
      "firstName lastName"
    );
    res.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: error.message });
  }
});

// Handle OPTIONS requests
app.options("*", cors());

module.exports = app;
