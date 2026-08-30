// ============================================================
// JOB MATCHER SERVICE
// ============================================================
//
// Compares:
// Resume Text
// +
// Job Description
//
// Returns:
// - Match Score
// - Match Level
// - Keyword Score
// - Skill Score
// - Matched Keywords
// - Missing Keywords
// - Matched Skills
// - Missing Skills
//
// ============================================================


// ============================================================
// STOP WORDS
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
  "had",
  "not",
  "but",
  "all",
  "can",
  "who",
  "what",
  "where",
  "when",
  "how",
  "into",
  "about",
  "their",
  "they",
  "them",
  "then",
  "than",
  "also",
  "using",
  "use",
  "used",
  "work",
  "working",
  "years",
  "year",
  "role",
  "job",
  "team",
  "company",
  "experience",
  "required",
  "requirements",
  "candidate",
  "preferred",
  "looking",
  "strong",
  "good",
  "skills",
  "skill",
  "knowledge",
  "ability",
  "responsibilities",
]);


// ============================================================
// COMMON TECHNICAL SKILLS
// ============================================================

const TECHNICAL_SKILLS = [
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
  "html",
  "css",
  "tailwind",
  "tailwind css",
  "redux",
  "redux toolkit",
  "git",
  "github",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "java",
  "python",
  "c",
  "c++",
  "php",
  "go",
  "rust",
  "spring",
  "spring boot",
  "django",
  "flask",
  "laravel",
  "graphql",
  "rest api",
  "restful api",
  "api",
  "jwt",
  "oauth",
  "firebase",
  "redis",
  "machine learning",
  "deep learning",
  "artificial intelligence",
  "ai",
  "data science",
  "pandas",
  "numpy",
  "tensorflow",
  "pytorch",
  "opencv",
  "figma",
  "jest",
  "mocha",
  "cypress",
  "vite",
  "webpack",
  "linux",
  "bash",
  "agile",
  "scrum",
];


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
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(
      (word) =>
        word.length >= 3 &&
        !STOP_WORDS.has(word)
    );
};


// ============================================================
// EXTRACT KEYWORDS
// ============================================================

const extractKeywords = (text = "") => {
  const words = extractWords(text);

  const frequency = {};

  for (const word of words) {
    frequency[word] =
      (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
};


// ============================================================
// EXTRACT TECHNICAL SKILLS
// ============================================================

const extractSkills = (text = "") => {
  const normalized = normalizeText(text);

  const foundSkills = [];

  for (const skill of TECHNICAL_SKILLS) {
    const normalizedSkill =
      normalizeText(skill);

    if (
      normalized.includes(
        normalizedSkill
      )
    ) {
      foundSkills.push(skill);
    }
  }

  return [
    ...new Set(foundSkills),
  ];
};


// ============================================================
// MATCH ITEMS
// ============================================================

const getMatches = (
  resumeItems,
  jobItems
) => {
  const resumeSet = new Set(
    resumeItems.map((item) =>
      item.toLowerCase()
    )
  );

  const matched = [];
  const missing = [];

  for (const item of jobItems) {
    if (
      resumeSet.has(
        item.toLowerCase()
      )
    ) {
      matched.push(item);
    } else {
      missing.push(item);
    }
  }

  return {
    matched,
    missing,
  };
};


// ============================================================
// CALCULATE PERCENTAGE
// ============================================================

const calculatePercentage = (
  matched,
  total
) => {
  if (!total) {
    return 0;
  }

  return Math.round(
    (matched / total) * 100
  );
};


// ============================================================
// GET MATCH LEVEL
// ============================================================

const getMatchLevel = (score) => {
  if (score >= 85) {
    return "Excellent Match";
  }

  if (score >= 70) {
    return "Strong Match";
  }

  if (score >= 55) {
    return "Moderate Match";
  }

  if (score >= 40) {
    return "Weak Match";
  }

  return "Poor Match";
};


// ============================================================
// MAIN JOB MATCHER
// ============================================================

const matchResumeWithJob = (
  resumeText = "",
  jobDescription = ""
) => {
  if (!resumeText.trim()) {
    throw new Error(
      "Resume text is required."
    );
  }

  if (!jobDescription.trim()) {
    throw new Error(
      "Job description is required."
    );
  }


  // ----------------------------------------------------------
  // KEYWORDS
  // ----------------------------------------------------------

  const resumeKeywords =
    extractKeywords(resumeText);

  const jobKeywords =
    extractKeywords(jobDescription);

  const keywordMatches =
    getMatches(
      resumeKeywords,
      jobKeywords
    );


  // ----------------------------------------------------------
  // LIMIT KEYWORDS
  // ----------------------------------------------------------

  const importantJobKeywords =
    jobKeywords.slice(0, 30);

  const importantKeywordMatches =
    getMatches(
      resumeKeywords,
      importantJobKeywords
    );


  // ----------------------------------------------------------
  // SKILLS
  // ----------------------------------------------------------

  const resumeSkills =
    extractSkills(resumeText);

  const jobSkills =
    extractSkills(jobDescription);

  const skillMatches =
    getMatches(
      resumeSkills,
      jobSkills
    );


  // ----------------------------------------------------------
  // SCORES
  // ----------------------------------------------------------

  const keywordScore =
    calculatePercentage(
      importantKeywordMatches.matched.length,
      importantJobKeywords.length
    );

  const skillScore =
    calculatePercentage(
      skillMatches.matched.length,
      jobSkills.length
    );


  // ----------------------------------------------------------
  // OVERALL SCORE
  // ----------------------------------------------------------

  let matchScore = Math.round(
    keywordScore * 0.6 +
    skillScore * 0.4
  );


  // ----------------------------------------------------------
  // IF JOB HAS NO DETECTED SKILLS
  // ----------------------------------------------------------

  if (jobSkills.length === 0) {
    matchScore = keywordScore;
  }


  matchScore = Math.min(
    Math.max(matchScore, 0),
    100
  );


  // ----------------------------------------------------------
  // RESULT
  // ----------------------------------------------------------

  return {
    matchScore,

    matchLevel:
      getMatchLevel(matchScore),

    keywordScore,

    skillScore,

    matchedKeywords:
      importantKeywordMatches.matched,

    missingKeywords:
      importantKeywordMatches.missing,

    matchedSkills:
      skillMatches.matched,

    missingSkills:
      skillMatches.missing,

    resumeSkills,

    requiredSkills:
      jobSkills,

    summary: {
      totalKeywords:
        importantJobKeywords.length,

      matchedKeywords:
        importantKeywordMatches.matched
          .length,

      totalRequiredSkills:
        jobSkills.length,

      matchedSkills:
        skillMatches.matched.length,
    },
  };
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  matchResumeWithJob,
};