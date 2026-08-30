
// ============================================================
// AI RESUME ANALYZER
// ADVANCED ATS ENGINE
// FINAL STABLE VERSION
// ============================================================
//
// FEATURES:
//
// ✅ ATS score
// ✅ Grade
// ✅ Category-wise scores
// ✅ Action verb analysis
// ✅ Quantified achievement detection
// ✅ Contact information detection
// ✅ Section detection
// ✅ Skill detection
// ✅ Duplicate skill detection
// ✅ Missing section analysis
// ✅ Content quality
// ✅ Formatting quality
// ✅ Strengths
// ✅ Weaknesses
// ✅ Smart suggestions
// ✅ Overall recommendation
//
// IMPORTANT:
//
// This analyzer does NOT invent resume information.
//
// ============================================================


// ============================================================
// 1. ACTION VERBS
// ============================================================

const ACTION_VERBS = [
  // General
  "achieved",
  "administered",
  "analyzed",
  "automated",
  "built",
  "collaborated",
  "completed",
  "conducted",
  "coordinated",
  "created",
  "delivered",
  "designed",
  "developed",
  "directed",
  "documented",
  "engineered",
  "executed",
  "generated",
  "handled",
  "implemented",
  "improved",
  "increased",
  "launched",
  "led",
  "maintained",
  "managed",
  "optimized",
  "organized",
  "participated",
  "performed",
  "planned",
  "processed",
  "reduced",
  "resolved",
  "reviewed",
  "saved",
  "streamlined",
  "supervised",
  "supported",
  "tested",
  "tracked",
  "trained",
  "transformed",
  "upgraded",

  // Warehouse / Logistics
  "picked",
  "packed",
  "filled",
  "cut",
  "switched",
  "awarded",
  "monitored",
  "inspected",
  "prepared",
  "operated",
  "assisted",
  "counted",
  "recorded",
  "cleaned",
  "loaded",
  "unloaded",
  "sorted",
  "stored",
  "dispatched",
  "received",
  "transported",
  "verified",

  // Technical
  "debugged",
  "deployed",
  "integrated",
  "architected",
  "refactored",
  "migrated",
  "scaled",
  "secured",
  "configured",
  "validated",
  "maintained",
  "monitored",
];


// ============================================================
// 2. SKILL KEYWORDS
// ============================================================

const SKILL_KEYWORDS = [
  // Programming / Technology
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
  "python",
  "java",
  "c",
  "c++",
  "c#",
  ".net",
  "html",
  "css",
  "tailwind",
  "redux",
  "redux toolkit",
  "git",
  "github",
  "docker",
  "aws",
  "azure",
  "sql",
  "rest api",
  "restful api",
  "api",
  "figma",

  // Data / Business
  "excel",
  "power bi",
  "data analysis",
  "data visualization",
  "machine learning",
  "deep learning",

  // Warehouse / Logistics
  "warehouse",
  "warehousing",
  "warehouse operations",
  "warehouse management",
  "inventory",
  "inventory management",
  "inventory systems",
  "supply chain",
  "supply chain management",
  "logistics",
  "logistics operations",
  "distribution",
  "shipping",
  "packing",
  "picking",
  "order fulfillment",
  "order processing",
  "material handling",
  "quality control",
  "quality assurance",
  "record keeping",
  "sanitation",
  "deep sanitation practices",
  "cleaning equipment",
  "mathematics",

  // Lean / Manufacturing
  "kanban",
  "kaizen",
  "gemba",
  "5s",

  // Soft Skills
  "communication",
  "leadership",
  "teamwork",
  "problem solving",
  "time management",
  "attention to detail",
  "organization",
];


// ============================================================
// 3. SECTION KEYWORDS
// ============================================================

const SECTION_KEYWORDS = {
  summary: [
    "summary",
    "professional summary",
    "career summary",
    "resume summary",
    "profile",
    "professional profile",
    "career profile",
    "objective",
    "career objective",
    "about me",
    "about",
    "overview",
  ],

  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "employment history",
    "work history",
    "career history",
    "professional history",
    "work",
    "internship",
    "internships",
    "internship experience",
  ],

  education: [
    "education",
    "educational background",
    "academic background",
    "academic qualifications",
    "academic qualification",
    "qualifications",
    "educational qualifications",
    "academic history",
  ],

  skills: [
    "skills",
    "skill",
    "technical skills",
    "technical skill",
    "key skills",
    "core skills",
    "professional skills",
    "technical proficiencies",
    "technologies",
    "technology",
    "technical expertise",
    "skills & technologies",
    "technical skills & technologies",
    "technical stack",
    "tech stack",
    "tools & technologies",
    "tools and technologies",
    "competencies",
    "core competencies",
  ],

  projects: [
    "projects",
    "project",
    "personal projects",
    "academic projects",
    "project experience",
    "key projects",
    "selected projects",
    "featured projects",
    "project work",
  ],

  certifications: [
    "certifications",
    "certification",
    "certificates",
    "certificate",
    "licenses",
    "licences",
    "professional certifications",
    "licenses & certifications",
    "licences & certifications",
  ],

  achievements: [
    "achievements",
    "achievement",
    "accomplishments",
    "accomplishment",
    "awards",
    "award",
    "honors",
    "honour",
    "honours",
    "awards & achievements",
    "awards and achievements",
  ],

  languages: [
    "languages",
    "language",
    "language proficiency",
    "language proficiencies",
    "languages known",
    "known languages",
  ],

  hobbies: [
    "hobbies",
    "hobby",
    "interests",
    "interest",
    "hobbies & interests",
    "interests & hobbies",
    "activities",
  ],
};


