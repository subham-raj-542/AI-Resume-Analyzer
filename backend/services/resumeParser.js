
// ============================================================
// AI RESUME ANALYZER
// SMART RESUME PARSER SERVICE v5
// ============================================================
//
// Input:
//   PDF extracted resume text
//
// Output:
//   Clean structured resume data
//
// Improvements over v4:
//   - Safer section detection
//   - Better PDF line cleanup
//   - Better name detection
//   - Better contact extraction
//   - Better experience header detection
//   - Better title/company/location parsing
//   - Better date detection
//   - Better bullet reconstruction
//   - Prevents normal bullet text becoming job headers
//   - Better project extraction
//   - Better education extraction
//   - Better skills extraction
//   - Removes obvious parser artifacts
//   - Compatible with Tailored Resume Builder v7
//
// No external API required.
// ============================================================


// ============================================================
// SAFE HELPERS
// ============================================================

function safeText(value = "") {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}


function safeArray(value) {
  return Array.isArray(value) ? value : [];
}


function cleanText(text = "") {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\t+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n[ ]+/g, "\n")
    .replace(/[ ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}


function cleanLine(line = "") {
  return String(line)
    .replace(/\u00a0/g, " ")
    .replace(/\t+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function removeBulletPrefix(line = "") {
  return cleanLine(
    String(line)
      .replace(/^\s*[-•●▪◦*▪‣►➢➤]\s*/, "")
      .replace(/^\s*\d+[.)]\s*/, "")
  );
}


function unique(values = []) {
  return [
    ...new Set(
      safeArray(values)
        .map((value) => safeText(value))
        .filter(Boolean)
    ),
  ];
}


function normalizeWhitespace(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .trim();
}


function capitalizeWords(text = "") {
  return String(text)
    .split(" ")
    .map((word) => {
      if (!word) return word;

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}


// ============================================================
// SECTION ALIASES
// ============================================================

const SECTION_ALIASES = {
  summary: [
    "summary",
    "professional summary",
    "profile",
    "professional profile",
    "career summary",
    "career profile",
    "objective",
    "career objective",
    "about me",
    "about",
  ],

  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "employment history",
    "work history",
    "career history",
    "internship",
    "internships",
    "relevant experience",
  ],

  projects: [
    "projects",
    "project",
    "academic projects",
    "academic project",
    "personal projects",
    "personal project",
    "project experience",
    "key projects",
  ],

  education: [
    "education",
    "educational background",
    "academic background",
    "academic qualification",
    "academic qualifications",
    "qualifications",
    "education background",
  ],

  skills: [
    "skills",
    "technical skills",
    "technical skill",
    "core skills",
    "key skills",
    "professional skills",
    "skills and technologies",
    "skills & technologies",
    "technical skills and tools",
    "technical skills & tools",
    "technologies",
    "technical stack",
    "tech stack",
  ],

  certifications: [
    "certifications",
    "certification",
    "certificates",
    "certificate",
    "licenses and certifications",
    "licenses & certifications",
    "licenses",
    "courses",
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
  ],

  languages: [
    "languages",
    "language",
  ],

  hobbies: [
    "hobbies",
    "hobby",
    "interests",
    "interests and hobbies",
  ],

  details: [
    "details",
    "personal details",
    "contact details",
    "contact information",
    "personal information",
  ],

  links: [
    "links",
    "profiles",
    "social links",
  ],
};


// ============================================================
// HEADING NORMALIZATION
// ============================================================

function normalizeHeading(line = "") {
  return safeText(line)
    .toLowerCase()
    .replace(/[|:]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}


function detectSection(line = "") {
  const normalized = normalizeHeading(line);

  if (!normalized) {
    return null;
  }

  for (const [section, aliases] of Object.entries(
    SECTION_ALIASES
  )) {
    if (aliases.includes(normalized)) {
      return section;
    }
  }

  return null;
}


// ============================================================
// DATE HELPERS
// ============================================================

const MONTH_PATTERN =
  "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*";


function looksLikeDate(line = "") {
  const value = safeText(line);

  if (!value) {
    return false;
  }

  return (
    /\b(?:19|20)\d{2}\b/.test(value) ||
    /\b\d{1,2}[/-]\d{4}\b/.test(value) ||
    new RegExp(
      `\\b${MONTH_PATTERN}\\s+(?:19|20)\\d{2}\\b`,
      "i"
    ).test(value) ||
    /\b(?:present|current|ongoing)\b/i.test(value)
  );
}


function extractDateRange(line = "") {
  const value = cleanLine(line);

  if (!value) {
    return null;
  }

  let match = value.match(
    new RegExp(
      `^(${MONTH_PATTERN}\\s+(?:19|20)\\d{2})\\s*[—–-]\\s*(${MONTH_PATTERN}\\s+(?:19|20)\\d{2}|present|current|ongoing)$`,
      "i"
    )
  );

  if (match) {
    return {
      raw: value,
      startDate: match[1],
      endDate: match[2],
    };
  }

  match = value.match(
    /^((?:19|20)\d{2})\s*[—–-]\s*((?:19|20)\d{2}|present|current|ongoing)$/i
  );

  if (match) {
    return {
      raw: value,
      startDate: match[1],
      endDate: match[2],
    };
  }

  match = value.match(
    /^((?:19|20)\d{2})\s*[-/]\s*((?:19|20)\d{2}|present|current|ongoing)$/i
  );

  if (match) {
    return {
      raw: value,
      startDate: match[1],
      endDate: match[2],
    };
  }

  match = value.match(
    new RegExp(
      `^(${MONTH_PATTERN}\\s+(?:19|20)\\d{2})$`,
      "i"
    )
  );

  if (match) {
    return {
      raw: value,
      startDate: match[1],
      endDate: "",
    };
  }

  match = value.match(/^((?:19|20)\d{2})$/);

  if (match) {
    return {
      raw: value,
      startDate: match[1],
      endDate: "",
    };
  }

  return null;
}


// ============================================================
// BULLET DETECTION
// ============================================================

function hasBulletPrefix(line = "") {
  return (
    /^\s*[-•●▪◦*▪‣►➢➤]/.test(
      safeText(line)
    ) ||
    /^\s*\d+[.)]\s+/.test(
      safeText(line)
    )
  );
}


const ACTION_VERBS = [
  "performed",
  "managed",
  "maintained",
  "picked",
  "saved",
  "cut",
  "filled",
  "completed",
  "awarded",
  "handled",
  "improved",
  "increased",
  "reduced",
  "created",
  "developed",
  "supported",
  "organized",
  "processed",
  "coordinated",
  "assisted",
  "achieved",
  "delivered",
  "led",
  "optimized",
  "implemented",
  "built",
  "designed",
  "deployed",
  "integrated",
  "tested",
  "analyzed",
  "configured",
  "automated",
  "resolved",
  "launched",
  "engineered",
  "contributed",
  "participated",
  "worked",
  "helped",
  "responsible",
  "oversaw",
  "supervised",
  "prepared",
  "loaded",
  "unloaded",
  "received",
  "shipped",
  "packed",
  "counted",
  "tracked",
  "inspected",
  "ensured",
  "monitored",
  "operated",
  "communicated",
  "collaborated",
  "generated",
  "reviewed",
  "verified",
  "documented",
  "resolved",
  "trained",
  "assisted",
];


function isActionBullet(line = "") {
  const value = removeBulletPrefix(line);

  if (!value) {
    return false;
  }

  const pattern = new RegExp(
    `^(?:${ACTION_VERBS.join("|")})\\b`,
    "i"
  );

  return pattern.test(value);
}


function isBulletLine(line = "") {
  return (
    hasBulletPrefix(line) ||
    isActionBullet(line)
  );
}


// ============================================================
// JOB TITLE DETECTION
// ============================================================

const JOB_TITLE_WORDS = [
  "associate",
  "assistant",
  "manager",
  "engineer",
  "developer",
  "analyst",
  "specialist",
  "coordinator",
  "administrator",
  "intern",
  "designer",
  "consultant",
  "supervisor",
  "operator",
  "technician",
  "executive",
  "worker",
  "laborer",
  "lead",
  "director",
  "officer",
  "representative",
  "architect",
  "scientist",
  "accountant",
  "recruiter",
  "clerk",
  "cashier",
  "developer",
  "programmer",
  "tester",
  "researcher",
  "trainee",
  "apprentice",
];


function containsJobTitleWord(line = "") {
  const lower = line.toLowerCase();

  return JOB_TITLE_WORDS.some((word) => {
    const regex = new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );

    return regex.test(lower);
  });
}


function isLikelyCompanyName(value = "") {
  const text = cleanLine(value);

  if (!text) {
    return false;
  }

  const companyWords = [
    "inc",
    "llc",
    "ltd",
    "limited",
    "corp",
    "corporation",
    "company",
    "co.",
    "logistics",
    "laboratories",
    "laboratory",
    "solutions",
    "technologies",
    "technology",
    "systems",
    "services",
    "group",
    "industries",
    "warehouse",
    "retail",
  ];

  const lower = text.toLowerCase();

  return companyWords.some((word) =>
    lower.includes(word)
  );
}


function looksLikeExperienceHeader(line = "") {
  const value = cleanLine(line);

  if (!value) {
    return false;
  }

  if (isBulletLine(value)) {
    return false;
  }

  if (detectSection(value)) {
    return false;
  }

  if (extractDateRange(value)) {
    return false;
  }

  // Long sentences are almost always descriptions.
  if (value.length > 110) {
    return false;
  }

  // Strong separators.
  if (/\s+at\s+/i.test(value)) {
    return true;
  }

  if (/\s+@\s+/i.test(value)) {
    return true;
  }

  if (/\s[-–—]\s/.test(value)) {
    const pieces = value.split(/\s[-–—]\s/);

    if (
      pieces.length >= 2 &&
      (
        containsJobTitleWord(pieces[0]) ||
        isLikelyCompanyName(pieces[1])
      )
    ) {
      return true;
    }
  }

  // Avoid classifying ordinary sentences as job headers.
  if (/[.!?]$/.test(value)) {
    return false;
  }

  // Strong job-title evidence.
  if (containsJobTitleWord(value)) {
    const words = value.split(/\s+/);

    return words.length <= 12;
  }

  return false;
}


// ============================================================
// EXPERIENCE HEADER PARSER
// ============================================================

function parseExperienceHeader(line = "") {
  const value = cleanLine(line);

  if (!value) {
    return {
      title: "",
      company: "",
      location: "",
      raw: "",
    };
  }

  // ----------------------------------------------------------
  // Title at Company, Location
  // ----------------------------------------------------------

  let match = value.match(
    /^(.+?)\s+at\s+([^,|]+?)(?:,\s*(.+))?$/i
  );

  if (match) {
    return {
      title: cleanLine(match[1]),
      company: cleanLine(match[2]),
      location: cleanLine(match[3] || ""),
      raw: value,
    };
  }

  // ----------------------------------------------------------
  // Title @ Company, Location
  // ----------------------------------------------------------

  match = value.match(
    /^(.+?)\s+@\s+([^,|]+?)(?:,\s*(.+))?$/i
  );

  if (match) {
    return {
      title: cleanLine(match[1]),
      company: cleanLine(match[2]),
      location: cleanLine(match[3] || ""),
      raw: value,
    };
  }

  // ----------------------------------------------------------
  // Title - Company, Location
  // ----------------------------------------------------------

  match = value.match(
    /^(.+?)\s[-–—]\s(.+?)(?:,\s*(.+))?$/
  );

  if (match) {
    return {
      title: cleanLine(match[1]),
      company: cleanLine(match[2]),
      location: cleanLine(match[3] || ""),
      raw: value,
    };
  }

  // ----------------------------------------------------------
  // Title | Company | Location
  // ----------------------------------------------------------

  const pipeParts = value
    .split("|")
    .map(cleanLine)
    .filter(Boolean);

  if (pipeParts.length >= 2) {
    return {
      title: pipeParts[0],
      company: pipeParts[1],
      location: pipeParts.slice(2).join(", "),
      raw: value,
    };
  }

  // ----------------------------------------------------------
  // Fallback
  // ----------------------------------------------------------

  return {
    title: value,
    company: "",
    location: "",
    raw: value,
  };
}


// ============================================================
// SECTION EXTRACTION
// ============================================================

function extractSections(text = "") {
  const lines = cleanText(text)
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  const sections = {
    summary: [],
    experience: [],
    projects: [],
    education: [],
    skills: [],
    certifications: [],
    achievements: [],
    languages: [],
    hobbies: [],
    details: [],
    links: [],
    other: [],
  };

  let currentSection = "other";

  for (const rawLine of lines) {
    if (!rawLine) {
      continue;
    }

    let detected = detectSection(rawLine);

    if (!detected) {
      const cleanedHeading = rawLine
        .replace(/[:|]+$/, "")
        .trim();

      detected = detectSection(
        cleanedHeading
      );
    }

    if (detected) {
      currentSection = detected;
      continue;
    }

    sections[currentSection].push(
      rawLine
    );
  }

  return sections;
}


// ============================================================
// CONTACT EXTRACTION
// ============================================================

function extractEmail(text = "") {
  const match = String(text).match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  return match ? match[0].trim() : "";
}


function extractPhone(text = "") {
  const matches =
    String(text).match(
      /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3}[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g
    ) || [];

  for (const candidate of matches) {
    const digits = candidate.replace(
      /\D/g,
      ""
    );

    if (
      digits.length >= 10 &&
      digits.length <= 15
    ) {
      return candidate.trim();
    }
  }

  return "";
}


function extractLinkedIn(text = "") {
  const match = String(text).match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/[A-Za-z0-9._%/-]+/i
  );

  if (!match) {
    return "";
  }

  let url = match[0].trim();

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url.replace(
    /[),.;]+$/,
    ""
  );
}


