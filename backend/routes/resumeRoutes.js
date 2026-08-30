
// ============================================================
// AI RESUME ANALYZER
// RESUME ROUTES
// ============================================================
//
// CANONICAL RESUME API
//
// POST   /api/resumes
// GET    /api/resumes
// GET    /api/resumes/:id
// PUT    /api/resumes/:id
// DELETE /api/resumes/:id
//
// All routes are user-specific through `protect`.
//
// ============================================================

const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const {
  protect,
} = require("../middleware/authMiddleware");

const Resume =
  require("../models/Resume");

const upload =
  require("../middleware/uploadMiddleware");

const {
  extractTextFromPDF,
} = require("../services/pdfService");

const {
  analyzeResume,
} = require("../services/resumeAnalyzer");

const {
  normalizeResumeInput,
} = require("../services/structuredResumeParser");

const {
  buildTailoredResume,
} = require("../services/tailoredResumeBuilder");

// ============================================================
// ROUTER
// ============================================================

const router =
  express.Router();

// ============================================================
// HELPERS
// ============================================================

const isValidResumeId = (
  id
) => {
  return mongoose.Types.ObjectId.isValid(
    id
  );
};

// ============================================================
// SAFE USER ID
// ============================================================

const getUserId = (
  req
) => {
  return String(
    req.user?.id ||
      req.user?._id ||
      req.user?.userId ||
      ""
  ).trim();
};

// ============================================================
// PDF CHECK
// ============================================================

const isPDFFile = (
  file
) => {
  if (
    !file
  ) {
    return false;
  }

  const mimeType =
    String(
      file.mimetype || ""
    ).toLowerCase();

  const originalName =
    String(
      file.originalname || ""
    ).toLowerCase();

  return (
    mimeType ===
      "application/pdf" ||
    originalName.endsWith(
      ".pdf"
    )
  );
};

// ============================================================
// ATS SCORE
// ============================================================

const getATSScore = (
  analysis
) => {
  const possibleScore =
    analysis?.atsScore ??
    analysis?.score ??
    analysis?.ats ??
    0;

  const numericScore =
    Number(
      possibleScore
    );

  if (
    !Number.isFinite(
      numericScore
    )
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        numericScore
      )
    )
  );
};

// ============================================================
// GRADE
// ============================================================

const calculateGrade = (
  score
) => {
  if (
    score >= 90
  ) {
    return "A+";
  }

  if (
    score >= 80
  ) {
    return "A";
  }

  if (
    score >= 70
  ) {
    return "B";
  }

  if (
    score >= 60
  ) {
    return "C";
  }

  if (
    score >= 50
  ) {
    return "D";
  }

  return "F";
};

// ============================================================
// FILE CLEANUP
// ============================================================

const cleanupFile = (
  filePath
) => {
  if (
    !filePath
  ) {
    return;
  }

  try {
    const resolvedPath =
      path.resolve(
        filePath
      );

    if (
      fs.existsSync(
        resolvedPath
      )
    ) {
      fs.unlinkSync(
        resolvedPath
      );

      console.log(
        `Cleaned up file: ${resolvedPath}`
      );
    }
  } catch (
    error
  ) {
    console.error(
      "FILE CLEANUP ERROR:",
      error?.message ||
        error
    );
  }
};

// ============================================================
// RESUME ANALYSIS HELPER
// ============================================================

const processResumeFile =
  async (
    filePath
  ) => {
    if (
      !filePath
    ) {
      throw new Error(
        "Resume file path is missing."
      );
    }

    // --------------------------------------------------------
    // EXTRACT
    // --------------------------------------------------------

    const resumeText =
      await extractTextFromPDF(
        filePath
      );

    if (
      !resumeText ||
      typeof resumeText !==
        "string" ||
      !resumeText.trim()
    ) {
      const extractionError =
        new Error(
          "Could not extract text from the uploaded PDF. Please upload a text-based PDF."
        );

      extractionError.statusCode =
        422;

      throw extractionError;
    }

    // --------------------------------------------------------
    // ANALYZE
    // --------------------------------------------------------

    const analysis =
      await analyzeResume(
        resumeText
      );

    if (
      !analysis ||
      typeof analysis !==
        "object"
    ) {
      const analysisError =
        new Error(
          "Resume analysis failed."
        );

      analysisError.statusCode =
        500;

      throw analysisError;
    }

    // --------------------------------------------------------
    // SCORE
    // --------------------------------------------------------

    const atsScore =
      getATSScore(
        analysis
      );

    const grade =
      typeof analysis.grade ===
        "string" &&
      analysis.grade.trim()
        ? analysis.grade.trim()
        : calculateGrade(
            atsScore
          );

    return {
      resumeText:
        resumeText.trim(),

      analysis,

      atsScore,

      grade,
    };
  };