// ============================================================
// 4. NORMALIZE TEXT
// ============================================================

function normalizeText(
  text = ""
) {
  return String(
    text
  )
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
// 5. ESCAPE REGEX
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
// 6. NORMALIZE HEADING
// ============================================================

function normalizeHeading(
  value = ""
) {
  return String(
    value
  )
    .toLowerCase()
    .replace(
      /[:|]/g,
      ""
    )
    .replace(
      /[^\w\s&+#./-]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


// ============================================================
// 7. HEADING MATCH
// ============================================================

function isSectionHeadingLine(
  line,
  alias
) {
  const normalizedLine =
    normalizeHeading(
      line
    );

  const normalizedAlias =
    normalizeHeading(
      alias
    );

  if (
    !normalizedLine ||
    !normalizedAlias
  ) {
    return false;
  }

  if (
    normalizedLine ===
    normalizedAlias
  ) {
    return true;
  }

  // Allows:
  //
  // Skills:
  // Skills & Technologies
  //
  return (
    normalizedLine.startsWith(
      normalizedAlias + " "
    )
  );
}


// ============================================================
// 8. DETECT SECTION FROM LINE
// ============================================================

function detectSectionFromLine(
  line = ""
) {
  const clean =
    String(
      line
    ).trim();

  if (
    !clean
  ) {
    return "";
  }

  for (
    const [
      section,
      keywords,
    ] of Object.entries(
      SECTION_KEYWORDS
    )
  ) {
    for (
      const keyword of keywords
    ) {
      if (
        isSectionHeadingLine(
          clean,
          keyword
        )
      ) {
        return section;
      }
    }
  }

  return "";
}


// ============================================================
// 9. CONTACT INFORMATION
// ============================================================

function analyzeContactInformation(
  text
) {
  const value =
    String(
      text
    );

  const emailRegex =
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/;

  const phoneRegex =
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?)?(?:\d{3,5}[\s.-]?\d{3,5}[\s.-]?\d{0,5})/;

  const linkedinUrlRegex =
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/[a-zA-Z0-9._-]+/i;

  const githubUrlRegex =
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9._-]+/i;

  const linkedinMentionRegex =
    /\blinkedin\b/i;

  const githubMentionRegex =
    /\bgithub\b/i;

  const email =
    emailRegex.test(
      value
    );

  const phone =
    phoneRegex.test(
      value
    );

  const linkedin =
    linkedinUrlRegex.test(
      value
    );

  const github =
    githubUrlRegex.test(
      value
    );

  const linkedinMention =
    linkedinMentionRegex.test(
      value
    );

  const githubMention =
    githubMentionRegex.test(
      value
    );

  const score =
    Number(email) +
    Number(phone) +
    Number(linkedin);

  return {
    email,

    phone,

    linkedin,

    github,

    linkedinMention,

    githubMention,

    score,

    total: 3,
  };
}


// ============================================================
// 10. ACTION VERB DETECTION
// ============================================================

function detectActionVerbs(
  text
) {
  const normalized =
    normalizeText(
      text
    );

  const found =
    [];

  const uniqueVerbs =
    [
      ...new Set(
        ACTION_VERBS.map(
          (
            verb
          ) =>
            verb.toLowerCase()
        )
      ),
    ];

  for (
    const verb of uniqueVerbs
  ) {
    const regex =
      new RegExp(
        `\\b${escapeRegex(
          verb
        )}\\b`,
        "i"
      );

    if (
      regex.test(
        normalized
      )
    ) {
      found.push(
        verb
      );
    }
  }

  return {
    count:
      found.length,

    verbs:
      found,
  };
}


// ============================================================
// 11. BULLET EXTRACTION
// ============================================================

function extractBulletLines(
  text
) {
  return normalizeText(
    text
  )
    .split(
      "\n"
    )
    .map(
      (line) =>
        line.trim()
    )
    .filter(
      (line) =>
        /^[-•▪●◦*✓✔➜➤→]\s+/.test(
          line
        )
    );
}


// ============================================================
// 12. CLEAN BULLET
// ============================================================

function cleanBullet(
  bullet = ""
) {
  return String(
    bullet
  )
    .replace(
      /^\s*[-•▪●◦*✓✔➜➤→]\s*/,
      ""
    )
    .trim();
}


// ============================================================
// 13. ACTION VERB QUALITY
// ============================================================

function analyzeActionVerbQuality(
  text
) {
  const bullets =
    extractBulletLines(
      text
    );

  let strongBulletCount =
    0;

  const usedVerbs =
    new Set();

  for (
    const bullet of bullets
  ) {
    const clean =
      cleanBullet(
        bullet
      );

    const normalized =
      clean.toLowerCase();

    for (
      const verb of ACTION_VERBS
    ) {
      const regex =
        new RegExp(
          `^${escapeRegex(
            verb
          )}\\b`,
          "i"
        );

      if (
        regex.test(
          normalized
        )
      ) {
        strongBulletCount++;

        usedVerbs.add(
          verb.toLowerCase()
        );

        break;
      }
    }
  }

  const score =
    bullets.length === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (
              strongBulletCount /
              bullets.length
            ) *
            100
          )
        );

  return {
    bulletCount:
      bullets.length,

    strongBulletCount,

    uniqueVerbs:
      [
        ...usedVerbs,
      ],

    score,
  };
}


