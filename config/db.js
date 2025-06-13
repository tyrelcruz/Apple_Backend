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

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      maxPoolSize: 50,
      minPoolSize: 10,
      retryWrites: true,
      retryReads: true,
      w: "majority",
    };

    // If we don't have a connection promise, create one
    if (!cached.promise) {
      cached.promise = mongoose
        .connect(process.env.MONGODB_URI, options)
        .then((mongoose) => {
          console.log(`MongoDB Connected: ${mongoose.connection.host}`);
          return mongoose;
        });
    }

    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      cached.conn = null;
      cached.promise = null;
    });

    return cached.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Full error:", error);
    cached.conn = null;
    cached.promise = null;
    throw error;
  }
};

module.exports = connectDB;