// ============================================================
// GET ALL RESUMES
// GET /api/resumes
// ============================================================
//
// Returns only resumes belonging to the logged-in user.
//
// ============================================================

router.get(
  "/",
  protect,
  async (
    req,
    res
  ) => {
    try {
      const userId =
        getUserId(
          req
        );

      if (
        !userId
      ) {
        return res
          .status(401)
          .json({
            success:
              false,

            code:
              "USER_ID_MISSING",

            message:
              "Authentication information is missing.",
          });
      }

      const resumes =
        await Resume.find({
          user:
            userId,
        })
          .sort({
            updatedAt:
              -1,

            createdAt:
              -1,
          })
          .select(
            "-resumeText"
          );

      return res
        .status(200)
        .json({
          success:
            true,

          count:
            resumes.length,

          resumes,
        });
    } catch (
      error
    ) {
      console.error(
        "GET RESUMES ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to fetch resumes.",
        });
    }
  }
);

// ============================================================
// CREATE / UPLOAD RESUME
// POST /api/resumes
// ============================================================
//
// Form-data:
// resume = PDF
//
// Flow:
//
// PDF
// ↓
// Extract
// ↓
// Analyze
// ↓
// Save
// ↓
// Return Resume ID
//
// ============================================================

router.post(
  "/",
  protect,
  upload.single(
    "resume"
  ),
  async (
    req,
    res
  ) => {
    let uploadedFilePath =
      null;

    try {
      const userId =
        getUserId(
          req
        );

      if (
        !userId
      ) {
        return res
          .status(401)
          .json({
            success:
              false,

            code:
              "USER_ID_MISSING",

            message:
              "Authentication information is missing.",
          });
      }

      // ------------------------------------------------------
      // FILE REQUIRED
      // ------------------------------------------------------

      if (
        !req.file
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            code:
              "RESUME_FILE_REQUIRED",

            message:
              "Please upload a resume PDF.",
          });
      }

      uploadedFilePath =
        req.file.path;

      // ------------------------------------------------------
      // PDF VALIDATION
      // ------------------------------------------------------

      if (
        !isPDFFile(
          req.file
        )
      ) {
        cleanupFile(
          uploadedFilePath
        );

        uploadedFilePath =
          null;

        return res
          .status(400)
          .json({
            success:
              false,

            code:
              "INVALID_FILE_TYPE",

            message:
              "Only PDF resumes are allowed.",
          });
      }

      // ------------------------------------------------------
      // PROCESS RESUME
      // ------------------------------------------------------

      const processed =
        await processResumeFile(
          req.file.path
        );

      // ------------------------------------------------------
      // SAVE
      // ------------------------------------------------------

      const resume =
        await Resume.create({
          user:
            userId,

          fileName:
            req.file.filename,

          originalName:
            req.file.originalname,

          filePath:
            req.file.path,

          fileSize:
            req.file.size,

          mimetype:
            req.file.mimetype,

          resumeText:
            processed.resumeText,

          analysis:
            processed.analysis,

          atsScore:
            processed.atsScore,

          grade:
            processed.grade,

          status:
            "analyzed",
        });

      // ------------------------------------------------------
      // FILE NOW BELONGS TO DATABASE RECORD
      // ------------------------------------------------------

      uploadedFilePath =
        null;

      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      return res
        .status(201)
        .json({
          success:
            true,

          message:
            "Resume uploaded, analyzed and saved successfully.",

          resumeId:
            resume._id,

          databaseId:
            resume._id,

          resume,
        });
    } catch (
      error
    ) {
      console.error(
        "CREATE RESUME ERROR:",
        error
      );

      // ------------------------------------------------------
      // CLEANUP NEW FILE IF DATABASE SAVE/ANALYSIS FAILED
      // ------------------------------------------------------

      cleanupFile(
        uploadedFilePath
      );

      const statusCode =
        Number(
          error?.statusCode
        ) || 500;

      return res
        .status(
          statusCode
        )
        .json({
          success:
            false,

          message:
            error?.message ||
            "Unable to upload and analyze resume.",
        });
    }
  }
);

