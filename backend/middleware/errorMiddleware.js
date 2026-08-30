
// ============================================================
// AI RESUME ANALYZER
// CENTRAL ERROR HANDLING MIDDLEWARE
// ============================================================

function notFoundHandler(
  req,
  res
) {
  return res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
}


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

function errorHandler(
  error,
  req,
  res,
  next
) {
  console.error(
    "\n========================================"
  );

  console.error(
    "GLOBAL API ERROR"
  );

  console.error(
    "========================================"
  );

  console.error(
    error
  );


  // ----------------------------------------------------------
  // JSON / body parsing error
  // ----------------------------------------------------------

  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid JSON request body.",
    });
  }


  // ----------------------------------------------------------
  // MongoDB duplicate key
  // ----------------------------------------------------------

  if (
    error?.code === 11000
  ) {
    return res.status(409).json({
      success: false,
      message:
        "A record with the same value already exists.",
    });
  }


  // ----------------------------------------------------------
  // Mongoose validation error
  // ----------------------------------------------------------

  if (
    error?.name ===
    "ValidationError"
  ) {
    const messages =
      Object.values(
        error.errors || {}
      )
        .map(
          (item) =>
            item?.message
        )
        .filter(Boolean);

    return res.status(400).json({
      success: false,

      message:
        messages.join(", ") ||
        "Validation failed.",
    });
  }


  // ----------------------------------------------------------
  // Mongoose cast error
  // ----------------------------------------------------------

  if (
    error?.name ===
    "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid resource ID.",
    });
  }


  // ----------------------------------------------------------
  // Explicit status code
  // ----------------------------------------------------------

  const statusCode =
    Number(
      error?.statusCode ||
      error?.status
    ) || 500;


  // ----------------------------------------------------------
  // Safe production message
  // ----------------------------------------------------------

  const message =
    statusCode >= 500
      ? "Internal server error."
      : (
          error?.message ||
          "Request failed."
        );


  return res.status(
    statusCode
  ).json({
    success: false,
    message,
  });
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  notFoundHandler,
  errorHandler,
};

