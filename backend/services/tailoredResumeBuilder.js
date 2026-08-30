
// ============================================================
// AI RESUME ANALYZER
// TAILORED RESUME BUILDER
// STABLE VERSION
// ============================================================

const {
  extractSkills,
  normalizeSkill,
  extractJobKeywords,
} = require("./JobMatcher");

// ============================================================
// SAFE HELPERS
// ============================================================

function safeText(value = "") {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return "";
  }

  return String(value).trim();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values = []) {
  const result = [];
  const seen = new Set();

  for (const value of safeArray(values)) {
    const text = safeText(value);

    if (!text) {
      continue;
    }

    const key = text.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(text);
  }

  return result;
}

function normalizeWhitespace(value = "") {
  return String(value)
    .replace(/\s+/g, " ")
    .trim();
}

function cleanBullet(value = "") {
  return normalizeWhitespace(
    String(value).replace(
      /^\s*[-•●▪◦*✓✔➜➤]\s*/,
      ""
    )
  );
}

// ============================================================
// OBJECT → TEXT
// ============================================================

function objectToText(value = "") {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return safeText(value);
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return safeText(
    value.text ||
      value.description ||
      value.content ||
      value.details ||
      value.summary ||
      value.name ||
      value.title ||
      value.value ||
      ""
  );
}

// ============================================================
// BULLET TEXT
// ============================================================

function extractBulletText(value = "") {
  if (typeof value === "string") {
    return cleanBullet(value);
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return cleanBullet(
    value.text ||
      value.description ||
      value.content ||
      value.details ||
      value.bullet ||
      value.point ||
      value.responsibility ||
      value.achievement ||
      ""
  );
}

// ============================================================
// EXPERIENCE BULLETS
// ============================================================

function getExperienceBullets(job = {}) {
  if (!job || typeof job !== "object") {
    return [];
  }

  const values = [];

  const arrays = [
    job.bullets,
    job.responsibilities,
    job.achievements,
    job.points,
    job.duties,
    job.tasks,
    job.highlights,
  ];

  for (const list of arrays) {
    if (Array.isArray(list)) {
      values.push(...list);
    }
  }

  const singleFields = [
    job.bullet,
    job.responsibility,
    job.achievement,
    job.highlight,
  ];

  for (const item of singleFields) {
    if (item !== undefined && item !== null) {
      values.push(item);
    }
  }

  return unique(
    values
      .map(extractBulletText)
      .filter(Boolean)
  );
}

// ============================================================
// SCORE RELEVANCE
// ============================================================

function scoreTextRelevance(
  text,
  jobKeywords = [],
  jobSkills = []
) {
  const value = safeText(text).toLowerCase();

  if (!value) {
    return 0;
  }

  let score = 0;

  for (const skill of safeArray(jobSkills)) {
    const normalized = normalizeSkill(skill);

    if (
      normalized &&
      value.includes(normalized.toLowerCase())
    ) {
      score += 5;
    }
  }

  for (const keyword of safeArray(jobKeywords)) {
    const normalized = normalizeSkill(keyword);

    if (
      normalized &&
      value.includes(normalized.toLowerCase())
    ) {
      score += 2;
    }
  }

  return score;
}

// ============================================================
// RANK BULLETS
// ============================================================

function rankBullets(
  bullets = [],
  jobDescription = ""
) {
  const keywords = extractJobKeywords(
    jobDescription
  );

  const skills = extractSkills(
    jobDescription
  );

  return safeArray(bullets)
    .map((bullet, index) => {
      const text = extractBulletText(bullet);

      return {
        text,

        score: scoreTextRelevance(
          text,
          keywords,
          skills
        ),

        originalIndex: index,
      };
    })
    .filter((item) => item.text)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.originalIndex - b.originalIndex;
    });
}

// ============================================================
// RANK EXPERIENCE
// ============================================================

