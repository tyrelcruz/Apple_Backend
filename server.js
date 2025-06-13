require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articleRoutes");
const mongoose = require("mongoose");

const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // Local backend
  "https://cruz-front-end.vercel.app",
  "https://appleclonefrontend.vercel.app",
  "https://cruz-front-end-git-main-tyrelcruz.vercel.app",
  "https://apple-frontend-seven.vercel.app", // Your new frontend URL
];

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Range, X-Content-Range"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    console.log(
      "Current MongoDB connection state:",
      mongoose.connection.readyState
    );

    if (mongoose.connection.readyState === 1) {
      console.log("Using existing database connection");
      next();
      return;
    }

    console.log("Attempting to establish database connection...");
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error(
        `Database connection not ready. State: ${mongoose.connection.readyState}`
      );
    }

    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      message: "Database connection is not ready",
      state: mongoose.connection.readyState,
      error: error.message,
    });
  }
});

// Welcome message route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Cruz MERN API",
    status: "Server is running",
    database: {
      state: mongoose.connection.readyState,
      stateText: getConnectionStateText(mongoose.connection.readyState),
    },
    endpoints: {
      users: "/api/users",
      articles: "/api/articles",
      stats: "/api/users/stats",
    },
  });
});

// Helper function to get connection state text
function getConnectionStateText(state) {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[state] || "unknown";
}

// Routes
app.use("/api/users", userRoutes);
app.use("/api/articles", articleRoutes);

// Error Handling with CORS headers
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Handle 404 routes with CORS headers
app.use((req, res) => {
  console.log("404 Not Found:", req.method, req.url);
  res.status(404).json({ message: "Route not found" });
});

// For local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test the server at: http://localhost:${PORT}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
