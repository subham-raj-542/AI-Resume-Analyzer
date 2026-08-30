
// ============================================================
// AI RESUME ANALYZER
// ADVANCED JOB DESCRIPTION MATCHER
// FINAL STABLE VERSION
// ============================================================
//
// INPUT:
//
// Resume Text
// +
// Job Description
//
// OUTPUT:
//
// ✅ Match Score
// ✅ Skill Score
// ✅ Keyword Score
// ✅ Experience Score
// ✅ Role Score
// ✅ Matched Skills
// ✅ Missing Skills
// ✅ Matched Keywords
// ✅ Missing Keywords
// ✅ Experience Match
// ✅ Role Match
// ✅ Recommendations
//
// PUBLIC EXPORTS:
//
// matchResumeToJob()
// extractSkills()
// normalizeSkill()
// extractJobKeywords()
//
// These exports are required by:
// tailoredResumeBuilder.js
//
// ============================================================


// ============================================================
// 1. SKILL KEYWORDS
// ============================================================

const SKILL_KEYWORDS = [
  // Programming
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "c++",
  "c#",
  ".net",

  // Frontend
  "html",
  "css",
  "react",
  "react.js",
  "next.js",
  "redux",
  "redux toolkit",
  "tailwind",
  "tailwind css",
  "bootstrap",
  "vite",
  "vue",
  "angular",

  // Backend
  "node",
  "node.js",
  "express",
  "express.js",

  // Database
  "mongodb",
  "mysql",
  "postgresql",
  "sql",
  "redis",
  "firebase",

  // APIs
  "api",
  "rest api",
  "restful api",
  "graphql",

  // Authentication
  "jwt",
  "jwt authentication",
  "oauth",

  // DevOps / Cloud
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "git",
  "github",
  "gitlab",
  "ci/cd",

  // Data / AI
  "machine learning",
  "deep learning",
  "artificial intelligence",
  "data analysis",
  "data science",
  "data visualization",
  "power bi",
  "excel",

  // Testing
  "jest",
  "mocha",
  "cypress",
  "selenium",
  "testing",

  // Design
  "figma",
  "ui/ux",
  "ui ux",
  "responsive design",
  "responsive web design",

  // General
  "agile",
  "scrum",
  "kanban",
  "communication",
  "communication skills",
  "leadership",
  "teamwork",
  "problem solving",
  "problem-solving",
  "time management",
  "attention to detail",
  "organization",
  "accuracy",

  // Warehouse / Operations
  "logistics",
  "supply chain",
  "inventory",
  "inventory management",
  "inventory tracking",
  "inventory checks",
  "inventory systems",
  "stock management",
  "stock records",
  "cycle counts",

  "warehouse",
  "warehouse operations",
  "warehouse management",
  "warehousing",

  "shipping",
  "shipping and receiving",
  "receiving",

  "dispatch",
  "dispatching",

  "packing",
  "picking",

  "distribution",

  "order fulfillment",
  "order processing",

  "barcode scanning",
  "barcode scanners",

  "record keeping",
  "documentation",

  "loading",
  "unloading",

  "quality control",
  "quality assurance",

  "safety procedures",
  "workplace safety",

  "sanitation",
  "cleaning equipment",

  // Lean / Manufacturing
  "kaizen",
  "gemba",
  "5s",
];


// ============================================================
// 2. EXPERIENCE KEYWORDS
// ============================================================

const EXPERIENCE_KEYWORDS = [
  "experience",
  "years of experience",
  "professional experience",
  "work experience",
  "industry experience",
  "relevant experience",

  "internship",
  "intern",

  "developer",
  "engineer",
  "manager",
  "lead",
  "senior",
  "junior",

  "full stack",
  "full-stack",

  "frontend",
  "front end",
  "frontend developer",
  "front end developer",

  "backend",
  "back end",
  "backend developer",
  "back end developer",

  "software engineer",
  "web developer",
];


// ============================================================
// 3. ROLE ALIASES
// ============================================================