function rankExperience(
  experience = [],
  jobDescription = ""
) {
  const keywords = extractJobKeywords(
    jobDescription
  );

  const skills = extractSkills(
    jobDescription
  );

  return safeArray(experience)
    .map((job, index) => {
      const bullets = getExperienceBullets(job);

      const combinedText = [
        job?.title,
        job?.role,
        job?.position,
        job?.company,
        job?.organization,
        job?.location,
        job?.description,
        ...bullets,
      ]
        .map(objectToText)
        .filter(Boolean)
        .join(" ");

      return {
        ...(job || {}),

        __bullets: bullets,

        relevanceScore: scoreTextRelevance(
          combinedText,
          keywords,
          skills
        ),

        originalIndex: index,
      };
    })
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return (
          b.relevanceScore -
          a.relevanceScore
        );
      }

      return (
        a.originalIndex -
        b.originalIndex
      );
    });
}

// ============================================================
// TAILORED SUMMARY
// ============================================================

function buildTailoredSummary(
  resume = {},
  jobDescription = ""
) {
  const originalSummary = safeText(
    resume.summary ||
      resume.profile ||
      resume.objective ||
      ""
  );

  const resumeContent = [
    resume.name,
    resume.email,
    resume.phone,
    resume.summary,
    resume.profile,
    resume.objective,

    ...safeArray(resume.skills).map(
      objectToText
    ),

    ...safeArray(resume.experience).flatMap(
      (job) => [
        job?.title,
        job?.company,
        job?.description,
        ...getExperienceBullets(job),
      ]
    ),

    ...safeArray(resume.projects).flatMap(
      (project) => [
        project?.name,
        project?.title,
        project?.text,
        project?.description,
        ...safeArray(
          project?.technologies
        ),
      ]
    ),
  ]
    .map(objectToText)
    .filter(Boolean)
    .join(" ");

  const resumeSkills = extractSkills(
    resumeContent
  );

  const jobSkills = extractSkills(
    jobDescription
  );

  const matchedSkills = jobSkills.filter(
    (jobSkill) =>
      resumeSkills.some(
        (resumeSkill) =>
          normalizeSkill(resumeSkill) ===
          normalizeSkill(jobSkill)
      )
  );

  if (!originalSummary) {
    if (matchedSkills.length === 0) {
      return "";
    }

    return (
      "Professional with experience in " +
      matchedSkills
        .slice(0, 5)
        .join(", ") +
      "."
    );
  }

  let summary = normalizeWhitespace(
    originalSummary
  );

  const missingInSummary =
    matchedSkills.filter(
      (skill) =>
        !summary
          .toLowerCase()
          .includes(
            normalizeSkill(skill).toLowerCase()
          )
    );

  if (missingInSummary.length > 0) {
    summary =
      summary +
      " Skilled in " +
      missingInSummary
        .slice(0, 4)
        .join(", ") +
      ".";
  }

  return summary;
}

// ============================================================
// TAILORED SKILLS
// ============================================================

function buildTailoredSkills(
  resume = {},
  jobDescription = ""
) {
  const resumeSkills = unique(
    safeArray(resume.skills).map(
      objectToText
    )
  );

  const jobSkills = unique(
    extractSkills(jobDescription)
  );

  const normalizedResume =
    resumeSkills.map(normalizeSkill);

  const output = [];

  for (const jobSkill of jobSkills) {
    const normalized =
      normalizeSkill(jobSkill);

    const index =
      normalizedResume.indexOf(
        normalized
      );

    if (index !== -1) {
      output.push(
        resumeSkills[index]
      );
    }
  }

  for (const skill of resumeSkills) {
    const exists = output.some(
      (item) =>
        normalizeSkill(item) ===
        normalizeSkill(skill)
    );

    if (!exists) {
      output.push(skill);
    }
  }

  return unique(output);
}

// ============================================================
// EXPERIENCE
// ============================================================

function buildTailoredExperience(
  resume = {},
  jobDescription = ""
) {
  const ranked = rankExperience(
    resume.experience,
    jobDescription
  );

  return ranked.map((job) => {
    const originalBullets =
      getExperienceBullets(job);

    const rankedBullets = rankBullets(
      originalBullets,
      jobDescription
    );

    const title = safeText(
      job.title ||
        job.role ||
        job.position ||
        job.jobTitle ||
        job.designation ||
        ""
    );

    const company = safeText(
      job.company ||
        job.organization ||
        job.employer ||
        job.companyName ||
        ""
    );

    const location = safeText(
      job.location ||
        job.city ||
        ""
    );

    const startDate = safeText(
      job.startDate ||
        job.start ||
        job.from ||
        ""
    );

    const endDate = safeText(
      job.endDate ||
        job.end ||
        job.to ||
        ""
    );

    const dates = safeText(
      job.dates ||
        job.duration ||
        job.period ||
        ""
    );

    const description = safeText(
      job.description ||
        job.summary ||
        job.details ||
        ""
    );

    return {
      type: "experience",

      title,

      company,

      location,

      startDate,

      endDate,

      dates,

      description,

      bullets: unique(
        rankedBullets.map(
          (item) => item.text
        )
      ),

      relevanceScore:
        Number(job.relevanceScore) || 0,
    };
  });
}

