// ============================================================
// AI RESUME ANALYZER
// TAILORED RESUME CONTROLLER
// STEP 31
// ============================================================
//
// Handles:
//
// POST /api/tailored-resume
// POST /api/tailored-resume/pdf
//
// Flow:
//
// User
// ↓
// Resume ownership
// ↓
// Resume text
// ↓
// Resume parser
// ↓
// Job matcher
// ↓
// Tailored resume builder
// ↓
// JSON / PDF
//
// ============================================================

const Resume = require("../models/Resume");

const {
  parseResume,
} = require("../services/resumeParser");

const {
  matchResumeToJob,
} = require("../services/jobMatcher");

const {
  buildTailoredResume,
} = require("../services/tailoredResumeBuilder");

const {
  generateResumePDF,
} = require("../services/resumePdfService");


// ============================================================
// HELPER
// ============================================================

function getUserId(req) {

  return (
    req.user?._id ||
    req.user?.id
  );
}


// ============================================================
// GET RESUME TEXT
// ============================================================

async function getResumeText({
  resumeId,
  resumeText,
  userId,
}) {

  // ----------------------------------------------------------
  // If resumeId is provided, ALWAYS verify ownership.
  // ----------------------------------------------------------

  if (resumeId) {

    const resume =
      await Resume.findOne({
        _id: resumeId,
        user: userId,
      });


    if (!resume) {

      const error =
        new Error(
          "Resume not found."
        );

      error.statusCode = 404;

      throw error;
    }


    // --------------------------------------------------------
    // Support different Resume model field names
    // --------------------------------------------------------

    const databaseResumeText =
      resume.resumeText ||
      resume.text ||
      resume.extractedText ||
      resume.content ||
      "";


    if (
      databaseResumeText &&
      typeof databaseResumeText === "string"
    ) {

      return databaseResumeText.trim();
    }
  }


  // ----------------------------------------------------------
  // Otherwise use resumeText from request
  // ----------------------------------------------------------

  if (
    resumeText &&
    typeof resumeText === "string"
  ) {

    return resumeText.trim();
  }


  return "";
}


// ============================================================
// VALIDATE JOB DESCRIPTION
// ============================================================

function validateJobDescription(
  jobDescription
) {

  if (
    !jobDescription ||
    typeof jobDescription !== "string" ||
    !jobDescription.trim()
  ) {

    const error =
      new Error(
        "Job description is required."
      );

    error.statusCode = 400;

    throw error;
  }


  return jobDescription.trim();
}


// ============================================================
// GENERATE TAILORED RESUME
// ============================================================
//
// POST /api/tailored-resume
//
// ============================================================

const generateTailoredResume =
  async (
    req,
    res
  ) => {

    try {

      console.log(
        "\n================================================"
      );

      console.log(
        "      TAILORED RESUME GENERATION"
      );

      console.log(
        "================================================"
      );


      // ======================================================
      // USER
      // ======================================================

      const userId =
        getUserId(req);


      if (!userId) {

        return res.status(401).json({

          success: false,

          message:
            "User authentication required.",
        });
      }


      // ======================================================
      // REQUEST BODY
      // ======================================================

      const {
        resumeId,
        resumeText,
        jobDescription,
      } =
        req.body || {};


      // ======================================================
      // JOB DESCRIPTION
      // ======================================================

      const finalJobDescription =
        validateJobDescription(
          jobDescription
        );


      // ======================================================
      // RESUME TEXT
      // ======================================================

      const finalResumeText =
        await getResumeText({

          resumeId,

          resumeText,

          userId,
        });


      if (
        !finalResumeText
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Resume text is required.",
        });
      }


      // ======================================================
      // LOG REQUEST
      // ======================================================

      console.log(
        "User:",
        String(userId)
      );

      console.log(
        "Resume ID:",
        resumeId || "Not provided"
      );

      console.log(
        "Resume text length:",
        finalResumeText.length
      );

      console.log(
        "Job description length:",
        finalJobDescription.length
      );


      // ======================================================
      // PARSE RESUME
      // ======================================================

      console.log(
        "\nParsing resume..."
      );


      const parsedResume =
        parseResume(
          finalResumeText
        );


      if (
        !parsedResume ||
        typeof parsedResume !== "object"
      ) {

        return res.status(500).json({

          success: false,

          message:
            "Unable to parse resume.",
        });
      }


      // ======================================================
      // JOB MATCHING
      // ======================================================

      console.log(
        "Matching resume with job..."
      );


      const matchResult =
        matchResumeToJob({

          resumeText:
            finalResumeText,

          jobDescription:
            finalJobDescription,
        });


      // ======================================================
      // BUILD TAILORED RESUME
      // ======================================================

      console.log(
        "Building tailored resume..."
      );


      const tailoredResume =
        buildTailoredResume(

          parsedResume,

          finalJobDescription

        );


      if (
        !tailoredResume ||
        typeof tailoredResume !== "object"
      ) {

        return res.status(500).json({

          success: false,

          message:
            "Unable to generate tailored resume.",
        });
      }


      // ======================================================
      // DEBUG
      // ======================================================

      console.log(
        "\n>>> TAILORED RESUME CHECK <<<"
      );

      console.log(
        "Candidate:",
        tailoredResume.name ||
          "Not detected"
      );

      console.log(
        "Skills:",
        Array.isArray(
          tailoredResume.skills
        )
          ? tailoredResume.skills.length
          : 0
      );

      console.log(
        "Experience:",
        Array.isArray(
          tailoredResume.experience
        )
          ? tailoredResume.experience.length
          : 0
      );

      console.log(
        "Projects:",
        Array.isArray(
          tailoredResume.projects
        )
          ? tailoredResume.projects.length
          : 0
      );

      console.log(
        "Education:",
        Array.isArray(
          tailoredResume.education
        )
          ? tailoredResume.education.length
          : 0
      );


      // ======================================================
      // FINAL RESPONSE
      // ======================================================

      console.log(
        "\nTailored resume generated successfully."
      );

      console.log(
        "================================================\n"
      );


      return res.status(200).json({

        success: true,

        message:
          "Tailored resume generated successfully.",

        data: {

          resume:
            tailoredResume,

          match:
            matchResult,

          originalResume:
            parsedResume,

          jobDescription:
            finalJobDescription,

          resumeId:
            resumeId || null,
        },
      });

    } catch (error) {

      console.error(
        "\n================================================"
      );

      console.error(
        "      TAILORED RESUME ERROR"
      );

      console.error(
        "================================================"
      );

      console.error(
        error
      );

      console.error(
        "================================================\n"
      );


      const statusCode =
        error.statusCode || 500;


      return res.status(
        statusCode
      ).json({

        success: false,

        message:
          error.message ||
          "Failed to generate tailored resume.",
      });
    }
  };


