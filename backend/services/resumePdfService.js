// ============================================================
// AI RESUME ANALYZER
// PROFESSIONAL TAILORED RESUME PDF SERVICE v2
// ============================================================
//
// Generates the FINAL tailored resume PDF from:
//
// result.tailoredResume
//
// Falls back to:
//
// result.structuredResume
//
// Uses PDFKit.
// No external API required.
//
// ============================================================

const PDFDocument = require("pdfkit");


// ============================================================
// SAFE HELPERS
// ============================================================

function safeText(value = "") {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim();
}


function safeArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}


function cleanArray(values = []) {
  return safeArray(values)
    .map((item) => {
      if (
        item &&
        typeof item === "object"
      ) {
        return safeText(
          item.text ||
          item.name ||
          item.value ||
          ""
        );
      }

      return safeText(item);
    })
    .filter(Boolean);
}


function unique(values = []) {
  return [
    ...new Set(
      cleanArray(values)
    ),
  ];
}


// ============================================================
// COLORS
// ============================================================

const COLORS = {
  black: "#111827",
  dark: "#1f2937",
  text: "#374151",
  muted: "#6b7280",
  light: "#9ca3af",
  border: "#d1d5db",
  softBorder: "#e5e7eb",
  accent: "#4f46e5",
};


// ============================================================
// PAGE HELPERS
// ============================================================

function bottomLimit(doc) {
  return (
    doc.page.height - 55
  );
}


function ensureSpace(
  doc,
  height = 60
) {
  if (
    doc.y + height >
    bottomLimit(doc)
  ) {
    doc.addPage();
  }
}


// ============================================================
// SECTION HEADER
// ============================================================

function addSectionHeader(
  doc,
  title
) {
  ensureSpace(
    doc,
    55
  );

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(
      COLORS.dark
    )
    .text(
      String(title).toUpperCase()
    );

  doc.moveDown(0.25);

  doc
    .moveTo(
      50,
      doc.y
    )
    .lineTo(
      doc.page.width - 50,
      doc.y
    )
    .lineWidth(0.7)
    .strokeColor(
      COLORS.border
    )
    .stroke();

  doc.moveDown(0.55);
}


// ============================================================
// BULLET
// ============================================================

function addBullet(
  doc,
  text
) {
  const value =
    safeText(text);

  if (!value) {
    return;
  }

  ensureSpace(
    doc,
    32
  );

  doc
    .font("Helvetica")
    .fontSize(9.7)
    .fillColor(
      COLORS.text
    )
    .text(
      `• ${value}`,
      {
        width:
          doc.page.width - 100,
        lineGap: 2.2,
        hanging: 5,
      }
    );

  doc.moveDown(0.18);
}


// ============================================================
// SKILLS
// ============================================================

function addSkills(
  doc,
  skills = []
) {
  const values =
    unique(
      skills
    );

  if (
    values.length === 0
  ) {
    return;
  }

  ensureSpace(
    doc,
    45
  );

  doc
    .font("Helvetica")
    .fontSize(9.7)
    .fillColor(
      COLORS.text
    )
    .text(
      values.join(
        "  •  "
      ),
      {
        width:
          doc.page.width - 100,
        lineGap: 2.5,
      }
    );

  doc.moveDown(0.7);
}


// ============================================================
// CONTACT
// ============================================================

function addContactLine(
  doc,
  values = []
) {
  const cleanValues =
    unique(
      values
    );

  if (
    cleanValues.length === 0
  ) {
    return;
  }

  doc
    .font("Helvetica")
    .fontSize(8.2)
    .fillColor(
      COLORS.muted
    )
    .text(
      cleanValues.join(
        "  |  "
      ),
      {
        align: "center",
        width:
          doc.page.width - 100,
      }
    );

  doc.moveDown(0.3);
}


// ============================================================
// EXPERIENCE NORMALIZER
// ============================================================

