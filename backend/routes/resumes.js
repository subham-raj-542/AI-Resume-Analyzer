// ============================================================
// AI RESUME ANALYZER
// RESUME ROUTES
// ============================================================

const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const {
  protect,
} = require("../middleware/authMiddleware");

const Resume = require("../models/Resume");

const upload = require("../middleware/uploadMiddleware");

const {
  extractTextFromPDF,
} = require("../services/pdfService");

const {
  analyzeResume,
} = require("../services/resumeAnalyzer");

// ============================================================
// TAILORED RESUME BUILDER
// ============================================================

const {
  buildTailoredResume,
} = require("../services/tailoredResumeBuilder");

const router = express.Router();


// ============================================================
// HELPER: GET ATS SCORE
// ============================================================

const getATSScore = (analysis) => {
  let score = 0;

  if (typeof analysis?.atsScore === "number") {
    score = analysis.atsScore;
  } else if (typeof analysis?.score === "number") {
    score = analysis.score;
  } else if (typeof analysis?.ats === "number") {
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
// GET ALL RESUMES OF LOGGED-IN USER
// ============================================================
// GET /api/resumes
// ============================================================

router.get(
  "/",
  protect,
  async (req, res) => {
    try {
      console.log("\n========================================");
      console.log("        GET USER RESUMES");
      console.log("========================================");

      console.log(
        "Authenticated User ID:",
        req.user.id
      );

      const resumes = await Resume.find({
        user: req.user.id,
      })
        .sort({
          createdAt: -1,
        })
        .select("-resumeText");

      console.log(
        "Resumes found:",
        resumes.length
      );

      console.log(
        "========================================\n"
      );

      return res.status(200).json({
        success: true,
        count: resumes.length,
        resumes,
      });

    } catch (error) {
      console.error(
        "GET RESUMES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch resumes",
      });
    }
  }
);


// ============================================================
// CREATE / UPLOAD NEW RESUME
// ============================================================
// POST /api/resumes
//
// Authorization:
// Bearer <token>
//
// Form-data:
// resume = PDF file
// ============================================================

router.post(
  "/",
  protect,
  upload.single("resume"),
  async (req, res) => {

    let uploadedFilePath = null;

    try {
      console.log("\n========================================");
      console.log("          UPLOAD NEW RESUME");
      console.log("========================================");

      console.log(
        "Authenticated User ID:",
        req.user.id
      );


      // ========================================================
      // 1. CHECK FILE
      // ========================================================

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload a resume PDF",
        });
      }

      uploadedFilePath =
        req.file.path;


      console.log(
        "Uploaded file:",
        req.file.originalname
      );

      console.log(
        "Saved file:",
        req.file.path
      );


      // ========================================================
      // 2. CHECK PDF
      // ========================================================

      const isPDF =
        req.file.mimetype ===
          "application/pdf" ||
        req.file.originalname
          .toLowerCase()
          .endsWith(".pdf");

      if (!isPDF) {

        try {
          if (
            uploadedFilePath &&
            fs.existsSync(
              uploadedFilePath
            )
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


      // ========================================================
      // 3. EXTRACT TEXT FROM PDF
      // ========================================================

      console.log(
        "Extracting resume text..."
      );

      const resumeText =
        await extractTextFromPDF(
          req.file.path
        );


      if (
        !resumeText ||
        typeof resumeText !== "string" ||
        resumeText.trim().length === 0
      ) {

        try {
          if (
            uploadedFilePath &&
            fs.existsSync(
              uploadedFilePath
            )
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
            "Could not extract text from the uploaded PDF.",
        });
      }


      console.log(
        "Resume text extracted successfully."
      );

      console.log(
        "Resume text length:",
        resumeText.length
      );


      // ========================================================
      // 4. ANALYZE RESUME
      // ========================================================

      console.log(
        "Starting AI resume analysis..."
      );

      const analysis =
        await analyzeResume(
          resumeText
        );


      if (!analysis) {

        try {
          if (
            uploadedFilePath &&
            fs.existsSync(
              uploadedFilePath
            )
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
        "Resume analysis completed."
      );


      // ========================================================
      // 5. ATS SCORE
      // ========================================================

      const atsScore =
        getATSScore(
          analysis
        );


      // ========================================================
      // 6. ATS GRADE
      // ========================================================

      const grade =
        typeof analysis.grade === "string"
          ? analysis.grade
          : calculateGrade(
              atsScore
            );


      // ========================================================
      // 7. CREATE RESUME DOCUMENT
      // ========================================================

      const resumeData = {

        user:
          req.user.id,

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
          resumeText,

        analysis:
          analysis,

        atsScore:
          atsScore,

        grade:
          grade,

        status:
          "analyzed",
      };


      // ========================================================
      // 8. SAVE TO MONGODB
      // ========================================================

      console.log(
        "Saving resume to MongoDB..."
      );

      const resume =
        await Resume.create(
          resumeData
        );


      console.log(
        "Resume saved successfully."
      );

      console.log(
        "MongoDB Resume ID:",
        resume._id
      );


      // ========================================================
      // 9. SUCCESS RESPONSE
      // ========================================================

      return res.status(201).json({

        success: true,

        message:
          "Resume uploaded and analyzed successfully",

        resume,
      });

    } catch (error) {

      console.error(
        "\n========================================"
      );

      console.error(
        "UPLOAD RESUME ERROR"
      );

      console.error(
        "========================================"
      );

      console.error(error);


      // ========================================================
      // CLEANUP
      // ========================================================

      try {

        if (
          uploadedFilePath &&
          fs.existsSync(
            uploadedFilePath
          )
        ) {

          fs.unlinkSync(
            uploadedFilePath
          );

          console.log(
            "Uploaded PDF cleaned up"
          );
        }

      } catch (cleanupError) {

        console.error(
          "File cleanup error:",
          cleanupError.message
        );
      }


      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to upload and analyze resume",
      });
    }
  }
);


// ============================================================
// GET SINGLE RESUME
// ============================================================
// GET /api/resumes/:id
// ============================================================

router.get(
  "/:id",
  protect,
  async (req, res) => {

    try {

      console.log("\n========================================");
      console.log("        GET SINGLE RESUME");
      console.log("========================================");

      console.log(
        "Resume ID:",
        req.params.id
      );

      console.log(
        "User ID:",
        req.user.id
      );


      // ========================================================
      // VALIDATE ID
      // ========================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid resume ID",
        });
      }


      // ========================================================
      // FIND USER'S RESUME
      // ========================================================

      const resume =
        await Resume.findOne({
          _id: req.params.id,
          user: req.user.id,
        });


      if (!resume) {

        return res.status(404).json({
          success: false,
          message:
            "Resume not found",
        });
      }


      return res.status(200).json({
        success: true,
        resume,
      });

    } catch (error) {

      console.error(
        "GET SINGLE RESUME ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch resume",
      });
    }
  }
);


