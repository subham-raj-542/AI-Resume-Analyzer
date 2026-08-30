
// ============================================================
// AI RESUME ANALYZER
// RESUME TAILOR ROUTES
// ============================================================
//
// PURPOSE:
//
// ✅ Load selected saved resume
// ✅ Validate target job description
// ✅ Send resume + JD to tailoring service
// ✅ Return customized resume
//
// THIS ROUTE DOES NOT:
//
// ❌ Perform job matching
// ❌ Upload resumes
// ❌ Delete resumes
// ❌ Generate PDF
//
// ============================================================

const express =
  require("express");

const mongoose =
  require("mongoose");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  tailorResume,
} = require("../services/resumeTailor");

const Resume =
  require("../models/Resume");

const router =
  express.Router();

// ============================================================
// HELPERS
// ============================================================

const cleanText = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  ).trim();
};

const safeArray = (
  value
) => {
  return Array.isArray(
    value
  )
    ? value
    : [];
};

const getResumeId = (
  value
) => {
  const cleanId =
    cleanText(
      value
    );

  if (
    !cleanId
  ) {
    return "";
  }

  return mongoose.Types.ObjectId.isValid(
    cleanId
  )
    ? cleanId
    : "";
};

// ============================================================
// POST /api/resume-tailor
// ============================================================
//
// Body:
//
// {
//   resumeId,
//   resumeText,
//   jobDescription
// }
//
// resumeId      → preferred source
// resumeText    → compatibility fallback
// jobDescription → target role
//
// ============================================================