function normalizeExperience(
  experience = []
) {
  return safeArray(
    experience
  )
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      return {
        title:
          safeText(
            item.title
          ),

        company:
          safeText(
            item.company
          ),

        location:
          safeText(
            item.location
          ),

        startDate:
          safeText(
            item.startDate
          ),

        endDate:
          safeText(
            item.endDate
          ),

        dates:
          safeText(
            item.dates
          ),

        description:
          safeText(
            item.description
          ),

        bullets:
          unique(
            safeArray(
              item.bullets
            ).map(
              (bullet) =>
                typeof bullet ===
                "object"
                  ? bullet.text
                  : bullet
            )
          ),
      };
    })
    .filter(Boolean);
}


// ============================================================
// EXPERIENCE SECTION
// ============================================================

function renderExperience(
  doc,
  experience = []
) {
  const items =
    normalizeExperience(
      experience
    );

  if (
    items.length === 0
  ) {
    return false;
  }

  items.forEach(
    (job, index) => {
      ensureSpace(
        doc,
        100
      );

      // ------------------------------------------------------
      // Job header
      // ------------------------------------------------------

      if (
        job.title
      ) {
        doc
          .font(
            "Helvetica-Bold"
          )
          .fontSize(10.5)
          .fillColor(
            COLORS.dark
          )
          .text(
            job.title
          );
      }

      // ------------------------------------------------------
      // Company / location
      // ------------------------------------------------------

      const companyParts =
        [];

      if (
        job.company
      ) {
        companyParts.push(
          job.company
        );
      }

      if (
        job.location
      ) {
        companyParts.push(
          job.location
        );
      }

      if (
        companyParts.length
      ) {
        doc
          .font("Helvetica")
          .fontSize(9.2)
          .fillColor(
            COLORS.muted
          )
          .text(
            companyParts.join(
              " - "
            )
          );
      }

      // ------------------------------------------------------
      // Dates
      // ------------------------------------------------------

      const dates =
        job.dates ||
        (
          job.startDate ||
          job.endDate
            ? `${job.startDate || ""}${
                job.startDate &&
                job.endDate
                  ? " - "
                  : ""
              }${job.endDate || ""}`
            : ""
        );

      if (
        dates
      ) {
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor(
            COLORS.light
          )
          .text(
            dates
          );
      }

      doc.moveDown(0.35);

      // ------------------------------------------------------
      // Description
      // ------------------------------------------------------

      if (
        job.description
      ) {
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(
            COLORS.text
          )
          .text(
            job.description,
            {
              width:
                doc.page.width - 100,
              lineGap: 2.2,
            }
          );

        doc.moveDown(0.25);
      }

      // ------------------------------------------------------
      // Tailored bullets
      //
      // IMPORTANT:
      // These are already the final tailored bullets.
      // We do NOT append experienceSuggestions here.
      // ------------------------------------------------------

      job.bullets.forEach(
        (bullet) => {
          addBullet(
            doc,
            bullet
          );
        }
      );

      if (
        index <
        items.length - 1
      ) {
        doc.moveDown(0.35);
      }
    }
  );

  doc.moveDown(0.5);

  return true;
}


// ============================================================
// PROJECTS
// ============================================================

function renderProjects(
  doc,
  projects = []
) {
  const items =
    safeArray(
      projects
    );

  if (
    items.length === 0
  ) {
    return false;
  }

  items.forEach(
    (project) => {
      if (
        typeof project ===
        "string"
      ) {
        addBullet(
          doc,
          project
        );

        return;
      }

      if (
        project.title
      ) {
        ensureSpace(
          doc,
          30
        );

        doc
          .font(
            "Helvetica-Bold"
          )
          .fontSize(10)
          .fillColor(
            COLORS.text
          )
          .text(
            safeText(
              project.title
            )
          );

        doc.moveDown(0.2);
      }

      if (
        project.description
      ) {
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(
            COLORS.text
          )
          .text(
            safeText(
              project.description
            ),
            {
              width:
                doc.page.width - 100,
              lineGap: 2.2,
            }
          );

        doc.moveDown(0.25);
      }

      safeArray(
        project.bullets
      ).forEach(
        (bullet) => {
          addBullet(
            doc,
            bullet
          );
        }
      );
    }
  );

  doc.moveDown(0.35);

  return true;
}