// ============================================================
// 14. QUANTIFIED ACHIEVEMENTS
// ============================================================

function detectQuantifiedAchievements(
  text
) {
  const patterns = [
    // Percentage
    /\b\d+(?:\.\d+)?\s*%/gi,

    // Currency
    /[$₹€£]\s?\d[\d,]*(?:\.\d+)?/gi,

    // Number + x / +
    /\b\d+(?:\.\d+)?\s*(?:x|\+)\b/gi,

    // Measurement / impact
    /\b\d+(?:\.\d+)?\s*(?:users|clients|customers|employees|projects|orders|products|leads|tickets|teams|members|hours|days|months|years|people|items|shipments|deliveries|records|applications|applications|requests|transactions)\b/gi,

    // Ordinal / percentile
    /\b\d+(?:st|nd|rd|th)\s+percentile\b/gi,

    // Time / numeric outcome
    /\b(?:reduced|increased|improved|saved|grew|raised|cut|boosted|delivered)\b[^.\n]{0,80}\b\d+(?:\.\d+)?\b/gi,
  ];

  const matches =
    [];

  for (
    const pattern of patterns
  ) {
    const found =
      String(
        text
      ).match(
        pattern
      );

    if (
      found
    ) {
      matches.push(
        ...found
      );
    }
  }

  const normalizedMatches =
    [
      ...new Set(
        matches
          .map(
            (item) =>
              item
                .trim()
                .replace(
                  /\s+/g,
                  " "
                )
          )
      ),
    ];

  return {
    count:
      normalizedMatches.length,

    examples:
      normalizedMatches.slice(
        0,
        10
      ),
  };
}


// ============================================================
// 15. SECTION DETECTION
// ============================================================
//
// IMPORTANT:
// Detect only actual heading-like lines.
// Do not use text.includes(keyword),
// because that creates false positives.
//
// ============================================================

function detectSections(
  text
) {
  const lines =
    normalizeText(
      text
    )
      .split(
        "\n"
      )
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);

  const sections = {
    summary:
      false,

    experience:
      false,

    education:
      false,

    skills:
      false,

    projects:
      false,

    certifications:
      false,

    achievements:
      false,

    languages:
      false,

    hobbies:
      false,
  };

  for (
    const line of lines
  ) {
    const detected =
      detectSectionFromLine(
        line
      );

    if (
      detected &&
      Object.prototype.hasOwnProperty.call(
        sections,
        detected
      )
    ) {
      sections[
        detected
      ] = true;
    }
  }

  return sections;
}


// ============================================================
// 16. MISSING IMPORTANT SECTIONS
// ============================================================

function analyzeMissingSections(
  sections
) {
  // Projects / Certifications /
  // Achievements / Languages / Hobbies
  // are optional.
  //
  // Core sections:

  const importantSections = [
    "summary",
    "experience",
    "education",
    "skills",
  ];

  const missing =
    [];

  for (
    const section of importantSections
  ) {
    if (
      !sections?.[section]
    ) {
      missing.push(
        section
      );
    }
  }

  return missing;
}


// ============================================================
// 17. SKILL BOUNDARY
// ============================================================

function skillRegex(
  skill
) {
  const escaped =
    escapeRegex(
      skill.toLowerCase()
    );

  return new RegExp(
    `(^|[^a-z0-9+#])${escaped}(?=$|[^a-z0-9+#])`,
    "i"
  );
}


// ============================================================
// 18. SKILL DETECTION
// ============================================================

function detectSkills(
  text
) {
  const normalized =
    normalizeText(
      text
    ).toLowerCase();

  const foundSkills =
    [];

  for (
    const skill of SKILL_KEYWORDS
  ) {
    const regex =
      skillRegex(
        skill
      );

    if (
      regex.test(
        normalized
      )
    ) {
      foundSkills.push(
        skill
      );
    }
  }

  // Remove aliases when a more specific
  // version is present.
  const finalSkills =
    [
      ...foundSkills,
    ];

  const removeIfSpecificExists = [
    ["react", "react.js"],
    ["node", "node.js"],
    ["express", "express.js"],
  ];

  for (
    const [
      generic,
      specific,
    ] of removeIfSpecificExists
  ) {
    const hasGeneric =
      finalSkills.includes(
        generic
      );

    const hasSpecific =
      finalSkills.includes(
        specific
      );

    if (
      hasGeneric &&
      hasSpecific
    ) {
      const index =
        finalSkills.indexOf(
          generic
        );

      if (
        index !== -1
      ) {
        finalSkills.splice(
          index,
          1
        );
      }
    }
  }

  return [
    ...new Set(
      finalSkills
    ),
  ];
}


// ============================================================
// 19. DUPLICATE SKILLS
// ============================================================

