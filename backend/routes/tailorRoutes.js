
// ============================================================
// AI RESUME ANALYZER
// TAILOR RESUME ROUTES
// ============================================================

const express = require("express");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  tailorResume,
} = require("../services/tailorResume");

const router = express.Router();


// ============================================================
// POST /api/tailor
// ============================================================
//
// Requires:
// Authorization: Bearer <token>
//
// Body:
// {
//   "resumeText": "...",
//   "jobDescription": "..."
// }
//
// ============================================================

router.post(
  "/",
  protect,
  async (req, res) => {

    try {

      console.log("\n========================================");
      console.log("        TAILOR RESUME REQUEST");
      console.log("========================================");

      console.log(
        "Authenticated User ID:",
        req.user.id
      );


      // ========================================================
      // 1. GET INPUT
      // ========================================================

      const {
        resumeText = "",
        jobDescription = "",
      } = req.body;


      // ========================================================
      // 2. VALIDATE RESUME
      // ========================================================

      if (
        !resumeText ||
        !String(resumeText).trim()
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Resume text is required.",
        });
      }


      // ========================================================
      // 3. VALIDATE JOB DESCRIPTION
      // ========================================================

      if (
        !jobDescription ||
        !String(jobDescription).trim()
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Job description is required.",
        });
      }


      // ========================================================
      // 4. TAILOR RESUME
      // ========================================================

      console.log(
        "Resume text length:",
        String(resumeText).length
      );

      console.log(
        "Job description length:",
        String(jobDescription).length
      );

      console.log(
        "\nRunning Tailored Resume Engine..."
      );


      const result =
        tailorResume(
          resumeText,
          jobDescription
        );


      // ========================================================
      // 5. SUCCESS
      // ========================================================

      console.log(
        "\nTailoring completed successfully."
      );

      console.log(
        "Tailoring Score:",
        result.tailoringScore
      );

      console.log(
        "Skill Score:",
        result.skillScore
      );

      console.log(
        "Keyword Score:",
        result.keywordScore
      );

      console.log(
        "========================================\n"
      );


      return res.status(200).json({

        success: true,

        message:
          "Resume tailored successfully.",

        data: result,

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
          "Unable to tailor resume.",

      });
    }
  }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;

