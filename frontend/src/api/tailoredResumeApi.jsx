// ============================================================
// TAILORED RESUME AI API
// ============================================================

const API_BASE_URL = "http://localhost:5000/api";


// ============================================================
// GET AUTH TOKEN
// ============================================================

function getToken() {
  return localStorage.getItem("token");
}


// ============================================================
// TAILOR RESUME
// ============================================================
// POST /api/resumes/:id/tailor
//
// Body:
// {
//   jobDescription: "..."
// }
// ============================================================

export async function tailorResume(
  resumeId,
  jobDescription
) {
  try {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    if (
      !jobDescription ||
      !jobDescription.trim()
    ) {
      throw new Error(
        "Job description is required."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/resumes/${resumeId}/tailor`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          jobDescription:
            jobDescription.trim(),
        }),
      }
    );


    // ========================================================
    // READ RESPONSE
    // ========================================================

    const data =
      await response.json();


    // ========================================================
    // HANDLE API ERROR
    // ========================================================

    if (!response.ok) {
      throw new Error(
        data?.message ||
        "Failed to generate tailored resume."
      );
    }


    // ========================================================
    // SUCCESS
    // ========================================================

    return data;

  } catch (error) {

    console.error(
      "TAILOR RESUME API ERROR:",
      error
    );

    throw error;
  }
}


// ============================================================
// GET SINGLE RESUME
// ============================================================
// Useful when we need resume details before tailoring.
// ============================================================

export async function getResume(
  resumeId
) {
  try {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/resumes/${resumeId}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


    const data =
      await response.json();


    if (!response.ok) {
      throw new Error(
        data?.message ||
        "Failed to fetch resume."
      );
    }


    return data;

  } catch (error) {

    console.error(
      "GET RESUME API ERROR:",
      error
    );

    throw error;
  }
}


// ============================================================
// GET ALL USER RESUMES
// ============================================================
// GET /api/resumes
// ============================================================

export async function getAllResumes() {
  try {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/resumes`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


    const data =
      await response.json();


    if (!response.ok) {
      throw new Error(
        data?.message ||
        "Failed to fetch resumes."
      );
    }


    return data;

  } catch (error) {

    console.error(
      "GET ALL RESUMES API ERROR:",
      error
    );

    throw error;
  }
}