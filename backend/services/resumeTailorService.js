// ============================================================
// RESUME TAILOR SERVICE
// ============================================================
//
// Input:
// - Resume Text
// - Job Description
//
// Output:
// - Tailored Resume
// - Match Information
// - Improvements
// ============================================================


// ============================================================
// NORMALIZE TEXT
// ============================================================

const normalizeText = (text = "") => {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};


// ============================================================
// EXTRACT WORDS
// ============================================================

const extractWords = (text = "") => {
  return normalizeText(text)
    .split(" ")
    .filter(
      (word) =>
        word.length >= 3
    );
};


// ============================================================
// COMMON STOP WORDS
// ============================================================

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "you",
  "are",
  "our",
  "will",
  "have",
  "has",
  "was",
  "were",
  "been",
  "their",
  "they",
  "them",
  "his",
  "her",
  "its",
  "into",
  "about",
  "using",
  "used",
  "use",
  "work",
  "working",
  "role",
  "job",
  "candidate",
  "team",
  "years",
  "year",
  "required",
  "requirements",
  "responsibilities",
  "experience",
  "skills",
  "skill",
  "looking",
  "strong",
  "good",
  "ability",
  "knowledge",
  "based",
  "including",
  "such",
  "other",
  "more",
  "than",
  "also",
  "can",
  "should",
  "would",
  "must",
  "who",
  "what",
  "where",
  "when",
  "how",
  "all",
  "any",
  "not",
  "but",
  "our",
  "their",
]);


// ============================================================
// EXTRACT KEYWORDS
// ============================================================

const extractKeywords = (
  jobDescription = ""
) => {
  const words =
    extractWords(
      jobDescription
    );

  const frequency = {};

  words.forEach(
    (word) => {
      if (
        STOP_WORDS.has(word)
      ) {
        return;
      }

      frequency[word] =
        (frequency[word] || 0) + 1;
    }
  );

  return Object.entries(
    frequency
  )
    .sort(
      (a, b) =>
        b[1] - a[1]
    )
    .map(
      ([word]) => word
    )
    .slice(0, 40);
};


// ============================================================
// COMMON TECH SKILLS
// ============================================================

const COMMON_SKILLS = [
  "javascript",
  "typescript",
  "react",
  "react.js",
  "next.js",
  "node.js",
  "node",
  "express",
  "express.js",
  "mongodb",
  "mysql",
  "postgresql",
  "sql",
  "python",
  "java",
  "c++",
  "c",
  "html",
  "css",
  "tailwind",
  "tailwindcss",
  "redux",
  "redux toolkit",
  "git",
  "github",
  "docker",
  "aws",
  "azure",
  "gcp",
  "rest api",
  "restful api",
  "api",
  "jwt",
  "figma",
  "vite",
  "webpack",
  "jest",
  "testing",
  "agile",
  "scrum",
  "machine learning",
  "deep learning",
  "data structures",
  "algorithms",
  "oop",
  "oops",
  "communication",
  "leadership",
  "problem solving",
];


// ============================================================
// EXTRACT SKILLS
// ============================================================

const extractSkills = (
  text = ""
) => {
  const normalized =
    normalizeText(text);

  return COMMON_SKILLS.filter(
    (skill) =>
      normalized.includes(
        skill.toLowerCase()
      )
  );
};


// ============================================================
// FIND MATCHED ITEMS
// ============================================================

const findMatchedItems = (
  resumeText,
  jobDescription,
  items
) => {
  const resume =
    normalizeText(
      resumeText
    );

  const job =
    normalizeText(
      jobDescription
    );

  return items.filter(
    (item) =>
      resume.includes(
        item.toLowerCase()
      ) &&
      job.includes(
        item.toLowerCase()
      )
  );
};


// ============================================================
// FIND MISSING ITEMS
// ============================================================

const findMissingItems = (
  resumeText,
  jobDescription,
  items
) => {
  const resume =
    normalizeText(
      resumeText
    );

  const job =
    normalizeText(
      jobDescription
    );

  return items.filter(
    (item) =>
      job.includes(
        item.toLowerCase()
      ) &&
      !resume.includes(
        item.toLowerCase()
      )
  );
};


// ============================================================
// EXTRACT RESUME NAME
// ============================================================