// ============================================================
// TAILOR RESUME FOR JOB DESCRIPTION
// ============================================================
// POST /api/resumes/:id/tailor
//
// Authorization:
// Bearer <token>
//
// Body:
// {
//   "jobDescription": "React Developer ..."
// }
// ============================================================

router.post(
  "/:id/tailor",
  protect,
  async (req, res) => {

    try {

      console.log("\n========================================");
      console.log("        TAILOR RESUME FOR JOB");
      console.log("========================================");

      console.log(
        "Resume ID:",
        req.params.id
      );

      console.log(
        "User ID:",
        req.user.id
      );


      // ========================================================
      // 1. VALIDATE RESUME ID
      // ========================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid resume ID",
        });
      }


      // ========================================================
      // 2. VALIDATE JOB DESCRIPTION
      // ========================================================

      const jobDescription =
        typeof req.body?.jobDescription === "string"
          ? req.body.jobDescription.trim()
          : "";


      if (!jobDescription) {

        return res.status(400).json({
          success: false,
          message:
            "Job description is required",
        });
      }


      if (
        jobDescription.length < 20
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Job description is too short",
        });
      }


      // ========================================================
      // 3. FIND USER'S RESUME
      // ========================================================

      const resume =
        await Resume.findOne({
          _id: req.params.id,
          user: req.user.id,
        });


      if (!resume) {

        return res.status(404).json({
          success: false,
          message:
            "Resume not found",
        });
      }


      // ========================================================
      // 4. CHECK RESUME TEXT
      // ========================================================

      if (
        !resume.resumeText ||
        typeof resume.resumeText !== "string" ||
        !resume.resumeText.trim()
      ) {

        return res.status(422).json({
          success: false,
          message:
            "Resume text is not available for tailoring",
        });
      }


      // ========================================================
      // 5. GET ANALYSIS
      // ========================================================

      const analysis =
        resume.analysis &&
        typeof resume.analysis === "object"
          ? resume.analysis
          : {};


      // ========================================================
      // 6. PREPARE STRUCTURED RESUME
      // ========================================================

      const parsedResume = {

        name:
          analysis.name ||
          "",

        email:
          analysis.email ||
          "",

        phone:
          analysis.phone ||
          "",

        linkedin:
          analysis.linkedin ||
          "",

        github:
          analysis.github ||
          "",

        summary:
          analysis.summary ||
          "",

        skills:
          Array.isArray(
            analysis.skills
          )
            ? analysis.skills
            : [],

        experience:
          Array.isArray(
            analysis.experience
          )
            ? analysis.experience
            : [],

        projects:
          Array.isArray(
            analysis.projects
          )
            ? analysis.projects
            : [],

        education:
          Array.isArray(
            analysis.education
          )
            ? analysis.education
            : [],

        certifications:
          Array.isArray(
            analysis.certifications
          )
            ? analysis.certifications
            : [],

        achievements:
          Array.isArray(
            analysis.achievements
          )
            ? analysis.achievements
            : [],

        languages:
          Array.isArray(
            analysis.languages
          )
            ? analysis.languages
            : [],

        hobbies:
          Array.isArray(
            analysis.hobbies
          )
            ? analysis.hobbies
            : [],
      };


      // ========================================================
      // 7. KEEP RAW RESUME TEXT
      // ========================================================

      parsedResume.rawText =
        resume.resumeText;


      // ========================================================
      // 8. BUILD TAILORED RESUME
      // ========================================================

      console.log(
        "Building tailored resume..."
      );

      const tailoredResume =
        buildTailoredResume(
          parsedResume,
          jobDescription
        );


      if (!tailoredResume) {

        return res.status(500).json({
          success: false,
          message:
            "Unable to build tailored resume",
        });
      }


      // ========================================================
      // 9. CALCULATE MATCH SCORE
      // ========================================================

      const metadata =
        tailoredResume.metadata ||
        {};


      const requiredSkills =
        Array.isArray(
          metadata.requiredSkills
        )
          ? metadata.requiredSkills
          : [];


      const matchedSkills =
        Array.isArray(
          metadata.matchedSkills
        )
          ? metadata.matchedSkills
          : [];


      const missingSkills =
        Array.isArray(
          metadata.missingSkills
        )
          ? metadata.missingSkills
          : [];


      const matchedKeywords =
        Array.isArray(
          metadata.matchedKeywords
        )
          ? metadata.matchedKeywords
          : [];


      const missingKeywords =
        Array.isArray(
          metadata.missingKeywords
        )
          ? metadata.missingKeywords
          : [];


      // ========================================================
      // SKILL SCORE
      // ========================================================

      const skillScore =
        requiredSkills.length > 0
          ? Math.round(
              (
                matchedSkills.length /
                requiredSkills.length
              ) * 100
            )
          : 0;


      // ========================================================
      // KEYWORD SCORE
      // ========================================================

      const totalKeywords =
        matchedKeywords.length +
        missingKeywords.length;


      const keywordScore =
        totalKeywords > 0
          ? Math.round(
              (
                matchedKeywords.length /
                totalKeywords
              ) * 100
            )
          : 0;


      // ========================================================
      // EXPERIENCE SCORE
      // ========================================================

      const experienceCount =
        Array.isArray(
          tailoredResume.experience
        )
          ? tailoredResume.experience.length
          : 0;


      const experienceScore =
        experienceCount > 0
          ? 100
          : 0;


      // ========================================================
      // ROLE SCORE
      // ========================================================

      const roleScore =
        skillScore >= 80
          ? 100
          : skillScore >= 60
          ? 80
          : skillScore >= 40
          ? 60
          : skillScore >= 20
          ? 40
          : 20;


      // ========================================================
      // OVERALL MATCH SCORE
      // ========================================================

      const matchScore =
        Math.round(
          (
            skillScore * 0.40 +
            keywordScore * 0.25 +
            experienceScore * 0.20 +
            roleScore * 0.15
          )
        );


      // ========================================================
      // MATCH LEVEL
      // ========================================================

      let matchLevel =
        "Low Match";


      if (matchScore >= 85) {
        matchLevel =
          "Excellent Match";
      } else if (
        matchScore >= 70
      ) {
        matchLevel =
          "Strong Match";
      } else if (
        matchScore >= 50
      ) {
        matchLevel =
          "Moderate Match";
      }


      // ========================================================
      // MATCH OBJECT
      // ========================================================

      const match = {

        matchScore,

        keywordScore,

        skillScore,

        experienceScore,

        roleScore,

        matchLevel,

        matchedSkills,

        missingSkills,

        matchedKeywords,

        missingKeywords,
      };


      // ========================================================
      // SUCCESS RESPONSE
      // ========================================================

      console.log(
        "Tailored resume generated successfully"
      );

      console.log(
        "Match Score:",
        matchScore
      );

      console.log(
        "Skill Score:",
        skillScore
      );

      console.log(
        "Keyword Score:",
        keywordScore
      );

      console.log(
        "Experience Score:",
        experienceScore
      );

      console.log(
        "Role Score:",
        roleScore
      );

      console.log(
        "========================================\n"
      );


      return res.status(200).json({

        success: true,

        message:
          "Tailored resume generated successfully",

        resumeId:
          resume._id,

        // Frontend-compatible
        data: {

          resume:
            tailoredResume,

          match,

          metadata:
            tailoredResume.metadata,
        },

        // Also keep direct fields
        tailoredResume,

        match,
      });

    } catch (error) {

      console.error(
        "\n========================================"
      );

      console.error(
        "TAILOR RESUME ERROR"
      );

      console.error(
        "========================================"
      );

      console.error(error);


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to generate tailored resume",

      });
    }
  }
);


