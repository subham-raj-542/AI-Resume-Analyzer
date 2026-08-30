
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Resume = require("../models/Resume");

// ============================================================
// HELPER — VALIDATE RESUME ID
// ============================================================

const isValidResumeId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// HELPER — DELETE FILE SAFELY
// ============================================================

const deleteFileSafely = (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    const absolutePath =
      path.resolve(filePath);

    if (
      fs.existsSync(
        absolutePath
      )
    ) {
      fs.unlinkSync(
        absolutePath
      );

      console.log(
        "Resume file deleted:",
        absolutePath
      );
    }
  } catch (error) {
    console.error(
      "Resume file deletion error:",
      error
    );
  }
};

// ============================================================
// GET USER RESUMES
// ============================================================
// GET /api/resumes
// Protected Route
// ============================================================

const getUserResumes = async (
  req,
  res
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const resumes =
      await Resume.find({
        user:
          req.user.id,
      })
        .select(
          [
            "originalName",
            "fileName",
            "fileSize",
            "mimetype",
            "atsScore",
            "grade",
            "analysis",
            "status",
            "createdAt",
            "updatedAt",
          ].join(" ")
        )
        .sort({
          updatedAt: -1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count:
        resumes.length,
      resumes,
    });
  } catch (error) {
    console.error(
      "Get user resumes error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch resumes.",
    });
  }
};

// ============================================================
// GET SINGLE RESUME
// ============================================================
// GET /api/resumes/:id
// Protected Route
// ============================================================

const getResumeById = async (
  req,
  res
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const { id } =
      req.params;

    if (
      !isValidResumeId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resume ID.",
      });
    }

    const resume =
      await Resume.findOne({
        _id:
          id,
        user:
          req.user.id,
      });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "Resume not found.",
      });
    }

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error(
      "Get resume error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch resume.",
    });
  }
};

// ============================================================
// DELETE RESUME
// ============================================================
// DELETE /api/resumes/:id
// Protected Route
// ============================================================

const deleteResume = async (
  req,
  res
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const { id } =
      req.params;

    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (
      !isValidResumeId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resume ID.",
      });
    }

    // --------------------------------------------------------
    // OWNERSHIP CHECK
    // --------------------------------------------------------

    const resume =
      await Resume.findOne({
        _id:
          id,
        user:
          req.user.id,
      });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "Resume not found.",
      });
    }

    // Save file path before deleting DB record.
    const oldFilePath =
      resume.filePath
        ? path.resolve(
            resume.filePath
          )
        : "";

    // --------------------------------------------------------
    // DELETE DATABASE RECORD
    // --------------------------------------------------------

    await Resume.deleteOne({
      _id:
        resume._id,
      user:
        req.user.id,
    });

    // --------------------------------------------------------
    // DELETE UPLOADED PDF
    // --------------------------------------------------------

    if (
      oldFilePath
    ) {
      deleteFileSafely(
        oldFilePath
      );
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Resume deleted successfully.",

      databaseId:
        resume._id,
    });
  } catch (error) {
    console.error(
      "\n================================================"
    );

    console.error(
      "DELETE RESUME ERROR"
    );

    console.error(
      "================================================"
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "================================================\n"
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete resume.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getUserResumes,
  getResumeById,
  deleteResume,
};