const extractName = (
  resumeText = ""
) => {
  const lines =
    String(resumeText)
      .split("\n")
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);

  if (
    lines.length === 0
  ) {
    return "Candidate";
  }

  const firstLine =
    lines[0];

  if (
    firstLine.length <= 60 &&
    !firstLine.includes("@") &&
    !/\d{3,}/.test(
      firstLine
    )
  ) {
    return firstLine;
  }

  return "Candidate";
};


// ============================================================
// BUILD SUMMARY
// ============================================================

const buildProfessionalSummary = (
  resumeText,
  matchedSkills
) => {
  const name =
    extractName(
      resumeText
    );

  const skills =
    matchedSkills.length > 0
      ? matchedSkills
          .slice(0, 6)
          .join(", ")
      : "relevant technical skills";

  return `${name} is a motivated professional with experience and skills relevant to the target role. Demonstrates practical knowledge of ${skills}, with a focus on problem solving, continuous learning, and delivering effective solutions.`;
};


// ============================================================
// BUILD TAILORED SKILLS
// ============================================================

const buildTailoredSkills = (
  resumeText,
  jobDescription
) => {
  const resumeSkills =
    extractSkills(
      resumeText
    );

  const jobSkills =
    extractSkills(
      jobDescription
    );

  const matchedSkills =
    findMatchedItems(
      resumeText,
      jobDescription,
      jobSkills
    );

  const missingSkills =
    findMissingItems(
      resumeText,
      jobDescription,
      jobSkills
    );

  return {
    resumeSkills,
    jobSkills,
    matchedSkills,
    missingSkills,
  };
};


// ============================================================
// BUILD TAILORED RESUME
// ============================================================

const buildTailoredResume = ({
  resumeText = "",
  jobDescription = "",
}) => {
  if (
    !resumeText.trim()
  ) {
    throw new Error(
      "Resume text is required."
    );
  }

  if (
    !jobDescription.trim()
  ) {
    throw new Error(
      "Job description is required."
    );
  }

  // ----------------------------------------------------------
  // SKILLS
  // ----------------------------------------------------------

  const skillData =
    buildTailoredSkills(
      resumeText,
      jobDescription
    );

  // ----------------------------------------------------------
  // KEYWORDS
  // ----------------------------------------------------------

  const jobKeywords =
    extractKeywords(
      jobDescription
    );

  const matchedKeywords =
    findMatchedItems(
      resumeText,
      jobDescription,
      jobKeywords
    );

  const missingKeywords =
    findMissingItems(
      resumeText,
      jobDescription,
      jobKeywords
    );

  // ----------------------------------------------------------
  // SCORE
  // ----------------------------------------------------------

  const totalSkills =
    skillData.jobSkills.length;

  const skillScore =
    totalSkills > 0
      ? Math.round(
          (skillData.matchedSkills
            .length /
            totalSkills) *
            100
        )
      : 0;

  const totalKeywords =
    jobKeywords.length;

  const keywordScore =
    totalKeywords > 0
      ? Math.round(
          (matchedKeywords.length /
            totalKeywords) *
            100
        )
      : 0;

  const tailoringScore =
    Math.round(
      skillScore * 0.6 +
        keywordScore * 0.4
    );

  // ----------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------

  const summary =
    buildProfessionalSummary(
      resumeText,
      skillData.matchedSkills
    );

  // ----------------------------------------------------------
  // RESULT
  // ----------------------------------------------------------

  return {
    success: true,

    tailoredResume: {
      name: extractName(
        resumeText
      ),

      summary,

      skills:
        skillData.resumeSkills,

      recommendedSkills:
        skillData.missingSkills,

      keywords:
        matchedKeywords,

      recommendedKeywords:
        missingKeywords,
    },

    match: {
      tailoringScore,
      skillScore,
      keywordScore,

      matchedSkills:
        skillData.matchedSkills,

      missingSkills:
        skillData.missingSkills,

      matchedKeywords,

      missingKeywords,
    },

    metadata: {
      resumeTextLength:
        resumeText.length,

      jobDescriptionLength:
        jobDescription.length,

      totalJobSkills:
        totalSkills,

      totalJobKeywords:
        totalKeywords,
    },
  };
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  buildTailoredResume,
  extractKeywords,
  extractSkills,
};