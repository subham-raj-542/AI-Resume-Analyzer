
const express = require("express");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  matchResumeToJob,
} = require("../services/jobMatcher");

const router = express.Router();

// ============================================================
// JOB MATCH ROUTES
// ============================================================
//
// POST /api/job-match
//
// PURPOSE:
//
// ✅ Resume vs Job Description
// ✅ Overall match score
// ✅ Skill match score
// ✅ Keyword match score
// ✅ Matched skills
// ✅ Missing skills
// ✅ Matched keywords
// ✅ Missing keywords
// ✅ Experience comparison
// ✅ Keyword coverage
// ✅ Skill coverage
// ✅ Priority actions
//
// NOT RESPONSIBLE FOR:
//
// ❌ Resume upload
// ❌ Resume storage
// ❌ Resume customization
// ❌ PDF generation
//
// ============================================================


// ============================================================
// HELPERS
// ============================================================

const cleanText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};


// ============================================================
// SAFE ARRAY
// ============================================================

const safeArray = (value) => {
  return Array.isArray(value)
    ? value
    : [];
};


// ============================================================
// CLAMP SCORE
// ============================================================

const clampScore = (value) => {
  const score = Number(value);

  if (
    !Number.isFinite(score)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(score)
    )
  );
};


// ============================================================
// POST /api/job-match
// ============================================================