// ============================================================
// UPDATE / RE-ANALYZE RESUME
// ============================================================
// PUT /api/resumes/:id
// ============================================================

router.put(
  "/:id",
  protect,
  upload.single("resume"),
  async (req, res) => {

    let uploadedFilePath = null;

    try {

      console.log("\n========================================");
      console.log("      UPDATE / RE-ANALYZE RESUME");
      console.log("========================================");

      console.log(
        "Resume ID:",
        req.params.id
      );

      console.log(
        "User ID:",
        req.user.id
      );


      // ========================================================
      // 1. VALIDATE RESUME ID
      // ========================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid resume ID",
        });
      }


      // ========================================================
      // 2. FIND USER'S RESUME
      // ========================================================

      const resume =
        await Resume.findOne({
          _id: req.params.id,
          user: req.user.id,
        });


      if (!resume) {

        return res.status(404).json({
          success: false,
          message:
            "Resume not found",
        });
      }


      // ========================================================
      // 3. CHECK FILE
      // ========================================================

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message:
            "Please upload a new resume PDF",
        });
      }


      uploadedFilePath =
        req.file.path;


      // ========================================================
      // 4. CHECK PDF
      // ========================================================

      const isPDF =
        req.file.mimetype ===
          "application/pdf" ||
        req.file.originalname
          .toLowerCase()
          .endsWith(".pdf");


      if (!isPDF) {

        try {

          if (
            uploadedFilePath &&
            fs.existsSync(
              uploadedFilePath
            )
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


      // ========================================================
      // 5. EXTRACT TEXT
      // ========================================================

      console.log(
        "Extracting new PDF text..."
      );

      const resumeText =
        await extractTextFromPDF(
          req.file.path
        );


      if (
        !resumeText ||
        typeof resumeText !== "string" ||
        resumeText.trim().length === 0
      ) {

        try {

          if (
            uploadedFilePath &&
            fs.existsSync(
              uploadedFilePath
            )
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
            "Could not extract text from the uploaded PDF.",
        });
      }


      // ========================================================
      // 6. ANALYZE NEW RESUME
      // ========================================================

      console.log(
        "Analyzing updated resume..."
      );

      const analysis =
        await analyzeResume(
          resumeText
        );


      if (!analysis) {

        try {

          if (
            uploadedFilePath &&
            fs.existsSync(
              uploadedFilePath
            )
          ) {

            fs.unlinkSync(
              uploadedFilePath
            );
          }

        } catch (cleanupError) {

          console.error(
            "Analysis failure cleanup error:",
            cleanupError.message
          );
        }


        return res.status(500).json({
          success: false,
          message:
            "Resume analysis failed",
        });
      }


      // ========================================================
      // 7. OLD / NEW FILE PATH
      // ========================================================

      const oldFilePath =
        resume.filePath
          ? path.resolve(
              resume.filePath
            )
          : null;


      const newFilePath =
        path.resolve(
          req.file.path
        );


      // ========================================================
      // 8. UPDATE DOCUMENT
      // ========================================================

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
        resumeText;

      resume.analysis =
        analysis;

      resume.status =
        "analyzed";


      // ========================================================
      // ATS SCORE
      // ========================================================

      resume.atsScore =
        getATSScore(
          analysis
        );


      // ========================================================
      // GRADE
      // ========================================================

      resume.grade =
        typeof analysis.grade === "string"
          ? analysis.grade
          : calculateGrade(
              resume.atsScore
            );


      await resume.save();


      // ========================================================
      // 9. DELETE OLD PDF
      // ========================================================

      if (
        oldFilePath &&
        oldFilePath !== newFilePath
      ) {

        try {

          if (
            fs.existsSync(
              oldFilePath
            )
          ) {

            fs.unlinkSync(
              oldFilePath
            );

            console.log(
              "Old PDF deleted"
            );
          }

        } catch (fileError) {

          console.error(
            "Old PDF deletion error:",
            fileError.message
          );
        }
      }


      // ========================================================
      // 10. SUCCESS
      // ========================================================

      console.log(
        "Resume updated successfully"
      );

      console.log(
        "MongoDB Resume ID:",
        resume._id
      );

      console.log(
        "========================================\n"
      );


      return res.status(200).json({

        success: true,

        message:
          "Resume updated and analyzed successfully",

        resume,
      });

    } catch (error) {

      console.error(
        "\n========================================"
      );

      console.error(
        "UPDATE RESUME ERROR"
      );

      console.error(
        "========================================"
      );

      console.error(error);


      // ========================================================
      // CLEANUP NEW FILE
      // ========================================================

      try {

        if (
          uploadedFilePath &&
          fs.existsSync(
            uploadedFilePath
          )
        ) {

          fs.unlinkSync(
            uploadedFilePath
          );

          console.log(
            "New uploaded PDF cleaned up"
          );
        }

      } catch (cleanupError) {

        console.error(
          "New PDF cleanup error:",
          cleanupError.message
        );
      }


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to update resume",
      });
    }
  }
);