// ============================================================
// PROJECTS
// ============================================================

function buildTailoredProjects(
  resume = {},
  jobDescription = ""
) {
  const keywords =
    extractJobKeywords(
      jobDescription
    );

  const skills =
    extractSkills(
      jobDescription
    );

  return safeArray(resume.projects)
    .map((project, index) => {
      const name = safeText(
        project?.name ||
          project?.title ||
          project?.projectName ||
          ""
      );

      const text = safeText(
        project?.text ||
          project?.description ||
          project?.details ||
          project?.content ||
          project?.summary ||
          ""
      );

      const technologies = unique(
        safeArray(
          project?.technologies ||
            project?.techStack ||
            project?.skills ||
            project?.tools
        ).map(objectToText)
      );

      const url = safeText(
        project?.url ||
          project?.link ||
          project?.github ||
          ""
      );

      const score =
        scoreTextRelevance(
          [
            name,
            text,
            ...technologies,
          ].join(" "),
          keywords,
          skills
        );

      return {
        type: "project",

        name,

        text,

        technologies,

        url,

        relevanceScore: score,

        originalIndex: index,
      };
    })
    .filter(
      (project) =>
        project.name ||
        project.text ||
        project.technologies.length >
          0 ||
        project.url
    )
    .sort((a, b) => {
      if (
        b.relevanceScore !==
        a.relevanceScore
      ) {
        return (
          b.relevanceScore -
          a.relevanceScore
        );
      }

      return (
        a.originalIndex -
        b.originalIndex
      );
    });
}

// ============================================================
// EDUCATION
// ============================================================

function buildTailoredEducation(
  resume = {}
) {
  return safeArray(resume.education)
    .map((item) => {
      if (typeof item === "string") {
        return safeText(item);
      }

      if (
        !item ||
        typeof item !== "object"
      ) {
        return "";
      }

      return [
        item.degree ||
          item.qualification ||
          item.title ||
          "",

        item.institution ||
          item.school ||
          item.college ||
          item.university ||
          "",

        item.location || "",

        item.year ||
          item.date ||
          item.graduationYear ||
          "",
      ]
        .map(safeText)
        .filter(Boolean)
        .join(" | ");
    })
    .filter(Boolean);
}

// ============================================================
// CERTIFICATIONS
// ============================================================

function buildTailoredCertifications(
  resume = {}
) {
  return unique(
    safeArray(
      resume.certifications
    ).map((item) => {
      if (typeof item === "string") {
        return cleanBullet(item);
      }

      if (
        !item ||
        typeof item !== "object"
      ) {
        return "";
      }

      return cleanBullet(
        item.name ||
          item.title ||
          item.text ||
          item.description ||
          item.certification ||
          ""
      );
    })
  );
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

function buildTailoredAchievements(
  resume = {}
) {
  return unique(
    safeArray(
      resume.achievements
    ).map((item) => {
      if (typeof item === "string") {
        return cleanBullet(item);
      }

      if (
        !item ||
        typeof item !== "object"
      ) {
        return "";
      }

      return cleanBullet(
        item.text ||
          item.description ||
          item.title ||
          item.name ||
          item.achievement ||
          ""
      );
    })
  );
}

// ============================================================
// LANGUAGES
// ============================================================

function buildTailoredLanguages(
  resume = {}
) {
  return unique(
    safeArray(
      resume.languages
    ).map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (
        !item ||
        typeof item !== "object"
      ) {
        return "";
      }

      return [
        item.name ||
          item.language ||
          item.title ||
          "",

        item.level ||
          item.proficiency ||
          item.fluency ||
          "",
      ]
        .map(safeText)
        .filter(Boolean)
        .join(" - ");
    })
  );
}

