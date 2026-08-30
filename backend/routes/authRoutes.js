const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// REGISTER
// ============================================================
// POST /api/auth/register
// ============================================================

router.post(
  "/register",
  registerUser
);

// ============================================================
// LOGIN
// ============================================================
// POST /api/auth/login
// ============================================================

router.post(
  "/login",
  loginUser
);

// ============================================================
// GET CURRENT USER
// ============================================================
// GET /api/auth/me
// Protected Route
// ============================================================

router.get(
  "/me",
  protect,
  getCurrentUser
);

module.exports = router;