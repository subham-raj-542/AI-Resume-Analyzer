// ============================================================
// AI RESUME ANALYZER
// JOB MATCHER ROUTE
// STEP 29
// ============================================================

const express = require("express");

const {
  matchResumeToJob,
} = require("../services/jobMatcher");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// POST /api/job-matcher
// ============================================================
//
// Receives:
//
// {
//   resumeText: "...",
//   jobDescription: "..."
// }
//
// Requires:
//
// Authorization: Bearer <token>
//
// Returns:
//
// - Match Score
// - Match Level
// - Keyword Score
// - Skill Score
// - Experience Score
// - Role Score
// - Matched Keywords
// - Missing Keywords
// - Matched Skills
// - Missing Skills
// - Recommendations
//
// ============================================================

router.post("/", protect, async (req, res) => {

  try {

    console.log("\n========================================");
    console.log("        JOB MATCHER REQUEST");
    console.log("========================================");

    // ========================================================
    // REQUEST DATA
    // ========================================================

    const {
      resumeText,
      jobDescription,
    } = req.body;


    console.log(
      "Authenticated User ID:",
      req.user.id
    );

    console.log(
      "Resume text received:",
      Boolean(resumeText)
    );

    console.log(
      "Job description received:",
      Boolean(jobDescription)
    );


    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      !resumeText ||
      typeof resumeText !== "string" ||
      !resumeText.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Resume text is required",

      });
    }


    if (
      !jobDescription ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Job description is required",

      });
    }


    // ========================================================
    // LIMIT VERY LARGE INPUT
    // ========================================================

    if (
      resumeText.length > 100000
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Resume text is too large",

      });
    }


    if (
      jobDescription.length > 100000
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Job description is too large",

      });
    }


    // ========================================================
    // RUN JOB MATCHER
    // ========================================================

    const result =
      matchResumeToJob(
        resumeText,
        jobDescription
      );


    // ========================================================
    // RESPONSE
    // ========================================================

    console.log(
      "Job Match Score:",
      result.matchScore
    );

    console.log(
      "Match Level:",
      result.matchLevel
    );

    console.log(
      "Matched Skills:",
      result.matchedSkills.length
    );

    console.log(
      "Missing Skills:",
      result.missingSkills.length
    );

    console.log("========================================\n");


    return res.status(200).json({

      success: true,

      result,

    });

  } catch (error) {

    console.error(
      "\n========================================"
    );

    console.error(
      "JOB MATCHER ERROR"
    );

    console.error(
      "========================================"
    );

    console.error(
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Unable to analyze job match",

    });

  }

});


module.exports = router;