// ============================================================
// DELETE RESUME
// ============================================================
// DELETE /api/resumes/:id
// ============================================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {

    try {

      console.log("\n========================================");
      console.log("          DELETE RESUME");
      console.log("========================================");

      console.log(
        "Resume ID:",
        req.params.id
      );

      console.log(
        "User ID:",
        req.user.id
      );


      // ========================================================
      // 1. VALIDATE ID
      // ========================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid resume ID",
        });
      }


      // ========================================================
      // 2. FIND USER'S RESUME
      // ========================================================

      const resume =
        await Resume.findOne({
          _id: req.params.id,
          user: req.user.id,
        });


      if (!resume) {

        return res.status(404).json({
          success: false,
          message:
            "Resume not found",
        });
      }


      // ========================================================
      // 3. DELETE PDF FILE
      // ========================================================

      if (resume.filePath) {

        try {

          const filePath =
            path.resolve(
              resume.filePath
            );


          if (
            fs.existsSync(
              filePath
            )
          ) {

            fs.unlinkSync(
              filePath
            );

            console.log(
              "Resume PDF deleted"
            );
          }

        } catch (fileError) {

          console.error(
            "PDF deletion error:",
            fileError.message
          );
        }
      }


      // ========================================================
      // 4. DELETE DATABASE DOCUMENT
      // ========================================================

      await Resume.deleteOne({
        _id: resume._id,
        user: req.user.id,
      });


      // ========================================================
      // 5. SUCCESS
      // ========================================================

      console.log(
        "Resume deleted from MongoDB"
      );

      console.log(
        "========================================\n"
      );


      return res.status(200).json({

        success: true,

        message:
          "Resume deleted successfully",

        databaseId:
          resume._id,
      });

    } catch (error) {

      console.error(
        "DELETE RESUME ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to delete resume",
      });
    }
  }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;