router.post(
  "/",
  protect,
  async (req, res) => {
    try {
      console.log(
        "\n================================================"
      );

      console.log(
        "              JOB MATCH REQUEST"
      );

      console.log(
        "================================================"
      );


      // ======================================================
      // AUTHENTICATED USER
      // ======================================================

      console.log(
        "Authenticated User ID:",
        req.user?.id ||
        req.user?._id ||
        "unknown"
      );


      // ======================================================
      // REQUEST DATA
      // ======================================================

      const resumeText =
        cleanText(
          req.body?.resumeText
        );

      const jobDescription =
        cleanText(
          req.body?.jobDescription
        );


      console.log(
        "Resume text length:",
        resumeText.length
      );

      console.log(
        "Job description length:",
        jobDescription.length
      );


      // ======================================================
      // VALIDATE RESUME
      // ======================================================

      if (
        !resumeText
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Resume text is required.",
        });
      }


      // ======================================================
      // VALIDATE JOB DESCRIPTION
      // ======================================================

      if (
        !jobDescription
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Job description is required.",
        });
      }


      // ======================================================
      // MINIMUM RESUME CONTENT
      // ======================================================

      if (
        resumeText.length <
        20
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Resume text is too short. Please upload a valid resume.",
        });
      }


      // ======================================================
      // MINIMUM JOB DESCRIPTION CONTENT
      // ======================================================

      if (
        jobDescription.length <
        20
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Job description is too short. Please paste a complete job description.",
        });
      }


      // ======================================================
      // RUN MATCH ENGINE
      // ======================================================

      console.log(
        "Running job matcher..."
      );


      const result =
        await Promise.resolve(
          matchResumeToJob({
            resumeText,
            jobDescription,
          })
        );


      // ======================================================
      // VALIDATE MATCHER RESULT
      // ======================================================

      if (
        !result ||
        typeof result !==
          "object" ||
        Array.isArray(result)
      ) {
        throw new Error(
          "Job matcher did not return a valid result."
        );
      }


      // ======================================================
      // NORMALIZE ARRAYS
      // ======================================================

      const matchedKeywords =
        safeArray(
          result.matchedKeywords
        );

      const missingKeywords =
        safeArray(
          result.missingKeywords
        );

      const matchedSkills =
        safeArray(
          result.matchedSkills
        );

      const missingSkills =
        safeArray(
          result.missingSkills
        );


      // ======================================================
      // NORMALIZE SCORES
      // ======================================================

      const matchScore =
        clampScore(
          result.matchScore
        );

      const skillScore =
        clampScore(
          result.skillScore
        );

      const keywordScore =
        clampScore(
          result.keywordScore
        );


      // ======================================================
      // MATCH LEVEL
      // ======================================================

      let matchLevel =
        cleanText(
          result.matchLevel
        );

      if (
        !matchLevel
      ) {
        if (
          matchScore >=
          85
        ) {
          matchLevel =
            "Excellent Match";
        } else if (
          matchScore >=
          70
        ) {
          matchLevel =
            "Strong Match";
        } else if (
          matchScore >=
          50
        ) {
          matchLevel =
            "Moderate Match";
        } else {
          matchLevel =
            "Low Match";
        }
      }


      // ======================================================
      // SUMMARY
      // ======================================================

      const summary =
        cleanText(
          result.summary ||
          result.matchMessage
        );


      // ======================================================
      // KEYWORD COVERAGE
      // ======================================================

      const totalKeywords =
        matchedKeywords.length +
        missingKeywords.length;


      const keywordCoverage = {
        matched:
          matchedKeywords.length,

        total:
          totalKeywords,

        percentage:
          totalKeywords >
          0
            ? Math.round(
                (
                  matchedKeywords.length /
                  totalKeywords
                ) *
                100
              )
            : keywordScore,
      };


      // ======================================================
      // SKILL COVERAGE
      // ======================================================

      const totalSkills =
        matchedSkills.length +
        missingSkills.length;


      const skillCoverage = {
        matched:
          matchedSkills.length,

        total:
          totalSkills,

        percentage:
          totalSkills >
          0
            ? Math.round(
                (
                  matchedSkills.length /
                  totalSkills
                ) *
                100
              )
            : skillScore,
      };


      // ======================================================
      // EXPERIENCE MATCH
      // ======================================================

      const experienceMatch =
        result.experienceMatch &&
        typeof result.experienceMatch ===
          "object"
          ? result.experienceMatch
          : null;


      // ======================================================
      // PRIORITY ACTIONS
      // ======================================================

      const priorityActions = [];


      // ------------------------------------------------------
      // MISSING SKILLS
      // ------------------------------------------------------

      if (
        missingSkills.length >
        0
      ) {
        priorityActions.push({
          type:
            "skill",

          priority:
            "high",

          action:
            `Review missing skills: ${missingSkills
              .slice(
                0,
                6
              )
              .join(
                ", "
              )}.`,
        });
      }


      // ------------------------------------------------------
      // MISSING KEYWORDS
      // ------------------------------------------------------

      if (
        missingKeywords.length >
        0
      ) {
        priorityActions.push({
          type:
            "keyword",

          priority:
            "medium",

          action:
            `Use relevant job keywords where they truthfully describe your experience: ${missingKeywords
              .slice(
                0,
                6
              )
              .join(
                ", "
              )}.`,
        });
      }


      // ------------------------------------------------------
      // EXPERIENCE
      // ------------------------------------------------------

      if (
        experienceMatch &&
        Number(
          experienceMatch.requiredYears
        ) > 0 &&
        clampScore(
          experienceMatch.score
        ) < 100
      ) {
        priorityActions.push({
          type:
            "experience",

          priority:
            "high",

          action:
            `The role asks for approximately ${experienceMatch.requiredYears} years of experience, while your resume indicates about ${experienceMatch.resumeYears || 0} years.`,
        });
      }


      // ------------------------------------------------------
      // LOW KEYWORD SCORE
      // ------------------------------------------------------

      if (
        keywordScore <
        60
      ) {
        priorityActions.push({
          type:
            "keyword",

          priority:
            "high",

          action:
            "Improve job-specific keyword coverage throughout the resume where those terms genuinely apply.",
        });
      }


      // ------------------------------------------------------
      // LOW SKILL SCORE
      // ------------------------------------------------------

      if (
        skillScore <
        60
      ) {
        priorityActions.push({
          type:
            "skill",

          priority:
            "high",

          action:
            "Strengthen the skills section with relevant skills you genuinely possess and can support with evidence.",
        });
      }


      // ------------------------------------------------------
      // LOW OVERALL SCORE
      // ------------------------------------------------------

      if (
        matchScore <
        70
      ) {
        priorityActions.push({
          type:
            "overall",

          priority:
            "high",

          action:
            "Customize the resume more closely around the responsibilities and requirements of this role.",
        });
      }


      // ======================================================
      // FINAL RESULT
      // ======================================================

      const finalResult = {
        ...result,

        matchScore,

        skillScore,

        keywordScore,

        matchLevel,

        summary,

        matchedSkills,

        missingSkills,

        matchedKeywords,

        missingKeywords,

        experienceMatch,

        keywordCoverage,

        skillCoverage,

        priorityActions,
      };


      // ======================================================
      // SUCCESS LOG
      // ======================================================

      console.log(
        "\n================================================"
      );

      console.log(
        "             JOB MATCH SUCCESS"
      );

      console.log(
        "================================================"
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
        "Matched Skills:",
        matchedSkills.length
      );

      console.log(
        "Missing Skills:",
        missingSkills.length
      );

      console.log(
        "Matched Keywords:",
        matchedKeywords.length
      );

      console.log(
        "Missing Keywords:",
        missingKeywords.length
      );

      console.log(
        "================================================\n"
      );


      // ======================================================
      // SUCCESS RESPONSE
      // ======================================================

      return res.status(200).json({
        success:
          true,

        message:
          "Resume matched with job successfully.",

        result:
          finalResult,
      });

    } catch (
      error
    ) {
      console.error(
        "\n================================================"
      );

      console.error(
        "               JOB MATCH ERROR"
      );

      console.error(
        "================================================"
      );

      console.error(
        "Error:",
        error?.message ||
        error
      );

      console.error(
        "================================================\n"
      );


      const statusCode =
        Number.isInteger(
          error?.statusCode
        ) &&
        error.statusCode >=
          400 &&
        error.statusCode <=
          599
          ? error.statusCode
          : 500;


      return res.status(
        statusCode
      ).json({
        success:
          false,

        message:
          error?.message ||
          "Failed to match resume with job.",
      });
    }
  }
);


// ============================================================
// INVALID JOB MATCH ROUTE
// ============================================================

router.use(
  (
    req,
    res
  ) => {
    return res.status(404).json({
      success:
        false,

      message:
        `Job match route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);


// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;