const ROLE_ALIASES = {
  "frontend developer": [
    "frontend developer",
    "front end developer",
    "frontend engineer",
    "front-end developer",
    "front-end engineer",
  ],

  "backend developer": [
    "backend developer",
    "back end developer",
    "backend engineer",
    "back-end developer",
    "back-end engineer",
  ],

  "full stack developer": [
    "full stack developer",
    "full-stack developer",
    "fullstack developer",
    "full stack engineer",
    "full-stack engineer",
  ],

  "software engineer": [
    "software engineer",
    "software developer",
  ],

  "web developer": [
    "web developer",
    "web engineer",
  ],

  "data analyst": [
    "data analyst",
    "business analyst",
  ],

  "data scientist": [
    "data scientist",
  ],

  "machine learning engineer": [
    "machine learning engineer",
    "ml engineer",
  ],

  "devops engineer": [
    "devops engineer",
    "devops developer",
    "devops",
  ],

  "ui ux designer": [
    "ui ux designer",
    "ui/ux designer",
    "ux designer",
    "ui designer",
  ],

  "warehouse associate": [
    "warehouse associate",
    "warehouse worker",
    "warehouse operative",
  ],

  "warehouse supervisor": [
    "warehouse supervisor",
    "warehouse lead",
    "warehouse manager",
  ],

  "logistics coordinator": [
    "logistics coordinator",
    "logistics associate",
    "logistics specialist",
  ],

  "inventory specialist": [
    "inventory specialist",
    "inventory associate",
    "inventory coordinator",
  ],

  "operations associate": [
    "operations associate",
    "operations specialist",
  ],

  "supply chain associate": [
    "supply chain associate",
    "supply chain specialist",
  ],
};


// ============================================================
// 4. IMPORTANT JOB PHRASES
// ============================================================

const IMPORTANT_JD_PHRASES = [
  // Technical
  "react.js",
  "react",
  "node.js",
  "node",
  "express.js",
  "express",
  "next.js",
  "redux",
  "redux toolkit",
  "rest api",
  "restful api",
  "mongodb",
  "mysql",
  "postgresql",
  "sql",
  "github",
  "git",
  "tailwind css",
  "tailwind",
  "jwt authentication",
  "jwt",
  "responsive web design",
  "responsive design",
  "full-stack applications",
  "full stack applications",
  "clean code",
  "reusable components",
  "ui components",
  "code reviews",
  "application performance",
  "web applications",
  "software development",
  "vite",
  "html",
  "css",
  "javascript",
  "typescript",

  // AI / Data
  "machine learning",
  "deep learning",
  "artificial intelligence",
  "data analysis",
  "data science",
  "data visualization",
  "power bi",

  // Warehouse
  "warehouse",
  "warehouse operations",
  "warehouse management",

  "inventory",
  "inventory management",
  "inventory tracking",
  "inventory checks",
  "inventory systems",
  "cycle counts",
  "stock records",
  "stock management",

  "logistics",
  "supply chain",

  "shipping",
  "shipping and receiving",
  "receiving",

  "packing",
  "picking",

  "dispatch",
  "dispatching",

  "order fulfillment",
  "order processing",

  "record keeping",
  "documentation",

  "barcode scanning",
  "barcode scanners",

  "safety procedures",
  "workplace safety",

  "quality control",

  "loading",
  "unloading",

  "kaizen",
  "gemba",
  "5s",
  "kanban",

  // Soft skills
  "communication skills",
  "teamwork",
  "leadership",
  "problem solving",
  "time management",
  "attention to detail",
];


// ============================================================
// 5. STOP WORDS
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
  "our",
  "are",
  "will",
  "have",
  "has",
  "had",
  "their",
  "they",
  "them",
  "into",
  "about",
  "using",
  "used",
  "use",
  "work",
  "working",
  "role",
  "job",
  "team",
  "candidate",
  "looking",
  "required",
  "requirements",
  "responsibilities",
  "skills",
  "experience",
  "ability",
  "strong",
  "good",
  "knowledge",
  "including",
  "such",
  "must",
  "should",
  "would",
  "could",
  "also",
  "etc",
  "can",
  "may",
  "more",
  "than",
  "within",
  "through",
  "across",
  "over",
  "under",
  "per",
  "all",
  "any",
  "other",
  "not",
  "but",
  "who",
  "what",
  "when",
  "where",
  "how",
  "why",
  "we",
  "they",
  "them",
  "their",
  "our",
  "ours",
  "its",
  "with",
  "without",
  "provide",
  "providing",
  "ensure",
  "ensuring",
  "support",
  "supporting",
  "responsible",
  "responsibility",
  "preferred",
  "qualifications",
  "minimum",
  "plus",
]);


// ============================================================
// 6. NORMALIZE TEXT
// ============================================================

function normalizeText(
  text = ""
) {
  return String(
    text
  )
    .toLowerCase()
    .replace(
      /\r\n/g,
      "\n"
    )
    .replace(
      /\r/g,
      "\n"
    )
    .replace(
      /\u00A0/g,
      " "
    )
    .replace(
      /[ \t]+/g,
      " "
    )
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}


// ============================================================
// 7. NORMALIZE SKILL
// ============================================================