function extractGitHub(text = "") {
  const match = String(text).match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9._-]+/i
  );

  if (!match) {
    return "";
  }

  let url = match[0].trim();

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url.replace(
    /[),.;]+$/,
    ""
  );
}


// ============================================================
// NAME DETECTION
// ============================================================

function looksLikeName(line = "") {
  const value = cleanLine(line);

  if (
    value.length < 2 ||
    value.length > 60
  ) {
    return false;
  }

  const lower = value.toLowerCase();

  const blocked = [
    "resume",
    "curriculum vitae",
    "cv",
    "summary",
    "profile",
    "objective",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "achievements",
    "contact",
    "linkedin",
    "github",
    "email",
    "phone",
    "details",
    "employment",
    "languages",
    "hobbies",
    "references",
  ];

  if (
    blocked.some(
      (word) =>
        lower === word ||
        lower.startsWith(`${word}:`)
    )
  ) {
    return false;
  }

  if (
    value.includes("@") ||
    /https?:\/\//i.test(value)
  ) {
    return false;
  }

  if (/\d{5,}/.test(value)) {
    return false;
  }

  if (isBulletLine(value)) {
    return false;
  }

  if (detectSection(value)) {
    return false;
  }

  const words = value.split(/\s+/);

  if (
    words.length < 2 ||
    words.length > 5
  ) {
    return false;
  }

  return /^[A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){1,4}$/.test(
    value
  );
}


