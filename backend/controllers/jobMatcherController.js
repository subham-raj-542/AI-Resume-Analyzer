const mongoose = require("mongoose");

const Resume = require("../models/Resume");

const {
  matchResumeWithJob,
} = require("../services/jobMatcherService");

// ============================================================
// JOB MATCHER CONTROLLER
// ============================================================
// POST /api/job-matcher
// Protected Route
//
// Receives:
// {
//   resumeId: "...",
//   jobDescription: "..."
// }
//
// Returns:
// - Match Score
// - Match Level
// - Keyword Score
// - Skill Score
// - Matched Keywords
// - Missing Keywords
// - Matched Skills
// - Missing Skills
// ============================================================

const matchJobWithResume = async (
  req,
  res
) => {
  try {
    // ==========================================================
    // GET REQUEST DATA
    // ==========================================================

    const {
      resumeId,
      jobDescription,
    } = req.body;

    // ==========================================================
    // VALIDATE RESUME ID
    // ==========================================================

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "Resume ID is required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        resumeId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID.",
      });
    }

    // ==========================================================
    // VALIDATE JOB DESCRIPTION
    // ==========================================================

    if (
      !jobDescription ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Job description is required.",
      });
    }

    // ==========================================================
    // FIND USER RESUME
    // ==========================================================
    //
    // IMPORTANT:
    // Resume must belong to logged-in user.
    //
    // ==========================================================

    const resume =
      await Resume.findOne({
        _id: resumeId,
        user: req.user.id,
      });

    // ==========================================================
    // RESUME NOT FOUND
    // ==========================================================

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "Resume not found or you do not have access to it.",
      });
    }

    // ==========================================================
    // CHECK RESUME TEXT
    // ==========================================================

    if (
      !resume.resumeText ||
      !resume.resumeText.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This resume does not contain extracted text.",
      });
    }

    // ==========================================================
    // RUN JOB MATCHER
    // ==========================================================

    const result =
      matchResumeWithJob(
        resume.resumeText,
        jobDescription.trim()
      );

    // ==========================================================
    // SUCCESS RESPONSE
    // ==========================================================

    return res.status(200).json({
      success: true,

      message:
        "Resume matched with job description successfully.",

      resume: {
        id: resume._id,
        originalName:
          resume.originalName,
      },

      result,
    });

  } catch (error) {
    // ==========================================================
    // ERROR
    // ==========================================================

    console.error(
      "Job matcher controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to match resume with job description.",
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  matchJobWithResume,
};