function detectDuplicateSkills(
  text
) {
  const normalized =
    normalizeText(
      text
    ).toLowerCase();

  const duplicates =
    [];

  for (
    const skill of SKILL_KEYWORDS
  ) {
    const regex =
      skillRegex(
        skill
      );

    const globalRegex =
      new RegExp(
        regex.source,
        "gi"
      );

    const matches =
      normalized.match(
        globalRegex
      );

    if (
      matches &&
      matches.length >= 2
    ) {
      duplicates.push({
        skill,

        count:
          matches.length,
      });
    }
  }

  return duplicates
    .sort(
      (
        a,
        b
      ) =>
        b.count -
        a.count
    )
    .slice(
      0,
      15
    );
}


// ============================================================
// 20. CONTENT QUALITY
// ============================================================

function analyzeContentQuality(
  text
) {
  const normalized =
    normalizeText(
      text
    );

  const words =
    normalized
      .split(
        /\s+/
      )
      .filter(Boolean);

  const wordCount =
    words.length;

  const bulletCount =
    extractBulletLines(
      text
    ).length;

  const numberMatches =
    String(
      text
    ).match(
      /\b\d+(?:\.\d+)?\b/g
    ) || [];

  const numberCount =
    numberMatches.length;

  const quantifiedCount =
    detectQuantifiedAchievements(
      text
    ).count;

  let score =
    0;

  // ----------------------------------------------------------
  // Word count
  // ----------------------------------------------------------

  if (
    wordCount >= 700
  ) {
    score += 28;
  } else if (
    wordCount >= 450
  ) {
    score += 25;
  } else if (
    wordCount >= 250
  ) {
    score += 22;
  } else if (
    wordCount >= 150
  ) {
    score += 16;
  } else if (
    wordCount >= 80
  ) {
    score += 10;
  } else {
    score += 5;
  }

  // ----------------------------------------------------------
  // Bullets
  // ----------------------------------------------------------

  if (
    bulletCount >= 10
  ) {
    score += 25;
  } else if (
    bulletCount >= 7
  ) {
    score += 22;
  } else if (
    bulletCount >= 5
  ) {
    score += 18;
  } else if (
    bulletCount >= 3
  ) {
    score += 12;
  } else if (
    bulletCount >= 1
  ) {
    score += 6;
  }

  // ----------------------------------------------------------
  // Numbers
  // ----------------------------------------------------------

  if (
    numberCount >= 12
  ) {
    score += 18;
  } else if (
    numberCount >= 8
  ) {
    score += 15;
  } else if (
    numberCount >= 5
  ) {
    score += 12;
  } else if (
    numberCount >= 2
  ) {
    score += 7;
  }

  // ----------------------------------------------------------
  // Quantified achievements
  // ----------------------------------------------------------

  if (
    quantifiedCount >= 6
  ) {
    score += 20;
  } else if (
    quantifiedCount >= 4
  ) {
    score += 17;
  } else if (
    quantifiedCount >= 2
  ) {
    score += 12;
  } else if (
    quantifiedCount >= 1
  ) {
    score += 7;
  }

  // ----------------------------------------------------------
  // Excessively long resume
  // ----------------------------------------------------------

  if (
    wordCount > 1400
  ) {
    score -= 8;
  }

  return {
    score:
      Math.max(
        0,
        Math.min(
          100,
          score
        )
      ),

    wordCount,

    bulletCount,

    numberCount,

    quantifiedCount,
  };
}


// ============================================================
// 21. FORMATTING QUALITY
// ============================================================

function analyzeFormattingQuality(
  text,
  sections
) {
  const rawLines =
    String(
      text
    )
      .replace(
        /\r\n/g,
        "\n"
      )
      .replace(
        /\r/g,
        "\n"
      )
      .split(
        "\n"
      );

  const lines =
    rawLines
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);

  const bulletLines =
    extractBulletLines(
      text
    );

  let score =
    100;

  const issues =
    [];

  // ----------------------------------------------------------
  // Bullet consistency
  // ----------------------------------------------------------

  if (
    bulletLines.length ===
    0
  ) {
    score -= 15;

    issues.push(
      "No bullet points were detected"
    );
  }

  // ----------------------------------------------------------
  // Very long lines
  // ----------------------------------------------------------

  const longLines =
    lines.filter(
      (line) =>
        line.length > 180
    );

  if (
    longLines.length >= 5
  ) {
    score -= 15;

    issues.push(
      "Several resume lines are unusually long"
    );
  } else if (
    longLines.length >= 3
  ) {
    score -= 10;

    issues.push(
      "Some resume lines are too long"
    );
  }

  // ----------------------------------------------------------
  // Excessive all-caps content
  // ----------------------------------------------------------

  const uppercaseLines =
    lines.filter(
      (line) =>
        line.length > 12 &&
        line ===
          line.toUpperCase() &&
        /[A-Z]/.test(
          line
        )
    );

  if (
    uppercaseLines.length >
      Math.max(
        3,
        Math.round(
          lines.length *
            0.15
        )
      )
  ) {
    score -= 5;

    issues.push(
      "Excessive uppercase formatting detected"
    );
  }

  // ----------------------------------------------------------
  // Missing important sections
  // ----------------------------------------------------------

  const importantSections = [
    "summary",
    "experience",
    "education",
    "skills",
  ];

  const missing =
    importantSections.filter(
      (section) =>
        !sections?.[section]
    );

  if (
    missing.length > 0
  ) {
    score -=
      missing.length *
      5;

    issues.push(
      "One or more important resume sections are missing"
    );
  }

  // ----------------------------------------------------------
  // Excessive blank lines
  // ----------------------------------------------------------

  if (
    /\n\s*\n\s*\n/.test(
      String(
        text
      )
    )
  ) {
    score -= 5;

    issues.push(
      "Excessive blank spacing detected"
    );
  }

  // ----------------------------------------------------------
  // Very short document
  // ----------------------------------------------------------

  if (
    lines.length < 8
  ) {
    score -= 10;

    issues.push(
      "Resume content appears too limited"
    );
  }

  return {
    score:
      Math.max(
        0,
        Math.min(
          100,
          score
        )
      ),

    issues:
      [
        ...new Set(
          issues
        ),
      ],
  };
}


