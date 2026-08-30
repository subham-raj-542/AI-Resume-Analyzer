
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadDirectory =
  path.join(
    process.cwd(),
    "uploads"
  );

// ============================================================
// CREATE UPLOAD DIRECTORY
// ============================================================

try {
  if (
    !fs.existsSync(
      uploadDirectory
    )
  ) {
    fs.mkdirSync(
      uploadDirectory,
      {
        recursive: true,
      }
    );
  }
} catch (error) {
  console.error(
    "UPLOAD DIRECTORY ERROR:",
    error?.message ||
      error
  );

  throw error;
}

// ============================================================
// STORAGE
// ============================================================

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      // ------------------------------------------------------
      // KEEP ONLY PDF EXTENSION
      // ------------------------------------------------------

      const originalName =
        String(
          file?.originalname ||
            ""
        );

      const extension =
        path
          .extname(
            originalName
          )
          .toLowerCase();

      const safeExtension =
        extension ===
        ".pdf"
          ? ".pdf"
          : ".pdf";

      // ------------------------------------------------------
      // UNIQUE FILE NAME
      // ------------------------------------------------------

      const uniqueName =
        `resume-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${safeExtension}`;

      cb(
        null,
        uniqueName
      );
    },
  });

// ============================================================
// FILE FILTER
// ============================================================
//
// Allow PDF only.
//
// We check both:
// 1. MIME type
// 2. File extension
//
// ============================================================

const fileFilter = (
  req,
  file,
  cb
) => {
  const mimeType =
    String(
      file?.mimetype ||
        ""
    ).toLowerCase();

  const originalName =
    String(
      file?.originalname ||
        ""
    ).toLowerCase();

  const hasPDFExtension =
    originalName.endsWith(
      ".pdf"
    );

  const isPDFMimeType =
    mimeType ===
    "application/pdf";

  if (
    !hasPDFExtension &&
    !isPDFMimeType
  ) {
    return cb(
      new Error(
        "Only PDF files are allowed."
      ),
      false
    );
  }

  return cb(
    null,
    true
  );
};

// ============================================================
// MULTER UPLOAD
// ============================================================
//
// Frontend maximum:
// 10 MB
//
// Backend maximum:
// 10 MB
//
// ============================================================

const upload =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        10 *
        1024 *
        1024,

      files:
        1,
    },
  });

// ============================================================
// EXPORT
// ============================================================

module.exports =
  upload;

