
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

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
      "JWT_SECRET is missing in .env file."
    );
  }

  if (
    secret.length < 16
  ) {
    throw new Error(
      "JWT_SECRET is too short. Please use a longer secret in .env."
    );
  }

  return secret;
};

// ============================================================
// GENERATE JWT TOKEN
// ============================================================

const generateToken = (
  userId
) => {
  const secret =
    getJWTSecret();

  return jwt.sign(
    {
      id: String(
        userId
      ),
    },
    secret,
    {
      expiresIn: "7d",
    }
  );
};

// ============================================================
// NORMALIZE EMAIL
// ============================================================

const normalizeEmail = (
  email = ""
) => {
  return String(
    email
  )
    .trim()
    .toLowerCase();
};

// ============================================================
// NORMALIZE NAME
// ============================================================

const normalizeName = (
  name = ""
) => {
  return String(
    name
  )
    .trim()
    .replace(
      /\s+/g,
      " "
    );
};

// ============================================================
// VALIDATE EMAIL
// ============================================================

const isValidEmail = (
  email = ""
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email).trim()
  );
};

// ============================================================
// REGISTER USER
// ============================================================
// POST /api/auth/register
// ============================================================

const registerUser = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // READ INPUT
    // --------------------------------------------------------

    const name =
      normalizeName(
        req.body?.name
      );

    const email =
      normalizeEmail(
        req.body?.email
      );

    const password =
      String(
        req.body?.password || ""
      );

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name) {
      return res.status(400).json({
        success: false,
        code: "NAME_REQUIRED",
        message:
          "Name is required.",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        code: "INVALID_NAME",
        message:
          "Name must contain at least 2 characters.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        code: "EMAIL_REQUIRED",
        message:
          "Email is required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_EMAIL",
        message:
          "Please enter a valid email address.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        code: "PASSWORD_REQUIRED",
        message:
          "Password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        code: "WEAK_PASSWORD",
        message:
          "Password must be at least 6 characters long.",
      });
    }

    // --------------------------------------------------------
    // JWT CONFIG CHECK
    // --------------------------------------------------------

    try {
      getJWTSecret();
    } catch (jwtConfigError) {
      console.error(
        "JWT CONFIGURATION ERROR:",
        jwtConfigError.message
      );

      return res.status(500).json({
        success: false,
        code: "JWT_CONFIGURATION_ERROR",
        message:
          "Server authentication configuration is incomplete. Check JWT_SECRET in backend/.env.",
      });
    }

    // --------------------------------------------------------
    // CHECK EXISTING USER
    // --------------------------------------------------------

    const existingUser =
      await User.findOne({
        email,
      }).select(
        "_id email"
      );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: "EMAIL_ALREADY_EXISTS",
        message:
          "An account already exists with this email. Please login instead.",
      });
    }

    // --------------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // --------------------------------------------------------
    // CREATE USER
    // --------------------------------------------------------

    const user =
      await User.create({
        name,
        email,
        password:
          hashedPassword,
      });

    // --------------------------------------------------------
    // GENERATE TOKEN
    // --------------------------------------------------------

    const token =
      generateToken(
        user._id
      );

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "User registered successfully.",

      token,

      user: {
        id:
          user._id,
        name:
          user.name,
        email:
          user.email,
      },
    });

  } catch (error) {
    console.error(
      "\n================================================"
    );

    console.error(
      "REGISTER USER ERROR"
    );

    console.error(
      "================================================"
    );

    console.error(
      "Name:",
      error?.name
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "================================================\n"
    );

    // --------------------------------------------------------
    // DUPLICATE KEY
    // --------------------------------------------------------

    if (
      error?.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        code: "EMAIL_ALREADY_EXISTS",
        message:
          "An account already exists with this email. Please login instead.",
      });
    }

    // --------------------------------------------------------
    // MONGOOSE VALIDATION
    // --------------------------------------------------------

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
        code: "VALIDATION_ERROR",
        message:
          messages.join(
            " "
          ) ||
          "Invalid registration data.",
      });
    }

    // --------------------------------------------------------
    // JWT CONFIGURATION
    // --------------------------------------------------------

    if (
      error?.message?.includes(
        "JWT_SECRET"
      )
    ) {
      return res.status(500).json({
        success: false,
        code: "JWT_CONFIGURATION_ERROR",
        message:
          "Server authentication configuration is incomplete. Check JWT_SECRET in backend/.env.",
      });
    }

    // --------------------------------------------------------
    // GENERIC ERROR
    // --------------------------------------------------------

    return res.status(500).json({
      success: false,
      code: "REGISTER_SERVER_ERROR",
      message:
        "Unable to create your account right now. Please try again.",
    });
  }
};

// ============================================================
// LOGIN USER
// ============================================================
// POST /api/auth/login
// ============================================================

const loginUser = async (
  req,
  res
) => {
  try {
    const email =
      normalizeEmail(
        req.body?.email
      );

    const password =
      String(
        req.body?.password || ""
      );

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "Password is required.",
      });
    }

    // --------------------------------------------------------
    // JWT CONFIG
    // --------------------------------------------------------

    try {
      getJWTSecret();
    } catch (jwtConfigError) {
      console.error(
        "JWT CONFIGURATION ERROR:",
        jwtConfigError.message
      );

      return res.status(500).json({
        success: false,
        code: "JWT_CONFIGURATION_ERROR",
        message:
          "Server authentication configuration is incomplete. Check JWT_SECRET in backend/.env.",
      });
    }

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        code:
          "INVALID_CREDENTIALS",
        message:
          "Invalid email or password.",
      });
    }

    // --------------------------------------------------------
    // PASSWORD
    // --------------------------------------------------------

    const passwordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        code:
          "INVALID_CREDENTIALS",
        message:
          "Invalid email or password.",
      });
    }

    // --------------------------------------------------------
    // TOKEN
    // --------------------------------------------------------

    const token =
      generateToken(
        user._id
      );

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Login successful.",

      token,

      user: {
        id:
          user._id,
        name:
          user.name,
        email:
          user.email,
      },
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to login right now.",
    });
  }
};

// ============================================================
// GET CURRENT USER
// ============================================================
// GET /api/auth/me
// ============================================================

const getCurrentUser = async (
  req,
  res
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication information is missing.",
      });
    }

    const user =
      await User.findById(
        req.user.id
      ).select(
        "-password"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve your account information.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};

