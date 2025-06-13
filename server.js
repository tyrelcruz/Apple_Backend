require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articleRoutes");
const mongoose = require("mongoose");

const app = express();

// Database Connection
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // Local backend
  "https://cruz-front-end.vercel.app",
  "https://appleclonefrontend.vercel.app",
  "https://cruz-front-end-git-main-tyrelcruz.vercel.app", // Add your Vercel frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  })
);

// Handle preflight requests
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Welcome message route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Cruz MERN API",
    status: "Server is running",
    endpoints: {
      users: "/api/users",
      articles: "/api/articles",
      stats: "/api/users/stats",
    },
  });
});

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