// ============================================================
// GENERATE TAILORED RESUME PDF
// ============================================================
//
// POST /api/tailored-resume/pdf
//
// ============================================================

const generateTailoredResumePDF =
  async (
    req,
    res
  ) => {

    try {

      console.log(
        "\n================================================"
      );

      console.log(
        "      TAILORED RESUME PDF"
      );

      console.log(
        "================================================"
      );


      // ======================================================
      // USER
      // ======================================================

      const userId =
        getUserId(req);


      if (!userId) {

        return res.status(401).json({

          success: false,

          message:
            "User authentication required.",
        });
      }


      // ======================================================
      // REQUEST BODY
      // ======================================================

      const {
        resumeId,
        resumeText,
        jobDescription,
      } =
        req.body || {};


      // ======================================================
      // JOB DESCRIPTION
      // ======================================================

      const finalJobDescription =
        validateJobDescription(
          jobDescription
        );


      // ======================================================
      // RESUME TEXT
      // ======================================================

      const finalResumeText =
        await getResumeText({

          resumeId,

          resumeText,

          userId,
        });


      if (
        !finalResumeText
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Resume text is required.",
        });
      }


      // ======================================================
      // PARSE
      // ======================================================

      console.log(
        "Parsing resume for PDF..."
      );


      const parsedResume =
        parseResume(
          finalResumeText
        );


      if (
        !parsedResume ||
        typeof parsedResume !== "object"
      ) {

        return res.status(500).json({

          success: false,

          message:
            "Unable to parse resume for PDF.",
        });
      }


      // ======================================================
      // BUILD TAILORED RESUME
      // ======================================================

      console.log(
        "Building tailored resume for PDF..."
      );


      const tailoredResume =
        buildTailoredResume(

          parsedResume,

          finalJobDescription

        );


      if (
        !tailoredResume ||
        typeof tailoredResume !== "object"
      ) {

        return res.status(500).json({

          success: false,

          message:
            "Unable to generate tailored resume for PDF.",
        });
      }


      // ======================================================
      // DEBUG PDF DATA
      // ======================================================

      console.log(
        "\n>>> PDF DATA CHECK <<<"
      );

      console.log(
        "Candidate:",
        tailoredResume.name ||
          "Not detected"
      );

      console.log(
        "Summary:",
        Boolean(
          tailoredResume.summary
        )
      );

      console.log(
        "Skills:",
        Array.isArray(
          tailoredResume.skills
        )
          ? tailoredResume.skills.length
          : 0
      );

      console.log(
        "Experience:",
        Array.isArray(
          tailoredResume.experience
        )
          ? tailoredResume.experience.length
          : 0
      );

      console.log(
        "Education:",
        Array.isArray(
          tailoredResume.education
        )
          ? tailoredResume.education.length
          : 0
      );

      console.log(
        "Certifications:",
        Array.isArray(
          tailoredResume.certifications
        )
          ? tailoredResume.certifications.length
          : 0
      );


      // ======================================================
      // GENERATE PDF
      // ======================================================

      console.log(
        "\nGenerating professional tailored resume PDF..."
      );


      generateResumePDF(
        tailoredResume,
        res
      );


      console.log(
        "PDF generation started."
      );

    } catch (error) {

      console.error(
        "\n================================================"
      );

      console.error(
        "      TAILORED RESUME PDF ERROR"
      );

      console.error(
        "================================================"
      );

      console.error(
        error
      );

      console.error(
        "================================================\n"
      );


      // ------------------------------------------------------
      // Do not send JSON after PDF stream has started
      // ------------------------------------------------------

      if (
        res.headersSent
      ) {

        return;
      }


      const statusCode =
        error.statusCode || 500;


      return res.status(
        statusCode
      ).json({

        success: false,

        message:
          error.message ||
          "Failed to generate tailored resume PDF.",
      });
    }
  };


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  generateTailoredResume,

  generateTailoredResumePDF,

};