function normalizeSkill(
  skill = ""
) {
  let value =
    String(
      skill || ""
    )
      .toLowerCase()
      .trim();

  if (
    !value
  ) {
    return "";
  }

  value =
    value
      .replace(
        /\u00A0/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  const aliases = {
    "react.js":
      "react",

    "reactjs":
      "react",

    "react js":
      "react",

    "nodejs":
      "node.js",

    "node js":
      "node.js",

    "expressjs":
      "express.js",

    "express js":
      "express.js",

    "nextjs":
      "next.js",

    "next js":
      "next.js",

    "tailwindcss":
      "tailwind css",

    "tailwind":
      "tailwind css",

    "restful api":
      "rest api",

    "restful":
      "rest api",

    "problem-solving":
      "problem solving",

    "communication skills":
      "communication",

    "jwt authentication":
      "jwt",

    "full-stack":
      "full stack",

    "fullstack":
      "full stack",

    "front-end":
      "frontend",

    "front end":
      "frontend",

    "back-end":
      "backend",

    "back end":
      "backend",

    "ui ux":
      "ui/ux",

    "ui-ux":
      "ui/ux",

    "c sharp":
      "c#",

    "cpp":
      "c++",

    "powerbi":
      "power bi",

    "machine-learning":
      "machine learning",

    "deep-learning":
      "deep learning",

    "data-analysis":
      "data analysis",

    "data-science":
      "data science",

    "data-visualization":
      "data visualization",

    "supply-chain":
      "supply chain",

    "inventory-management":
      "inventory management",

    "inventory-tracking":
      "inventory tracking",

    "order-fulfillment":
      "order fulfillment",

    "order-processing":
      "order processing",

    "record-keeping":
      "record keeping",

    "barcode-scanning":
      "barcode scanning",

    "attention-to-detail":
      "attention to detail",

    "time-management":
      "time management",

    "quality-control":
      "quality control",

    "safety-procedures":
      "safety procedures",

    "workplace-safety":
      "workplace safety",

    "shipping and receiving":
      "shipping and receiving",
  };

  return (
    aliases[value] ||
    value
  );
}


// ============================================================
// 8. ESCAPE REGEX
// ============================================================

function escapeRegex(
  value = ""
) {
  return String(
    value
  ).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}


// ============================================================
// 9. PHRASE NORMALIZATION
// ============================================================

function normalizePhrase(
  value = ""
) {
  return normalizeSkill(
    value
  );
}


// ============================================================
// 10. CREATE WORD SET
// ============================================================

function createWordSet(
  text = ""
) {
  return new Set(
    normalizeText(
      text
    )
      .replace(
        /[+#./-]/g,
        " "
      )
      .split(
        /\s+/
      )
      .map(
        (word) =>
          word.trim()
      )
      .filter(
        (word) =>
          word.length > 2 &&
          !STOP_WORDS.has(
            word
          )
      )
  );
}


// ============================================================
// 11. SAFE PHRASE MATCH
// ============================================================

function containsPhrase(
  text = "",
  phrase = ""
) {
  const normalizedText =
    normalizeText(
      text
    );

  const normalizedPhrase =
    normalizePhrase(
      phrase
    );

  if (
    !normalizedText ||
    !normalizedPhrase
  ) {
    return false;
  }

  const escaped =
    escapeRegex(
      normalizedPhrase
    );

  const regex =
    new RegExp(
      `(^|[^a-z0-9+#])${escaped}(?=$|[^a-z0-9+#])`,
      "i"
    );

  return regex.test(
    normalizedText
  );
}


// ============================================================
// 12. DETECT SKILLS
// ============================================================

function detectSkills(
  text = ""
) {
  const normalized =
    normalizeText(
      text
    );

  if (
    !normalized
  ) {
    return [];
  }

  const found =
    [];

  for (
    const rawSkill of SKILL_KEYWORDS
  ) {
    const skill =
      normalizeSkill(
        rawSkill
      );

    if (
      !skill
    ) {
      continue;
    }

    if (
      containsPhrase(
        normalized,
        skill
      )
    ) {
      found.push(
        skill
      );
    }
  }

  // ----------------------------------------------------------
  // Prefer specific aliases
  // ----------------------------------------------------------

  const set =
    new Set(
      found
    );

  // React.js → react
  // Node.js remains node.js
  // Express.js remains express.js

  if (
    set.has(
      "react"
    ) &&
    set.has(
      "react.js"
    )
  ) {
    set.delete(
      "react.js"
    );
  }

  if (
    set.has(
      "node"
    ) &&
    set.has(
      "node.js"
    )
  ) {
    set.delete(
      "node"
    );
  }

  if (
    set.has(
      "express"
    ) &&
    set.has(
      "express.js"
    )
  ) {
    set.delete(
      "express"
    );
  }

  if (
    set.has(
      "tailwind"
    )
  ) {
    set.delete(
      "tailwind"
    );

    set.add(
      "tailwind css"
    );
  }

  if (
    set.has(
      "problem-solving"
    )
  ) {
    set.delete(
      "problem-solving"
    );

    set.add(
      "problem solving"
    );
  }

  return [
    ...set,
  ];
}


// ============================================================
// 13. EXTRACT SKILLS
// ============================================================
//
// PUBLIC FUNCTION
//
// Required by tailoredResumeBuilder.js
//
// ============================================================

function extractSkills(
  text = ""
) {
  if (
    !text ||
    !String(
      text
    ).trim()
  ) {
    return [];
  }

  return detectSkills(
    text
  );
}


// ============================================================
// 14. EXTRACT ROLE PHRASES
// ============================================================

function extractRolePhrases(
  jobDescription = ""
) {
  const roles =
    [];

  const jd =
    normalizeText(
      jobDescription
    );

  for (
    const [
      canonical,
      aliases,
    ] of Object.entries(
      ROLE_ALIASES
    )
  ) {
    if (
      aliases.some(
        (
          alias
        ) =>
          containsPhrase(
            jd,
            alias
          )
      )
    ) {
      roles.push(
        canonical
      );
    }
  }

  return [
    ...new Set(
      roles
    ),
  ];
}


// ============================================================
// 15. EXTRACT JOB KEYWORDS
// ============================================================
//
// PUBLIC FUNCTION
//
// Important:
// We deliberately avoid treating every normal JD word
// as a keyword. That produces misleadingly low scores.
//
// Instead:
//
// 1. Important phrases
// 2. Detected skills
// 3. Relevant experience phrases
// 4. Strong meaningful individual words
//
// ============================================================

function extractJobKeywords(
  jobDescription = ""
) {
  const normalizedJD =
    normalizeText(
      jobDescription
    );

  if (
    !normalizedJD
  ) {
    return [];
  }

  const keywords =
    [];

  // ----------------------------------------------------------
  // Important phrases
  // ----------------------------------------------------------

  for (
    const phrase of IMPORTANT_JD_PHRASES
  ) {
    const normalizedPhrase =
      normalizePhrase(
        phrase
      );

    if (
      containsPhrase(
        normalizedJD,
        normalizedPhrase
      )
    ) {
      keywords.push(
        normalizedPhrase
      );
    }
  }

  // ----------------------------------------------------------
  // Skills
  // ----------------------------------------------------------

  const detectedSkills =
    detectSkills(
      normalizedJD
    );

  keywords.push(
    ...detectedSkills
  );

  // ----------------------------------------------------------
  // Experience phrases
  // ----------------------------------------------------------

  for (
    const phrase of EXPERIENCE_KEYWORDS
  ) {
    if (
      containsPhrase(
        normalizedJD,
        phrase
      )
    ) {
      keywords.push(
        normalizePhrase(
          phrase
        )
      );
    }
  }

  // ----------------------------------------------------------
  // Role phrases
  // ----------------------------------------------------------

  const detectedRoles =
    extractRolePhrases(
      normalizedJD
    );

  keywords.push(
    ...detectedRoles
  );

  // ----------------------------------------------------------
  // Meaningful words
  //
  // Only include longer terms.
  // Avoid generic filler.
  // ----------------------------------------------------------

  const words =
    createWordSet(
      normalizedJD
    );

  for (
    const word of words
  ) {
    if (
      word.length >= 5 &&
      !STOP_WORDS.has(
        word
      )
    ) {
      keywords.push(
        normalizeSkill(
          word
        )
      );
    }
  }

  return [
    ...new Set(
      keywords
        .map(
          normalizePhrase
        )
        .filter(Boolean)
    ),
  ];
}


// ============================================================
// 16. MATCH KEYWORDS
// ============================================================

function matchKeywords(
  resumeText,
  jobDescription
) {
  const normalizedResume =
    normalizeText(
      resumeText
    );

  const resumeWords =
    createWordSet(
      normalizedResume
    );

  const jobKeywords =
    extractJobKeywords(
      jobDescription
    );

  const matched =
    [];

  const missing =
    [];

  for (
    const keyword of jobKeywords
  ) {
    const normalizedKeyword =
      normalizeSkill(
        keyword
      );

    if (
      !normalizedKeyword
    ) {
      continue;
    }

    // --------------------------------------------------------
    // Multi-word
    // --------------------------------------------------------

    if (
      normalizedKeyword.includes(
        " "
      ) ||
      normalizedKeyword.includes(
        "/"
      )
    ) {
      if (
        containsPhrase(
          normalizedResume,
          normalizedKeyword
        )
      ) {
        matched.push(
          normalizedKeyword
        );
      } else {
        missing.push(
          normalizedKeyword
        );
      }

      continue;
    }

    // --------------------------------------------------------
    // Single word
    // --------------------------------------------------------

    if (
      resumeWords.has(
        normalizedKeyword
      ) ||
      containsPhrase(
        normalizedResume,
        normalizedKeyword
      )
    ) {
      matched.push(
        normalizedKeyword
      );
    } else {
      missing.push(
        normalizedKeyword
      );
    }
  }

  return {
    matchedKeywords:
      [
        ...new Set(
          matched
        ),
      ],

    missingKeywords:
      [
        ...new Set(
          missing
        ),
      ],

    totalKeywords:
      new Set(
        jobKeywords
      ).size,

    matchedCount:
      new Set(
        matched
      ).size,

    missingCount:
      new Set(
        missing
      ).size,
  };
}


// ============================================================
// 17. KEYWORD SCORE
// ============================================================

function calculateKeywordScore(
  keywordAnalysis
) {
  if (
    !keywordAnalysis ||
    keywordAnalysis.totalKeywords <=
      0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (
        keywordAnalysis.matchedCount /
        keywordAnalysis.totalKeywords
      ) *
      100
    )
  );
}


// ============================================================
// 18. MATCH SKILLS
// ============================================================

function matchSkills(
  resumeText,
  jobDescription
) {
  const resumeSkills =
    extractSkills(
      resumeText
    );

  const jobSkills =
    extractSkills(
      jobDescription
    );

  const resumeSkillSet =
    new Set(
      resumeSkills.map(
        normalizeSkill
      )
    );

  const matchedSkills =
    [];

  const missingSkills =
    [];

  for (
    const skill of jobSkills
  ) {
    const normalized =
      normalizeSkill(
        skill
      );

    if (
      resumeSkillSet.has(
        normalized
      )
    ) {
      matchedSkills.push(
        skill
      );
    } else {
      missingSkills.push(
        skill
      );
    }
  }

  return {
    resumeSkills:
      [
        ...new Set(
          resumeSkills
        ),
      ],

    jobSkills:
      [
        ...new Set(
          jobSkills
        ),
      ],

    matchedSkills:
      [
        ...new Set(
          matchedSkills
        ),
      ],

    missingSkills:
      [
        ...new Set(
          missingSkills
        ),
      ],

    totalRequiredSkills:
      new Set(
        jobSkills
      ).size,

    matchedSkillCount:
      new Set(
        matchedSkills
      ).size,

    missingSkillCount:
      new Set(
        missingSkills
      ).size,
  };
}


// ============================================================
// 19. SKILL SCORE
// ============================================================

function calculateSkillScore(
  skillAnalysis
) {
  if (
    !skillAnalysis ||
    skillAnalysis.totalRequiredSkills <=
      0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (
        skillAnalysis.matchedSkillCount /
        skillAnalysis.totalRequiredSkills
      ) *
      100
    )
  );
}


