
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// ============================================================
// COMPONENT
// ============================================================

function EditResume() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    token,
    isAuthenticated,
  } = useAuth();

  const fileInputRef =
    useRef(null);

  // ==========================================================
  // STATE
  // ==========================================================

  const [resume, setResume] =
    useState(null);

  const [file, setFile] =
    useState(null);

  const [dragging, setDragging] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    return String(
      token ||
        localStorage.getItem(
          "token"
        ) ||
        ""
    ).trim();
  };

  // ==========================================================
  // RESUME ID
  // ==========================================================

  const getResumeId = () => {
    return String(
      id ||
        resume?._id ||
        resume?.id ||
        ""
    ).trim();
  };

  // ==========================================================
  // FILE VALIDATION
  // ==========================================================

  const validateFile = (
    selectedFile
  ) => {
    if (!selectedFile) {
      return "Please select a resume PDF.";
    }

    const isPDF =
      selectedFile.type ===
        "application/pdf" ||
      selectedFile.name
        ?.toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {
      return "Only PDF resume files are allowed.";
    }

    const maxSize =
      10 * 1024 * 1024;

    if (
      selectedFile.size >
      maxSize
    ) {
      return "Resume file must be smaller than 10 MB.";
    }

    return "";
  };

  // ==========================================================
  // FILE SIZE
  // ==========================================================

  const formatFileSize =
    (bytes) => {
      const value =
        Number(bytes);

      if (
        !Number.isFinite(
          value
        ) ||
        value <= 0
      ) {
        return "—";
      }

      if (
        value < 1024
      ) {
        return `${value} B`;
      }

      if (
        value <
        1024 * 1024
      ) {
        return `${(
          value / 1024
        ).toFixed(1)} KB`;
      }

      return `${(
        value /
        (1024 * 1024)
      ).toFixed(2)} MB`;
    };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate =
    (value) => {
      if (!value) {
        return "Unknown";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "Unknown";
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    };

  // ==========================================================
  // LOAD CURRENT RESUME
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadResume =
      async () => {
        try {
          setLoading(true);
          setError("");

          const authToken =
            getToken();

          if (
            !authToken ||
            !isAuthenticated
          ) {
            throw new Error(
              "Please login to edit your resume."
            );
          }

          if (!id) {
            throw new Error(
              "Resume ID is missing."
            );
          }

          const response =
            await fetch(
              `${API_BASE_URL}/api/resumes/${id}`,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${authToken}`,
                },
              }
            );

          const contentType =
            response.headers.get(
              "content-type"
            ) || "";

          let data = {};

          if (
            contentType.includes(
              "application/json"
            )
          ) {
            data =
              await response.json();
          } else {
            await response.text();

            throw new Error(
              `Server returned ${response.status} instead of JSON.`
            );
          }

          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            throw new Error(
              data?.message ||
                "Your login session has expired. Please login again."
            );
          }

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to load resume."
            );
          }

          const savedResume =
            data?.resume ||
            data?.data?.resume ||
            data?.data ||
            null;

          if (!savedResume) {
            throw new Error(
              "Resume data was not returned by the server."
            );
          }

          if (mounted) {
            setResume(
              savedResume
            );

            const currentId =
              String(
                savedResume?._id ||
                  savedResume?.id ||
                  id
              ).trim();

            localStorage.setItem(
              "selectedResumeId",
              currentId
            );

            localStorage.setItem(
              "resumeId",
              currentId
            );

            window.dispatchEvent(
              new CustomEvent(
                "resume-selection-changed",
                {
                  detail: {
                    resumeId:
                      currentId,
                  },
                }
              )
            );
          }
        } catch (err) {
          console.error(
            "Edit resume load error:",
            err
          );

          if (mounted) {
            setError(
              err?.message ||
                "Unable to load resume."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadResume();

    return () => {
      mounted = false;
    };
  }, [
    id,
    token,
    isAuthenticated,
  ]);

  // ==========================================================
  // SELECT FILE
  // ==========================================================

  const handleFileSelect = (
    selectedFile
  ) => {
    setError("");
    setSuccessMessage("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError =
      validateFile(
        selectedFile
      );

    if (validationError) {
      setFile(null);
      setError(
        validationError
      );
      return;
    }

    setFile(
      selectedFile
    );
  };

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleInputChange =
    (event) => {
      handleFileSelect(
        event.target.files?.[0]
      );
    };

  // ==========================================================
  // DRAG OVER
  // ==========================================================

  const handleDragOver =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!uploading) {
        setDragging(true);
      }
    };

  // ==========================================================
  // DRAG LEAVE
  // ==========================================================

  const handleDragLeave =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setDragging(false);
    };

  // ==========================================================
  // DROP
  // ==========================================================

  const handleDrop =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setDragging(false);

      if (uploading) {
        return;
      }

      handleFileSelect(
        event.dataTransfer.files?.[0]
      );
    };

  // ==========================================================
  // OPEN PICKER
  // ==========================================================

  const openPicker = () => {
    if (uploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  // ==========================================================
  // REMOVE SELECTED NEW FILE
  // ==========================================================

  const handleRemoveFile =
    () => {
      if (uploading) {
        return;
      }

      setFile(null);
      setError("");
      setSuccessMessage("");

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

  // ==========================================================
  // UPDATE RESUME
  // ==========================================================

  const handleUpdateResume =
    async () => {
      try {
        setError("");
        setSuccessMessage("");

        // ----------------------------------------------------
        // AUTH
        // ----------------------------------------------------

        const authToken =
          getToken();

        if (
          !authToken ||
          !isAuthenticated
        ) {
          throw new Error(
            "Please login first."
          );
        }

        // ----------------------------------------------------
        // RESUME ID
        // ----------------------------------------------------

        const resumeId =
          getResumeId();

        if (!resumeId) {
          throw new Error(
            "Resume ID is missing."
          );
        }

        // ----------------------------------------------------
        // FILE
        // ----------------------------------------------------

        if (!file) {
          throw new Error(
            "Please select a new PDF resume first."
          );
        }

        const validationError =
          validateFile(
            file
          );

        if (validationError) {
          throw new Error(
            validationError
          );
        }

        // ----------------------------------------------------
        // CONFIRM
        // ----------------------------------------------------

        const confirmed =
          window.confirm(
            "This will replace the existing resume PDF and re-run the resume analysis.\n\nContinue?"
          );

        if (!confirmed) {
          return;
        }

        // ----------------------------------------------------
        // FORM DATA
        // ----------------------------------------------------

        const formData =
          new FormData();

        formData.append(
          "resume",
          file
        );

        setUploading(true);

        console.log(
          "\n========================================"
        );

        console.log(
          "UPDATING SAVED RESUME"
        );

        console.log(
          "Resume ID:",
          resumeId
        );

        console.log(
          "New File:",
          file.name
        );

        console.log(
          "API:",
          `${API_BASE_URL}/api/resumes/${resumeId}`
        );

        console.log(
          "========================================"
        );

        // ----------------------------------------------------
        // REQUEST
        // ----------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes/${resumeId}`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${authToken}`,
              },

              body:
                formData,
            }
          );

        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let data = {};

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          data =
            await response.json();
        } else {
          const text =
            await response.text();

          console.error(
            "Non-JSON update response:",
            text
          );

          throw new Error(
            `Server returned ${response.status} instead of JSON.`
          );
        }

        console.log(
          "Resume update response:",
          data
        );

        // ----------------------------------------------------
        // AUTH ERROR
        // ----------------------------------------------------

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            data?.message ||
              "Your login session has expired. Please login again."
          );
        }

        // ----------------------------------------------------
        // API ERROR
        // ----------------------------------------------------

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to update resume."
          );
        }

        // ----------------------------------------------------
        // UPDATED RESUME
        // ----------------------------------------------------

        const updatedResume =
          data?.resume ||
          data?.data?.resume ||
          data?.data ||
          null;

        if (
          !updatedResume
        ) {
          throw new Error(
            "Resume was updated, but updated resume data was not returned."
          );
        }

        // ----------------------------------------------------
        // KEEP SAME RESUME ID SELECTED
        // ----------------------------------------------------

        const updatedId =
          String(
            updatedResume?._id ||
              updatedResume?.id ||
              resumeId
          ).trim();

        localStorage.setItem(
          "selectedResumeId",
          updatedId
        );

        localStorage.setItem(
          "resumeId",
          updatedId
        );

        window.dispatchEvent(
          new CustomEvent(
            "resume-selection-changed",
            {
              detail: {
                resumeId:
                  updatedId,
              },
            }
          )
        );

        setResume(
          updatedResume
        );

        setFile(null);

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }

        setSuccessMessage(
          "Resume replaced and re-analyzed successfully."
        );

        console.log(
          "✅ Resume updated successfully."
        );

        // ----------------------------------------------------
        // GO TO DETAILS
        // ----------------------------------------------------

        setTimeout(() => {
          navigate(
            `/resumes/${updatedId}`
          );
        }, 800);

      } catch (err) {
        console.error(
          "Resume update error:",
          err
        );

        setError(
          err?.message ||
            "Something went wrong while updating your resume."
        );
      } finally {
        setUploading(false);
      }
    };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack =
    () => {
      if (id) {
        navigate(
          `/resumes/${id}`
        );
        return;
      }

      navigate(
        "/resumes"
      );
    };

  // ==========================================================
  // ANALYZER
  // ==========================================================

  const handleAnalyzer =
    () => {
      const resumeId =
        getResumeId();

      if (resumeId) {
        localStorage.setItem(
          "selectedResumeId",
          resumeId
        );

        localStorage.setItem(
          "resumeId",
          resumeId
        );
      }

      navigate(
        "/analyzer"
      );
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-slate-950
          text-white
          px-[5%]
          sm:px-[7%]
          lg:px-[10%]
          py-20
        "
      >

        <div
          className="
            max-w-6xl
            mx-auto
          "
        >

          <div
            className="
              h-5
              w-36
              rounded
              bg-slate-900
              animate-pulse
            "
          />

          <div
            className="
              mt-5
              h-10
              w-96
              max-w-full
              rounded-xl
              bg-slate-900
              animate-pulse
            "
          />

          <div
            className="
              mt-8
              h-96
              rounded-3xl
              bg-slate-900
              animate-pulse
            "
          />

        </div>
      </div>
    );
  }

  // ==========================================================
  // LOAD ERROR
  // ==========================================================

  if (
    error &&
    !resume
  ) {
    return (
      <div
        className="
          min-h-screen
          bg-slate-950
          text-white
          px-[5%]
          sm:px-[7%]
          lg:px-[10%]
          py-20
        "
      >

        <div
          className="
            max-w-3xl
            mx-auto
            text-center
          "
        >

          <div
            className="
              w-20
              h-20
              mx-auto
              rounded-3xl
              bg-red-500/10
              border
              border-red-500/20
              flex
              items-center
              justify-center
              text-4xl
            "
          >
            ⚠️
          </div>

          <h1
            className="
              mt-6
              text-3xl
              font-bold
            "
          >
            Unable to Load Resume
          </h1>

          <p
            className="
              mt-3
              text-slate-500
            "
          >
            {error}
          </p>

          <button
            type="button"
            onClick={
              () =>
                navigate(
                  "/resumes"
                )
            }
            className="
              mt-7
              px-6
              py-3
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-500
              text-white
              font-semibold
              transition
            "
          >
            ← My Resumes
          </button>

        </div>

      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
      "
    >

      {/* ======================================================
          HEADER
      ======================================================= */}

      <section
        className="
          px-[5%]
          sm:px-[7%]
          lg:px-[10%]
          pt-12
          md:pt-16
          pb-10
        "
      >

        <div
          className="
            max-w-6xl
            mx-auto
          "
        >

          <button
            type="button"
            onClick={
              handleBack
            }
            className="
              text-sm
              text-slate-500
              hover:text-white
              transition
            "
          >
            ← Back to Resume
          </button>

          <div
            className="
              mt-6
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-indigo-400
                font-semibold
              "
            >
              Resume Management
            </p>

            <h1
              className="
                mt-3
                text-3xl
                sm:text-4xl
                font-bold
              "
            >
              Replace Your Resume
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-slate-400
                leading-7
              "
            >
              Upload a new PDF to replace
              the existing resume. Your
              resume will be extracted,
              analyzed and the ATS score
              will be updated automatically.
            </p>

          </div>

        </div>

      </section>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main
        className="
          px-[5%]
          sm:px-[7%]
          lg:px-[10%]
          pb-20
        "
      >

        <div
          className="
            max-w-6xl
            mx-auto
            space-y-6
          "
        >

          {/* ==================================================
              CURRENT RESUME
          =================================================== */}

          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-slate-900
              p-6
              md:p-7
            "
          >

            <div
              className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-4
                  min-w-0
                "
              >

                <div
                  className="
                    w-14
                    h-14
                    shrink-0
                    rounded-2xl
                    bg-red-500/10
                    border
                    border-red-500/20
                    flex
                    items-center
                    justify-center
                    text-2xl
                  "
                >
                  📄
                </div>

                <div
                  className="
                    min-w-0
                  "
                >

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-slate-500
                    "
                  >
                    Current Resume
                  </p>

                  <h2
                    className="
                      mt-1
                      text-lg
                      font-semibold
                      truncate
                    "
                    title={
                      resume?.originalName
                    }
                  >
                    {resume?.originalName ||
                      resume?.fileName ||
                      "Saved Resume"}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    {formatFileSize(
                      resume?.fileSize
                    )}{" "}
                    • Uploaded{" "}
                    {formatDate(
                      resume?.createdAt
                    )}
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  shrink-0
                "
              >

                <div
                  className="
                    text-center
                  "
                >

                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    Current ATS
                  </p>

                  <p
                    className="
                      mt-1
                      text-2xl
                      font-bold
                      text-indigo-400
                    "
                  >
                    {
                      Number(
                        resume?.atsScore ??
                          resume?.analysis?.atsScore ??
                          0
                      )
                    }
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              SUCCESS
          =================================================== */}

          {successMessage && (
            <div
              className="
                rounded-2xl
                border
                border-emerald-500/20
                bg-emerald-500/10
                px-5
                py-4
                text-sm
                text-emerald-400
              "
            >
              ✓ {successMessage}
            </div>
          )}

          {/* ==================================================
              ERROR
          =================================================== */}

          {error && (
            <div
              className="
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                px-5
                py-4
                text-sm
                text-red-400
              "
            >
              ⚠️ {error}
            </div>
          )}

          {/* ==================================================
              UPLOAD CARD
          =================================================== */}

          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-slate-900
              p-6
              md:p-8
            "
          >

            <div
              className="
                mb-6
              "
            >

              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.18em]
                  text-indigo-400
                  font-semibold
                "
              >
                Replace PDF
              </p>

              <h2
                className="
                  mt-2
                  text-2xl
                  sm:text-3xl
                  font-bold
                "
              >
                Upload a New Resume
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-slate-500
                  leading-6
                "
              >
                Maximum 10 MB. PDF format
                only.
              </p>

            </div>

            {/* FILE SELECTOR */}

            {!file ? (
              <div
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={
                  handleDrop
                }
                onClick={
                  openPicker
                }
                className={`
                  cursor-pointer
                  rounded-3xl
                  border-2
                  border-dashed
                  p-10
                  sm:p-14
                  text-center
                  transition
                  ${
                    dragging
                      ? "border-indigo-400 bg-indigo-500/10"
                      : "border-white/10 bg-slate-950 hover:border-indigo-500/40 hover:bg-indigo-500/[0.04]"
                  }
                `}
              >

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={
                    handleInputChange
                  }
                  className="hidden"
                />

                <div
                  className="
                    mx-auto
                    w-16
                    h-16
                    rounded-2xl
                    bg-indigo-500/10
                    border
                    border-indigo-500/20
                    flex
                    items-center
                    justify-center
                    text-3xl
                  "
                >
                  📄
                </div>

                <h3
                  className="
                    mt-5
                    text-lg
                    sm:text-xl
                    font-semibold
                  "
                >
                  Drop your new resume here
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-500
                  "
                >
                  or click to browse
                </p>

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-xs
                    text-slate-600
                  "
                >
                  <span>
                    PDF only
                  </span>

                  <span>
                    •
                  </span>

                  <span>
                    Maximum 10 MB
                  </span>
                </div>

              </div>
            ) : (
              <div
                className="
                  rounded-3xl
                  border
                  border-indigo-500/20
                  bg-indigo-500/[0.04]
                  p-5
                  md:p-6
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-5
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                      min-w-0
                    "
                  >

                    <div
                      className="
                        w-14
                        h-14
                        shrink-0
                        rounded-2xl
                        bg-red-500/10
                        border
                        border-red-500/20
                        flex
                        items-center
                        justify-center
                        text-2xl
                      "
                    >
                      📕
                    </div>

                    <div
                      className="
                        min-w-0
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-white
                          truncate
                        "
                        title={
                          file.name
                        }
                      >
                        {file.name}
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                        "
                      >
                        {formatFileSize(
                          file.size
                        )}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRemoveFile
                    }
                    disabled={
                      uploading
                    }
                    className="
                      px-4
                      py-2
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      hover:bg-white/10
                      text-sm
                      text-slate-300
                      transition
                      disabled:opacity-50
                    "
                  >
                    Remove
                  </button>

                </div>

              </div>
            )}

            {/* ACTIONS */}

            <div
              className="
                mt-6
                flex
                flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
              "
            >

              <button
                type="button"
                onClick={
                  handleBack
                }
                disabled={
                  uploading
                }
                className="
                  px-6
                  py-3
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  hover:bg-white/10
                  text-slate-300
                  font-medium
                  transition
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleUpdateResume
                }
                disabled={
                  uploading ||
                  !file
                }
                className="
                  px-6
                  py-3
                  rounded-xl
                  bg-indigo-600
                  hover:bg-indigo-500
                  text-white
                  font-semibold
                  transition
                  shadow-lg
                  shadow-indigo-600/20
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {uploading ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        w-4
                        h-4
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                        animate-spin
                      "
                    />
                    Re-analyzing Resume...
                  </span>
                ) : (
                  "Replace & Re-analyze →"
                )}
              </button>

            </div>

          </section>

          {/* ==================================================
              WARNING
          =================================================== */}

          <div
            className="
              rounded-2xl
              border
              border-yellow-500/20
              bg-yellow-500/[0.04]
              px-5
              py-4
            "
          >

            <p
              className="
                text-sm
                font-medium
                text-yellow-400
              "
            >
              Before replacing your resume
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
                leading-6
              "
            >
              Your new PDF will replace the
              current saved PDF. The same
              resume record and resume ID
              will be updated with the new
              text, analysis and ATS score.
            </p>

          </div>

        </div>

      </main>
    </div>
  );
}

export default EditResume;

