
// ============================================================
// AUTH API
// ============================================================

import API_BASE_URL from "./apiConfig";

// ============================================================
// HELPER — HANDLE RESPONSE
// ============================================================

const handleResponse = async (
  response
) => {
  let data = {};

  try {
    data =
      await response.json();
  } catch (
    error
  ) {
    throw new Error(
      "Server returned an invalid response."
    );
  }

  if (
    !response.ok ||
    data?.success === false
  ) {
    throw new Error(
      data?.message ||
        "Something went wrong."
    );
  }

  return data;
};

// ============================================================
// REGISTER USER
// ============================================================
//
// POST /api/auth/register
//
// ============================================================

export const registerUser =
  async (
    userData
  ) => {
    const response =
      await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              userData
            ),
        }
      );

    return handleResponse(
      response
    );
  };

// ============================================================
// LOGIN USER
// ============================================================
//
// POST /api/auth/login
//
// ============================================================

export const loginUser =
  async (
    userData
  ) => {
    const response =
      await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              userData
            ),
        }
      );

    return handleResponse(
      response
    );
  };

// ============================================================
// GET CURRENT USER
// ============================================================
//
// GET /api/auth/me
//
// Protected Route
//
// ============================================================

export const getCurrentUser =
  async (
    token
  ) => {
    const cleanToken =
      String(
        token || ""
      ).trim();

    if (
      !cleanToken
    ) {
      throw new Error(
        "Authentication token is missing."
      );
    }

    const response =
      await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          method:
            "GET",

          headers: {
            Authorization:
              `Bearer ${cleanToken}`,
          },
        }
      );

    return handleResponse(
      response
    );
  };