// ============================================================
// SIMPLE LIST
// ============================================================

function renderSimpleList(
  doc,
  items = []
) {
  const values =
    unique(
      items
    );

  if (
    values.length === 0
  ) {
    return false;
  }

  values.forEach(
    (item) => {
      addBullet(
        doc,
        item
      );
    }
  );

  return true;
}


// ============================================================
// INLINE LIST
// ============================================================

function renderInlineList(
  doc,
  items = []
) {
  const values =
    unique(
      items
    );

  if (
    values.length === 0
  ) {
    return false;
  }

  ensureSpace(
    doc,
    30
  );

  doc
    .font("Helvetica")
    .fontSize(9.7)
    .fillColor(
      COLORS.text
    )
    .text(
      values.join(
        "  •  "
      ),
      {
        width:
          doc.page.width - 100,
        lineGap: 2.5,
      }
    );

  doc.moveDown(0.5);

  return true;
}


// ============================================================
// FOOTER
// ============================================================

function addFooter(
  doc
) {
  const range =
    doc.bufferedPageRange();

  for (
    let i = 0;
    i < range.count;
    i++
  ) {
    doc.switchToPage(
      range.start + i
    );

    doc
      .font("Helvetica")
      .fontSize(7.2)
      .fillColor(
        COLORS.light
      )
      .text(
        `AI Resume Analyzer  |  Page ${
          i + 1
        }`,
        50,
        doc.page.height - 30,
        {
          width:
            doc.page.width - 100,
          align: "center",
        }
      );
  }
}


// ============================================================
// MAIN PDF GENERATOR
// ============================================================