// ============================================================
// 22. CATEGORY SCORES
// ============================================================

function calculateCategoryScores({
  contact,
  actionVerbs,
  actionVerbQuality,
  quantifiedAchievements,
  sections,
  skills,
  contentQuality,
  formattingQuality,
}) {
  // ----------------------------------------------------------
  // Contact
  // ----------------------------------------------------------

  const contactScore =
    contact.total > 0
      ? Math.round(
          (
            contact.score /
            contact.total
          ) *
          100
        )
      : 0;

  // ----------------------------------------------------------
  // Action verbs
  // ----------------------------------------------------------

  const actionVerbPresenceScore =
    Math.min(
      100,
      actionVerbs.count *
        8
    );

  const actionVerbScore =
    Math.round(
      (
        actionVerbPresenceScore *
        0.35
      ) +
      (
        actionVerbQuality.score *
        0.65
      )
    );

  // ----------------------------------------------------------
  // Quantified achievements
  // ----------------------------------------------------------

  const quantifiedScore =
    Math.min(
      100,
      quantifiedAchievements.count *
        16
    );

  // ----------------------------------------------------------
  // Skills
  // ----------------------------------------------------------

  const skillScore =
    Math.min(
      100,
      skills.length *
        8
    );

  // ----------------------------------------------------------
  // Sections
  // ----------------------------------------------------------

  const importantSections = [
    "summary",
    "experience",
    "education",
    "skills",
  ];

  const existingSections =
    importantSections.filter(
      (section) =>
        Boolean(
          sections?.[section]
        )
    ).length;

  const sectionScore =
    Math.round(
      (
        existingSections /
        importantSections.length
      ) *
      100
    );

  return {
    contactInformation:
      contactScore,

    actionVerbs:
      Math.min(
        100,
        actionVerbScore
      ),

    quantifiedAchievements:
      Math.round(
        quantifiedScore
      ),

    skills:
      Math.round(
        skillScore
      ),

    sections:
      Math.round(
        sectionScore
      ),

    contentQuality:
      contentQuality.score,

    formatting:
      formattingQuality.score,
  };
}


// ============================================================
// 23. MISSING SECTION IMPACT
// ============================================================

function calculateMissingSectionImpact(
  missingSections = []
) {
  const penalties = {
    experience: 10,
    skills: 9,
    education: 6,
    summary: 4,
  };

  let impact =
    0;

  for (
    const section of missingSections
  ) {
    impact +=
      penalties[
        section
      ] || 0;
  }

  return Math.min(
    25,
    impact
  );
}


// ============================================================
// 24. ATS SCORE
// ============================================================

function calculateATSScore({
  categoryScores,
  missingSectionImpact,
  duplicateSkills,
  contact,
}) {
  // ----------------------------------------------------------
  // Weighted score
  // ----------------------------------------------------------

  let score =
    (
      categoryScores.contactInformation *
      0.12
    ) +
    (
      categoryScores.actionVerbs *
      0.13
    ) +
    (
      categoryScores.quantifiedAchievements *
      0.15
    ) +
    (
      categoryScores.skills *
      0.18
    ) +
    (
      categoryScores.sections *
      0.15
    ) +
    (
      categoryScores.contentQuality *
      0.15
    ) +
    (
      categoryScores.formatting *
      0.12
    );

  // ----------------------------------------------------------
  // Missing section penalty
  // ----------------------------------------------------------

  score -=
    missingSectionImpact;

  // ----------------------------------------------------------
  // LinkedIn
  // ----------------------------------------------------------

  if (
    !contact.linkedin
  ) {
    score -= 2;
  }

  // ----------------------------------------------------------
  // Duplicate skills
  // ----------------------------------------------------------

  if (
    duplicateSkills.length >=
    6
  ) {
    score -= 3;
  } else if (
    duplicateSkills.length >=
    3
  ) {
    score -= 2;
  } else if (
    duplicateSkills.length >
    0
  ) {
    score -= 1;
  }

  return Math.round(
    Math.max(
      0,
      Math.min(
        100,
        score
      )
    )
  );
}


// ============================================================
// 25. GRADE
// ============================================================

