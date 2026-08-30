const {
  matchResumeToJob,
} = require("../services/jobMatcher");

// ============================================================
// JOB MATCH CONTROLLER
// ============================================================
//
// POST /api/job-match
//
// Receives:
//
// {
//   resumeText,
//   jobDescription
// }
//
// Returns:
//
// - Match Score
// - Match Level
// - Keyword Score
// - Skill Score
// - Experience Score
// - Matched Keywords
// - Missing Keywords
// - Matched Skills
// - Missing Skills
// - Recommendations
// - Coverage
// - Priority Actions
//
// ============================================================

const jobMatchController = async (req, res) => {
  try {
    console.log("\n================================================");
    console.log("          JOB MATCH REQUEST");
    console.log("================================================");

    // ==========================================================
    // GET DATA
    // ==========================================================

    const {
      resumeText,
      jobDescription,
    } = req.body || {};

    // ==========================================================
    // VALIDATE RESUME
    // ==========================================================

    if (
      !resumeText ||
      typeof resumeText !== "string" ||
      !resumeText.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Resume text is required.",
      });
    }

    // ==========================================================
    // VALIDATE JOB DESCRIPTION
    // ==========================================================

    if (
      !jobDescription ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Job description is required.",
      });
    }

    console.log(
      "Resume characters:",
      resumeText.length
    );

    console.log(
      "Job description characters:",
      jobDescription.length
    );

    // ==========================================================
    // RUN JOB MATCH ENGINE
    // ==========================================================

    const result =
      matchResumeToJob({
        resumeText:
          resumeText.trim(),

        jobDescription:
          jobDescription.trim(),
      });

    // ==========================================================
    // ADD KEYWORD COVERAGE
    // ==========================================================

    const keywordTotal =
      result.summary?.totalKeywords || 0;

    const keywordMatched =
      result.summary?.matchedKeywords || 0;

    const keywordPercentage =
      keywordTotal > 0
        ? Math.round(
            (keywordMatched /
              keywordTotal) *
              100
          )
        : 0;

    // ==========================================================
    // ADD SKILL COVERAGE
    // ==========================================================

    const skillTotal =
      result.summary?.totalRequiredSkills || 0;

    const skillMatched =
      result.summary?.matchedSkills || 0;

    const skillPercentage =
      skillTotal > 0
        ? Math.round(
            (skillMatched /
              skillTotal) *
              100
          )
        : 0;

    // ==========================================================
    // PRIORITY ACTIONS
    // ==========================================================

    const priorityActions = [];

    if (
      result.missingSkills?.length > 0
    ) {
      priorityActions.push({
        priority: "high",
        type: "skills",
        action:
          `Review missing skills: ${result.missingSkills
            .slice(0, 6)
            .join(", ")}`,
      });
    }

    if (
      result.missingKeywords?.length > 0
    ) {
      priorityActions.push({
        priority: "medium",
        type: "keywords",
        action:
          `Review important missing keywords: ${result.missingKeywords
            .slice(0, 6)
            .join(", ")}`,
      });
    }

    if (
      result.experienceMatch &&
      result.experienceMatch.score < 100 &&
      result.experienceMatch.requiredYears > 0
    ) {
      priorityActions.push({
        priority: "high",
        type: "experience",
        action:
          `The job requires approximately ${result.experienceMatch.requiredYears} years of experience, while the resume indicates about ${result.experienceMatch.resumeYears} years.`,
      });
    }

    if (
      result.keywordScore < 60
    ) {
      priorityActions.push({
        priority: "medium",
        type: "keyword-score",
        action:
          "Improve job-specific keyword coverage throughout the resume.",
      });
    }

    if (
      result.skillScore < 60
    ) {
      priorityActions.push({
        priority: "high",
        type: "skill-score",
        action:
          "Improve alignment with the required skills, but only include skills you genuinely possess.",
      });
    }

    // ==========================================================
    // FINAL RESPONSE
    // ==========================================================

    const finalResult = {
      ...result,

      keywordCoverage: {
        matched:
          keywordMatched,

        total:
          keywordTotal,

        percentage:
          keywordPercentage,
      },

      skillCoverage: {
        matched:
          skillMatched,

        total:
          skillTotal,

        percentage:
          skillPercentage,
      },

      priorityActions:
        priorityActions.slice(
          0,
          8
        ),
    };

    console.log(
      "\n✅ JOB MATCH COMPLETED"
    );

    console.log(
      "Match Score:",
      finalResult.matchScore
    );

    console.log(
      "Match Level:",
      finalResult.matchLevel
    );

    console.log(
      "Skill Score:",
      finalResult.skillScore
    );

    console.log(
      "Keyword Score:",
      finalResult.keywordScore
    );

    console.log(
      "================================================\n"
    );

    return res.status(200).json({
      success: true,

      message:
        "Resume matched with job successfully.",

      result:
        finalResult,
    });

  } catch (error) {

    console.error(
      "\n================================================"
    );

    console.error(
      "        JOB MATCH ERROR"
    );

    console.error(
      "================================================"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to match resume with job.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.stack
          : undefined,
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  jobMatchController,
};