function extractName(text = "") {
  const lines = cleanText(text)
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  // Name normally appears near the beginning.
  for (
    const line of lines.slice(0, 15)
  ) {
    if (looksLikeName(line)) {
      return line;
    }
  }

  return "";
}


// ============================================================
// SUMMARY
// ============================================================

function extractSummary(sections = {}) {
  return normalizeWhitespace(
    safeArray(sections.summary)
      .map(removeBulletPrefix)
      .filter(Boolean)
      .join(" ")
  );
}


// ============================================================
// COMMON SKILLS
// ============================================================

const COMMON_SKILLS = {
  javascript: "JavaScript",
  "java script": "JavaScript",
  js: "JavaScript",

  typescript: "TypeScript",

  python: "Python",
  python3: "Python",

  java: "Java",

  "c++": "C++",
  cpp: "C++",

  "c#": "C#",

  html: "HTML",
  html5: "HTML",

  css: "CSS",
  css3: "CSS",

  react: "React",
  "react.js": "React",
  reactjs: "React",
  "react js": "React",

  tailwind: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  tailwindcss: "Tailwind CSS",

  node: "Node.js",
  "node.js": "Node.js",
  nodejs: "Node.js",

  express: "Express.js",
  "express.js": "Express.js",
  expressjs: "Express.js",

  "next.js": "Next.js",
  nextjs: "Next.js",

  mongodb: "MongoDB",
  "mongo db": "MongoDB",

  mysql: "MySQL",

  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",

  sql: "SQL",

  git: "Git",
  github: "GitHub",
  "git hub": "GitHub",

  gitlab: "GitLab",

  redux: "Redux",
  "redux toolkit": "Redux Toolkit",

  rest: "REST",
  "rest api": "REST API",
  "restful api": "REST API",
  restful: "REST",

  api: "API",

  docker: "Docker",
  kubernetes: "Kubernetes",

  aws: "AWS",
  azure: "Azure",
  gcp: "GCP",

  communication: "Communication",
  "communication skills": "Communication",

  "problem solving": "Problem Solving",
  "problem-solving": "Problem Solving",

  teamwork: "Teamwork",
  "team work": "Teamwork",

  leadership: "Leadership",

  logistics: "Logistics",
  "supply chain": "Supply Chain",

  inventory: "Inventory",

  "inventory management":
    "Inventory Management",

  "inventory systems":
    "Inventory Systems",

  "inventory tracking":
    "Inventory Tracking",

  warehouse: "Warehouse",

  "warehouse operations":
    "Warehouse Operations",

  warehousing: "Warehousing",

  shipping: "Shipping",

  "shipping and receiving":
    "Shipping and Receiving",

  receiving: "Receiving",

  dispatch: "Dispatch",

  dispatching: "Dispatching",

  packing: "Packing",

  picking: "Picking",

  distribution: "Distribution",

  "order fulfillment":
    "Order Fulfillment",

  "barcode scanning":
    "Barcode Scanning",

  "barcode scanners":
    "Barcode Scanners",

  sanitation: "Sanitation",

  "deep sanitation practices":
    "Deep Sanitation Practices",

  "cleaning equipment":
    "Cleaning Equipment",

  "record keeping":
    "Record Keeping",

  "cycle counts":
    "Cycle Counts",

  "inventory checks":
    "Inventory Checks",

  "stock records":
    "Stock Records",

  accuracy: "Accuracy",

  "attention to detail":
    "Attention to Detail",

  kanban: "Kanban",
  kaizen: "Kaizen",
  gemba: "Gemba",

  "5s": "5S",

  mathematics: "Mathematics",
};