function calculateGrade(
  score
) {
  if (
    score >= 90
  ) {
    return "Excellent";
  }

  if (
    score >= 80
  ) {
    return "Very Good";
  }

  if (
    score >= 70
  ) {
    return "Good";
  }

  if (
    score >= 60
  ) {
    return "Average";
  }

  if (
    score >= 50
  ) {
    return "Needs Improvement";
  }

  return "Poor";
}


// ============================================================
// 26. STRENGTH GENERATOR
// ============================================================

function generateStrengths({
  actionVerbs,
  actionVerbQuality,
  quantifiedAchievements,
  skills,
  sections,
  contact,
  contentQuality,
  formattingQuality,
}) {
  const strengths =
    [];

  if (
    quantifiedAchievements.count >=
    5
  ) {
    strengths.push(
      "Resume contains multiple measurable achievements"
    );
  } else if (
    quantifiedAchievements.count >=
    3
  ) {
    strengths.push(
      "Resume includes several measurable results"
    );
  }

  if (
    actionVerbQuality.score >=
    60
  ) {
    strengths.push(
      "Strong use of achievement-oriented action verbs"
    );
  } else if (
    actionVerbs.count >=
    5
  ) {
    strengths.push(
      "Resume uses a good variety of action verbs"
    );
  }

  if (
    skills.length >=
    8
  ) {
    strengths.push(
      "Good coverage of relevant professional skills"
    );
  } else if (
    skills.length >=
    4
  ) {
    strengths.push(
      "Resume includes several identifiable skills"
    );
  }

  if (
    sections.experience
  ) {
    strengths.push(
      "Professional experience section is present"
    );
  }

  if (
    sections.education
  ) {
    strengths.push(
      "Educational background is included"
    );
  }

  if (
    contact.email &&
    contact.phone
  ) {
    strengths.push(
      "Essential contact information is available"
    );
  }

  if (
    contentQuality.score >=
    75
  ) {
    strengths.push(
      "Resume contains sufficient detail and measurable content"
    );
  }

  if (
    formattingQuality.score >=
    85
  ) {
    strengths.push(
      "Resume structure appears clean and organized"
    );
  }

  return [
    ...new Set(
      strengths
    ),
  ].slice(
    0,
    6
  );
}


// ============================================================
// 27. WEAKNESS GENERATOR
// ============================================================

function generateWeaknesses({
  actionVerbs,
  actionVerbQuality,
  quantifiedAchievements,
  missingSections,
  contact,
  duplicateSkills,
  skills,
  formattingQuality,
}) {
  const weaknesses =
    [];

  if (
    missingSections.includes(
      "summary"
    )
  ) {
    weaknesses.push(
      "Professional summary section is missing"
    );
  }

  if (
    missingSections.includes(
      "experience"
    )
  ) {
    weaknesses.push(
      "Professional experience section is missing"
    );
  }

  if (
    missingSections.includes(
      "education"
    )
  ) {
    weaknesses.push(
      "Education section is missing"
    );
  }

  if (
    missingSections.includes(
      "skills"
    )
  ) {
    weaknesses.push(
      "Dedicated skills section is missing"
    );
  }

  if (
    actionVerbQuality.score <
      40 ||
    actionVerbs.count <
      4
  ) {
    weaknesses.push(
      "Limited use of strong achievement-oriented action verbs"
    );
  }

  if (
    quantifiedAchievements.count <
    3
  ) {
    weaknesses.push(
      "Resume has limited quantifiable achievements"
    );
  }

  if (
    !contact.linkedin
  ) {
    weaknesses.push(
      contact.linkedinMention
        ? "LinkedIn is mentioned but a clear profile URL is missing"
        : "LinkedIn profile URL is missing"
    );
  }

  if (
    !contact.email
  ) {
    weaknesses.push(
      "Professional email address could not be detected"
    );
  }

  if (
    !contact.phone
  ) {
    weaknesses.push(
      "Phone number could not be detected"
    );
  }

  if (
    skills.length <
    3
  ) {
    weaknesses.push(
      "Resume contains a limited number of identifiable skills"
    );
  }

  if (
    duplicateSkills.length >=
    3
  ) {
    weaknesses.push(
      "Several skills appear repeatedly and should be consolidated"
    );
  } else if (
    duplicateSkills.length >
    0
  ) {
    weaknesses.push(
      "Some skills are repeated in the resume"
    );
  }

  if (
    formattingQuality.score <
    70
  ) {
    weaknesses.push(
      "Resume formatting or structure could be improved"
    );
  }

  return [
    ...new Set(
      weaknesses
    ),
  ].slice(
    0,
    8
  );
}


// ============================================================
// 28. SMART SUGGESTIONS
// ============================================================

