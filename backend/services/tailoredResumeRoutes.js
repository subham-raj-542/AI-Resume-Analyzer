const express = require("express");

const {
protect,
} = require("../middleware/authMiddleware");

const {
buildTailoredResume,
} = require("../services/tailoredResumeBuilder");

const {
generateResumePDF,
} = require("../services/resumePdfService");

const router = express.Router();

// ============================================================
// POST /api/tailored-resume
// Generate Tailored Resume
// ============================================================

router.post("/", protect, (req, res) => {
try {
console.log(
"\n================================================"
);

```
console.log(
  "       TAILORED RESUME REQUEST"
);

console.log(
  "================================================"
);

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
    message: "Resume text is required.",
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
    message: "Job description is required.",
  });
}


// ==========================================================
// LOG
// ==========================================================

console.log(
  "Authenticated user:",
  req.user?._id || req.user?.id
);

console.log(
  "Resume text length:",
  resumeText.length
);

console.log(
  "Job description length:",
  jobDescription.length
);


// ==========================================================
// BUILD
// ==========================================================

console.log(
  "\nGenerating tailored resume..."
);

const result =
  buildTailoredResume(
    resumeText,
    jobDescription
  );


// ==========================================================
// CHECK
// ==========================================================

if (!result) {
  return res.status(500).json({
    success: false,
    message:
      "Unable to generate tailored resume.",
  });
}


// ==========================================================
// VERIFY FINAL OBJECT
// ==========================================================

console.log(
  "\n>>> FINAL TAILORED RESUME CHECK <<<"
);

console.log(
  "Has tailoredResume:",
  Boolean(
    result?.tailoredResume
  )
);

console.log(
  "Candidate:",
  result?.tailoredResume?.name ||
    "Not detected"
);

console.log(
  "Experience count:",
  Array.isArray(
    result?.tailoredResume?.experience
  )
    ? result.tailoredResume.experience.length
    : 0
);


// ==========================================================
// RESPONSE
// ==========================================================

return res.status(200).json({
  success: true,

  message:
    "Tailored resume generated successfully.",

  result,
});


} catch (error) {
console.error(
"\n================================================"
);

```
console.error(
  "      TAILORED RESUME ERROR"
);

console.error(
  "================================================"
);

console.error(error);

console.error(
  "================================================\n"
);

return res.status(500).json({
  success: false,

  message:
    error.message ||
    "Unable to generate tailored resume.",
});


}
});

// ============================================================
// POST /api/tailored-resume/pdf
// Generate + Download Tailored Resume PDF
// ============================================================

router.post(
"/pdf",
protect,
(req, res) => {
try {
console.log(
"\n================================================"
);


  console.log(
    ">>> PDF ROUTE HIT: /api/tailored-resume/pdf <<<"
  );

  console.log(
    "================================================"
  );


  // ========================================================
  // AUTHENTICATED USER
  // ========================================================

  console.log(
    "Authenticated user:",
    req.user?._id || req.user?.id
  );


  // ========================================================
  // REQUEST DATA
  // ========================================================

  const {
    resumeText,
    jobDescription,
  } = req.body || {};


  // ========================================================
  // VALIDATE RESUME
  // ========================================================

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


  // ========================================================
  // VALIDATE JOB DESCRIPTION
  // ========================================================

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


  // ========================================================
  // LOG REQUEST
  // ========================================================

  console.log(
    "PDF resume text received:",
    true
  );

  console.log(
    "PDF resume text length:",
    resumeText.length
  );

  console.log(
    "PDF job description received:",
    true
  );

  console.log(
    "PDF job description length:",
    jobDescription.length
  );


  // ========================================================
  // BUILD FINAL TAILORED RESUME
  // ========================================================

  console.log(
    "\nBuilding tailored resume for PDF..."
  );

  const result =
    buildTailoredResume(
      resumeText,
      jobDescription
    );


  // ========================================================
  // VERIFY RESULT
  // ========================================================

  if (!result) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to generate tailored resume for PDF.",
    });
  }


  // ========================================================
  // DEBUG FINAL PDF DATA
  // ========================================================

  console.log(
    "\n>>> PDF DATA CHECK <<<"
  );

  console.log(
    "Has tailoredResume:",
    Boolean(
      result?.tailoredResume
    )
  );

  console.log(
    "PDF Candidate:",
    result?.tailoredResume?.name ||
      "Not detected"
  );

  console.log(
    "PDF Summary exists:",
    Boolean(
      result?.tailoredResume?.summary
    )
  );

  console.log(
    "PDF Skills count:",
    Array.isArray(
      result?.tailoredResume?.skills
    )
      ? result.tailoredResume.skills.length
      : 0
  );

  console.log(
    "PDF Experience count:",
    Array.isArray(
      result?.tailoredResume?.experience
    )
      ? result.tailoredResume.experience.length
      : 0
  );

  console.log(
    "PDF Education count:",
    Array.isArray(
      result?.tailoredResume?.education
    )
      ? result.tailoredResume.education.length
      : 0
  );

  console.log(
    "PDF Certifications count:",
    Array.isArray(
      result?.tailoredResume?.certifications
    )
      ? result.tailoredResume.certifications.length
      : 0
  );


  // ========================================================
  // GENERATE PDF
  // ========================================================

  console.log(
    "\nGenerating professional tailored resume PDF..."
  );

  generateResumePDF(
    result,
    res
  );

  console.log(
    "PDF generation started successfully."
  );

} catch (error) {
  console.error(
    "\n================================================"
  );

  console.error(
    "   TAILORED RESUME PDF ERROR"
  );

  console.error(
    "================================================"
  );

  console.error(error);

  console.error(
    "================================================\n"
  );


  // ========================================================
  // STREAM ALREADY STARTED
  // ========================================================

  if (res.headersSent) {
    return;
  }


  return res.status(500).json({
    success: false,

    message:
      error.message ||
      "Unable to generate tailored resume PDF.",
  });
}


}
);

// ============================================================
// INVALID ROUTE
// ============================================================

router.use((req, res) => {
return res.status(404).json({
success: false,


message:
  `Tailored resume route not found: ${req.method} ${req.originalUrl}`,


});
});

// ============================================================
// EXPORT
// ============================================================

module.exports = router;
