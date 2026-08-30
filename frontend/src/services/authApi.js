
// ============================================================
// AUTH API
// ============================================================
//
// All authentication requests use the central API configuration.
//
// Central API config:
// frontend/src/api/apiConfig.js
//
// frontend/.env:
// VITE_API_URL=http://localhost:5000
//
// ============================================================

import API_BASE_URL from "./apiConfig";

// ============================================================
// HELPER — PARSE RESPONSE
// ============================================================

const parseResponse =
  async (response) => {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    // --------------------------------------------------------
    // JSON RESPONSE
    // --------------------------------------------------------

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      try {
        return await response.json();
      } catch (
        error
      ) {
        console.error(
          "Failed to parse JSON response:",
          error
        );

        return {
          success:
            false,

          message:
            "Server returned invalid JSON.",
        };
      }
    }

    // --------------------------------------------------------
    // NON-JSON RESPONSE
    // --------------------------------------------------------

    try {
      const text =
        await response.text();

      return {
        success:
          false,

        message:
          text ||
          `Server returned ${response.status} ${response.statusText}`,
      };
    } catch (
      error
    ) {
      console.error(
        "Failed to read server response:",
        error
      );

      return {
        success:
          false,

        message:
          `Server returned ${response.status} ${response.statusText}`,
      };
    }
  };

// ============================================================
// HELPER — HANDLE API ERROR
// ============================================================

const getErrorMessage =
  (
    data,
    fallbackMessage
  ) => {
    return (
      data?.message ||
      fallbackMessage
    );
  };

// ============================================================
// REGISTER USER
// ============================================================
// POST /api/auth/register
// ============================================================

export const registerUser =
  async (
    userData
  ) => {
    try {
      // ------------------------------------------------------
      // VALIDATE INPUT
      // ------------------------------------------------------

      if (
        !userData ||
        typeof userData !==
          "object"
      ) {
        throw new Error(
          "Registration data is required."
        );
      }

      // ------------------------------------------------------
      // REQUEST
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      const data =
        await parseResponse(
          response
        );

      console.log(
        "Register API Response:",
        data
      );

      // ------------------------------------------------------
      // ERROR
      // ------------------------------------------------------

      if (
        !response.ok ||
        data?.success ===
          false
      ) {
        throw new Error(
          getErrorMessage(
            data,
            "Registration failed."
          )
        );
      }

      return data;
    } catch (
      error
    ) {
      console.error(
        "Register API Error:",
        error
      );

      throw new Error(
        error?.message ||
          "Unable to connect to server."
      );
    }
  };

// ============================================================
// LOGIN USER
// ============================================================
// POST /api/auth/login
// ============================================================

export const loginUser =
  async (
    userData
  ) => {
    try {
      // ------------------------------------------------------
      // VALIDATE INPUT
      // ------------------------------------------------------

      if (
        !userData ||
        typeof userData !==
          "object"
      ) {
        throw new Error(
          "Login data is required."
        );
      }

      // ------------------------------------------------------
      // REQUEST
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      const data =
        await parseResponse(
          response
        );

      console.log(
        "Login API Response:",
        data
      );

      // ------------------------------------------------------
      // ERROR
      // ------------------------------------------------------

      if (
        !response.ok ||
        data?.success ===
          false
      ) {
        throw new Error(
          getErrorMessage(
            data,
            "Login failed."
          )
        );
      }

      return data;
    } catch (
      error
    ) {
      console.error(
        "Login API Error:",
        error
      );

      throw new Error(
        error?.message ||
          "Unable to connect to server."
      );
    }
  };

// ============================================================
// GET CURRENT USER
// ============================================================
// GET /api/auth/me
// ============================================================

export const getCurrentUser =
  async (
    token
  ) => {
    try {
      // ------------------------------------------------------
      // TOKEN VALIDATION
      // ------------------------------------------------------

      const cleanToken =
        String(
          token || ""
        ).trim();

      if (
        !cleanToken
      ) {
        throw new Error(
          "Authentication token is required."
        );
      }

      // ------------------------------------------------------
      // REQUEST
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      const data =
        await parseResponse(
          response
        );

      console.log(
        "Current User API Response:",
        data
      );

      // ------------------------------------------------------
      // ERROR
      // ------------------------------------------------------

      if (
        !response.ok ||
        data?.success ===
          false
      ) {
        throw new Error(
          getErrorMessage(
            data,
            "Failed to get current user."
          )
        );
      }

      return data;
    } catch (
      error
    ) {
      console.error(
        "Current User API Error:",
        error
      );

      throw new Error(
        error?.message ||
          "Unable to get current user."
      );
    }
  };

// ============================================================
// EXPORT
// ============================================================
//
// Default export intentionally omitted because the application
// uses named exports:
//
// registerUser()
// loginUser()
// getCurrentUser()
//
// ============================================================

