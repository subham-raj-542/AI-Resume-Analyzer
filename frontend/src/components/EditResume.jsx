
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import API_BASE_URL from "../api/apiConfig";

// ============================================================
// EDIT / REPLACE RESUME
// ============================================================
//
// RESPONSIBILITY:
//
// ✅ Load one saved resume
// ✅ Replace existing PDF
// ✅ Validate replacement file
// ✅ Re-analyze through backend
// ✅ Preserve same resume ID
// ✅ Update active resume selection
// ✅ Return to Resume Details
//
// NOT HERE:
//
// ❌ Job Match
// ❌ Resume Customization
// ❌ Tailor Resume
//
// ============================================================

function EditResume() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const fileInputRef =
    useRef(null);

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    resume,
    setResume,
  ] = useState(null);

  const [
    file,
    setFile,
  ] = useState(null);

  const [
    dragging,
    setDragging,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    try {
      return String(
        localStorage.getItem(
          "token"
        ) || ""
      ).trim();
    } catch (
      storageError
    ) {
      console.error(
        "Unable to read authentication token:",
        storageError
      );

      return "";
    }
  };

  // ==========================================================
  // RESUME ID
  // ==========================================================

  const getResumeId = (
    value
  ) => {
    return String(
      value?._id ||
        value?.id ||
        value?.resumeId ||
        ""
    ).trim();
  };

  // ==========================================================
  // LOAD RESUME
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadResume =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          // --------------------------------------------------
          // TOKEN
          // --------------------------------------------------

          const authToken =
            getToken();

          if (
            !authToken
          ) {
            throw new Error(
              "Please login first."
            );
          }

          // --------------------------------------------------
          // RESUME ID
          // --------------------------------------------------

          if (
            !id
          ) {
            throw new Error(
              "Resume ID is missing."
            );
          }

          // --------------------------------------------------
          // API REQUEST
          // --------------------------------------------------

          const response =
            await fetch(
              `${API_BASE_URL}/api/resumes/${encodeURIComponent(
                id
              )}`,
              {
                method:
                  "GET",

                headers: {
                  Authorization:
                    `Bearer ${authToken}`,
                },
              }
            );

          // --------------------------------------------------
          // RESPONSE
          // --------------------------------------------------

          const contentType =
            response.headers.get(
              "content-type"
            ) || "";

          let data =
            {};

          if (
            contentType.includes(
              "application/json"
            )
          ) {
            try {
              data =
                await response.json();
            } catch (
              parseError
            ) {
              console.error(
                "Load resume JSON parse error:",
                parseError
              );

              throw new Error(
                "Server returned invalid JSON."
              );
            }
          } else {
            const responseText =
              await response.text();

            console.error(
              "Load resume non-JSON response:",
              responseText
            );

            throw new Error(
              `Server returned ${response.status} instead of JSON.`
            );
          }

          // --------------------------------------------------
          // AUTH ERROR
          // --------------------------------------------------

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

          // --------------------------------------------------
          // NOT FOUND
          // --------------------------------------------------

          if (
            response.status ===
            404
          ) {
            throw new Error(
              data?.message ||
                "Resume not found."
            );
          }

          // --------------------------------------------------
          // OTHER API ERRORS
          // --------------------------------------------------

          if (
            !response.ok ||
            data?.success ===
              false
          ) {
            throw new Error(
              data?.message ||
                "Unable to load resume."
            );
          }

          // --------------------------------------------------
          // RESUME DATA
          // --------------------------------------------------

          const savedResume =
            data?.resume ||
            data?.data?.resume ||
            data?.result?.resume ||
            null;

          if (
            !savedResume
          ) {
            throw new Error(
              "Resume data was not returned by the server."
            );
          }

          if (
            mounted
          ) {
            setResume(
              savedResume
            );

            const selectedId =
              getResumeId(
                savedResume
              ) ||
              id;

            // ----------------------------------------------
            // KEEP THIS RESUME SELECTED
            // ----------------------------------------------

            try {
              localStorage.setItem(
                "selectedResumeId",
                selectedId
              );

              localStorage.setItem(
                "resumeId",
                selectedId
              );
            } catch (
              storageError
            ) {
              console.error(
                "Resume selection storage error:",
                storageError
              );
            }

            window.dispatchEvent(
              new CustomEvent(
                "resume-selection-changed",
                {
                  detail: {
                    resumeId:
                      selectedId,

                    _id:
                      selectedId,

                    id:
                      selectedId,

                    resume:
                      savedResume,
                  },
                }
              )
            );
          }
        } catch (
          loadError
        ) {
          console.error(
            "Load resume error:",
            loadError
          );

          if (
            mounted
          ) {
            setError(
              loadError?.message ||
                "Unable to load resume."
            );
          }
        } finally {
          if (
            mounted
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadResume();

    return () => {
      mounted =
        false;
    };
  }, [id]);

  // ==========================================================
  // VALIDATE FILE
  // ==========================================================

  const validateFile = (
    selectedFile
  ) => {
    if (
      !selectedFile
    ) {
      return "Please select a resume PDF.";
    }

    const isPDF =
      selectedFile.type ===
        "application/pdf" ||
      String(
        selectedFile.name || ""
      )
        .toLowerCase()
        .endsWith(
          ".pdf"
        );

    if (
      !isPDF
    ) {
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
  // FILE SELECT
  // ==========================================================

  const handleFileSelect = (
    selectedFile
  ) => {
    setError("");

    setSuccess("");

    if (
      !selectedFile
    ) {
      setFile(
        null
      );

      return;
    }

    const validationError =
      validateFile(
        selectedFile
      );

    if (
      validationError
    ) {
      setFile(
        null
      );

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
  // FILE INPUT
  // ==========================================================

  const handleInputChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0];

    handleFileSelect(
      selectedFile
    );

    // Allow choosing same file again.
    event.target.value =
      "";
  };

  // ==========================================================
  // DRAG OVER
  // ==========================================================

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      !updating
    ) {
      setDragging(
        true
      );
    }
  };

  // ==========================================================
  // DRAG LEAVE
  // ==========================================================

  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragging(
      false
    );
  };

  // ==========================================================
  // DROP
  // ==========================================================

  const handleDrop = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragging(
      false
    );

    if (
      updating
    ) {
      return;
    }

    const droppedFile =
      event.dataTransfer.files?.[0];

    handleFileSelect(
      droppedFile
    );
  };

  // ==========================================================
  // OPEN PICKER
  // ==========================================================

  const openPicker = () => {
    if (
      updating
    ) {
      return;
    }

    fileInputRef.current?.click();
  };

  // ==========================================================
  // FILE SIZE
  // ==========================================================

  const formatFileSize =
    (
      bytes
    ) => {
      const value =
        Number(
          bytes
        );

      if (
        !Number.isFinite(
          value
        ) ||
        value <= 0
      ) {
        return "Unknown size";
      }

      if (
        value <
        1024
      ) {
        return `${value} B`;
      }

      if (
        value <
        1024 *
          1024
      ) {
        return `${(
          value /
          1024
        ).toFixed(
          1
        )} KB`;
      }

      return `${(
        value /
        (1024 *
          1024)
      ).toFixed(
        2
      )} MB`;
    };

  // ==========================================================
  // UPDATE / REPLACE
  // ==========================================================

  const handleUpdate =
    async () => {
      try {
        setError("");

        setSuccess("");

        // ----------------------------------------------------
        // RESUME ID
        // ----------------------------------------------------

        if (
          !id
        ) {
          throw new Error(
            "Resume ID is missing."
          );
        }

        // ----------------------------------------------------
        // FILE
        // ----------------------------------------------------

        if (
          !file
        ) {
          setError(
            "Please select a new PDF resume first."
          );

          return;
        }

        // ----------------------------------------------------
        // FILE VALIDATION
        // ----------------------------------------------------

        const validationError =
          validateFile(
            file
          );

        if (
          validationError
        ) {
          setError(
            validationError
          );

          return;
        }

        // ----------------------------------------------------
        // TOKEN
        // ----------------------------------------------------

        const authToken =
          getToken();

        if (
          !authToken
        ) {
          throw new Error(
            "Please login first."
          );
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

        // ----------------------------------------------------
        // LOADING
        // ----------------------------------------------------

        setUpdating(
          true
        );

        // ----------------------------------------------------
        // API REQUEST
        // ----------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes/${encodeURIComponent(
              id
            )}`,
            {
              method:
                "PUT",

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

        let data =
          {};

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          try {
            data =
              await response.json();
          } catch (
            parseError
          ) {
            console.error(
              "Update resume JSON parse error:",
              parseError
            );

            throw new Error(
              "Server returned invalid JSON."
            );
          }
        } else {
          const responseText =
            await response.text();

          console.error(
            "Update resume non-JSON response:",
            responseText
          );

          throw new Error(
            `Server returned ${response.status} instead of JSON.`
          );
        }

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
        // NOT FOUND
        // ----------------------------------------------------

        if (
          response.status ===
          404
        ) {
          throw new Error(
            data?.message ||
              "Resume was not found."
          );
        }

        // ----------------------------------------------------
        // API ERROR
        // ----------------------------------------------------

        if (
          !response.ok ||
          data?.success ===
            false
        ) {
          throw new Error(
            data?.message ||
              "Unable to replace resume."
          );
        }

        // ----------------------------------------------------
        // UPDATED RESUME
        // ----------------------------------------------------

        const updatedResume =
          data?.resume ||
          data?.data?.resume ||
          data?.result?.resume ||
          null;

        const updatedId =
          getResumeId(
            updatedResume
          ) ||
          id;

        // ----------------------------------------------------
        // KEEP SAME RESUME SELECTED
        // ----------------------------------------------------

        try {
          localStorage.setItem(
            "selectedResumeId",
            updatedId
          );

          localStorage.setItem(
            "resumeId",
            updatedId
          );
        } catch (
          storageError
        ) {
          console.error(
            "Resume selection storage error:",
            storageError
          );
        }

        window.dispatchEvent(
          new CustomEvent(
            "resume-selection-changed",
            {
              detail: {
                resumeId:
                  updatedId,

                _id:
                  updatedId,

                id:
                  updatedId,

                resume:
                  updatedResume,
              },
            }
          )
        );

        // ----------------------------------------------------
        // UPDATE LOCAL STATE
        // ----------------------------------------------------

        if (
          updatedResume
        ) {
          setResume(
            updatedResume
          );
        } else {
          setResume(
            (
              current
            ) => ({
              ...(current ||
                {}),

              originalName:
                file.name,

              fileName:
                file.name,

              fileSize:
                file.size,

              mimetype:
                "application/pdf",
            })
          );
        }

        // ----------------------------------------------------
        // CLEAR FILE
        // ----------------------------------------------------

        setFile(
          null
        );

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }

        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        setSuccess(
          "Resume replaced and analyzed successfully."
        );

        // ----------------------------------------------------
        // RETURN TO DETAILS
        // ----------------------------------------------------

        window.setTimeout(
          () => {
            navigate(
              `/resumes/${updatedId}`,
              {
                replace:
                  true,
              }
            );
          },
          800
        );
      } catch (
        updateError
      ) {
        console.error(
          "Update resume error:",
          updateError
        );

        setError(
          updateError?.message ||
            "Unable to update resume."
        );
      } finally {
        setUpdating(
          false
        );
      }
    };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack =
    () => {
      if (
        updating
      ) {
        return;
      }

      if (
        id
      ) {
        navigate(
          `/resumes/${id}`
        );
      } else {
        navigate(
          "/resumes"
        );
      }
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading
  ) {
    return (
      <div
        className="
          min-h-screen
          bg-[#07070a]
          px-5
          py-16
          text-white
          md:px-8
        "
      >
        <div
          className="
            mx-auto
            max-w-6xl
          "
        >
          <div
            className="
              h-4
              w-40
              animate-pulse
              rounded
              bg-white/[0.05]
            "
          />

          <div
            className="
              mt-5
              h-10
              w-80
              animate-pulse
              rounded-xl
              bg-white/[0.05]
            "
          />

          <div
            className="
              mt-8
              h-80
              animate-pulse
              rounded-[30px]
              border
              border-white/[0.05]
              bg-white/[0.02]
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
          bg-[#07070a]
          px-5
          py-16
          text-white
          md:px-8
        "
      >
        <div
          className="
            mx-auto
            max-w-2xl
            rounded-[30px]
            border
            border-white/[0.07]
            bg-white/[0.02]
            p-8
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-red-500/10
              bg-red-500/[0.05]
              text-2xl
            "
          >
            ⚠️
          </div>

          <p
            className="
              mt-5
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-red-300
            "
          >
            Resume unavailable
          </p>

          <h1
            className="
              mt-2
              text-2xl
              font-bold
              text-white
            "
          >
            Unable to open this resume
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-500
            "
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/resumes"
              )
            }
            className="
              mt-7
              rounded-xl
              bg-white
              px-5
              py-3
              text-sm
              font-bold
              text-slate-950
              transition
              hover:bg-slate-100
            "
          >
            Back to Resume History
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CURRENT RESUME DATA
  // ==========================================================

  const currentName =
    resume?.originalName ||
    resume?.fileName ||
    "Saved Resume";

  const currentScore =
    Number(
      resume?.atsScore ??
        resume?.analysis?.atsScore ??
        resume?.analysis?.score ??
        0
    );

  const safeScore =
    Number.isFinite(
      currentScore
    )
      ? Math.min(
          100,
          Math.max(
            0,
            currentScore
          )
        )
      : 0;

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#07070a]
        text-white
      "
    >
      {/* ======================================================
          HEADER
      ======================================================= */}

      <header
        className="
          border-b
          border-white/[0.06]
          bg-[#07070a]/80
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            w-[92%]
            max-w-6xl
            py-8
          "
        >
          <button
            type="button"
            onClick={
              handleBack
            }
            className="
              text-xs
              font-medium
              text-slate-500
              transition
              hover:text-white
            "
          >
            ← Back to Resume
          </button>

          <div
            className="
              mt-6
            "
          >
            <span
              className="
                inline-flex
                rounded-full
                border
                border-violet-400/10
                bg-violet-500/[0.05]
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-violet-300
              "
            >
              Resume Management
            </span>

            <h1
              className="
                mt-4
                text-3xl
                font-bold
                tracking-[-0.03em]
                text-white
                md:text-5xl
              "
            >
              Replace your resume.
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-7
                text-slate-500
                md:text-base
              "
            >
              Upload a newer PDF to replace the
              current version. The new file will
              be extracted, analyzed and saved
              automatically.
            </p>
          </div>
        </div>
      </header>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main
        className="
          mx-auto
          w-[92%]
          max-w-6xl
          py-8
          pb-20
        "
      >
        {/* ====================================================
            CURRENT RESUME
        ==================================================== */}

        <section
          className="
            rounded-[28px]
            border
            border-white/[0.07]
            bg-white/[0.02]
            p-5
            md:p-7
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-red-400/10
                  bg-red-500/[0.06]
                  text-xl
                "
              >
                📄
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-slate-600
                  "
                >
                  Current resume
                </p>

                <h2
                  className="
                    mt-1
                    truncate
                    text-base
                    font-semibold
                    text-white
                  "
                  title={
                    currentName
                  }
                >
                  {currentName}
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  ATS Score:{" "}
                  <span
                    className="
                      font-semibold
                      text-indigo-300
                    "
                  >
                    {safeScore}
                  </span>
                </p>
              </div>
            </div>

            <div
              className="
                rounded-xl
                border
                border-cyan-400/10
                bg-cyan-500/[0.04]
                px-3
                py-2
                text-xs
                text-cyan-300
              "
            >
              Same resume ID will be preserved
            </div>
          </div>
        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-red-500/10
              bg-red-500/[0.04]
              px-4
              py-3
              text-sm
              leading-6
              text-red-300
            "
          >
            ⚠️ {error}
          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-emerald-500/10
              bg-emerald-500/[0.04]
              px-4
              py-3
              text-sm
              leading-6
              text-emerald-300
            "
          >
            ✓ {success}
          </div>
        )}

        {/* ====================================================
            INSTRUCTION
        ==================================================== */}

        <section
          className="
            mt-5
            rounded-2xl
            border
            border-indigo-500/[0.08]
            bg-indigo-500/[0.025]
            p-4
            md:p-5
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-indigo-500/10
                text-xs
                font-bold
                text-indigo-300
              "
            >
              1
            </span>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Upload your newer PDF
              </p>

              <p
                className="
                  mt-1.5
                  text-xs
                  leading-6
                  text-slate-500
                  md:text-sm
                "
              >
                The replacement file will completely
                replace the current PDF and will be
                analyzed again automatically.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            UPLOAD
        ==================================================== */}

        <section
          className="
            mt-5
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.07]
            bg-white/[0.02]
          "
        >
          <div
            className="
              border-b
              border-white/[0.06]
              px-5
              py-5
              md:px-7
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-slate-600
              "
            >
              New PDF
            </p>

            <h2
              className="
                mt-2
                text-xl
                font-bold
                text-white
              "
            >
              Choose replacement file
            </h2>
          </div>

          <div
            className="
              p-5
              md:p-7
            "
          >
            <input
              ref={
                fileInputRef
              }
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={
                handleInputChange
              }
            />

            {/* EMPTY */}

            {!file && (
              <button
                type="button"
                onClick={
                  openPicker
                }
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={
                  handleDrop
                }
                disabled={
                  updating
                }
                className={`
                  group
                  flex
                  min-h-[300px]
                  w-full
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-[26px]
                  border
                  border-dashed
                  p-8
                  text-center
                  outline-none
                  transition-all
                  ${
                    dragging
                      ? "border-violet-400/50 bg-violet-500/[0.08]"
                      : "border-white/[0.09] bg-black/10 hover:border-violet-400/25 hover:bg-violet-500/[0.025]"
                  }
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                `}
              >
                <div
                  className="
                    flex
                    h-18
                    w-18
                    items-center
                    justify-center
                    rounded-[22px]
                    border
                    border-violet-400/10
                    bg-violet-500/[0.08]
                    text-3xl
                    transition
                    duration-300
                    group-hover:scale-105
                  "
                >
                  📄
                </div>

                <h3
                  className="
                    mt-6
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  Drop the new PDF here
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
                    flex-wrap
                    justify-center
                    gap-2
                  "
                >
                  <span
                    className="
                      rounded-lg
                      border
                      border-white/[0.06]
                      bg-white/[0.02]
                      px-3
                      py-1.5
                      text-[11px]
                      text-slate-600
                    "
                  >
                    PDF only
                  </span>

                  <span
                    className="
                      rounded-lg
                      border
                      border-white/[0.06]
                      bg-white/[0.02]
                      px-3
                      py-1.5
                      text-[11px]
                      text-slate-600
                    "
                  >
                    Max 10MB
                  </span>

                  <span
                    className="
                      rounded-lg
                      border
                      border-white/[0.06]
                      bg-white/[0.02]
                      px-3
                      py-1.5
                      text-[11px]
                      text-slate-600
                    "
                  >
                    Re-analyzed automatically
                  </span>
                </div>
              </button>
            )}

            {/* SELECTED */}

            {file && (
              <div
                className="
                  rounded-[26px]
                  border
                  border-violet-500/[0.10]
                  bg-violet-500/[0.025]
                  p-5
                  md:p-6
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-violet-500/10
                        text-xl
                        text-violet-300
                      "
                    >
                      ✓
                    </div>

                    <div
                      className="
                        min-w-0
                      "
                    >
                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-white
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
                        )}{" "}
                        • PDF
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        updating
                      ) {
                        return;
                      }

                      setFile(
                        null
                      );

                      setError(
                        ""
                      );

                      if (
                        fileInputRef.current
                      ) {
                        fileInputRef.current.value =
                          "";
                      }
                    }}
                    disabled={
                      updating
                    }
                    className="
                      rounded-xl
                      border
                      border-white/[0.07]
                      bg-white/[0.02]
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-slate-400
                      transition
                      hover:bg-white/[0.05]
                      hover:text-white
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Remove
                  </button>
                </div>

                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-amber-500/[0.08]
                    bg-amber-500/[0.025]
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      leading-6
                      text-amber-300/70
                    "
                  >
                    This file will replace the current
                    resume. Its text, analysis and file
                    metadata will be updated.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleUpdate
                  }
                  disabled={
                    updating
                  }
                  className="
                    mt-5
                    flex
                    min-h-14
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-white
                    px-6
                    py-4
                    text-sm
                    font-bold
                    text-slate-950
                    transition
                    hover:-translate-y-0.5
                    hover:bg-slate-100
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {updating ? (
                    <>
                      <span
                        className="
                          h-5
                          w-5
                          animate-spin
                          rounded-full
                          border-2
                          border-slate-300
                          border-t-slate-950
                        "
                      />

                      Replacing & analyzing...
                    </>
                  ) : (
                    <>
                      🔄 Replace & Analyze Resume
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            WHAT HAPPENS
        ==================================================== */}

        <section
          className="
            mt-5
            rounded-[26px]
            border
            border-white/[0.07]
            bg-white/[0.015]
            p-5
            md:p-7
          "
        >
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-600
            "
          >
            After replacement
          </p>

          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-3
              md:grid-cols-4
            "
          >
            <ProcessStep
              number="01"
              title="Replace"
              text="Your old PDF is replaced."
            />

            <ProcessStep
              number="02"
              title="Extract"
              text="Text is extracted from the new PDF."
            />

            <ProcessStep
              number="03"
              title="Analyze"
              text="ATS and resume analysis runs again."
            />

            <ProcessStep
              number="04"
              title="Save"
              text="The updated resume remains in your history."
            />
          </div>
        </section>

        {/* ====================================================
            CANCEL
        ==================================================== */}

        <button
          type="button"
          onClick={
            handleBack
          }
          disabled={
            updating
          }
          className="
            mt-5
            w-full
            rounded-2xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            px-5
            py-3.5
            text-sm
            font-semibold
            text-slate-500
            transition
            hover:bg-white/[0.04]
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Cancel and go back
        </button>
      </main>
    </div>
  );
}

// ============================================================
// PROCESS STEP
// ============================================================

function ProcessStep({
  number,
  title,
  text,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.05]
        bg-black/10
        p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <span
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            bg-white/[0.04]
            text-[9px]
            font-bold
            text-slate-500
          "
        >
          {number}
        </span>

        <h3
          className="
            text-sm
            font-semibold
            text-white
          "
        >
          {title}
        </h3>
      </div>

      <p
        className="
          mt-3
          text-xs
          leading-5
          text-slate-600
        "
      >
        {text}
      </p>
    </div>
  );
}

// ============================================================
// EXPORT
// ============================================================

export default EditResume;