// ============================================================
// SKILL NORMALIZATION
// ============================================================

function normalizeSkillValue(value = "") {
  return cleanLine(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


// ============================================================
// EXTRACT SKILLS
// ============================================================

function extractSkills(
  sections = {},
  fullText = ""
) {
  const lines = safeArray(
    sections.skills
  )
    .map(removeBulletPrefix)
    .filter(Boolean);

  const skills = [];

  for (const line of lines) {
    const parts = line
      .split(/[,;|•·]+/)
      .map(cleanLine)
      .filter(Boolean);

    for (const part of parts) {
      const key =
        normalizeSkillValue(part);

      if (COMMON_SKILLS[key]) {
        skills.push(
          COMMON_SKILLS[key]
        );
        continue;
      }

      const slashParts = part
        .split(/\s*\/\s*/)
        .map(cleanLine)
        .filter(Boolean);

      if (slashParts.length > 1) {
        for (const slashPart of slashParts) {
          const slashKey =
            normalizeSkillValue(
              slashPart
            );

          if (
            COMMON_SKILLS[slashKey]
          ) {
            skills.push(
              COMMON_SKILLS[
                slashKey
              ]
            );
          }
        }

        continue;
      }

      // Do not accept very long sentence-like values
      // as skills.
      if (
        part.length >= 2 &&
        part.length <= 50 &&
        !/[.!?]$/.test(part)
      ) {
        skills.push(part);
      }
    }
  }

  // ----------------------------------------------------------
  // Full text fallback
  // ----------------------------------------------------------

  if (skills.length === 0) {
    const normalized =
      String(fullText).toLowerCase();

    for (
      const [alias, label] of Object.entries(
        COMMON_SKILLS
      )
    ) {
      const escaped = alias.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const regex = new RegExp(
        `(^|[^a-z0-9+#])${escaped.replace(
          /\s+/g,
          "\\s+"
        )}([^a-z0-9+#]|$)`,
        "i"
      );

      if (regex.test(normalized)) {
        skills.push(label);
      }
    }
  }

  return unique(skills);
}


// ============================================================
// BULLET RECONSTRUCTION
// ============================================================

function reconstructBullets(lines = []) {
  const result = [];

  let currentBullet = "";

  function flush() {
    if (!currentBullet) {
      return;
    }

    const cleaned =
      normalizeWhitespace(
        currentBullet
      );

    if (cleaned) {
      result.push(
        cleaned.endsWith(".")
          ? cleaned
          : `${cleaned}.`
      );
    }

    currentBullet = "";
  }

  for (const rawLine of lines) {
    const raw = safeText(rawLine);

    if (!raw) {
      continue;
    }

    const cleaned =
      removeBulletPrefix(raw);

    if (!cleaned) {
      continue;
    }

    const startsBullet =
      hasBulletPrefix(raw) ||
      isActionBullet(raw);

    if (startsBullet) {
      flush();
      currentBullet = cleaned;
      continue;
    }

    if (currentBullet) {
      currentBullet =
        `${currentBullet} ${cleaned}`;
      continue;
    }

    // Text before first bullet is preserved.
    result.push(
      cleaned.endsWith(".")
        ? cleaned
        : `${cleaned}.`
    );
  }

  flush();

  return unique(result);
}


// ============================================================
// EXPERIENCE BULLET CLEANUP
// ============================================================

function cleanExperienceBullet(
  bullet = ""
) {
  let value =
    normalizeWhitespace(
      bullet
    );

  if (!value) {
    return "";
  }

  // Remove obvious accidental section headings.
  value = value.replace(
    /\s+(?:experience|education|skills|projects|certifications)\s*$/i,
    ""
  );

  // Remove accidental repeated punctuation.
  value = value
    .replace(/[,.]+$/g, "")
    .trim();

  if (!value) {
    return "";
  }

  return `${value}.`;
}


// ============================================================
// STRUCTURED EXPERIENCE EXTRACTION
// ============================================================

function extractExperience(
  sections = {}
) {
  const lines = safeArray(
    sections.experience
  )
    .map(cleanLine)
    .filter(Boolean);

  const records = [];

  let currentJob = null;
  let pendingDetail = "";
  let pendingBullet = "";

  function flushBullet() {
    if (
      !currentJob ||
      !pendingBullet
    ) {
      return;
    }

    const cleanedBullet =
      cleanExperienceBullet(
        pendingBullet
      );

    if (
      cleanedBullet &&
      cleanedBullet.length >= 15
    ) {
      currentJob.bullets.push(
        cleanedBullet
      );
    }

    pendingBullet = "";
  }


  function flushDetail() {
    if (
      !currentJob ||
      !pendingDetail
    ) {
      return;
    }

    const detail =
      normalizeWhitespace(
        pendingDetail
      );

    if (detail) {
      currentJob.description =
        currentJob.description
          ? `${currentJob.description} ${detail}`
          : detail;
    }

    pendingDetail = "";
  }


  function flushJob() {
    if (!currentJob) {
      return;
    }

    flushBullet();
    flushDetail();

    currentJob.bullets =
      unique(
        currentJob.bullets
      );

    currentJob.description =
      normalizeWhitespace(
        currentJob.description
      );

    // Do not create completely empty records.
    if (
      !currentJob.title &&
      !currentJob.company &&
      !currentJob.bullets.length &&
      !currentJob.description
    ) {
      currentJob = null;
      return;
    }

    records.push({
      type: "experience",

      title:
        currentJob.title,

      company:
        currentJob.company,

      location:
        currentJob.location,

      startDate:
        currentJob.startDate,

      endDate:
        currentJob.endDate,

      dates:
        currentJob.dates,

      description:
        currentJob.description,

      bullets:
        currentJob.bullets,

      text:
        [
          currentJob.title,
          currentJob.company
            ? `at ${currentJob.company}`
            : "",
          currentJob.location
            ? `, ${currentJob.location}`
            : "",
        ]
          .join(" ")
          .replace(/\s+,/g, ",")
          .trim(),
    });

    currentJob = null;
  }


  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    const line = lines[i];

    // --------------------------------------------------------
    // Ignore section heading
    // --------------------------------------------------------

    if (detectSection(line)) {
      flushJob();
      continue;
    }


    // --------------------------------------------------------
    // Date
    // --------------------------------------------------------

    const dateRange =
      extractDateRange(line);

    if (
      dateRange &&
      currentJob
    ) {
      flushBullet();
      flushDetail();

      currentJob.startDate =
        dateRange.startDate;

      currentJob.endDate =
        dateRange.endDate;

      currentJob.dates =
        dateRange.raw;

      continue;
    }


    // --------------------------------------------------------
    // Date embedded in a job line
    // --------------------------------------------------------

    if (
      currentJob &&
      looksLikeDate(line) &&
      !isBulletLine(line)
    ) {
      const embedded =
        line.match(
          /((?:19|20)\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2})\s*(?:[-–—]|to)\s*((?:19|20)\d{2}|present|current)/i
        );

      if (embedded) {
        flushBullet();
        flushDetail();

        currentJob.startDate =
          embedded[1];

        currentJob.endDate =
          embedded[2];

        currentJob.dates =
          embedded[0];

        continue;
      }
    }


    // --------------------------------------------------------
    // New job header
    // --------------------------------------------------------

    if (
      looksLikeExperienceHeader(
        line
      )
    ) {
      flushJob();

      const parsed =
        parseExperienceHeader(
          line
        );

      currentJob = {
        title:
          parsed.title,

        company:
          parsed.company,

        location:
          parsed.location,

        startDate: "",
        endDate: "",
        dates: "",

        description: "",

        bullets: [],
      };

      continue;
    }


    // --------------------------------------------------------
    // Bullet
    // --------------------------------------------------------

    if (
      isBulletLine(line)
    ) {
      if (!currentJob) {
        continue;
      }

      flushDetail();

      if (pendingBullet) {
        flushBullet();
      }

      pendingBullet =
        removeBulletPrefix(
          line
        );

      continue;
    }


    // --------------------------------------------------------
    // Bullet continuation
    // --------------------------------------------------------

    if (pendingBullet) {
      pendingBullet =
        `${pendingBullet} ${line}`;

      continue;
    }


    // --------------------------------------------------------
    // Plain description
    // --------------------------------------------------------

    if (!currentJob) {
      continue;
    }

    pendingDetail =
      pendingDetail
        ? `${pendingDetail} ${line}`
        : line;
  }

  flushJob();

  return records.filter(
    (record) =>
      record.title ||
      record.company ||
      record.bullets.length > 0 ||
      record.description
  );
}


