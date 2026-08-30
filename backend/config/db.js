
const mongoose = require("mongoose");

// ============================================================
// MONGODB CONNECTION
// ============================================================

const connectDB = async () => {
  try {
    // ----------------------------------------------------------
    // CHECK ENVIRONMENT VARIABLE
    // ----------------------------------------------------------

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing in .env file"
      );
    }

    console.log(
      "\n================================================"
    );

    console.log(
      "             CONNECTING TO MONGODB"
    );

    console.log(
      "================================================"
    );

    // ----------------------------------------------------------
    // CONNECT
    // ----------------------------------------------------------

    const connection =
      await mongoose.connect(
        process.env.MONGODB_URI
      );

    console.log(
      "MongoDB connected successfully"
    );

    console.log(
      `MongoDB Host: ${connection.connection.host}`
    );

    console.log(
      `MongoDB Database: ${connection.connection.name}`
    );

    console.log(
      "================================================\n"
    );
  } catch (error) {
    console.error(
      "\n================================================"
    );

    console.error(
      "             MONGODB CONNECTION ERROR"
    );

    console.error(
      "================================================"
    );

    console.error(
      error?.message ||
        error
    );

    console.error(
      "================================================\n"
    );

    process.exit(1);
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports =
  connectDB;