// ============================================================
// 20. EXTRACT YEARS OF EXPERIENCE
// ============================================================

function extractYearsOfExperience(
  text = ""
) {
  const normalized =
    normalizeText(
      text
    );

  const patterns = [
    /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:professional\s*)?experience/i,

    /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:in|with)\s+[a-z][a-z\s-]{2,50}/i,

    /minimum\s+of\s+(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i,

    /at\s+least\s+(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i,

    /(\d+(?:\.\d+)?)\s*-\s*(?:\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i,

    /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i,
  ];

  for (
    const pattern of patterns
  ) {
    const match =
      normalized.match(
        pattern
      );

    if (
      match &&
      match[1]
    ) {
      const value =
        Number(
          match[1]
        );

      if (
        Number.isFinite(
          value
        )
      ) {
        return value;
      }
    }
  }

  return null;
}


// ============================================================
// 21. EXPERIENCE MATCH
// ============================================================

function analyzeExperienceMatch(
  resumeText,
  jobDescription
) {
  const normalizedResume =
    normalizeText(
      resumeText
    );

  const normalizedJD =
    normalizeText(
      jobDescription
    );

  const resumeYears =
    extractYearsOfExperience(
      normalizedResume
    );

  const requiredYears =
    extractYearsOfExperience(
      normalizedJD
    );

  let score =
    70;

  let level =
    "Experience requirement not clearly specified";

  // ----------------------------------------------------------
  // No explicit JD experience requirement
  // ----------------------------------------------------------

  if (
    requiredYears ===
    null
  ) {
    if (
      resumeYears !==
      null
    ) {
      score =
        85;

      level =
        `${resumeYears}+ years detected in resume`;
    }

    return {
      score,

      resumeYears,

      requiredYears,

      level,
    };
  }

  // ----------------------------------------------------------
  // Requirement exists, resume years unavailable
  // ----------------------------------------------------------

  if (
    resumeYears ===
    null
  ) {
    return {
      score:
        50,

      resumeYears:
        null,

      requiredYears,

      level:
        "Experience requirement found, but resume experience could not be determined",
    };
  }

  // ----------------------------------------------------------
  // Requirement met
  // ----------------------------------------------------------

  if (
    resumeYears >=
    requiredYears
  ) {
    return {
      score:
        100,

      resumeYears,

      requiredYears,

      level:
        "Resume appears to meet the experience requirement",
    };
  }

  // ----------------------------------------------------------
  // Requirement partially met
  // ----------------------------------------------------------

  const difference =
    requiredYears -
    resumeYears;

  const scoreValue =
    Math.max(
      40,
      Math.round(
        100 -
        difference *
          20
      )
    );

  return {
    score:
      scoreValue,

    resumeYears,

    requiredYears,

    level:
      "Resume may have less experience than required",
  };
}


// ============================================================
// 22. ROLE MATCH
// ============================================================

function analyzeRoleMatch(
  resumeText,
  jobDescription
) {
  const resume =
    normalizeText(
      resumeText
    );

  const jd =
    normalizeText(
      jobDescription
    );

  const detectedRoles =
    [];

  const matchedRoles =
    [];

  for (
    const [
      canonical,
      aliases,
    ] of Object.entries(
      ROLE_ALIASES
    )
  ) {
    const foundInJD =
      aliases.some(
        (
          alias
        ) =>
          containsPhrase(
            jd,
            alias
          )
      );

    if (
      foundInJD
    ) {
      detectedRoles.push(
        canonical
      );

      const foundInResume =
        aliases.some(
          (
            alias
          ) =>
            containsPhrase(
              resume,
              alias
            )
        );

      if (
        foundInResume
      ) {
        matchedRoles.push(
          canonical
        );
      }
    }
  }

  // ----------------------------------------------------------
  // No explicit recognized role
  // ----------------------------------------------------------

  if (
    detectedRoles.length ===
    0
  ) {
    return {
      score:
        70,

      detectedRoles:
        [],

      matchedRoles:
        [],
    };
  }

  const score =
    Math.round(
      (
        matchedRoles.length /
        detectedRoles.length
      ) *
      100
    );

  return {
    score,

    detectedRoles:
      [
        ...new Set(
          detectedRoles
        ),
      ],

    matchedRoles:
      [
        ...new Set(
          matchedRoles
        ),
      ],
  };
}


// ============================================================
// 23. MATCH LEVEL
// ============================================================

function calculateMatchLevel(
  score
) {
  if (
    score >=
    90
  ) {
    return "Excellent Match";
  }

  if (
    score >=
    80
  ) {
    return "Strong Match";
  }

  if (
    score >=
    70
  ) {
    return "Good Match";
  }

  if (
    score >=
    60
  ) {
    return "Moderate Match";
  }

  if (
    score >=
    50
  ) {
    return "Weak Match";
  }

  return "Poor Match";
}


// ============================================================
// 24. RECOMMENDATIONS
// ============================================================

function generateJobRecommendations({
  keywordScore,
  skillScore,
  experienceScore,
  roleScore,
  missingSkills,
  missingKeywords,
}) {
  const recommendations =
    [];

  // ----------------------------------------------------------
  // Missing skills
  // ----------------------------------------------------------

  if (
    missingSkills.length >
    0
  ) {
    recommendations.push(
      `Review missing skills that you genuinely possess: ${missingSkills
        .slice(
          0,
          6
        )
        .join(
          ", "
        )}.`
    );
  }

  // ----------------------------------------------------------
  // Keyword alignment
  // ----------------------------------------------------------

  if (
    keywordScore <
      70 &&
    missingKeywords.length >
      0
  ) {
    recommendations.push(
      `Improve keyword alignment by naturally using relevant terms such as: ${missingKeywords
        .slice(
          0,
          8
        )
        .join(
          ", "
        )}.`
    );
  }

  // ----------------------------------------------------------
  // Skill score
  // ----------------------------------------------------------

  if (
    skillScore <
    60
  ) {
    recommendations.push(
      "Your resume currently has limited overlap with the skills requested by this job."
    );
  }

  // ----------------------------------------------------------
  // Experience score
  // ----------------------------------------------------------

  if (
    experienceScore <
    70
  ) {
    recommendations.push(
      "Highlight relevant experience, internships, projects and responsibilities that directly support this role."
    );
  }

  // ----------------------------------------------------------
  // Role score
  // ----------------------------------------------------------

  if (
    roleScore <
    70
  ) {
    recommendations.push(
      "Make the target role clearer in your headline or professional summary where truthful."
    );
  }

  // ----------------------------------------------------------
  // Fallback
  // ----------------------------------------------------------

  if (
    recommendations.length ===
    0
  ) {
    recommendations.push(
      "Your resume aligns reasonably well with this job. Continue emphasizing the most relevant achievements and responsibilities."
    );
  }

  return [
    ...new Set(
      recommendations
    ),
  ].slice(
    0,
    6
  );
}


// ============================================================
// 25. MAIN JOB MATCHER
// ============================================================

function matchResumeToJob(
  resumeTextOrOptions,
  jobDescriptionArgument
) {
  let resumeText =
    "";

  let jobDescription =
    "";

  // ----------------------------------------------------------
  // Object format
  // ----------------------------------------------------------

  if (
    resumeTextOrOptions &&
    typeof resumeTextOrOptions ===
      "object" &&
    !Array.isArray(
      resumeTextOrOptions
    )
  ) {
    resumeText =
      resumeTextOrOptions.resumeText;

    jobDescription =
      resumeTextOrOptions.jobDescription;
  } else {
    // --------------------------------------------------------
    // Positional format
    // --------------------------------------------------------

    resumeText =
      resumeTextOrOptions;

    jobDescription =
      jobDescriptionArgument;
  }

  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log(
    "\n================================================"
  );

  console.log(
    "              JOB MATCHER SERVICE"
  );

  console.log(
    "================================================"
  );

  console.log(
    "Resume type:",
    typeof resumeText
  );

  console.log(
    "Resume length:",
    typeof resumeText ===
      "string"
      ? resumeText.trim().length
      : 0
  );

  console.log(
    "Job description type:",
    typeof jobDescription
  );

  console.log(
    "Job description length:",
    typeof jobDescription ===
      "string"
      ? jobDescription.trim().length
      : 0
  );

  console.log(
    "================================================\n"
  );

  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (
    !resumeText ||
    typeof resumeText !==
      "string" ||
    !resumeText.trim()
  ) {
    throw new Error(
      "Resume text is required"
    );
  }

  if (
    !jobDescription ||
    typeof jobDescription !==
      "string" ||
    !jobDescription.trim()
  ) {
    throw new Error(
      "Job description is required"
    );
  }

  const cleanResumeText =
    resumeText.trim();

  const cleanJobDescription =
    jobDescription.trim();

  if (
    cleanResumeText.length <
    20
  ) {
    throw new Error(
      "Resume text is too short"
    );
  }

  if (
    cleanJobDescription.length <
    20
  ) {
    throw new Error(
      "Job description is too short"
    );
  }

  // ==========================================================
  // KEYWORDS
  // ==========================================================

  const keywordAnalysis =
    matchKeywords(
      cleanResumeText,
      cleanJobDescription
    );

  const keywordScore =
    calculateKeywordScore(
      keywordAnalysis
    );

  // ==========================================================
  // SKILLS
  // ==========================================================

  const skillAnalysis =
    matchSkills(
      cleanResumeText,
      cleanJobDescription
    );

  const skillScore =
    calculateSkillScore(
      skillAnalysis
    );

  // ==========================================================
  // EXPERIENCE
  // ==========================================================

  const experienceAnalysis =
    analyzeExperienceMatch(
      cleanResumeText,
      cleanJobDescription
    );

  // ==========================================================
  // ROLE
  // ==========================================================

  const roleAnalysis =
    analyzeRoleMatch(
      cleanResumeText,
      cleanJobDescription
    );

  // ==========================================================
  // OVERALL SCORE
  // ==========================================================
  //
  // Weight:
  //
  // Keyword   35%
  // Skill     35%
  // Experience 15%
  // Role      15%
  //
  // ==========================================================

  const overallScore =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (
            keywordScore *
            0.35
          ) +
          (
            skillScore *
            0.35
          ) +
          (
            experienceAnalysis.score *
            0.15
          ) +
          (
            roleAnalysis.score *
            0.15
          )
        )
      )
    );

  const matchLevel =
    calculateMatchLevel(
      overallScore
    );

  // ==========================================================
  // RECOMMENDATIONS
  // ==========================================================

  const recommendations =
    generateJobRecommendations({
      keywordScore,

      skillScore,

      experienceScore:
        experienceAnalysis.score,

      roleScore:
        roleAnalysis.score,

      missingSkills:
        skillAnalysis.missingSkills,

      missingKeywords:
        keywordAnalysis.missingKeywords,
    });

  // ==========================================================
  // FINAL RESULT
  // ==========================================================

  const result = {
    // --------------------------------------------------------
    // Main
    // --------------------------------------------------------

    matchScore:
      overallScore,

    matchLevel,

    // --------------------------------------------------------
    // Score breakdown
    // --------------------------------------------------------

    keywordScore,

    skillScore,

    experienceScore:
      experienceAnalysis.score,

    roleScore:
      roleAnalysis.score,

    // --------------------------------------------------------
    // Keywords
    // --------------------------------------------------------

    matchedKeywords:
      keywordAnalysis.matchedKeywords.slice(
        0,
        50
      ),

    missingKeywords:
      keywordAnalysis.missingKeywords.slice(
        0,
        50
      ),

    // --------------------------------------------------------
    // Skills
    // --------------------------------------------------------

    matchedSkills:
      skillAnalysis.matchedSkills,

    missingSkills:
      skillAnalysis.missingSkills,

    // --------------------------------------------------------
    // Experience
    // --------------------------------------------------------

    experience:
      experienceAnalysis,

    experienceMatch:
      experienceAnalysis,

    // --------------------------------------------------------
    // Role
    // --------------------------------------------------------

    role:
      roleAnalysis,

    roleMatch:
      roleAnalysis,

    // --------------------------------------------------------
    // Detailed analysis
    // --------------------------------------------------------

    keywordAnalysis,

    skillAnalysis,

    // --------------------------------------------------------
    // Metrics
    // --------------------------------------------------------

    metrics: {
      totalJobKeywords:
        keywordAnalysis.totalKeywords,

      matchedKeywords:
        keywordAnalysis.matchedCount,

      missingKeywords:
        keywordAnalysis.missingCount,

      requiredSkills:
        skillAnalysis.totalRequiredSkills,

      matchedSkills:
        skillAnalysis.matchedSkillCount,

      missingSkills:
        skillAnalysis.missingSkillCount,

      detectedResumeSkills:
        skillAnalysis.resumeSkills.length,

      detectedJobSkills:
        skillAnalysis.jobSkills.length,
    },

    // --------------------------------------------------------
    // Recommendations
    // --------------------------------------------------------

    recommendations,

    recommendation:
      recommendations.join(
        " "
      ),

    overallRecommendation:
      recommendations.join(
        " "
      ),

    // --------------------------------------------------------
    // Metadata
    // --------------------------------------------------------

    analyzedAt:
      new Date().toISOString(),
  };

  // ==========================================================
  // FINAL DEBUG
  // ==========================================================

  console.log(
    "\n================================================"
  );

  console.log(
    "            JOB MATCHER RESULT"
  );

  console.log(
    "================================================"
  );

  console.log(
    "Match Score:",
    result.matchScore
  );

  console.log(
    "Match Level:",
    result.matchLevel
  );

  console.log(
    "Keyword Score:",
    result.keywordScore
  );

  console.log(
    "Skill Score:",
    result.skillScore
  );

  console.log(
    "Experience Score:",
    result.experienceScore
  );

  console.log(
    "Role Score:",
    result.roleScore
  );

  console.log(
    "Matched Skills:",
    result.matchedSkills.length
  );

  console.log(
    "Missing Skills:",
    result.missingSkills.length
  );

  console.log(
    "Matched Keywords:",
    result.matchedKeywords.length
  );

  console.log(
    "Missing Keywords:",
    result.missingKeywords.length
  );

  console.log(
    "================================================\n"
  );

  return result;
}


// ============================================================
// 26. EXPORTS
// ============================================================

module.exports = {
  // Main matcher
  matchResumeToJob,

  // Required by tailoredResumeBuilder.js
  extractSkills,

  normalizeSkill,

  extractJobKeywords,

  // Reusable helpers
  detectSkills,

  normalizeText,

  matchKeywords,

  matchSkills,

  calculateKeywordScore,

  calculateSkillScore,

  analyzeExperienceMatch,

  extractYearsOfExperience,

  analyzeRoleMatch,

  calculateMatchLevel,

  generateJobRecommendations,

  extractRolePhrases,
};