// ============================================================
// GET SINGLE RESUME
// GET /api/resumes/:id
// ============================================================
//
// Ownership:
//
// _id + user
//
// ============================================================

router.get(
  "/:id",
  protect,
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const userId =
        getUserId(
          req
        );

      if (
        !userId
      ) {
        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication information is missing.",
          });
      }

      if (
        !isValidResumeId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid resume ID.",
          });
      }

      const resume =
        await Resume.findOne({
          _id:
            id,

          user:
            userId,
        });

      if (
        !resume
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Resume not found.",
          });
      }

      return res
        .status(200)
        .json({
          success:
            true,

          resume,
        });
    } catch (
      error
    ) {
      console.error(
        "GET SINGLE RESUME ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to fetch resume.",
        });
    }
  }
);

// ============================================================
// LEGACY TAILOR SAVED RESUME
// POST /api/resumes/:id/tailor
// ============================================================
//
// Kept for backend compatibility.
//
// Current frontend customization workflow:
//
// POST /api/resume-tailor
//
// ============================================================

router.post(
  "/:id/tailor",
  protect,
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const userId =
        getUserId(
          req
        );

      if (
        !userId
      ) {
        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication information is missing.",
          });
      }

      if (
        !isValidResumeId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid resume ID.",
          });
      }

      const jobDescription =
        typeof req.body
          ?.jobDescription ===
        "string"
          ? req.body.jobDescription.trim()
          : "";

      if (
        !jobDescription
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Job description is required.",
          });
      }

      if (
        jobDescription.length <
        20
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Job description should contain at least 20 characters.",
          });
      }

      const resume =
        await Resume.findOne({
          _id:
            id,

          user:
            userId,
        });

      if (
        !resume
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Resume not found.",
          });
      }

      if (
        !resume.resumeText ||
        typeof resume.resumeText !==
          "string" ||
        !resume.resumeText.trim()
      ) {
        return res
          .status(422)
          .json({
            success:
              false,

            message:
              "Resume text is not available for customization.",
          });
      }

      const parsedResume =
        normalizeResumeInput(
          resume.resumeText
        );

      const tailoredResume =
        buildTailoredResume(
          parsedResume,
          jobDescription
        );

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Customized resume generated successfully.",

          resumeId:
            resume._id,

          tailoredResume,
        });
    } catch (
      error
    ) {
      console.error(
        "LEGACY TAILOR ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            error?.message ||
            "Unable to generate customized resume.",
        });
    }
  }
);

// ============================================================
// UPDATE / REPLACE RESUME
// PUT /api/resumes/:id
// ============================================================
//
// Flow:
//
// Existing Resume
//      ↓
// New PDF
//      ↓
// Extract
//      ↓
// Analyze
//      ↓
// Update SAME MongoDB record
//      ↓
// Delete old PDF
//
// ============================================================