// ============================================================
// PROJECTS
// ============================================================

function extractProjects(
  sections = {}
) {
  const lines = safeArray(
    sections.projects
  )
    .map(cleanLine)
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const result = [];

  let current = "";

  for (const line of lines) {
    const bullet = isBulletLine(line);

    if (bullet) {
      if (current) {
        result.push({
          type: "bullet",
          text: cleanExperienceBullet(
            current
          ),
        });
      }

      current =
        removeBulletPrefix(line);

      continue;
    }

    if (current) {
      current =
        `${current} ${line}`;
    } else {
      current = line;
    }
  }

  if (current) {
    result.push({
      type: "bullet",
      text: cleanExperienceBullet(
        current
      ),
    });
  }

  return result.filter(
    (item) =>
      item.text &&
      item.text.length >= 10
  );
}


// ============================================================
// EDUCATION
// ============================================================

function extractEducation(
  sections = {}
) {
  const lines = safeArray(
    sections.education
  )
    .map(cleanLine)
    .filter(Boolean);

  const result = [];

  let current = "";

  for (const line of lines) {
    if (
      /^details$/i.test(line) ||
      /^links$/i.test(line)
    ) {
      continue;
    }

    if (
      /^[+]?\d[\d\s().-]{8,}$/.test(
        line
      )
    ) {
      continue;
    }

    if (/@/.test(line)) {
      continue;
    }

    if (
      /^https?:\/\//i.test(line)
    ) {
      continue;
    }

    const date =
      extractDateRange(line);

    if (date && current) {
      result.push(
        normalizeWhitespace(
          `${current} (${date.raw})`
        )
      );

      current = "";
      continue;
    }

    // Detect common degree/institution boundaries.
    if (
      current &&
      (
        /\b(?:bachelor|master|b\.?tech|m\.?tech|bca|mca|bba|mba|bsc|msc|phd|diploma|degree)\b/i.test(
          line
        )
      )
    ) {
      result.push(
        normalizeWhitespace(
          current
        )
      );

      current = line;
      continue;
    }

    if (current) {
      result.push(
        normalizeWhitespace(
          current
        )
      );
    }

    current = line;
  }

  if (current) {
    result.push(
      normalizeWhitespace(
        current
      )
    );
  }

  return unique(result);
}


