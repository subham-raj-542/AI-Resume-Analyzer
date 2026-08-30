
// ============================================================
// AI RESUME ANALYZER
// RESUME TAILOR SERVICE
// FINAL CLEAN VERSION
// ============================================================
//
// PURPOSE:
//
// Resume Text / Parsed Resume
//          +
// Target Job Description
//          ↓
// Resume Parser
//          ↓
// Tailored Resume Builder
//          ↓
// Structured Job-Focused Resume
//
// RESPONSIBILITIES:
//
// ✅ Normalize resume input
// ✅ Validate job description
// ✅ Build tailored resume
// ✅ Normalize result structure
// ✅ Return scores
// ✅ Return matched/missing skills
// ✅ Return matched/missing keywords
// ✅ Preserve resume sections
// ✅ Preserve legacy frontend compatibility
//
// THIS SERVICE DOES NOT:
//
// ❌ Upload files
// ❌ Save files
// ❌ Handle HTTP requests
// ❌ Generate PDFs
//
// ============================================================

const structuredResumeParser =
  require("./structuredResumeParser");

const {
  buildTailoredResume,
} = require("./tailoredResumeBuilder");

// ============================================================
// SAFE TEXT
// ============================================================

function safeText(value = "") {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    return "";
  }

  return String(value).trim();
}

// ============================================================
// SAFE ARRAY
// ============================================================

function safeArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}

// ============================================================
// SAFE OBJECT
// ============================================================

function safeObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  )
    ? value
    : {};
}

// ============================================================
// CLAMP SCORE
// ============================================================

function clampScore(value) {
  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      numericValue
    )
  );
}

// ============================================================
// NORMALIZE RESUME INPUT
// ============================================================
//
// Supported:
//
// 1. Raw resume text
// 2. Already parsed resume object
//
// ============================================================

function normalizeResumeInput(
  resumeInput
) {
  // ----------------------------------------------------------
  // RAW TEXT
  // ----------------------------------------------------------

  if (
    typeof resumeInput ===
    "string"
  ) {
    const cleanText =
      resumeInput.trim();

    if (
      !cleanText
    ) {
      throw new Error(
        "Resume text is required."
      );
    }

    if (
      typeof structuredResumeParser
        .convertResumeTextToParsedResume !==
      "function"
    ) {
      throw new Error(
        "Resume parser is not configured correctly."
      );
    }

    const parsedResume =
      structuredResumeParser
        .convertResumeTextToParsedResume(
          cleanText
        );

    if (
      !parsedResume ||
      typeof parsedResume !==
        "object"
    ) {
      throw new Error(
        "Resume parser returned invalid resume data."
      );
    }

    return parsedResume;
  }

  // ----------------------------------------------------------
  // PARSED OBJECT
  // ----------------------------------------------------------

  if (
    resumeInput &&
    typeof resumeInput ===
      "object" &&
    !Array.isArray(
      resumeInput
    )
  ) {
    if (
      typeof structuredResumeParser
        .normalizeResumeInput ===
      "function"
    ) {
      const normalizedResume =
        structuredResumeParser
          .normalizeResumeInput(
            resumeInput
          );

      return (
        normalizedResume ||
        resumeInput
      );
    }

    return resumeInput;
  }

  throw new Error(
    "Resume text or parsed resume data is required."
  );
}

// ============================================================
// COUNT EXPERIENCE BULLETS
// ============================================================

function countExperienceBullets(
  experience = []
) {
  if (
    !Array.isArray(
      experience
    )
  ) {
    return 0;
  }

  return experience.reduce(
    (
      total,
      job
    ) => {
      const bullets =
        safeArray(
          job?.bullets
        );

      return (
        total +
        bullets.length
      );
    },
    0
  );
}

// ============================================================
// EXTRACT TAILORED RESUME
// ============================================================

function extractTailoredResume(
  result
) {
  if (
    result?.tailoredResume &&
    typeof result.tailoredResume ===
      "object" &&
    !Array.isArray(
      result.tailoredResume
    )
  ) {
    return result.tailoredResume;
  }

  if (
    result?.structuredResume &&
    typeof result.structuredResume ===
      "object" &&
    !Array.isArray(
      result.structuredResume
    )
  ) {
    return result.structuredResume;
  }

  if (
    result &&
    typeof result ===
      "object" &&
    !Array.isArray(
      result
    )
  ) {
    return result;
  }

  return {};
}

