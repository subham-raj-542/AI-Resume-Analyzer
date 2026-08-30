// ============================================================
// AI RESUME ANALYZER
// TAILORED RESUME ROUTES
// STEP 31
// ============================================================

const express = require("express");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  generateTailoredResume,
  generateTailoredResumePDF,
} = require("../controllers/tailoredResumeController");

const router = express.Router();


// ============================================================
// POST /api/tailored-resume
// ============================================================
//
// Resume
//   +
// Job Description
//   ↓
// Parse Resume
//   ↓
// Match Job
//   ↓
// Build Tailored Resume
//
// Protected route
//
// ============================================================

router.post(
  "/",
  protect,
  generateTailoredResume
);


// ============================================================
// POST /api/tailored-resume/pdf
// ============================================================
//
// Resume
//   +
// Job Description
//   ↓
// Tailored Resume
//   ↓
// Professional PDF
//
// Protected route
//
// ============================================================

router.post(
  "/pdf",
  protect,
  generateTailoredResumePDF
);


// ============================================================
// INVALID ROUTE
// ============================================================

router.use(
  (req, res) => {

    return res.status(404).json({

      success: false,

      message:
        `Tailored resume route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;