function generateSuggestions({
  missingSections,
  actionVerbs,
  actionVerbQuality,
  quantifiedAchievements,
  contact,
  duplicateSkills,
  formattingQuality,
  contentQuality,
}) {
  const suggestions =
    [];

  if (
    missingSections.includes(
      "summary"
    )
  ) {
    suggestions.push(
      "Add a concise professional summary tailored to your target role"
    );
  }

  if (
    missingSections.includes(
      "experience"
    )
  ) {
    suggestions.push(
      "Add a professional experience section with achievement-focused bullets"
    );
  }

  if (
    missingSections.includes(
      "education"
    )
  ) {
    suggestions.push(
      "Add your relevant educational qualifications"
    );
  }

  if (
    missingSections.includes(
      "skills"
    )
  ) {
    suggestions.push(
      "Add a dedicated skills section containing relevant skills and technologies"
    );
  }

  if (
    actionVerbs.count <
      4 ||
    actionVerbQuality.score <
      40
  ) {
    suggestions.push(
      "Start important bullet points with strong action verbs"
    );
  }

  if (
    quantifiedAchievements.count <
      3
  ) {
    suggestions.push(
      "Add measurable results such as percentages, numbers, revenue, users, time saved or output increased where genuinely applicable"
    );
  }

  if (
    !contact.linkedin
  ) {
    suggestions.push(
      "Add a professional LinkedIn profile URL"
    );
  }

  if (
    !contact.email
  ) {
    suggestions.push(
      "Add a clearly visible professional email address"
    );
  }

  if (
    duplicateSkills.length >
    0
  ) {
    suggestions.push(
      "Remove repeated skills and keep each skill listed once"
    );
  }

  if (
    formattingQuality.score <
    75
  ) {
    suggestions.push(
      "Improve formatting using clear headings, consistent spacing and concise bullets"
    );
  }

  if (
    contentQuality.score <
    65
  ) {
    suggestions.push(
      "Strengthen resume content with more specific responsibilities and measurable outcomes"
    );
  }

  if (
    suggestions.length ===
    0
  ) {
    suggestions.push(
      "Continue tailoring this resume for each target job description"
    );
  }

  return [
    ...new Set(
      suggestions
    ),
  ].slice(
    0,
    8
  );
}


// ============================================================
// 29. OVERALL RECOMMENDATION
// ============================================================

function generateOverallRecommendation({
  atsScore,
  strengths,
  weaknesses,
  suggestions,
  categoryScores,
}) {
  let opening =
    "";

  if (
    atsScore >=
    90
  ) {
    opening =
      "This resume is highly ATS-ready and demonstrates strong structure, content and professional presentation.";
  } else if (
    atsScore >=
    80
  ) {
    opening =
      "This resume has a strong ATS foundation, with a few opportunities for further optimization.";
  } else if (
    atsScore >=
    70
  ) {
    opening =
      "This resume has a good foundation, but several improvements could increase its ATS performance.";
  } else if (
    atsScore >=
    60
  ) {
    opening =
      "This resume contains useful information but needs noticeable improvements to become more ATS-friendly.";
  } else {
    opening =
      "This resume requires significant improvements in structure, content and ATS optimization.";
  }

  const scoreEntries =
    Object.entries(
      categoryScores || {}
    )
      .filter(
        ([, value]) =>
          Number.isFinite(
            Number(
              value
            )
          )
      );

  const sorted =
    [
      ...scoreEntries,
    ].sort(
      (
        a,
        b
      ) =>
        Number(
          b[1]
        ) -
        Number(
          a[1]
        )
    );

  const strongest =
    sorted[0];

  const weakest =
    sorted[
      sorted.length -
        1
    ];

  const categoryNames = {
    contactInformation:
      "contact information",

    actionVerbs:
      "action verbs",

    quantifiedAchievements:
      "quantifiable achievements",

    skills:
      "skills",

    sections:
      "resume sections",

    contentQuality:
      "content quality",

    formatting:
      "formatting",
  };

  const strongestName =
    strongest
      ? (
          categoryNames[
            strongest[0]
          ] ||
          strongest[0]
        )
      : "resume structure";

  const weakestName =
    weakest
      ? (
          categoryNames[
            weakest[0]
          ] ||
          weakest[0]
        )
      : "content quality";

  let recommendation =
    `${opening} `;

  recommendation +=
    `Your strongest area is ${strongestName}, while ${weakestName} should receive the most attention. `;

  if (
    weaknesses.length >
    0
  ) {
    recommendation +=
      "Address the highest-impact weaknesses first, especially missing sections, weak bullets and missing contact information. ";
  }

  if (
    suggestions.length >
    0
  ) {
    recommendation +=
      "For the best results, tailor the resume to each target job while keeping all claims truthful and supported by your actual experience.";
  }

  return recommendation.trim();
}


// ============================================================
// 30. MAIN ANALYZER
// ============================================================