// ============================================================
// EXTRACT METADATA
// ============================================================

function extractMetadata(
  result,
  tailoredResume
) {
  if (
    tailoredResume?.metadata &&
    typeof tailoredResume.metadata ===
      "object" &&
    !Array.isArray(
      tailoredResume.metadata
    )
  ) {
    return tailoredResume.metadata;
  }

  if (
    result?.metadata &&
    typeof result.metadata ===
      "object" &&
    !Array.isArray(
      result.metadata
    )
  ) {
    return result.metadata;
  }

  return {};
}

// ============================================================
// NORMALIZE SKILL / KEYWORD LIST
// ============================================================

function normalizeStringList(
  value
) {
  return safeArray(
    value
  )
    .map(
      (item) => {
        if (
          typeof item ===
          "string"
        ) {
          return item.trim();
        }

        if (
          typeof item ===
            "number"
        ) {
          return String(
            item
          );
        }

        if (
          item &&
          typeof item ===
            "object"
        ) {
          return safeText(
            item.name ||
              item.skill ||
              item.keyword ||
              item.title ||
              item.text ||
              item.value ||
              ""
          );
        }

        return "";
      }
    )
    .filter(Boolean);
}

// ============================================================
// MAIN TAILOR FUNCTION
// ============================================================

function tailorResume(
  resumeInput = "",
  jobDescription = ""
) {
  // ==========================================================
  // VALIDATE JOB DESCRIPTION
  // ==========================================================

  const cleanJobDescription =
    safeText(
      jobDescription
    );

  if (
    !cleanJobDescription
  ) {
    throw new Error(
      "Job description is required."
    );
  }

  if (
    cleanJobDescription.length <
    20
  ) {
    throw new Error(
      "Job description should contain at least 20 characters."
    );
  }

  // ==========================================================
  // VALIDATE RESUME
  // ==========================================================

  if (
    !resumeInput
  ) {
    throw new Error(
      "Resume text or parsed resume data is required."
    );
  }

  // ==========================================================
  // PARSE RESUME
  // ==========================================================

  let parsedResume;

  try {
    parsedResume =
      normalizeResumeInput(
        resumeInput
      );
  } catch (
    error
  ) {
    console.error(
      "\n================================================"
    );

    console.error(
      "              RESUME PARSING ERROR"
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

    throw new Error(
      `Resume parsing failed: ${error.message}`
    );
  }

  // ==========================================================
  // INPUT SECTIONS
  // ==========================================================

  const inputSkills =
    safeArray(
      parsedResume?.skills
    );

  const inputExperience =
    safeArray(
      parsedResume?.experience
    );

  const inputProjects =
    safeArray(
      parsedResume?.projects
    );

  const inputEducation =
    safeArray(
      parsedResume?.education
    );

  const inputCertifications =
    safeArray(
      parsedResume?.certifications
    );

  const inputAchievements =
    safeArray(
      parsedResume?.achievements
    );

  const inputLanguages =
    safeArray(
      parsedResume?.languages
    );

  const inputHobbies =
    safeArray(
      parsedResume?.hobbies
    );

  const inputExperienceBullets =
    countExperienceBullets(
      inputExperience
    );

  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log(
    "\n================================================"
  );

  console.log(
    "             RESUME TAILOR REQUEST"
  );

  console.log(
    "================================================"
  );

  console.log(
    "Resume input:",
    typeof resumeInput ===
      "string"
      ? "raw text"
      : "structured object"
  );

  console.log(
    "Resume name:",
    safeText(
      parsedResume?.name
    ) ||
      "Not detected"
  );

  console.log(
    "Skills:",
    inputSkills.length
  );

  console.log(
    "Experience:",
    inputExperience.length
  );

  console.log(
    "Experience bullets:",
    inputExperienceBullets
  );

  console.log(
    "Projects:",
    inputProjects.length
  );

  console.log(
    "Education:",
    inputEducation.length
  );

  console.log(
    "Certifications:",
    inputCertifications.length
  );

  console.log(
    "Achievements:",
    inputAchievements.length
  );

  console.log(
    "Languages:",
    inputLanguages.length
  );

  console.log(
    "Hobbies:",
    inputHobbies.length
  );

  console.log(
    "Job description length:",
    cleanJobDescription.length
  );

  console.log(
    "================================================"
  );

  // ==========================================================
  // BUILD TAILORED RESUME
  // ==========================================================

  let result;

  try {
    console.log(
      "\nBuilding customized resume..."
    );

    result =
      buildTailoredResume(
        parsedResume,
        cleanJobDescription
      );
  } catch (
    error
  ) {
    console.error(
      "\n================================================"
    );

    console.error(
      "       TAILORED RESUME BUILDER ERROR"
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

    throw new Error(
      `Resume tailoring failed: ${error.message}`
    );
  }

  // ==========================================================
  // VALIDATE BUILDER RESULT
  // ==========================================================

  if (
    !result ||
    typeof result !==
      "object"
  ) {
    throw new Error(
      "Tailored resume builder returned an invalid result."
    );
  }

  // ==========================================================
  // EXTRACT FINAL RESUME
  // ==========================================================

  const tailoredResume =
    extractTailoredResume(
      result
    );

  // ==========================================================
  // METADATA
  // ==========================================================

  const metadata =
    extractMetadata(
      result,
      tailoredResume
    );

  // ==========================================================
  // MATCH DATA
  // ==========================================================

  const matchedSkills =
    normalizeStringList(
      metadata.matchedSkills
    );

  const missingSkills =
    normalizeStringList(
      metadata.missingSkills
    );

  const matchedKeywords =
    normalizeStringList(
      metadata.matchedKeywords
    );

  const missingKeywords =
    normalizeStringList(
      metadata.missingKeywords
    );

  // ==========================================================
  // FINAL RESUME ARRAYS
  // ==========================================================

  const finalSkills =
    safeArray(
      tailoredResume?.skills
    );

  const finalExperience =
    safeArray(
      tailoredResume?.experience
    );

  const finalProjects =
    safeArray(
      tailoredResume?.projects
    );

  const finalEducation =
    safeArray(
      tailoredResume?.education
    );

  const finalCertifications =
    safeArray(
      tailoredResume?.certifications
    );

  const finalAchievements =
    safeArray(
      tailoredResume?.achievements
    );

  const finalLanguages =
    safeArray(
      tailoredResume?.languages
    );

  const finalHobbies =
    safeArray(
      tailoredResume?.hobbies
    );

  const finalExperienceBullets =
    countExperienceBullets(
      finalExperience
    );

  // ==========================================================
  // SCORES
  // ==========================================================

  const tailoringScore =
    clampScore(
      result?.tailoringScore ??
        result?.tailorScore ??
        tailoredResume?.tailoringScore
    );

  const skillScore =
    clampScore(
      result?.skillScore ??
        metadata.skillScore
    );

  const keywordScore =
    clampScore(
      result?.keywordScore ??
        metadata.keywordScore
    );

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const professionalSummary =
    safeText(
      result?.professionalSummary ||
        result?.tailoredSummary ||
        tailoredResume?.summary ||
        tailoredResume?.profile ||
        tailoredResume?.objective
    );

  // ==========================================================
  // PRIORITIZED SKILLS
  // ==========================================================

  const prioritizedSkills =
    normalizeStringList(
      result?.prioritizedSkills
    );

  const finalPrioritizedSkills =
    prioritizedSkills.length >
    0
      ? prioritizedSkills
      : normalizeStringList(
          finalSkills
        );

  // ==========================================================
  // SUGGESTIONS
  // ==========================================================

  const experienceSuggestions =
    safeArray(
      result?.experienceSuggestions
    );

  const optimizationNotes =
    safeArray(
      result?.optimizationNotes
    );

  // ==========================================================
  // TAILORED SKILL STATUS
  // ==========================================================

  const tailoredSkills = [
    ...matchedSkills.map(
      (
        skill
      ) => ({
        skill,

        status:
          "matched",

        recommendation:
          "Keep this skill visible because it directly aligns with the target role.",
      })
    ),

    ...missingSkills.map(
      (
        skill
      ) => ({
        skill,

        status:
          "missing",

        recommendation:
          "Add this skill only if you genuinely possess it and can support it with evidence.",
      })
    ),
  ];

  // ==========================================================
  // ATS OPTIMIZATION TIPS
  // ==========================================================

  const atsOptimizationTips = [
    "Use relevant job keywords naturally throughout the resume.",

    "Keep the most relevant skills visible and easy to scan.",

    "Prefer concise, achievement-focused experience bullets.",

    "Use measurable results only when they are truthful.",

    "Do not invent skills, experience, education or achievements.",

    "Keep formatting simple, consistent and ATS-readable.",
  ];

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = {
    ...safeObject(
      result?.statistics
    ),

    matchedSkills:
      matchedSkills.length,

    missingSkills:
      missingSkills.length,

    matchedKeywords:
      matchedKeywords.length,

    missingKeywords:
      missingKeywords.length,

    parsedSkills:
      finalSkills.length,

    parsedExperiences:
      finalExperience.length,

    experienceBullets:
      finalExperienceBullets,

    parsedProjects:
      finalProjects.length,

    parsedEducation:
      finalEducation.length,

    certifications:
      finalCertifications.length,

    achievements:
      finalAchievements.length,

    languages:
      finalLanguages.length,

    hobbies:
      finalHobbies.length,
  };

  // ==========================================================
  // TAILORING SUMMARY
  // ==========================================================

  const tailoringSummary =
    matchedSkills.length >
    0
      ? `Your resume contains ${matchedSkills.length} skill(s) that align with the target job.`
      : "Your resume has limited direct skill overlap with this job.";

  // ==========================================================
  // FINAL RESULT
  // ==========================================================

  const finalResult = {
    // --------------------------------------------------------
    // SCORES
    // --------------------------------------------------------

    tailoringScore,

    tailorScore:
      tailoringScore,

    skillScore,

    keywordScore,

    // --------------------------------------------------------
    // RESUME
    // --------------------------------------------------------

    tailoredResume,

    structuredResume:
      tailoredResume,

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    professionalSummary,

    tailoredSummary:
      professionalSummary,

    tailoringSummary,

    // --------------------------------------------------------
    // SKILLS
    // --------------------------------------------------------

    prioritizedSkills:
      finalPrioritizedSkills,

    prioritySkills:
      finalPrioritizedSkills,

    tailoredSkills,

    matchedSkills,

    missingSkills,

    matchedKeywords,

    missingKeywords,

    // --------------------------------------------------------
    // KEYWORDS
    // --------------------------------------------------------

    atsKeywords: {
      alreadyPresent:
        matchedKeywords,

      considerAdding:
        missingKeywords,
    },

    // --------------------------------------------------------
    // SUGGESTIONS
    // --------------------------------------------------------

    experienceSuggestions,

    optimizationNotes,

    atsOptimizationTips,

    // --------------------------------------------------------
    // STATISTICS
    // --------------------------------------------------------

    statistics,

    // --------------------------------------------------------
    // METADATA
    // --------------------------------------------------------

    metadata,

    // --------------------------------------------------------
    // LEGACY / FRONTEND COMPATIBILITY
    // --------------------------------------------------------

    result:
      result,
  };

  // ==========================================================
  // FINAL DEBUG
  // ==========================================================

  console.log(
    "\n================================================"
  );

  console.log(
    "          RESUME TAILOR RESULT"
  );

  console.log(
    "================================================"
  );

  console.log(
    "Tailoring Score:",
    tailoringScore
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
    "Skills:",
    finalSkills.length
  );

  console.log(
    "Experience:",
    finalExperience.length
  );

  console.log(
    "Experience Bullets:",
    finalExperienceBullets
  );

  console.log(
    "Projects:",
    finalProjects.length
  );

  console.log(
    "Education:",
    finalEducation.length
  );

  console.log(
    "Certifications:",
    finalCertifications.length
  );

  console.log(
    "Achievements:",
    finalAchievements.length
  );

  console.log(
    "Languages:",
    finalLanguages.length
  );

  console.log(
    "Hobbies:",
    finalHobbies.length
  );

  console.log(
    "================================================\n"
  );

  // ==========================================================
  // RETURN
  // ==========================================================

  return finalResult;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  tailorResume,

  normalizeResumeInput,

  convertResumeTextToParsedResume:
    structuredResumeParser
      .convertResumeTextToParsedResume,

  buildTailoredResume,
};