// ============================================================
// CERTIFICATIONS
// ============================================================

function extractCertifications(
  sections = {}
) {
  const lines = safeArray(
    sections.certifications
  )
    .map(removeBulletPrefix)
    .filter(Boolean);

  return reconstructBullets(
    lines
  );
}


// ============================================================
// ACHIEVEMENTS
// ============================================================

function extractAchievements(
  sections = {}
) {
  const lines = safeArray(
    sections.achievements
  )
    .map(cleanLine)
    .filter(Boolean);

  return reconstructBullets(
    lines
  );
}


// ============================================================
// LANGUAGES
// ============================================================

function extractLanguages(
  sections = {}
) {
  return unique(
    safeArray(
      sections.languages
    )
      .join(",")
      .split(/[,;|•·]+/)
      .map(cleanLine)
      .filter(Boolean)
  );
}


// ============================================================
// HOBBIES
// ============================================================

function extractHobbies(
  sections = {}
) {
  return unique(
    safeArray(
      sections.hobbies
    )
      .join(",")
      .split(/[,;|•·]+/)
      .map(cleanLine)
      .filter(Boolean)
  );
}


// ============================================================
// CONTACT INFO
// ============================================================

function buildContactInfo(
  text = ""
) {
  return {
    email:
      extractEmail(text),

    phone:
      extractPhone(text),

    linkedin:
      extractLinkedIn(text),

    github:
      extractGitHub(text),
  };
}


