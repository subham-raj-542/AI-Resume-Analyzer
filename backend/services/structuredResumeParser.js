
// ============================================================
// AI RESUME ANALYZER
// STRUCTURED RESUME PARSER
// FINAL STABLE VERSION
// ============================================================
//
// FLOW:
//
// PDF TEXT
//    ↓
// STRUCTURED RESUME PARSER
//    ↓
// {
//   name,
//   email,
//   phone,
//   location,
//   linkedin,
//   github,
//   portfolio,
//   website,
//   summary,
//   skills,
//   experience,
//   projects,
//   education,
//   certifications,
//   achievements,
//   languages,
//   hobbies,
//   rawText
// }
//
// IMPORTANT:
//
// ✅ Extracts existing information only
// ✅ Does not invent resume data
// ✅ Preserves raw text
// ✅ Supports raw text and structured objects
// ✅ Compatible with resumeTailor.js
// ✅ Compatible with tailoredResumeBuilder.js
//
// ============================================================


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

  return String(
    value
  ).trim();
}


// ============================================================
// SAFE ARRAY
// ============================================================

function safeArray(value) {
  return Array.isArray(
    value
  )
    ? value
    : [];
}


// ============================================================
// UNIQUE
// ============================================================

function unique(values = []) {
  const result = [];
  const seen = new Set();

  for (
    const value of safeArray(
      values
    )
  ) {
    const text =
      safeText(
        value
      );

    if (
      !text
    ) {
      continue;
    }

    const key =
      text.toLowerCase();

    if (
      seen.has(key)
    ) {
      continue;
    }

    seen.add(
      key
    );

    result.push(
      text
    );
  }

  return result;
}


// ============================================================
// NORMALIZE WHITESPACE
// ============================================================

function normalizeWhitespace(
  value = ""
) {
  return String(
    value
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
      /\s+/g,
      " "
    )
    .trim();
}


// ============================================================
// CLEAN LINE
// ============================================================

function cleanLine(
  value = ""
) {
  return normalizeWhitespace(
    String(
      value
    ).replace(
      /^\s*[-•●▪◦*✓✔➜➤→]\s*/,
      ""
    )
  );
}


// ============================================================
// BULLET DETECTION
// ============================================================

function isBullet(
  line = ""
) {
  return /^\s*[-•●▪◦*✓✔➜➤→]\s+/.test(
    String(
      line
    )
  );
}


// ============================================================
// DATE RANGE
// ============================================================

const MONTH =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

const DATE_VALUE =
  `(?:${MONTH}\\.?\\s+\\d{4}|\\d{4})`;

const DATE_END =
  `(?:present|current|${MONTH}\\.?\\s+\\d{4}|\\d{4})`;

const DATE_RANGE_REGEX =
  new RegExp(
    `(${DATE_VALUE})\\s*(?:-|–|—|to)\\s*(${DATE_END})`,
    "i"
  );


// ============================================================
// YEAR
// ============================================================

const YEAR_REGEX =
  /\b(?:19|20)\d{2}\b/;


// ============================================================
// URL
// ============================================================

function isUrl(
  line = ""
) {
  const value =
    String(
      line
    ).trim();

  return (
    /^(?:https?:\/\/|www\.)/i.test(
      value
    ) ||
    /(?:linkedin\.com|github\.com|gitlab\.com|bitbucket\.org)/i.test(
      value
    )
  );
}


// ============================================================
// SECTION ALIASES
// ============================================================