function generateResumePDF(
  result,
  res
) {
  if (!result) {
    throw new Error(
      "Tailored resume result is required."
    );
  }


  // ==========================================================
  // IMPORTANT:
  // Prefer actual final tailoredResume.
  //
  // Fallback keeps compatibility with older responses.
  // ==========================================================

  const tailoredResume =
    result.tailoredResume ||
    result.structuredResume ||
    {};


  // ==========================================================
  // CREATE PDF
  // ==========================================================

  const doc =
    new PDFDocument({
      size: "A4",

      margins: {
        top: 42,
        bottom: 50,
        left: 50,
        right: 50,
      },

      bufferPages: true,
      autoFirstPage: true,
    });


  // ==========================================================
  // RESPONSE HEADERS
  // ==========================================================

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="tailored-resume.pdf"'
  );

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );

  res.setHeader(
    "Pragma",
    "no-cache"
  );


  // ==========================================================
  // PIPE
  // ==========================================================

  doc.pipe(res);


  // ==========================================================
  // EXTRACT FINAL DATA
  // ==========================================================

  const name =
    safeText(
      tailoredResume.name
    ) ||
    "Tailored Resume";

  const email =
    safeText(
      tailoredResume.email
    );

  const phone =
    safeText(
      tailoredResume.phone
    );

  const linkedin =
    safeText(
      tailoredResume.linkedin
    );

  const github =
    safeText(
      tailoredResume.github
    );

  const summary =
    safeText(
      tailoredResume.summary ||
      result.professionalSummary ||
      ""
    );

  const skills =
    unique(
      tailoredResume.skills?.length
        ? tailoredResume.skills
        : result.prioritizedSkills
    );

  const experience =
    normalizeExperience(
      tailoredResume.experience
    );

  const projects =
    safeArray(
      tailoredResume.projects
    );

  const education =
    cleanArray(
      tailoredResume.education
    );

  const certifications =
    cleanArray(
      tailoredResume.certifications
    );

  const achievements =
    cleanArray(
      tailoredResume.achievements
    );

  const languages =
    cleanArray(
      tailoredResume.languages
    );

  const hobbies =
    cleanArray(
      tailoredResume.hobbies
    );


  // ==========================================================
  // HEADER
  // ==========================================================

  ensureSpace(
    doc,
    125
  );

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(
      COLORS.black
    )
    .text(
      name,
      {
        align: "center",
      }
    );

  doc.moveDown(0.15);

  addContactLine(
    doc,
    [
      email,
      phone,
    ]
  );

  addContactLine(
    doc,
    [
      linkedin,
      github,
    ]
  );

  doc.moveDown(0.2);

  doc
    .moveTo(
      50,
      doc.y
    )
    .lineTo(
      doc.page.width - 50,
      doc.y
    )
    .lineWidth(1)
    .strokeColor(
      COLORS.dark
    )
    .stroke();

  doc.moveDown(0.8);


  // ==========================================================
  // PROFESSIONAL SUMMARY
  // ==========================================================

  if (
    summary
  ) {
    addSectionHeader(
      doc,
      "Professional Summary"
    );

    doc
      .font("Helvetica")
      .fontSize(9.8)
      .fillColor(
        COLORS.text
      )
      .text(
        summary,
        {
          width:
            doc.page.width - 100,
          lineGap: 3,
        }
      );

    doc.moveDown(0.7);
  }


  // ==========================================================
  // SKILLS
  // ==========================================================

  if (
    skills.length > 0
  ) {
    addSectionHeader(
      doc,
      "Skills"
    );

    addSkills(
      doc,
      skills
    );
  }


  // ==========================================================
  // EXPERIENCE
  // ==========================================================

  if (
    experience.length > 0
  ) {
    addSectionHeader(
      doc,
      "Professional Experience"
    );

    renderExperience(
      doc,
      experience
    );
  }


  // ==========================================================
  // PROJECTS
  // ==========================================================

  if (
    projects.length > 0
  ) {
    addSectionHeader(
      doc,
      "Projects"
    );

    renderProjects(
      doc,
      projects
    );
  }


  // ==========================================================
  // EDUCATION
  // ==========================================================

  if (
    education.length > 0
  ) {
    addSectionHeader(
      doc,
      "Education"
    );

    renderSimpleList(
      doc,
      education
    );

    doc.moveDown(0.3);
  }


  // ==========================================================
  // CERTIFICATIONS
  // ==========================================================

  if (
    certifications.length > 0
  ) {
    addSectionHeader(
      doc,
      "Certifications"
    );

    renderSimpleList(
      doc,
      certifications
    );

    doc.moveDown(0.3);
  }


  // ==========================================================
  // ACHIEVEMENTS
  // ==========================================================

  if (
    achievements.length > 0
  ) {
    addSectionHeader(
      doc,
      "Achievements"
    );

    renderSimpleList(
      doc,
      achievements
    );

    doc.moveDown(0.3);
  }


  // ==========================================================
  // LANGUAGES
  // ==========================================================

  if (
    languages.length > 0
  ) {
    addSectionHeader(
      doc,
      "Languages"
    );

    renderInlineList(
      doc,
      languages
    );
  }


  // ==========================================================
  // INTERESTS
  // ==========================================================

  if (
    hobbies.length > 0
  ) {
    addSectionHeader(
      doc,
      "Interests"
    );

    renderInlineList(
      doc,
      hobbies
    );
  }


  // ==========================================================
  // FINAL NOTE
  // ==========================================================

  ensureSpace(
    doc,
    60
  );

  doc
    .font("Helvetica")
    .fontSize(7.2)
    .fillColor(
      COLORS.light
    )
    .text(
      "Generated using AI Resume Analyzer. Review all content before submitting an application.",
      {
        align: "center",
        width:
          doc.page.width - 100,
      }
    );


  // ==========================================================
  // FOOTER
  // ==========================================================

  addFooter(
    doc
  );


  // ==========================================================
  // END PDF
  // ==========================================================

  doc.end();
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  generateResumePDF,
};