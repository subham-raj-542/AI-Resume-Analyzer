
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ============================================================
// DATABASE
// ============================================================

const connectDB = require("./config/db");

// ============================================================
// ROUTES
// ============================================================

// IMPORTANT:
// Actual file:
// backend/routes/jobMatchRoutes.js

const jobMatchRoutes = require("./routes/jobMatchRoutes");

const resumeTailorRoutes =
  require("./routes/resumeTailorRoutes");

const tailoredResumeRoutes =
  require("./routes/tailoredResumeRoutes");

const resumeRoutes =
  require("./routes/resumeRoutes");

const authRoutes =
  require("./routes/authRoutes");

// ============================================================
// APP
// ============================================================

const app = express();

// ============================================================
// PORT
// ============================================================

const PORT =
  Number(process.env.PORT) || 5000;

// ============================================================
// CORS CONFIGURATION
// ============================================================

const allowedOrigins = String(
  process.env.CORS_ALLOWED_ORIGINS || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // --------------------------------------------------------
    // Allow requests without Origin.
    // Examples:
    // - Postman
    // - curl
    // - server-to-server requests
    // --------------------------------------------------------

    if (!origin) {
      return callback(null, true);
    }

    // --------------------------------------------------------
    // No whitelist configured = allow all origins.
    // --------------------------------------------------------

    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    // --------------------------------------------------------
    // Check whitelist.
    // --------------------------------------------------------

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(
        `CORS blocked request from origin: ${origin}`
      )
    );
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,

    message:
      "AI Resume Analyzer Backend is running",

    environment:
      process.env.NODE_ENV || "development",
  });
});

// ============================================================
// AUTHENTICATION
// ============================================================
//
// POST /api/auth/register
// POST /api/auth/login
// GET  /api/auth/me
//
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);

// ============================================================
// RESUME SYSTEM
// ============================================================
//
// POST   /api/resumes
// GET    /api/resumes
// GET    /api/resumes/:id
// PUT    /api/resumes/:id
// DELETE /api/resumes/:id
//
// ============================================================

app.use(
  "/api/resumes",
  resumeRoutes
);

// ============================================================
// JOB MATCH
// ============================================================
//
// POST /api/job-match
//
// ============================================================

app.use(
  "/api/job-match",
  jobMatchRoutes
);

// ============================================================
// RESUME CUSTOMIZATION
// ============================================================
//
// POST /api/resume-tailor
//
// ============================================================

app.use(
  "/api/resume-tailor",
  resumeTailorRoutes
);

// ============================================================
// TAILORED RESUME BUILDER
// ============================================================
//
// POST /api/tailored-resume
//
// ============================================================

app.use(
  "/api/tailored-resume",
  tailoredResumeRoutes
);

// ============================================================
// OLD UPLOAD ROUTES REMOVED
// ============================================================
//
// Removed:
//
// /api/upload
// /api/upload/resume
//
// Canonical upload API:
//
// POST /api/resumes
//
// ============================================================

// ============================================================
// GLOBAL 404
// ============================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,

    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "\n================================================"
    );

    console.error(
      "              GLOBAL SERVER ERROR"
    );

    console.error(
      "================================================"
    );

    console.error(error);

    console.error(
      "================================================\n"
    );

    // --------------------------------------------------------
    // Prevent duplicate response.
    // --------------------------------------------------------

    if (res.headersSent) {
      return next(error);
    }

    // --------------------------------------------------------
    // CORS ERROR
    // --------------------------------------------------------

    if (
      error?.message?.startsWith(
        "CORS blocked request"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(
      error?.statusCode ||
        error?.status ||
        500
    ).json({
      success: false,

      message:
        error?.message ||
        "Internal server error",
    });
  }
);

// ============================================================
// START SERVER
// ============================================================

let server;

const startServer = async () => {
  try {
    // --------------------------------------------------------
    // CONNECT DATABASE FIRST
    // --------------------------------------------------------

    await connectDB();

    // --------------------------------------------------------
    // START EXPRESS
    // --------------------------------------------------------

    server = app.listen(
      PORT,
      () => {
        console.log(
          "\n================================================"
        );

        console.log(
          "        AI RESUME ANALYZER BACKEND"
        );

        console.log(
          "================================================"
        );

        console.log(
          `Environment: ${
            process.env.NODE_ENV ||
            "development"
          }`
        );

        console.log(
          `Server running on port ${PORT}`
        );

        console.log(
          "Auth API: /api/auth"
        );

        console.log(
          "Resume API: /api/resumes"
        );

        console.log(
          "Job Match API: /api/job-match"
        );

        console.log(
          "Resume Customization API: /api/resume-tailor"
        );

        console.log(
          "Tailored Builder API: /api/tailored-resume"
        );

        console.log(
          "================================================"
        );

        console.log(
          "Canonical resume upload endpoint:"
        );

        console.log(
          "POST /api/resumes"
        );

        console.log(
          "================================================\n"
        );

        // ----------------------------------------------------
        // CORS STATUS
        // ----------------------------------------------------

        if (
          allowedOrigins.length === 0
        ) {
          console.log(
            "CORS: Allowing all origins"
          );
        } else {
          console.log(
            "CORS allowed origins:"
          );

          allowedOrigins.forEach(
            (origin) => {
              console.log(
                ` - ${origin}`
              );
            }
          );
        }

        console.log(
          "================================================\n"
        );
      }
    );
  } catch (error) {
    console.error(
      "\nFailed to start server:"
    );

    console.error(
      error?.message || error
    );

    process.exit(1);
  }
};

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

const shutdown = (signal) => {
  console.log(
    `\n${signal} received. Shutting down server...`
  );

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    console.log(
      "HTTP server closed."
    );

    process.exit(0);
  });
};

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);

// ============================================================
// RUN SERVER
// ============================================================

startServer();

