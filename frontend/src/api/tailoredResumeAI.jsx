
// ============================================================
// TAILORED RESUME AI API
// ============================================================
//
// Central API configuration:
// frontend/src/api/apiConfig.js
//
// frontend/.env:
//
// VITE_API_URL=http://localhost:5000
//
// ============================================================

import API_BASE_URL from "./apiConfig";

// ============================================================
// API ROOT
// ============================================================
//
// apiConfig.js gives:
// http://localhost:5000
//
// This file uses:
// http://localhost:5000/api
//
// ============================================================

const API_ROOT = `${API_BASE_URL}/api`;

// ============================================================
// HELPER — GET AUTH TOKEN
// ============================================================

const getToken = () => {
  try {
    return String(
      localStorage.getItem(
        "token"
      ) || ""
    ).trim();
  } catch (error) {
    console.error(
      "Unable to read authentication token:",
      error
    );

    return "";
  }
};

// ============================================================
// HELPER — HANDLE API RESPONSE
// ============================================================

const handleResponse =
  async (
    response
  ) => {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let data = {};

    // --------------------------------------------------------
    // JSON RESPONSE
    // --------------------------------------------------------

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      try {
        data =
          await response.json();
      } catch (
        error
      ) {
        console.error(
          "Invalid JSON response:",
          error
        );

        throw new Error(
          "Server returned an invalid JSON response."
        );
      }
    } else {
      // ------------------------------------------------------
      // NON-JSON RESPONSE
      // ------------------------------------------------------

      const responseText =
        await response.text();

      console.error(
        "Tailored Resume AI non-JSON response:",
        responseText
      );

      throw new Error(
        `Server returned ${response.status} instead of JSON.`
      );
    }

    // --------------------------------------------------------
    // AUTH ERROR
    // --------------------------------------------------------

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error(
        data?.message ||
          "Your login session has expired. Please login again."
      );
    }

    // --------------------------------------------------------
    // API ERROR
    // --------------------------------------------------------

    if (
      !response.ok ||
      data?.success === false
    ) {
      throw new Error(
        data?.message ||
          "Request failed."
      );
    }

    return data;
  };

// ============================================================
// GENERATE TAILORED RESUME
// ============================================================
// POST /api/resume-tailor
//
// Body:
//
// {
//   resumeId: "...",
//   resumeText: "...",
//   jobDescription: "..."
// }
//
// ============================================================

export const tailorResume =
  async (
    resumeId,
    jobDescription,
    resumeText = ""
  ) => {
    try {
      // ------------------------------------------------------
      // TOKEN
      // ------------------------------------------------------

      const token =
        getToken();

      if (
        !token
      ) {
        throw new Error(
          "Please login first."
        );
      }

      // ------------------------------------------------------
      // RESUME ID
      // ------------------------------------------------------

      const cleanResumeId =
        String(
          resumeId || ""
        ).trim();

      if (
        !cleanResumeId
      ) {
        throw new Error(
          "Resume ID is required."
        );
      }

      // ------------------------------------------------------
      // JOB DESCRIPTION
      // ------------------------------------------------------

      const cleanJobDescription =
        String(
          jobDescription || ""
        ).trim();

      if (
        !cleanJobDescription
      ) {
        throw new Error(
          "Job description is required."
        );
      }

      if (
        cleanJobDescription.length <
        20
      ) {
        throw new Error(
          "Job description should contain at least 20 characters."
        );
      }

      // ------------------------------------------------------
      // RESUME TEXT
      // ------------------------------------------------------

      const cleanResumeText =
        String(
          resumeText || ""
        ).trim();

      // ------------------------------------------------------
      // REQUEST
      // ------------------------------------------------------

      const response =
        await fetch(
          `${API_ROOT}/resume-tailor`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                resumeId:
                  cleanResumeId,

                resumeText:
                  cleanResumeText,

                jobDescription:
                  cleanJobDescription,
              }),
          }
        );

      // ------------------------------------------------------
      // HANDLE RESPONSE
      // ------------------------------------------------------

      return await handleResponse(
        response
      );
    } catch (
      error
    ) {
      console.error(
        "TAILORED RESUME AI API ERROR:",
        error
      );

      throw error;
    }
  };

// ============================================================
// GENERATE SAVED RESUME TAILOR
// ============================================================
//
// Legacy compatibility helper.
//
// POST /api/resumes/:id/tailor
//
// This route is still available in backend for compatibility.
//
// ============================================================

export const tailorSavedResume =
  async (
    resumeId,
    jobDescription
  ) => {
    try {
      const token =
        getToken();

      if (
        !token
      ) {
        throw new Error(
          "Please login first."
        );
      }

      const cleanResumeId =
        String(
          resumeId || ""
        ).trim();

      if (
        !cleanResumeId
      ) {
        throw new Error(
          "Resume ID is required."
        );
      }

      const cleanJobDescription =
        String(
          jobDescription || ""
        ).trim();

      if (
        !cleanJobDescription
      ) {
        throw new Error(
          "Job description is required."
        );
      }

      if (
        cleanJobDescription.length <
        20
      ) {
        throw new Error(
          "Job description should contain at least 20 characters."
        );
      }

      const response =
        await fetch(
          `${API_ROOT}/resumes/${encodeURIComponent(
            cleanResumeId
          )}/tailor`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                jobDescription:
                  cleanJobDescription,
              }),
          }
        );

      return await handleResponse(
        response
      );
    } catch (
      error
    ) {
      console.error(
        "TAILORED SAVED RESUME API ERROR:",
        error
      );

      throw error;
    }
  };

// ============================================================
// EXPORT API ROOT
// ============================================================

export {
  API_ROOT,
};