// ============================================================
// CLEAN EXPERIENCE
// ============================================================

function cleanExperienceRecords(
  experience = []
) {
  return unique(
    safeArray(experience)
      .filter(Boolean)
      .map((record) => ({
        ...record,

        title:
          cleanLine(
            record.title || ""
          ),

        company:
          cleanLine(
            record.company || ""
          ),

        location:
          cleanLine(
            record.location || ""
          ),

        startDate:
          cleanLine(
            record.startDate || ""
          ),

        endDate:
          cleanLine(
            record.endDate || ""
          ),

        dates:
          cleanLine(
            record.dates || ""
          ),

        description:
          normalizeWhitespace(
            record.description || ""
          ),

        bullets:
          unique(
            safeArray(
              record.bullets
            )
              .map(
                cleanExperienceBullet
              )
              .filter(
                (bullet) =>
                  bullet.length >= 15
              )
          ),
      }))
      .map(
        (record) =>
          JSON.stringify(record)
      )
  ).map((value) =>
    JSON.parse(value)
  );
}


// ============================================================
// PARSE RESUME
// ============================================================

function parseResume(
  resumeText = ""
) {
  const cleaned =
    cleanText(
      resumeText
    );

  if (!cleaned) {
    throw new Error(
      "Resume text is required."
    );
  }


  // ----------------------------------------------------------
  // Extract sections
  // ----------------------------------------------------------

  const sections =
    extractSections(
      cleaned
    );


  // ----------------------------------------------------------
  // Contact
  // ----------------------------------------------------------

  const contact =
    buildContactInfo(
      cleaned
    );


  // ----------------------------------------------------------
  // Experience
  // ----------------------------------------------------------

  const experience =
    cleanExperienceRecords(
      extractExperience(
        sections
      )
    );


  // ----------------------------------------------------------
  // Parsed resume
  // ----------------------------------------------------------

  const parsedResume = {
    name:
      extractName(
        cleaned
      ),

    email:
      contact.email,

    phone:
      contact.phone,

    linkedin:
      contact.linkedin,

    github:
      contact.github,

    summary:
      extractSummary(
        sections
      ),

    skills:
      extractSkills(
        sections,
        cleaned
      ),

    experience,

    projects:
      extractProjects(
        sections
      ),

    education:
      extractEducation(
        sections
      ),

    certifications:
      extractCertifications(
        sections
      ),

    achievements:
      extractAchievements(
        sections
      ),

    languages:
      extractLanguages(
        sections
      ),

    hobbies:
      extractHobbies(
        sections
      ),
  };


  // ==========================================================
  // METADATA
  // ==========================================================

  const sectionsDetected = {
    summary:
      sections.summary.length > 0,

    experience:
      sections.experience.length > 0,

    projects:
      sections.projects.length > 0,

    education:
      sections.education.length > 0,

    skills:
      sections.skills.length > 0,

    certifications:
      sections.certifications.length > 0,

    achievements:
      sections.achievements.length > 0,

    languages:
      sections.languages.length > 0,

    hobbies:
      sections.hobbies.length > 0,
  };


  const experienceCount =
    experience.length;


  const totalExperienceBullets =
    experience.reduce(
      (
        total,
        record
      ) =>
        total +
        safeArray(
          record.bullets
        ).length,
      0
    );


  const totalProjects =
    safeArray(
      parsedResume.projects
    ).length;


  const totalSkills =
    safeArray(
      parsedResume.skills
    ).length;


  return {
    ...parsedResume,

    metadata: {
      textLength:
        cleaned.length,

      sectionsDetected,

      detectedSectionCount:
        Object.values(
          sectionsDetected
        ).filter(Boolean).length,

      experienceCount,

      experienceBullets:
        totalExperienceBullets,

      projectCount:
        totalProjects,

      skillCount:
        totalSkills,

      contactDetected: {
        email:
          Boolean(
            contact.email
          ),

        phone:
          Boolean(
            contact.phone
          ),

        linkedin:
          Boolean(
            contact.linkedin
          ),

        github:
          Boolean(
            contact.github
          ),
      },
    },
  };
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  parseResume,

  extractName,
  extractEmail,
  extractPhone,
  extractLinkedIn,
  extractGitHub,

  extractSections,
  detectSection,

  extractSkills,
  extractExperience,
  extractProjects,
  extractEducation,
  extractCertifications,
  extractAchievements,

  extractLanguages,
  extractHobbies,

  cleanText,
  cleanLine,
  safeArray,

  // Useful for testing
  looksLikeExperienceHeader,
  parseExperienceHeader,
  extractDateRange,
  reconstructBullets,
};