router.put(
  "/:id",
  protect,
  upload.single(
    "resume"
  ),
  async (
    req,
    res
  ) => {
    let uploadedFilePath =
      null;

    try {
      const {
        id,
      } =
        req.params;

      const userId =
        getUserId(
          req
        );

      // ------------------------------------------------------
      // AUTH
      // ------------------------------------------------------

      if (
        !userId
      ) {
        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication information is missing.",
          });
      }

      // ------------------------------------------------------
      // ID
      // ------------------------------------------------------

      if (
        !isValidResumeId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid resume ID.",
          });
      }

      // ------------------------------------------------------
      // OWNERSHIP
      // ------------------------------------------------------

      const resume =
        await Resume.findOne({
          _id:
            id,

          user:
            userId,
        });

      if (
        !resume
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Resume not found.",
          });
      }

      // ------------------------------------------------------
      // FILE REQUIRED
      // ------------------------------------------------------

      if (
        !req.file
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            code:
              "NEW_RESUME_FILE_REQUIRED",

            message:
              "Please upload a new resume PDF.",
          });
      }

      uploadedFilePath =
        req.file.path;

      // ------------------------------------------------------
      // PDF VALIDATION
      // ------------------------------------------------------

      if (
        !isPDFFile(
          req.file
        )
      ) {
        cleanupFile(
          uploadedFilePath
        );

        uploadedFilePath =
          null;

        return res
          .status(400)
          .json({
            success:
              false,

            code:
              "INVALID_FILE_TYPE",

            message:
              "Only PDF resumes are allowed.",
          });
      }

      // ------------------------------------------------------
      // PROCESS NEW FILE
      // ------------------------------------------------------

      const processed =
        await processResumeFile(
          req.file.path
        );

      // ------------------------------------------------------
      // STORE OLD FILE PATH
      // ------------------------------------------------------

      const oldFilePath =
        resume.filePath
          ? path.resolve(
              resume.filePath
            )
          : null;

      const newFilePath =
        req.file.path
          ? path.resolve(
              req.file.path
            )
          : null;

      // ------------------------------------------------------
      // UPDATE SAME DATABASE RECORD
      // ------------------------------------------------------

      resume.originalName =
        req.file.originalname;

      resume.fileName =
        req.file.filename;

      resume.filePath =
        req.file.path;

      resume.fileSize =
        req.file.size;

      resume.mimetype =
        req.file.mimetype;

      resume.resumeText =
        processed.resumeText;

      resume.analysis =
        processed.analysis;

      resume.atsScore =
        processed.atsScore;

      resume.grade =
        processed.grade;

      resume.status =
        "analyzed";

      await resume.save();

      // ------------------------------------------------------
      // NEW FILE IS NOW OWNED BY DATABASE RECORD
      // ------------------------------------------------------

      uploadedFilePath =
        null;

      // ------------------------------------------------------
      // DELETE OLD FILE
      // ------------------------------------------------------

      if (
        oldFilePath &&
        newFilePath &&
        oldFilePath !==
          newFilePath
      ) {
        cleanupFile(
          oldFilePath
        );
      }

      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Resume updated and analyzed successfully.",

          resumeId:
            resume._id,

          databaseId:
            resume._id,

          resume,
        });
    } catch (
      error
    ) {
      console.error(
        "UPDATE RESUME ERROR:",
        error
      );

      // ------------------------------------------------------
      // CLEANUP NEW FILE IF UPDATE FAILED
      // ------------------------------------------------------

      cleanupFile(
        uploadedFilePath
      );

      const statusCode =
        Number(
          error?.statusCode
        ) || 500;

      return res
        .status(
          statusCode
        )
        .json({
          success:
            false,

          message:
            error?.message ||
            "Unable to update resume.",
        });
    }
  }
);

// ============================================================
// DELETE RESUME
// DELETE /api/resumes/:id
// ============================================================

router.delete(
  "/:id",
  protect,
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const userId =
        getUserId(
          req
        );

      // ------------------------------------------------------
      // AUTH
      // ------------------------------------------------------

      if (
        !userId
      ) {
        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication information is missing.",
          });
      }

      // ------------------------------------------------------
      // ID
      // ------------------------------------------------------

      if (
        !isValidResumeId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid resume ID.",
          });
      }

      // ------------------------------------------------------
      // OWNERSHIP
      // ------------------------------------------------------

      const resume =
        await Resume.findOne({
          _id:
            id,

          user:
            userId,
        });

      if (
        !resume
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Resume not found.",
          });
      }

      // ------------------------------------------------------
      // STORE PDF PATH
      // ------------------------------------------------------

      const filePath =
        resume.filePath
          ? path.resolve(
              resume.filePath
            )
          : null;

      // ------------------------------------------------------
      // DELETE DB RECORD
      // ------------------------------------------------------

      await Resume.deleteOne({
        _id:
          resume._id,

        user:
          userId,
      });

      // ------------------------------------------------------
      // DELETE PDF
      // ------------------------------------------------------

      if (
        filePath
      ) {
        cleanupFile(
          filePath
        );
      }

      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Resume deleted successfully.",

          databaseId:
            resume._id,
        });
    } catch (
      error
    ) {
      console.error(
        "DELETE RESUME ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            error?.message ||
            "Unable to delete resume.",
        });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;