router.post(
  "/",
  protect,
  async (
    req,
    res
  ) => {
    try {
      console.log(
        "\n================================================"
      );

      console.log(
        "             RESUME CUSTOMIZATION"
      );

      console.log(
        "================================================"
      );

      console.log(
        "Authenticated User ID:",
        req.user?.id
      );

      // ======================================================
      // REQUEST DATA
      // ======================================================

      const requestedResumeId =
        getResumeId(
          req.body?.resumeId
        );

      const frontendResumeText =
        cleanText(
          req.body?.resumeText
        );

      const jobDescription =
        cleanText(
          req.body?.jobDescription
        );

      console.log(
        "Resume ID:",
        requestedResumeId ||
          "Not provided"
      );

      console.log(
        "Frontend resume text:",
        frontendResumeText
          ? "Available"
          : "Not available"
      );

      console.log(
        "Job description length:",
        jobDescription.length
      );

      // ======================================================
      // JOB DESCRIPTION VALIDATION
      // ======================================================

      if (
        !jobDescription
      ) {
        return res.status(
          400
        ).json({
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
        return res.status(
          400
        ).json({
          success:
            false,

          message:
            "Job description should contain at least 20 characters.",
        });
      }

      // ======================================================
      // RESOLVE RESUME TEXT
      // ======================================================

      let finalResumeText =
        frontendResumeText;

      let savedResume =
        null;

      // ------------------------------------------------------
      // PREFERRED SOURCE:
      // SAVED RESUME FROM MONGODB
      // ------------------------------------------------------

      if (
        requestedResumeId
      ) {
        savedResume =
          await Resume.findOne({
            _id:
              requestedResumeId,

            user:
              req.user.id,
          });

        if (
          !savedResume
        ) {
          return res.status(
            404
          ).json({
            success:
              false,

            message:
              "Selected resume was not found in your saved resumes.",
          });
        }

        console.log(
          "✅ Selected saved resume found."
        );

        if (
          typeof savedResume.resumeText ===
            "string" &&
          savedResume.resumeText.trim()
        ) {
          finalResumeText =
            savedResume.resumeText;

          console.log(
            "✅ Using resume text from MongoDB."
          );
        } else {
          console.log(
            "⚠ Saved resume has no stored resume text."
          );
        }
      }

      // ======================================================
      // FALLBACK RESUME TEXT
      // ======================================================
      //
      // Kept for compatibility with the frontend.
      //
      // If a valid saved resume exists, MongoDB always wins.
      //
      // ======================================================

      if (
        !finalResumeText
      ) {
        return res.status(
          400
        ).json({
          success:
            false,

          message:
            "Resume text or a saved resume is required.",
        });
      }

      if (
        finalResumeText.length <
        20
      ) {
        return res.status(
          400
        ).json({
          success:
            false,

          message:
            "Resume text is too short to customize.",
        });
      }

      // ======================================================
      // CALL TAILOR SERVICE
      // ======================================================

      console.log(
        "\nRunning resume customization service..."
      );

      const result =
        await Promise.resolve(
          tailorResume(
            finalResumeText,
            jobDescription
          )
        );

      if (
        !result
      ) {
        throw new Error(
          "Resume customization service returned no result."
        );
      }

      // ======================================================
      // EXTRACT CUSTOMIZED RESUME
      // ======================================================

      let tailoredResume =
        null;

      if (
        result?.tailoredResume &&
        typeof result.tailoredResume ===
          "object" &&
        !Array.isArray(
          result.tailoredResume
        )
      ) {
        tailoredResume =
          result.tailoredResume;
      } else if (
        result?.structuredResume &&
        typeof result.structuredResume ===
          "object" &&
        !Array.isArray(
          result.structuredResume
        )
      ) {
        tailoredResume =
          result.structuredResume;
      } else if (
        typeof result ===
          "object" &&
        !Array.isArray(
          result
        )
      ) {
        tailoredResume =
          result;
      }

      if (
        !tailoredResume
      ) {
        throw new Error(
          "Customized resume data was not generated."
        );
      }

      // ======================================================
      // BASIC RESULT CHECK
      // ======================================================

      const customizedName =
        cleanText(
          tailoredResume.name
        );

      const customizedSkills =
        safeArray(
          tailoredResume.skills
        );

      const customizedExperience =
        safeArray(
          tailoredResume.experience
        );

      const customizedProjects =
        safeArray(
          tailoredResume.projects
        );

      const customizedEducation =
        safeArray(
          tailoredResume.education
        );

      const customizedCertifications =
        safeArray(
          tailoredResume.certifications
        );

      const customizedAchievements =
        safeArray(
          tailoredResume.achievements
        );

      const customizedLanguages =
        safeArray(
          tailoredResume.languages
        );

      // ======================================================
      // DEBUG
      // ======================================================

      console.log(
        "\n=============================="
      );

      console.log(
        "CUSTOMIZED RESUME GENERATED"
      );

      console.log(
        "=============================="
      );

      console.log(
        "Name:",
        customizedName ||
          "Not available"
      );

      console.log(
        "Skills:",
        customizedSkills.length
      );

      console.log(
        "Experience:",
        customizedExperience.length
      );

      console.log(
        "Projects:",
        customizedProjects.length
      );

      console.log(
        "Education:",
        customizedEducation.length
      );

      console.log(
        "Certifications:",
        customizedCertifications.length
      );

      console.log(
        "Achievements:",
        customizedAchievements.length
      );

      console.log(
        "Languages:",
        customizedLanguages.length
      );

      console.log(
        "==============================\n"
      );

      // ======================================================
      // RESPONSE
      // ======================================================

      return res.status(
        200
      ).json({
        success:
          true,

        message:
          "Resume customized successfully for the target job.",

        resumeId:
          savedResume?._id ||
          requestedResumeId ||
          null,

        tailoringScore:
          Number(
            tailoredResume?.tailoringScore
          ) || 0,

        result,

        tailoredResume,
      });
    } catch (
      error
    ) {
      console.error(
        "\n================================================"
      );

      console.error(
        "          RESUME CUSTOMIZATION ERROR"
      );

      console.error(
        "================================================"
      );

      console.error(
        "Error Name:",
        error?.name
      );

      console.error(
        "Error Message:",
        error?.message
      );

      console.error(
        "Error Stack:",
        error?.stack
      );

      console.error(
        "================================================\n"
      );

      return res.status(
        Number(
          error?.statusCode
        ) >= 400 &&
        Number(
          error?.statusCode
        ) < 600
          ? Number(
              error.statusCode
            )
          : 500
      ).json({
        success:
          false,

        message:
          error?.message ||
          "Unable to customize resume.",
      });
    }
  }
);

// ============================================================
// INVALID ROUTE
// ============================================================

router.use(
  (
    req,
    res
  ) => {
    return res.status(
      404
    ).json({
      success:
        false,

      message:
        `Resume customization route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;