function analyzeResume(
  text
) {
  if (
    !text ||
    typeof text !==
      "string" ||
    !text.trim()
  ) {
    throw new Error(
      "Resume text is required for analysis"
    );
  }

  const normalizedText =
    normalizeText(
      text
    );

  // ----------------------------------------------------------
  // Contact
  // ----------------------------------------------------------

  const contact =
    analyzeContactInformation(
      normalizedText
    );

  // ----------------------------------------------------------
  // Action verbs
  // ----------------------------------------------------------

  const actionVerbs =
    detectActionVerbs(
      normalizedText
    );

  // ----------------------------------------------------------
  // Action verb quality
  // ----------------------------------------------------------

  const actionVerbQuality =
    analyzeActionVerbQuality(
      normalizedText
    );

  // ----------------------------------------------------------
  // Quantified achievements
  // ----------------------------------------------------------

  const quantifiedAchievements =
    detectQuantifiedAchievements(
      normalizedText
    );

  // ----------------------------------------------------------
  // Sections
  // ----------------------------------------------------------

  const sections =
    detectSections(
      normalizedText
    );

  // ----------------------------------------------------------
  // Missing sections
  // ----------------------------------------------------------

  const missingSections =
    analyzeMissingSections(
      sections
    );

  // ----------------------------------------------------------
  // Skills
  // ----------------------------------------------------------

  const skills =
    detectSkills(
      normalizedText
    );

  // ----------------------------------------------------------
  // Duplicate skills
  // ----------------------------------------------------------

  const duplicateSkills =
    detectDuplicateSkills(
      normalizedText
    );

  // ----------------------------------------------------------
  // Content quality
  // ----------------------------------------------------------

  const contentQuality =
    analyzeContentQuality(
      normalizedText
    );

  // ----------------------------------------------------------
  // Formatting quality
  // ----------------------------------------------------------

  const formattingQuality =
    analyzeFormattingQuality(
      normalizedText,
      sections
    );

  // ----------------------------------------------------------
  // Category scores
  // ----------------------------------------------------------

  const categoryScores =
    calculateCategoryScores({
      contact,

      actionVerbs,

      actionVerbQuality,

      quantifiedAchievements,

      sections,

      skills,

      contentQuality,

      formattingQuality,
    });

  // ----------------------------------------------------------
  // Missing section impact
  // ----------------------------------------------------------

  const missingSectionImpact =
    calculateMissingSectionImpact(
      missingSections
    );

  // ----------------------------------------------------------
  // ATS score
  // ----------------------------------------------------------

  const atsScore =
    calculateATSScore({
      categoryScores,

      missingSectionImpact,

      duplicateSkills,

      contact,
    });

  // ----------------------------------------------------------
  // Grade
  // ----------------------------------------------------------

  const grade =
    calculateGrade(
      atsScore
    );

  // ----------------------------------------------------------
  // Strengths
  // ----------------------------------------------------------

  const strengths =
    generateStrengths({
      actionVerbs,

      actionVerbQuality,

      quantifiedAchievements,

      skills,

      sections,

      contact,

      contentQuality,

      formattingQuality,
    });

  // ----------------------------------------------------------
  // Weaknesses
  // ----------------------------------------------------------

  const weaknesses =
    generateWeaknesses({
      actionVerbs,

      actionVerbQuality,

      quantifiedAchievements,

      missingSections,

      contact,

      duplicateSkills,

      skills,

      formattingQuality,
    });

  // ----------------------------------------------------------
  // Suggestions
  // ----------------------------------------------------------

  const suggestions =
    generateSuggestions({
      missingSections,

      actionVerbs,

      actionVerbQuality,

      quantifiedAchievements,

      contact,

      duplicateSkills,

      formattingQuality,

      contentQuality,
    });

  // ----------------------------------------------------------
  // Overall recommendation
  // ----------------------------------------------------------

  const overallRecommendation =
    generateOverallRecommendation({
      atsScore,

      strengths,

      weaknesses,

      suggestions,

      categoryScores,
    });

  // ==========================================================
  // FINAL RESPONSE
  // ==========================================================

  return {
    // --------------------------------------------------------
    // ATS
    // --------------------------------------------------------

    atsScore,

    grade,

    score:
      atsScore,

    // --------------------------------------------------------
    // AI insights
    // --------------------------------------------------------

    strengths,

    weaknesses,

    suggestions,

    overallRecommendation,

    // --------------------------------------------------------
    // Metrics
    // --------------------------------------------------------

    metrics: {
      quantifiedAchievements:
        quantifiedAchievements.count,

      actionVerbs:
        actionVerbs.count,

      actionVerbBulletCoverage:
        actionVerbQuality.strongBulletCount,

      contactInformation:
        contact.score,

      skills:
        skills.length,

      duplicateSkills:
        duplicateSkills.length,

      resumeWords:
        contentQuality.wordCount,

      bulletPoints:
        contentQuality.bulletCount,

      numbers:
        contentQuality.numberCount,
    },

    // --------------------------------------------------------
    // Category scores
    // --------------------------------------------------------

    categoryScores,

    // --------------------------------------------------------
    // Contact
    // --------------------------------------------------------

    contactInformation:
      contact,

    // --------------------------------------------------------
    // Action verbs
    // --------------------------------------------------------

    actionVerbs,

    actionVerbQuality,

    // --------------------------------------------------------
    // Quantified achievements
    // --------------------------------------------------------

    quantifiedAchievements,

    // --------------------------------------------------------
    // Skills
    // --------------------------------------------------------

    skills,

    duplicateSkills,

    // --------------------------------------------------------
    // Sections
    // --------------------------------------------------------

    sections,

    missingSections,

    missingSectionImpact,

    // --------------------------------------------------------
    // Quality
    // --------------------------------------------------------

    contentQuality,

    formattingQuality,

    // --------------------------------------------------------
    // Additional metadata
    // --------------------------------------------------------

    analyzedAt:
      new Date().toISOString(),
  };
}


// ============================================================
// 31. EXPORT
// ============================================================

module.exports = {
  analyzeResume,
};

