
const mongoose = require("mongoose");

// ============================================================
// RESUME SCHEMA
// ============================================================

const resumeSchema = new mongoose.Schema(
  {
    // ==========================================================
    // USER
    // ==========================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================================
    // RESUME FILE INFORMATION
    // ==========================================================

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      default: "",
      trim: true,
    },

    fileSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    mimetype: {
      type: String,
      default: "application/pdf",
      trim: true,
    },

    // ==========================================================
    // EXTRACTED RESUME TEXT
    // ==========================================================

    resumeText: {
      type: String,
      default: "",
    },

    // ==========================================================
    // AI ANALYSIS
    // ==========================================================

    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ==========================================================
    // ATS SCORE
    // ==========================================================

    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ==========================================================
    // ATS GRADE
    // ==========================================================

    grade: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // RESUME STATUS
    // ==========================================================

    status: {
      type: String,
      enum: [
        "uploaded",
        "processing",
        "analyzed",
        "failed",
      ],
      default: "uploaded",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


// ============================================================
// INDEX
// ============================================================
//
// Makes fetching a user's resume history faster.
//
// ============================================================

resumeSchema.index({
  user: 1,
  createdAt: -1,
});


// ============================================================
// MODEL
// ============================================================

const Resume = mongoose.model(
  "Resume",
  resumeSchema
);


// ============================================================
// EXPORT
// ============================================================

module.exports = Resume;

