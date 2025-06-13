const mongoose = require("mongoose");

// Cache the database connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    // If we have a cached connection, return it
    if (cached.conn) {
      console.log("Using cached database connection");
      return cached.conn;
    }

    console.log("Attempting to connect to MongoDB...");
    console.log(
      "MongoDB URI:",
      process.env.MONGODB_URI ? "URI is set" : "URI is not set"
    );
    console.log("Current connection state:", mongoose.connection.readyState);

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Reduced timeout
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
      w: "majority",
    };

    // If we don't have a connection promise, create one
    if (!cached.promise) {
      console.log("Creating new connection promise...");
      cached.promise = mongoose
        .connect(process.env.MONGODB_URI, options)
        .then((mongoose) => {
          console.log(`MongoDB Connected: ${mongoose.connection.host}`);
          console.log(
            "Connection state after connect:",
            mongoose.connection.readyState
          );
          return mongoose;
        })
        .catch((error) => {
          console.error("MongoDB connection error in promise:", error);
          cached.conn = null;
          cached.promise = null;
          throw error;
        });
    }

    // Wait for the connection promise to resolve
    console.log("Waiting for connection promise to resolve...");
    cached.conn = await cached.promise;
    console.log(
      "Connection promise resolved. State:",
      mongoose.connection.readyState
    );

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
      console.log(
        "Connection state on connected event:",
        mongoose.connection.readyState
      );
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      console.log("Connection state on error:", mongoose.connection.readyState);
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      console.log(
        "Connection state on disconnected:",
        mongoose.connection.readyState
      );
      cached.conn = null;
      cached.promise = null;
    });

    // Add a connection check
    if (mongoose.connection.readyState !== 1) {
      console.log(
        "Connection not ready after setup. Current state:",
        mongoose.connection.readyState
      );
      throw new Error(
        `Database connection not ready. State: ${mongoose.connection.readyState}`
      );
    }

    return cached.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Full error:", error);
    console.log("Connection state on error:", mongoose.connection.readyState);
    cached.conn = null;
    cached.promise = null;
    throw error;
  }
};

module.exports = connectDB;