const SECTION_ALIASES = {
  summary: [
    "summary",
    "professional summary",
    "career summary",
    "resume summary",
    "profile",
    "professional profile",
    "career profile",
    "about me",
    "about",
    "overview",
    "professional overview",
    "career objective",
    "objective",
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
    "internship experience",
    "internships",
    "internship",
  ],

  education: [
    "education",
    "educational background",
    "academic background",
    "academic qualifications",
    "academic qualification",
    "qualifications",
    "education qualifications",
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
    "certificates",
    "certification",
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
// NORMALIZE HEADING
// ============================================================

function normalizeHeading(
  line = ""
) {
  return String(
    line
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
// DETECT SECTION HEADING
// ============================================================

function detectSectionHeading(
  line = ""
) {
  const normalized =
    normalizeHeading(
      line
    );

  if (
    !normalized
  ) {
    return "";
  }

  for (
    const [
      section,
      aliases,
    ] of Object.entries(
      SECTION_ALIASES
    )
  ) {
    for (
      const alias of aliases
    ) {
      const normalizedAlias =
        normalizeHeading(
          alias
        );

      if (
        normalized ===
        normalizedAlias
      ) {
        return section;
      }

      if (
        normalized.startsWith(
          normalizedAlias + " "
        )
      ) {
        return section;
      }
    }
  }

  return "";
}


// ============================================================
// SPLIT RESUME INTO SECTIONS
// ============================================================

function splitResumeIntoSections(
  resumeText = ""
) {
  const rawLines =
    String(
      resumeText
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

  const sections = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    hobbies: [],
  };

  let currentSection =
    "header";

  for (
    const rawLine of rawLines
  ) {
    const line =
      String(
        rawLine
      ).trim();

    if (
      !line
    ) {
      continue;
    }

    const detected =
      detectSectionHeading(
        line
      );

    if (
      detected
    ) {
      currentSection =
        detected;

      continue;
    }

    if (
      !sections[
        currentSection
      ]
    ) {
      sections[
        currentSection
      ] = [];
    }

    sections[
      currentSection
    ].push(
      line
    );
  }

  return sections;
}


// ============================================================
// EMAIL
// ============================================================

function extractEmail(
  text = ""
) {
  const match =
    String(
      text
    ).match(
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/
    );

  return match
    ? match[0]
    : "";
}


// ============================================================
// PHONE
// ============================================================

function extractPhone(
  text = ""
) {
  const source =
    String(
      text
    );

  const matches =
    source.match(
      /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?)?(?:\d{3,5}[\s.-]?\d{3,5}[\s.-]?\d{0,5})/g
    );

  if (
    !matches ||
    matches.length === 0
  ) {
    return "";
  }

  const candidates =
    matches
      .map(
        (value) =>
          safeText(
            value
          )
      )
      .filter(
        (value) => {
          const digits =
            value.replace(
              /\D/g,
              ""
            );

          return (
            digits.length >= 8 &&
            digits.length <= 15
          );
        }
      );

  if (
    candidates.length === 0
  ) {
    return "";
  }

  candidates.sort(
    (
      a,
      b
    ) =>
      b.replace(
        /\D/g,
        ""
      ).length -
      a.replace(
        /\D/g,
        ""
      ).length
  );

  return safeText(
    candidates[0]
  );
}


// ============================================================
// LINKEDIN
// ============================================================

function extractLinkedIn(
  text = ""
) {
  const match =
    String(
      text
    ).match(
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/[a-zA-Z0-9._-]+/i
    );

  return match
    ? match[0]
    : "";
}


// ============================================================
// GITHUB
// ============================================================

function extractGithub(
  text = ""
) {
  const match =
    String(
      text
    ).match(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9._-]+/i
    );

  return match
    ? match[0]
    : "";
}


// ============================================================
// PORTFOLIO
// ============================================================

function extractPortfolio(
  text = ""
) {
  const lines =
    String(
      text
    )
      .split(
        /\r?\n/
      )
      .map(
        (line) =>
          line.trim()
      );

  for (
    const line of lines
  ) {
    if (
      /portfolio/i.test(
        line
      ) &&
      isUrl(
        line
      )
    ) {
      return (
        line.match(
          /(?:https?:\/\/|www\.)\S+/i
        )?.[0] ||
        ""
      );
    }
  }

  return "";
}


// ============================================================
// WEBSITE
// ============================================================

function extractWebsite(
  text = ""
) {
  const lines =
    String(
      text
    )
      .split(
        /\r?\n/
      )
      .map(
        (line) =>
          line.trim()
      );

  for (
    const line of lines
  ) {
    if (
      !isUrl(
        line
      )
    ) {
      continue;
    }

    if (
      /linkedin\.com/i.test(
        line
      ) ||
      /github\.com/i.test(
        line
      ) ||
      /gitlab\.com/i.test(
        line
      ) ||
      /bitbucket\.org/i.test(
        line
      )
    ) {
      continue;
    }

    const url =
      line.match(
        /(?:https?:\/\/|www\.)\S+/i
      )?.[0];

    if (
      url
    ) {
      return url;
    }
  }

  return "";
}


// ============================================================
// LOCATION
// ============================================================

function extractLocation(
  headerLines = []
) {
  const candidates =
    [];

  for (
    const originalLine of safeArray(
      headerLines
    )
  ) {
    const line =
      cleanLine(
        originalLine
      );

    if (
      !line
    ) {
      continue;
    }

    if (
      /@/.test(
        line
      )
    ) {
      continue;
    }

    if (
      /linkedin|github|gitlab|bitbucket/i.test(
        line
      )
    ) {
      continue;
    }

    if (
      isUrl(
        line
      )
    ) {
      continue;
    }

    if (
      DATE_RANGE_REGEX.test(
        line
      )
    ) {
      continue;
    }

    if (
      /^\+?[\d\s().-]+$/.test(
        line
      )
    ) {
      continue;
    }

    if (
      /,\s*[A-Za-z]{2,}/.test(
        line
      )
    ) {
      candidates.push(
        line
      );
      continue;
    }

    if (
      /\b(remote|hybrid)\b/i.test(
        line
      )
    ) {
      candidates.push(
        line
      );
    }
  }

  return (
    candidates[0] ||
    ""
  );
}


// ============================================================
// NAME
// ============================================================

function extractName(
  headerLines = [],
  fullText = ""
) {
  const ignoredPatterns = [
    /@/,
    /linkedin/i,
    /github/i,
    /gitlab/i,
    /bitbucket/i,
    /\d{7,}/,
    /resume/i,
    /curriculum vitae/i,
    /^cv$/i,
    /https?:\/\//i,
    /www\./i,
  ];

  // ----------------------------------------------------------
  // 1. Header candidate
  // ----------------------------------------------------------

  for (
    const originalLine of safeArray(
      headerLines
    )
  ) {
    const line =
      cleanLine(
        originalLine
      );

    if (
      !line
    ) {
      continue;
    }

    if (
      ignoredPatterns.some(
        (
          pattern
        ) =>
          pattern.test(
            line
          )
      )
    ) {
      continue;
    }

    if (
      detectSectionHeading(
        line
      )
    ) {
      continue;
    }

    const words =
      line.split(
        /\s+/
      );

    if (
      words.length >= 1 &&
      words.length <= 5 &&
      line.length <= 70
    ) {
      const looksLikeName =
        words.every(
          (word) =>
            /^[A-Za-zÀ-ÖØ-öø-ÿ'`.-]+$/.test(
              word
            )
        );

      if (
        looksLikeName
      ) {
        return line;
      }
    }
  }

  // ----------------------------------------------------------
  // 2. Full text fallback
  // ----------------------------------------------------------

  const lines =
    String(
      fullText
    )
      .split(
        /\r?\n/
      )
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);

  for (
    const line of lines.slice(
      0,
      15
    )
  ) {
    if (
      ignoredPatterns.some(
        (
          pattern
        ) =>
          pattern.test(
            line
          )
      )
    ) {
      continue;
    }

    if (
      detectSectionHeading(
        line
      )
    ) {
      continue;
    }

    const words =
      line.split(
        /\s+/
      );

    if (
      line.length <= 70 &&
      words.length >= 1 &&
      words.length <= 5
    ) {
      const looksLikeName =
        words.every(
          (word) =>
            /^[A-Za-zÀ-ÖØ-öø-ÿ'`.-]+$/.test(
              word
            )
        );

      if (
        looksLikeName
      ) {
        return cleanLine(
          line
        );
      }
    }
  }

  return "";
}


// ============================================================
// BULLET PARSER
// ============================================================

function parseBulletLines(
  lines = []
) {
  return unique(
    safeArray(
      lines
    )
      .filter(
        (line) =>
          isBullet(
            line
          )
      )
      .map(
        (line) =>
          cleanLine(
            line
          )
      )
      .filter(Boolean)
  );
}


// ============================================================
// GENERIC ITEMS
// ============================================================

function parseGenericItems(
  lines = []
) {
  return unique(
    safeArray(
      lines
    )
      .map(
        cleanLine
      )
      .filter(Boolean)
  );
}


// ============================================================
// SKILLS
// ============================================================
//
// Important:
// We avoid splitting characters like:
// React.js
// Node.js
// C++
// C#
// .NET
// Next.js
// Vue.js
//
// ============================================================

function splitSkillLine(
  value = ""
) {
  return String(
    value
  )
    .split(
      /[,;|]+/
    )
    .flatMap(
      (part) =>
        part
          .split(
            /\s+\/\s+/
          )
    )
    .map(
      (part) =>
        normalizeWhitespace(
          part
        )
    )
    .filter(Boolean);
}


// ============================================================

function parseSkills(
  lines = []
) {
  const skills = [];

  for (
    const rawLine of safeArray(
      lines
    )
  ) {
    const clean =
      cleanLine(
        rawLine
      );

    if (
      !clean
    ) {
      continue;
    }

    const stripped =
      clean.replace(
        /^(?:skills?|technical skills?|core skills?|key skills?|technical expertise|technologies|tools?|tech stack|technical stack|competencies|core competencies)\s*:\s*/i,
        ""
      );

    // --------------------------------------------------------
    // Category format:
    //
    // Languages: C++, JavaScript
    //
    // Frameworks: React, Node.js
    // --------------------------------------------------------

    const colonIndex =
      stripped.indexOf(
        ":"
      );

    if (
      colonIndex >
        0 &&
      colonIndex <
        80
    ) {
      const category =
        stripped.slice(
          0,
          colonIndex
        );

      const remaining =
        stripped.slice(
          colonIndex + 1
        );

      if (
        category &&
        remaining
      ) {
        skills.push(
          ...splitSkillLine(
            remaining
          )
        );

        continue;
      }
    }

    skills.push(
      ...splitSkillLine(
        stripped
      )
    );
  }

  return unique(
    skills
  );
}


// ============================================================
// TITLE / COMPANY
// ============================================================

function parseTitleCompany(
  line = ""
) {
  const clean =
    cleanLine(
      line
    );

  if (
    !clean
  ) {
    return {
      title: "",
      company: "",
    };
  }

  // ----------------------------------------------------------
  // "Developer at Google"
  // ----------------------------------------------------------

  if (
    /\s+at\s+/i.test(
      clean
    )
  ) {
    const parts =
      clean.split(
        /\s+at\s+/i
      );

    return {
      title:
        normalizeWhitespace(
          parts[0]
        ),

      company:
        normalizeWhitespace(
          parts
            .slice(
              1
            )
            .join(
              " at "
            )
        ),
    };
  }

  // ----------------------------------------------------------
  // "Developer | Google"
  // ----------------------------------------------------------

  if (
    /\s*\|\s*/.test(
      clean
    )
  ) {
    const parts =
      clean.split(
        /\s*\|\s*/
      );

    if (
      parts.length >= 2
    ) {
      return {
        title:
          normalizeWhitespace(
            parts[0]
          ),

        company:
          normalizeWhitespace(
            parts
              .slice(
                1
              )
              .join(
                " | "
              )
          ),
      };
    }
  }

  // ----------------------------------------------------------
  // "Developer - Google"
  // ----------------------------------------------------------

  if (
    /\s+-\s+/.test(
      clean
    )
  ) {
    const parts =
      clean.split(
        /\s+-\s+/
      );

    if (
      parts.length === 2
    ) {
      return {
        title:
          normalizeWhitespace(
            parts[0]
          ),

        company:
          normalizeWhitespace(
            parts[1]
          ),
      };
    }
  }

  return {
    title:
      clean,

    company:
      "",
  };
}


// ============================================================
// EMPTY EXPERIENCE
// ============================================================

function createEmptyExperience() {
  return {
    type:
      "experience",

    title:
      "",

    company:
      "",

    location:
      "",

    startDate:
      "",

    endDate:
      "",

    dates:
      "",

    description:
      "",

    bullets:
      [],
  };
}


// ============================================================
// EXPERIENCE HEADER DETECTION
// ============================================================

function isLikelyExperienceHeader(
  line = ""
) {
  const clean =
    cleanLine(
      line
    );

  if (
    !clean
  ) {
    return false;
  }

  if (
    isBullet(
      line
    )
  ) {
    return false;
  }

  if (
    DATE_RANGE_REGEX.test(
      clean
    )
  ) {
    return false;
  }

  if (
    isUrl(
      clean
    )
  ) {
    return false;
  }

  const titleWords = [
    "developer",
    "engineer",
    "manager",
    "designer",
    "analyst",
    "intern",
    "associate",
    "assistant",
    "specialist",
    "coordinator",
    "administrator",
    "consultant",
    "executive",
    "lead",
    "supervisor",
    "director",
    "architect",
    "technician",
    "accountant",
    "teacher",
    "professor",
    "trainee",
    "operator",
    "worker",
    "sales",
    "marketing",
    "recruiter",
    "scientist",
    "researcher",
    "developer",
    "developer",
    "tester",
    "qa",
    "devops",
    "product",
  ];

  const lower =
    clean.toLowerCase();

  if (
    titleWords.some(
      (
        word
      ) =>
        lower.includes(
          word
        )
    )
  ) {
    return true;
  }

  if (
    /\s+at\s+/i.test(
      clean
    ) ||
    /\s*\|\s*/.test(
      clean
    )
  ) {
    return true;
  }

  return false;
}


// ============================================================
// APPLY DATE RANGE
// ============================================================

function applyDateRange(
  job,
  line
) {
  const match =
    String(
      line
    ).match(
      DATE_RANGE_REGEX
    );

  if (
    !match
  ) {
    return false;
  }

  job.dates =
    cleanLine(
      line
    );

  job.startDate =
    safeText(
      match[1]
    );

  job.endDate =
    safeText(
      match[2]
    );

  return true;
}


// ============================================================
// EXPERIENCE PARSER
// ============================================================

function parseExperience(
  lines = []
) {
  const result = [];

  let currentJob =
    null;

  let lastNonBulletWasHeader =
    false;

  const pushCurrent = () => {
    if (
      !currentJob
    ) {
      return;
    }

    currentJob.title =
      safeText(
        currentJob.title
      );

    currentJob.company =
      safeText(
        currentJob.company
      );

    currentJob.location =
      safeText(
        currentJob.location
      );

    currentJob.description =
      normalizeWhitespace(
        currentJob.description
      );

    currentJob.bullets =
      unique(
        currentJob.bullets
      );

    if (
      currentJob.title ||
      currentJob.company ||
      currentJob.description ||
      currentJob.bullets.length >
        0
    ) {
      result.push(
        currentJob
      );
    }

    currentJob =
      null;
  };

  const ensureJob = () => {
    if (
      !currentJob
    ) {
      currentJob =
        createEmptyExperience();
    }
  };

  for (
    let i = 0;
    i <
    safeArray(
      lines
    ).length;
    i++
  ) {
    const line =
      String(
        lines[i]
      ).trim();

    if (
      !line
    ) {
      continue;
    }

    // --------------------------------------------------------
    // Bullet
    // --------------------------------------------------------

    if (
      isBullet(
        line
      )
    ) {
      ensureJob();

      const bullet =
        cleanLine(
          line
        );

      if (
        bullet
      ) {
        currentJob.bullets.push(
          bullet
        );
      }

      lastNonBulletWasHeader =
        false;

      continue;
    }

    // --------------------------------------------------------
    // Date range
    // --------------------------------------------------------

    if (
      DATE_RANGE_REGEX.test(
        line
      )
    ) {
      ensureJob();

      applyDateRange(
        currentJob,
        line
      );

      lastNonBulletWasHeader =
        false;

      continue;
    }

    // --------------------------------------------------------
    // Single year
    // --------------------------------------------------------

    if (
      !currentJob?.dates &&
      YEAR_REGEX.test(
        line
      ) &&
      line.length <= 40
    ) {
      ensureJob();

      currentJob.dates =
        cleanLine(
          line
        );

      lastNonBulletWasHeader =
        false;

      continue;
    }

    // --------------------------------------------------------
    // URL
    // --------------------------------------------------------

    if (
      isUrl(
        line
      )
    ) {
      ensureJob();

      currentJob.description =
        currentJob.description
          ? `${currentJob.description} ${line}`
          : line;

      continue;
    }

    // --------------------------------------------------------
    // No current job
    // --------------------------------------------------------

    if (
      !currentJob
    ) {
      currentJob =
        createEmptyExperience();

      const parsed =
        parseTitleCompany(
          line
        );

      currentJob.title =
        parsed.title;

      currentJob.company =
        parsed.company;

      lastNonBulletWasHeader =
        true;

      continue;
    }

    // --------------------------------------------------------
    // Missing title
    // --------------------------------------------------------

    if (
      !currentJob.title
    ) {
      const parsed =
        parseTitleCompany(
          line
        );

      currentJob.title =
        parsed.title;

      currentJob.company =
        parsed.company;

      lastNonBulletWasHeader =
        true;

      continue;
    }

    // --------------------------------------------------------
    // Company after title
    // --------------------------------------------------------

    if (
      !currentJob.company &&
      lastNonBulletWasHeader
    ) {
      currentJob.company =
        cleanLine(
          line
        );

      lastNonBulletWasHeader =
        false;

      continue;
    }

    // --------------------------------------------------------
    // Location
    // --------------------------------------------------------

    if (
      !currentJob.location &&
      (
        /,\s*[A-Za-z]{2,}/.test(
          line
        ) ||
        /\b(remote|hybrid)\b/i.test(
          line
        )
      ) &&
      !DATE_RANGE_REGEX.test(
        line
      )
    ) {
      currentJob.location =
        cleanLine(
          line
        );

      lastNonBulletWasHeader =
        false;

      continue;
    }

    // --------------------------------------------------------
    // New likely job
    // --------------------------------------------------------

    if (
      isLikelyExperienceHeader(
        line
      ) &&
      (
        currentJob.bullets.length >
          0 ||
        currentJob.description
      )
    ) {
      pushCurrent();

      currentJob =
        createEmptyExperience();

      const parsed =
        parseTitleCompany(
          line
        );

      currentJob.title =
        parsed.title;

      currentJob.company =
        parsed.company;

      lastNonBulletWasHeader =
        true;

      continue;
    }

    // --------------------------------------------------------
    // Company fallback
    // --------------------------------------------------------

    if (
      currentJob.title &&
      !currentJob.company &&
      currentJob.bullets.length ===
        0 &&
      !currentJob.description
    ) {
      currentJob.company =
        cleanLine(
          line
        );

      lastNonBulletWasHeader =
        false;

      continue;
    }

    // --------------------------------------------------------
    // Description
    // --------------------------------------------------------

    const descriptionLine =
      cleanLine(
        line
      );

    if (
      descriptionLine
    ) {
      currentJob.description =
        currentJob.description
          ? `${currentJob.description} ${descriptionLine}`
          : descriptionLine;
    }

    lastNonBulletWasHeader =
      false;
  }

  pushCurrent();

  return result;
}


// ============================================================
// EXPERIENCE FALLBACK
// ============================================================

function ensureExperienceData(
  experience = [],
  lines = []
) {
  if (
    experience.length > 0
  ) {
    return experience;
  }

  const bullets =
    parseBulletLines(
      lines
    );

  if (
    bullets.length === 0
  ) {
    return [];
  }

  return [
    {
      ...createEmptyExperience(),

      bullets,
    },
  ];
}


// ============================================================
// EMPTY PROJECT
// ============================================================

function createEmptyProject() {
  return {
    type:
      "project",

    name:
      "",

    text:
      "",

    technologies:
      [],

    url:
      "",
  };
}


// ============================================================
// PROJECT PARSER
// ============================================================

function parseProjects(
  lines = []
) {
  const result = [];

  let currentProject =
    null;

  const pushCurrent = () => {
    if (
      !currentProject
    ) {
      return;
    }

    currentProject.name =
      safeText(
        currentProject.name
      );

    currentProject.text =
      normalizeWhitespace(
        currentProject.text
      );

    currentProject.technologies =
      unique(
        currentProject.technologies
      );

    currentProject.url =
      safeText(
        currentProject.url
      );

    if (
      currentProject.name ||
      currentProject.text ||
      currentProject.technologies.length >
        0 ||
      currentProject.url
    ) {
      result.push(
        currentProject
      );
    }

    currentProject =
      null;
  };

  const looksLikeNewProject =
    (
      line
    ) => {
      const clean =
        cleanLine(
          line
        );

      if (
        !clean
      ) {
        return false;
      }

      if (
        isBullet(
          line
        )
      ) {
        return false;
      }

      if (
        isUrl(
          line
        )
      ) {
        return false;
      }

      if (
        /^(?:technologies?|tech stack|tools?|stack|skills?)\s*:/i.test(
          clean
        )
      ) {
        return false;
      }

      // Short project heading
      if (
        clean.length <=
        90 &&
        clean.split(
          /\s+/
        ).length <=
          12
      ) {
        return true;
      }

      return false;
    };

  for (
    const rawLine of safeArray(
      lines
    )
  ) {
    const line =
      String(
        rawLine
      ).trim();

    if (
      !line
    ) {
      continue;
    }

    // --------------------------------------------------------
    // Bullet
    // --------------------------------------------------------

    if (
      isBullet(
        line
      )
    ) {
      if (
        !currentProject
      ) {
        currentProject =
          createEmptyProject();
      }

      const bullet =
        cleanLine(
          line
        );

      if (
        bullet
      ) {
        currentProject.text =
          currentProject.text
            ? `${currentProject.text} ${bullet}`
            : bullet;
      }

      continue;
    }

    // --------------------------------------------------------
    // Technologies
    // --------------------------------------------------------

    const technologyMatch =
      line.match(
        /^(?:technologies?|tech stack|tools?|stack|skills?)\s*:\s*(.+)$/i
      );

    if (
      technologyMatch
    ) {
      if (
        !currentProject
      ) {
        currentProject =
          createEmptyProject();
      }

      currentProject.technologies =
        unique(
          [
            ...currentProject.technologies,
            ...technologyMatch[1]
              .split(
                /[,;|]+/
              )
              .map(
                normalizeWhitespace
              ),
          ]
        );

      continue;
    }

    // --------------------------------------------------------
    // URL
    // --------------------------------------------------------

    if (
      isUrl(
        line
      )
    ) {
      if (
        !currentProject
      ) {
        currentProject =
          createEmptyProject();
      }

      const url =
        line.match(
          /(?:https?:\/\/|www\.)\S+/i
        )?.[0] ||
        line;

      currentProject.url =
        url;

      continue;
    }

    // --------------------------------------------------------
    // New project
    // --------------------------------------------------------

    if (
      !currentProject
    ) {
      currentProject =
        createEmptyProject();

      currentProject.name =
        cleanLine(
          line
        );

      continue;
    }

    if (
      looksLikeNewProject(
        line
      ) &&
      (
        currentProject.text ||
        currentProject.technologies.length >
          0 ||
        currentProject.url
      )
    ) {
      pushCurrent();

      currentProject =
        createEmptyProject();

      currentProject.name =
        cleanLine(
          line
        );

      continue;
    }

    // --------------------------------------------------------
    // Missing name
    // --------------------------------------------------------

    if (
      !currentProject.name
    ) {
      currentProject.name =
        cleanLine(
          line
        );

      continue;
    }

    // --------------------------------------------------------
    // Description
    // --------------------------------------------------------

    const description =
      cleanLine(
        line
      );

    if (
      description
    ) {
      currentProject.text =
        currentProject.text
          ? `${currentProject.text} ${description}`
          : description;
    }
  }

  pushCurrent();

  return result;
}


// ============================================================
// EDUCATION PARSER
// ============================================================

function parseEducation(
  lines = []
) {
  const result = [];

  let current =
    null;

  const createEducation =
    () => ({
      degree:
        "",

      institution:
        "",

      location:
        "",

      year:
        "",
    });

  const pushCurrent = () => {
    if (
      !current
    ) {
      return;
    }

    if (
      current.degree ||
      current.institution ||
      current.location ||
      current.year
    ) {
      result.push(
        current
      );
    }

    current =
      null;
  };

  for (
    const rawLine of safeArray(
      lines
    )
  ) {
    const line =
      cleanLine(
        rawLine
      );

    if (
      !line
    ) {
      continue;
    }

    const yearMatch =
      line.match(
        YEAR_REGEX
      );

    // --------------------------------------------------------
    // Start
    // --------------------------------------------------------

    if (
      !current
    ) {
      current =
        createEducation();
    }

    // --------------------------------------------------------
    // Degree
    // --------------------------------------------------------

    if (
      !current.degree
    ) {
      current.degree =
        line;

      if (
        yearMatch
      ) {
        current.year =
          yearMatch[0];
      }

      continue;
    }

    // --------------------------------------------------------
    // Institution
    // --------------------------------------------------------

    if (
      !current.institution
    ) {
      current.institution =
        line;

      if (
        yearMatch &&
        !current.year
      ) {
        current.year =
          yearMatch[0];
      }

      continue;
    }

    // --------------------------------------------------------
    // Location
    // --------------------------------------------------------

    if (
      !current.location &&
      (
        /,\s*[A-Za-z]{2,}/.test(
          line
        ) ||
        /\b(remote|hybrid)\b/i.test(
          line
        )
      )
    ) {
      current.location =
        line;

      continue;
    }

    // --------------------------------------------------------
    // Another education entry
    // --------------------------------------------------------

    if (
      current.degree &&
      current.institution
    ) {
      pushCurrent();

      current =
        createEducation();

      current.degree =
        line;

      if (
        yearMatch
      ) {
        current.year =
          yearMatch[0];
      }
    }
  }

  pushCurrent();

  return result;
}


// ============================================================
// CERTIFICATIONS
// ============================================================

function parseCertifications(
  lines = []
) {
  return unique(
    safeArray(
      lines
    )
      .map(
        cleanLine
      )
      .filter(Boolean)
  );
}


// ============================================================
// ACHIEVEMENTS
// ============================================================

function parseAchievements(
  lines = []
) {
  return unique(
    safeArray(
      lines
    )
      .map(
        cleanLine
      )
      .filter(Boolean)
  );
}


// ============================================================
// LANGUAGES
// ============================================================

function parseLanguages(
  lines = []
) {
  const result = [];

  for (
    const rawLine of safeArray(
      lines
    )
  ) {
    const clean =
      cleanLine(
        rawLine
      );

    if (
      !clean
    ) {
      continue;
    }

    const stripped =
      clean.replace(
        /^(?:languages?|language proficiency|languages known)\s*:\s*/i,
        ""
      );

    const parts =
      stripped.split(
        /[,;|]+/
      );

    for (
      const part of parts
    ) {
      const value =
        normalizeWhitespace(
          part
        );

      if (
        value
      ) {
        result.push(
          value
        );
      }
    }
  }

  return unique(
    result
  );
}


// ============================================================
// HOBBIES
// ============================================================

function parseHobbies(
  lines = []
) {
  const result = [];

  for (
    const rawLine of safeArray(
      lines
    )
  ) {
    const clean =
      cleanLine(
        rawLine
      );

    if (
      !clean
    ) {
      continue;
    }

    const stripped =
      clean.replace(
        /^(?:hobbies?|interests?|hobbies & interests|interests & hobbies)\s*:\s*/i,
        ""
      );

    const parts =
      stripped.split(
        /[,;|]+/
      );

    for (
      const part of parts
    ) {
      const value =
        normalizeWhitespace(
          part
        );

      if (
        value
      ) {
        result.push(
          value
        );
      }
    }
  }

  return unique(
    result
  );
}


// ============================================================
// SUMMARY
// ============================================================

function parseSummary(
  lines = []
) {
  return normalizeWhitespace(
    safeArray(
      lines
    )
      .map(
        cleanLine
      )
      .filter(Boolean)
      .join(
        " "
      )
  );
}


// ============================================================
// RAW TEXT → STRUCTURED RESUME
// ============================================================

function convertResumeTextToParsedResume(
  resumeText = ""
) {
  const text =
    safeText(
      resumeText
    );

  if (
    !text
  ) {
    throw new Error(
      "Resume text is required for parsing."
    );
  }

  // ==========================================================
  // SPLIT
  // ==========================================================

  const sections =
    splitResumeIntoSections(
      text
    );

  // ==========================================================
  // CONTACT
  // ==========================================================

  const email =
    extractEmail(
      text
    );

  const phone =
    extractPhone(
      text
    );

  const linkedin =
    extractLinkedIn(
      text
    );

  const github =
    extractGithub(
      text
    );

  const portfolio =
    extractPortfolio(
      text
    );

  const website =
    extractWebsite(
      text
    );

  const name =
    extractName(
      sections.header,
      text
    );

  const location =
    extractLocation(
      sections.header
    );

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    parseSummary(
      sections.summary
    );

  // ==========================================================
  // SKILLS
  // ==========================================================

  const skills =
    parseSkills(
      sections.skills
    );

  // ==========================================================
  // EXPERIENCE
  // ==========================================================

  let experience =
    parseExperience(
      sections.experience
    );

  experience =
    ensureExperienceData(
      experience,
      sections.experience
    );

  // ==========================================================
  // PROJECTS
  // ==========================================================

  const projects =
    parseProjects(
      sections.projects
    );

  // ==========================================================
  // EDUCATION
  // ==========================================================

  const education =
    parseEducation(
      sections.education
    );

  // ==========================================================
  // CERTIFICATIONS
  // ==========================================================

  const certifications =
    parseCertifications(
      sections.certifications
    );

  // ==========================================================
  // ACHIEVEMENTS
  // ==========================================================

  const achievements =
    parseAchievements(
      sections.achievements
    );

  // ==========================================================
  // LANGUAGES
  // ==========================================================

  const languages =
    parseLanguages(
      sections.languages
    );

  // ==========================================================
  // HOBBIES
  // ==========================================================

  const hobbies =
    parseHobbies(
      sections.hobbies
    );

  // ==========================================================
  // FINAL STRUCTURED OBJECT
  // ==========================================================

  const parsedResume = {
    name,

    email,

    phone,

    location,

    linkedin,

    github,

    portfolio,

    website,

    summary,

    skills,

    experience,

    projects,

    education,

    certifications,

    achievements,

    languages,

    hobbies,

    rawText:
      text,
  };

  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log(
    "\n================================================"
  );

  console.log(
    "           STRUCTURED RESUME PARSER"
  );

  console.log(
    "================================================"
  );

  console.log(
    "Name:",
    parsedResume.name ||
      "Not detected"
  );

  console.log(
    "Email:",
    parsedResume.email ||
      "Not detected"
  );

  console.log(
    "Phone:",
    parsedResume.phone ||
      "Not detected"
  );

  console.log(
    "Location:",
    parsedResume.location ||
      "Not detected"
  );

  console.log(
    "LinkedIn:",
    parsedResume.linkedin ||
      "Not detected"
  );

  console.log(
    "GitHub:",
    parsedResume.github ||
      "Not detected"
  );

  console.log(
    "Portfolio:",
    parsedResume.portfolio ||
      "Not detected"
  );

  console.log(
    "Website:",
    parsedResume.website ||
      "Not detected"
  );

  console.log(
    "Skills:",
    parsedResume.skills.length
  );

  console.log(
    "Experience:",
    parsedResume.experience.length
  );

  console.log(
    "Experience Bullets:",
    parsedResume.experience.reduce(
      (
        total,
        job
      ) =>
        total +
        safeArray(
          job?.bullets
        ).length,
      0
    )
  );

  console.log(
    "Projects:",
    parsedResume.projects.length
  );

  console.log(
    "Education:",
    parsedResume.education.length
  );

  console.log(
    "Certifications:",
    parsedResume.certifications.length
  );

  console.log(
    "Achievements:",
    parsedResume.achievements.length
  );

  console.log(
    "Languages:",
    parsedResume.languages.length
  );

  console.log(
    "Hobbies:",
    parsedResume.hobbies.length
  );

  console.log(
    "Raw text characters:",
    parsedResume.rawText.length
  );

  console.log(
    "================================================\n"
  );

  return parsedResume;
}


// ============================================================
// NORMALIZE STRUCTURED INPUT
// ============================================================
//
// Supports:
//
// ✅ Raw text
// ✅ Structured object
//
// ============================================================

function normalizeResumeInput(
  resumeInput
) {
  // ----------------------------------------------------------
  // RAW STRING
  // ----------------------------------------------------------

  if (
    typeof resumeInput ===
    "string"
  ) {
    const text =
      resumeInput.trim();

    if (
      !text
    ) {
      throw new Error(
        "Resume text is required."
      );
    }

    return convertResumeTextToParsedResume(
      text
    );
  }

  // ----------------------------------------------------------
  // OBJECT
  // ----------------------------------------------------------

  if (
    resumeInput &&
    typeof resumeInput ===
      "object" &&
    !Array.isArray(
      resumeInput
    )
  ) {
    const normalized = {
      name:
        safeText(
          resumeInput.name ||
          resumeInput.fullName ||
          resumeInput.candidateName
        ),

      email:
        safeText(
          resumeInput.email
        ),

      phone:
        safeText(
          resumeInput.phone ||
          resumeInput.mobile
        ),

      location:
        safeText(
          resumeInput.location ||
          resumeInput.address
        ),

      linkedin:
        safeText(
          resumeInput.linkedin ||
          resumeInput.linkedIn ||
          resumeInput.linkedinUrl
        ),

      github:
        safeText(
          resumeInput.github ||
          resumeInput.githubUrl
        ),

      portfolio:
        safeText(
          resumeInput.portfolio ||
          resumeInput.portfolioUrl
        ),

      website:
        safeText(
          resumeInput.website ||
          resumeInput.websiteUrl
        ),

      summary:
        safeText(
          resumeInput.summary ||
          resumeInput.profile ||
          ""
        ),

      objective:
        safeText(
          resumeInput.objective
        ),

      profile:
        safeText(
          resumeInput.profile
        ),

      skills:
        safeArray(
          resumeInput.skills
        ),

      experience:
        safeArray(
          resumeInput.experience
        ),

      projects:
        safeArray(
          resumeInput.projects
        ),

      education:
        safeArray(
          resumeInput.education
        ),

      certifications:
        safeArray(
          resumeInput.certifications
        ),

      achievements:
        safeArray(
          resumeInput.achievements
        ),

      languages:
        safeArray(
          resumeInput.languages
        ),

      hobbies:
        safeArray(
          resumeInput.hobbies
        ),

      rawText:
        safeText(
          resumeInput.rawText ||
          resumeInput.resumeText
        ),
    };

    // --------------------------------------------------------
    // If rawText exists and structured fields are empty,
    // parse the original text again.
    // --------------------------------------------------------

    const meaningfulCount =
      normalized.skills.length +
      normalized.experience.length +
      normalized.projects.length +
      normalized.education.length +
      normalized.certifications.length +
      normalized.achievements.length +
      normalized.languages.length +
      normalized.hobbies.length;

    if (
      meaningfulCount === 0 &&
      normalized.rawText
    ) {
      return convertResumeTextToParsedResume(
        normalized.rawText
      );
    }

    return normalized;
  }

  throw new Error(
    "Resume text or parsed resume data is required."
  );
}


// ============================================================
// CONVENIENCE FUNCTION
// ============================================================

function buildStructuredResume(
  resumeText
) {
  return convertResumeTextToParsedResume(
    resumeText
  );
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  convertResumeTextToParsedResume,

  normalizeResumeInput,

  buildStructuredResume,

  splitResumeIntoSections,

  detectSectionHeading,

  extractName,

  extractEmail,

  extractPhone,

  extractLinkedIn,

  extractGithub,

  extractPortfolio,

  extractWebsite,

  extractLocation,

  parseSkills,

  parseExperience,

  parseProjects,

  parseEducation,

  parseCertifications,

  parseAchievements,

  parseLanguages,

  parseHobbies,

  parseSummary,

  isBullet,

  isUrl,
};