// ============================================================
// HOBBIES
// ============================================================

function buildTailoredHobbies(
  resume = {}
) {
  return unique(
    safeArray(resume.hobbies).map(
      (item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          !item ||
          typeof item !== "object"
        ) {
          return "";
        }

        return (
          item.name ||
          item.title ||
          item.text ||
          item.hobby ||
          ""
        );
      }
    )
  );
}

// ============================================================
// BUILD TAILORED RESUME
// ============================================================

function buildTailoredResume(
  resume,
  jobDescription
) {
  if (
    !resume ||
    typeof resume !== "object" ||
    Array.isArray(resume)
  ) {
    throw new Error(
      "Parsed resume data is required."
    );
  }

  if (
    !jobDescription ||
    typeof jobDescription !== "string" ||
    !jobDescription.trim()
  ) {
    throw new Error(
      "Job description is required."
    );
  }

  const cleanJD =
    jobDescription.trim();

  const resumeText = [
    resume.name,
    resume.email,
    resume.phone,
    resume.location,
    resume.linkedin,
    resume.github,
    resume.summary,
    resume.profile,
    resume.objective,

    ...safeArray(resume.skills).map(
      objectToText
    ),

    ...safeArray(resume.experience).flatMap(
      (job) => [
        job?.title,
        job?.company,
        job?.location,
        job?.description,
        ...getExperienceBullets(job),
      ]
    ),

    ...safeArray(resume.projects).flatMap(
      (project) => [
        project?.name,
        project?.title,
        project?.text,
        project?.description,
        ...safeArray(
          project?.technologies
        ),
      ]
    ),

    ...safeArray(resume.education).map(
      objectToText
    ),

    ...safeArray(
      resume.certifications
    ).map(objectToText),

    ...safeArray(
      resume.achievements
    ).map(objectToText),

    ...safeArray(
      resume.languages
    ).map(objectToText),

    ...safeArray(
      resume.hobbies
    ).map(objectToText),

    resume.rawText,
  ]
    .filter(Boolean)
    .join("\n");

  const resumeSkills = unique(
    extractSkills(resumeText)
  );

  const jobSkills = unique(
    extractSkills(cleanJD)
  );

  const matchedSkills =
    jobSkills.filter(
      (jobSkill) =>
        resumeSkills.some(
          (resumeSkill) =>
            normalizeSkill(
              resumeSkill
            ) ===
            normalizeSkill(
              jobSkill
            )
        )
    );

  const missingSkills =
    jobSkills.filter(
      (jobSkill) =>
        !resumeSkills.some(
          (resumeSkill) =>
            normalizeSkill(
              resumeSkill
            ) ===
            normalizeSkill(
              jobSkill
            )
        )
    );

  const jobKeywords = unique(
    extractJobKeywords(cleanJD)
  );

  const normalizedResumeText =
    resumeText.toLowerCase();

  const matchedKeywords =
    jobKeywords.filter(
      (keyword) => {
        const normalized =
          normalizeSkill(keyword);

        return (
          normalized &&
          normalizedResumeText.includes(
            normalized.toLowerCase()
          )
        );
      }
    );

  const missingKeywords =
    jobKeywords.filter(
      (keyword) => {
        const normalized =
          normalizeSkill(keyword);

        return (
          normalized &&
          !normalizedResumeText.includes(
            normalized.toLowerCase()
          )
        );
      }
    );

  const tailored = {
    name: safeText(
      resume.name ||
        resume.fullName ||
        resume.candidateName
    ),

    email: safeText(
      resume.email
    ),

    phone: safeText(
      resume.phone ||
        resume.mobile
    ),

    location: safeText(
      resume.location ||
        resume.address
    ),

    linkedin: safeText(
      resume.linkedin ||
        resume.linkedIn ||
        resume.linkedinUrl
    ),

    github: safeText(
      resume.github ||
        resume.githubUrl
    ),

    portfolio: safeText(
      resume.portfolio ||
        resume.portfolioUrl
    ),

    website: safeText(
      resume.website ||
        resume.websiteUrl
    ),

    summary:
      buildTailoredSummary(
        resume,
        cleanJD
      ),

    objective: safeText(
      resume.objective
    ),

    profile: safeText(
      resume.profile
    ),

    skills:
      buildTailoredSkills(
        resume,
        cleanJD
      ),

    experience:
      buildTailoredExperience(
        resume,
        cleanJD
      ),

    projects:
      buildTailoredProjects(
        resume,
        cleanJD
      ),

    education:
      buildTailoredEducation(
        resume
      ),

    certifications:
      buildTailoredCertifications(
        resume
      ),

    achievements:
      buildTailoredAchievements(
        resume
      ),

    languages:
      buildTailoredLanguages(
        resume
      ),

    hobbies:
      buildTailoredHobbies(
        resume
      ),

    rawText: safeText(
      resume.rawText ||
        resume.resumeText
    ),
  };

  const experienceCount =
    tailored.experience.length;

  const experienceBullets =
    tailored.experience.reduce(
      (total, item) =>
        total +
        safeArray(
          item?.bullets
        ).length,
      0
    );

  const skillScore =
    jobSkills.length > 0
      ? Math.round(
          (matchedSkills.length /
            jobSkills.length) *
            100
        )
      : 0;

  const keywordTotal =
    matchedKeywords.length +
    missingKeywords.length;

  const keywordScore =
    keywordTotal > 0
      ? Math.round(
          (matchedKeywords.length /
            keywordTotal) *
            100
        )
      : 0;

  const experienceScore =
    experienceCount > 0
      ? Math.min(
          100,
          experienceCount * 25
        )
      : 0;

  const roleScore =
    skillScore >= 80
      ? 100
      : skillScore >= 60
      ? 80
      : skillScore >= 40
      ? 60
      : skillScore;

  const tailoringScore =
    Math.round(
      (
        skillScore +
        keywordScore +
        experienceScore +
        roleScore
      ) / 4
    );

  return {
    ...tailored,

    tailoringScore,

    skillScore,

    keywordScore,

    tailoredResume:
      tailored,

    structuredResume:
      tailored,

    professionalSummary:
      tailored.summary,

    prioritizedSkills:
      tailored.skills,

    atsKeywords: {
      alreadyPresent:
        matchedKeywords,

      considerAdding:
        missingKeywords,
    },

    experienceSuggestions:
      experienceCount > 0 &&
      experienceBullets === 0
        ? [
            "Experience was detected, but no bullet points were available in the parsed source.",
          ]
        : [],

    optimizationNotes: [
      "Relevant existing skills were prioritized for the target job.",
      "Unsupported skills and achievements were not invented.",
      "Original resume text is preserved in rawText.",
    ],

    metadata: {
      generatedAt:
        new Date().toISOString(),

      tailoredFor:
        cleanJD,

      resumeSkills,

      requiredSkills:
        jobSkills,

      matchedSkills,

      missingSkills,

      matchedKeywords,

      missingKeywords,

      experienceCount,

      experienceBullets,

      projectCount:
        tailored.projects.length,

      educationCount:
        tailored.education.length,

      certificationCount:
        tailored.certifications.length,

      achievementCount:
        tailored.achievements.length,

      languageCount:
        tailored.languages.length,

      hobbyCount:
        tailored.hobbies.length,

      skillCount:
        tailored.skills.length,
    },

    statistics: {
      matchedSkills:
        matchedSkills.length,

      missingSkills:
        missingSkills.length,

      matchedKeywords:
        matchedKeywords.length,

      missingKeywords:
        missingKeywords.length,

      parsedExperiences:
        experienceCount,

      experienceBullets,

      parsedProjects:
        tailored.projects.length,

      parsedEducation:
        tailored.education.length,

      certifications:
        tailored.certifications.length,

      achievements:
        tailored.achievements.length,

      languages:
        tailored.languages.length,

      hobbies:
        tailored.hobbies.length,
    },
  };
}

// ============================================================
// CONVENIENCE FUNCTION
// ============================================================

function tailorResume(
  resume,
  jobDescription
) {
  return buildTailoredResume(
    resume,
    jobDescription
  );
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  buildTailoredResume,
  tailorResume,
  rankBullets,
  rankExperience,
  buildTailoredSummary,
  buildTailoredSkills,
  buildTailoredExperience,
  buildTailoredProjects,
  buildTailoredEducation,
  buildTailoredCertifications,
  buildTailoredAchievements,
  buildTailoredLanguages,
  buildTailoredHobbies,
};

