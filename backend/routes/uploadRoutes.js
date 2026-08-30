
const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  extractTextFromPDF,
} = require("../services/pdfService");

const {
  analyzeResume,
} = require("../services/resumeAnalyzer");

const Resume = require("../models/Resume");

const router = express.Router();


// ============================================================
// HELPER: CALCULATE ATS GRADE
// ============================================================

const calculateGrade = (score) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";

  return "F";
};


// ============================================================
// HELPER: GET ATS SCORE
// ============================================================

const getATSScore = (analysis) => {
  let score = 0;

  if (
    typeof analysis?.atsScore === "number"
  ) {
    score = analysis.atsScore;
  } else if (
    typeof analysis?.score === "number"
  ) {
    score = analysis.score;
  } else if (
    typeof analysis?.ats === "number"
  ) {
    score = analysis.ats;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Number(score) || 0
    )
  );
};


// ============================================================
// RESUME UPLOAD HANDLER
// ============================================================

const uploadResume = async (req, res) => {
  let uploadedFilePath = null;

  try {
    console.log(
      "\n================================================"
    );

    console.log(
      "          RESUME UPLOAD REQUEST"
    );

    console.log(
      "================================================"
    );


    // ==========================================================
    // 1. AUTHENTICATED USER
    // ==========================================================

    console.log(
      "Authenticated User ID:",
      req.user.id
    );


    // ==========================================================
    // 2. CHECK FILE
    // ==========================================================

    if (!req.file) {
      console.log(
        "❌ No resume file received"
      );

      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }


    uploadedFilePath =
      req.file.path;


    console.log(
      "✅ Resume file received"
    );

    console.log(
      "Original Name:",
      req.file.originalname
    );

    console.log(
      "Generated File Name:",
      req.file.filename
    );

    console.log(
      "File Size:",
      req.file.size
    );

    console.log(
      "File Path:",
      req.file.path
    );

    console.log(
      "MIME Type:",
      req.file.mimetype
    );


    // ==========================================================
    // 3. CHECK PDF
    // ==========================================================

    const isPDF =
      req.file.mimetype ===
        "application/pdf" ||
      req.file.originalname
        .toLowerCase()
        .endsWith(".pdf");


    if (!isPDF) {
      console.log(
        "❌ Invalid file type"
      );

      // Cleanup uploaded invalid file
      try {
        if (
          uploadedFilePath &&
          fs.existsSync(uploadedFilePath)
        ) {
          fs.unlinkSync(
            uploadedFilePath
          );
        }
      } catch (cleanupError) {
        console.error(
          "Invalid file cleanup error:",
          cleanupError.message
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "Only PDF resumes are allowed",
      });
    }


    // ==========================================================
    // 4. EXTRACT TEXT FROM PDF
    // ==========================================================

    console.log(
      "\n=============================="
    );

    console.log(
      "EXTRACTING PDF TEXT"
    );

    console.log(
      "=============================="
    );


    const resumeText =
      await extractTextFromPDF(
        req.file.path
      );


    // ==========================================================
    // 5. CHECK EXTRACTED TEXT
    // ==========================================================

    if (
      !resumeText ||
      typeof resumeText !== "string" ||
      resumeText.trim().length === 0
    ) {
      console.log(
        "❌ No text extracted from PDF"
      );

      try {
        if (
          uploadedFilePath &&
          fs.existsSync(uploadedFilePath)
        ) {
          fs.unlinkSync(
            uploadedFilePath
          );
        }
      } catch (cleanupError) {
        console.error(
          "PDF cleanup error:",
          cleanupError.message
        );
      }

      return res.status(422).json({
        success: false,
        message:
          "Could not extract text from the uploaded PDF. Please upload a text-based PDF.",
      });
    }


    console.log(
      "✅ PDF text extracted"
    );

    console.log(
      "Extracted Characters:",
      resumeText.length
    );


    // ==========================================================
    // 6. ANALYZE RESUME
    // ==========================================================

    console.log(
      "\n=============================="
    );

    console.log(
      "STARTING RESUME ANALYSIS"
    );

    console.log(
      "=============================="
    );


    const analysis =
      await analyzeResume(
        resumeText
      );


    // ==========================================================
    // 7. CHECK ANALYSIS
    // ==========================================================

    if (!analysis) {
      console.log(
        "❌ Resume analysis failed"
      );

      try {
        if (
          uploadedFilePath &&
          fs.existsSync(uploadedFilePath)
        ) {
          fs.unlinkSync(
            uploadedFilePath
          );
        }
      } catch (cleanupError) {
        console.error(
          "Analysis cleanup error:",
          cleanupError.message
        );
      }

      return res.status(500).json({
        success: false,
        message:
          "Resume analysis failed",
      });
    }


    console.log(
      "✅ Resume analysis completed"
    );


    // ==========================================================
    // 8. ATS SCORE
    // ==========================================================

    const atsScore =
      getATSScore(
        analysis
      );


    // ==========================================================
    // 9. ATS GRADE
    // ==========================================================

    const grade =
      calculateGrade(
        atsScore
      );


    console.log(
      "\n=============================="
    );

    console.log(
      "ATS RESULT"
    );

    console.log(
      "=============================="
    );

    console.log(
      "ATS Score:",
      atsScore
    );

    console.log(
      "Grade:",
      grade
    );


    // ==========================================================
    // 10. SAVE RESUME TO MONGODB
    // ==========================================================

    console.log(
      "\n=============================="
    );

    console.log(
      "SAVING RESUME TO MONGODB"
    );

    console.log(
      "=============================="
    );


    const savedResume =
      await Resume.create({

        // ======================================================
        // USER OWNERSHIP
        // ======================================================

        user:
          req.user.id,


        // ======================================================
        // FILE INFORMATION
        // ======================================================

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


        // ======================================================
        // RESUME TEXT
        // ======================================================

        resumeText:
          resumeText,


        // ======================================================
        // AI ANALYSIS
        // ======================================================

        analysis:
          analysis,


        // ======================================================
        // ATS SCORE
        // ======================================================

        atsScore:
          atsScore,


        // ======================================================
        // ATS GRADE
        // ======================================================

        grade:
          grade,

      });


    console.log(
      "✅ Resume saved successfully"
    );

    console.log(
      "MongoDB Resume ID:",
      savedResume._id
    );

    console.log(
      "Resume Owner ID:",
      savedResume.user
    );


    // ==========================================================
    // 11. RESPONSE
    // ==========================================================

    return res.status(201).json({

      success: true,

      message:
        "Resume uploaded, analyzed and saved successfully",


      // ========================================================
      // DATABASE ID
      // ========================================================

      databaseId:
        savedResume._id,


      // ========================================================
      // RESUME INFORMATION
      // ========================================================

      resume: {

        id:
          savedResume._id,

        fileName:
          savedResume.fileName,

        originalName:
          savedResume.originalName,

        fileSize:
          savedResume.fileSize,

        mimetype:
          savedResume.mimetype,

        atsScore:
          savedResume.atsScore,

        grade:
          savedResume.grade,

        analysis:
          savedResume.analysis,

        createdAt:
          savedResume.createdAt,

      },


      // ========================================================
      // EXTRACTED TEXT
      // ========================================================

      resumeText:
        resumeText,

    });


  } catch (error) {

    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    console.error(
      "\n================================================"
    );

    console.error(
      "        RESUME PROCESSING ERROR"
    );

    console.error(
      "================================================"
    );

    console.error(
      "Error Name:",
      error.name
    );

    console.error(
      "Error Message:",
      error.message
    );

    console.error(
      "Error Stack:",
      error.stack
    );

    console.error(
      "================================================\n"
    );


    // ==========================================================
    // CLEANUP UPLOADED FILE
    // ==========================================================

    try {
      if (
        uploadedFilePath &&
        fs.existsSync(uploadedFilePath)
      ) {
        fs.unlinkSync(
          uploadedFilePath
        );

        console.log(
          "🧹 Uploaded PDF cleaned up"
        );
      }
    } catch (cleanupError) {
      console.error(
        "PDF cleanup error:",
        cleanupError.message
      );
    }


    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Unable to process resume",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.stack
          : undefined,

    });
  }
};


// ============================================================
// POST /api/upload
// ============================================================
//
// Authorization:
// Bearer <JWT_TOKEN>
//
// Form-data:
// resume = PDF file
// ============================================================

router.post(
  "/",
  protect,
  upload.single("resume"),
  uploadResume
);


// ============================================================
// POST /api/upload/resume
// ============================================================

router.post(
  "/resume",
  protect,
  upload.single("resume"),
  uploadResume
);


// ============================================================
// INVALID ROUTE HANDLER
// ============================================================

router.use(
  (req, res) => {

    return res.status(404).json({

      success: false,

      message:
        `Upload route not found: ${req.method} ${req.originalUrl}`,

    });
  }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;

