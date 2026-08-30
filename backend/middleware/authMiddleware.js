
const jwt = require("jsonwebtoken");

// ============================================================
// JWT SECRET
// ============================================================

const getJWTSecret = () => {
  const secret =
    String(
      process.env.JWT_SECRET || ""
    ).trim();

  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing in backend/.env file."
    );
  }

  if (
    secret.length <
    16
  ) {
    throw new Error(
      "JWT_SECRET is too short. Please use a longer secret."
    );
  }

  return secret;
};

// ============================================================
// EXTRACT BEARER TOKEN
// ============================================================

const extractBearerToken = (
  req
) => {
  const authorization =
    String(
      req.headers?.authorization ||
        ""
    ).trim();

  if (
    !authorization
  ) {
    return "";
  }

  const [
    scheme,
    token,
  ] =
    authorization.split(
      /\s+/
    );

  if (
    scheme?.toLowerCase() !==
    "bearer"
  ) {
    return "";
  }

  return String(
    token || ""
  ).trim();
};

// ============================================================
// PROTECT ROUTE
// ============================================================
//
// Usage:
//
// router.get(
//   "/",
//   protect,
//   controller
// );
//
// ============================================================

const protect = async (
  req,
  res,
  next
) => {
  try {
    // --------------------------------------------------------
    // JWT SECRET CHECK
    // --------------------------------------------------------

    const secret =
      getJWTSecret();

    // --------------------------------------------------------
    // GET TOKEN
    // --------------------------------------------------------

    const token =
      extractBearerToken(
        req
      );

    // --------------------------------------------------------
    // TOKEN MISSING
    // --------------------------------------------------------

    if (
      !token
    ) {
      return res
        .status(401)
        .json({
          success:
            false,

          code:
            "TOKEN_MISSING",

          message:
            "Access denied. Token missing.",
        });
    }

    // --------------------------------------------------------
    // VERIFY TOKEN
    // --------------------------------------------------------

    const decoded =
      jwt.verify(
        token,
        secret
      );

    // --------------------------------------------------------
    // VALIDATE PAYLOAD
    // --------------------------------------------------------

    const userId =
      String(
        decoded?.id ||
          decoded?._id ||
          decoded?.userId ||
          ""
      ).trim();

    if (
      !userId
    ) {
      return res
        .status(401)
        .json({
          success:
            false,

          code:
            "INVALID_TOKEN",

          message:
            "Invalid token payload.",
        });
    }

    // --------------------------------------------------------
    // ATTACH USER
    // --------------------------------------------------------

    req.user = {
      ...decoded,
      id:
        userId,
    };

    // --------------------------------------------------------
    // CONTINUE
    // --------------------------------------------------------

    return next();

  } catch (
    error
  ) {
    console.error(
      "JWT verification error:",
      error?.message ||
        error
    );

    // --------------------------------------------------------
    // JWT CONFIGURATION ERROR
    // --------------------------------------------------------

    if (
      error?.message?.includes(
        "JWT_SECRET"
      )
    ) {
      return res
        .status(500)
        .json({
          success:
            false,

          code:
            "JWT_CONFIGURATION_ERROR",

          message:
            "Server authentication configuration is incomplete. Check JWT_SECRET in backend/.env.",
        });
    }

    // --------------------------------------------------------
    // TOKEN ERROR
    // --------------------------------------------------------

    if (
      error?.name ===
      "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({
          success:
            false,

          code:
            "TOKEN_EXPIRED",

          message:
            "Your login session has expired. Please login again.",
        });
    }

    if (
      error?.name ===
      "JsonWebTokenError"
    ) {
      return res
        .status(401)
        .json({
          success:
            false,

          code:
            "INVALID_TOKEN",

          message:
            "Invalid authentication token.",
        });
    }

    // --------------------------------------------------------
    // GENERIC AUTH ERROR
    // --------------------------------------------------------

    return res
      .status(401)
      .json({
        success:
          false,

        code:
          "AUTHENTICATION_FAILED",

        message:
          "Authentication failed. Please login again.",
      });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  protect,
};

