import {
  useRef,
  useState,
} from "react";

import {
  useAuth,
} from "../context/AuthContext";

import API_BASE_URL from "../api/apiConfig";

// ============================================================
// RESUME UPLOAD + ANALYSIS
// ============================================================
//
// RESPONSIBILITY:
//
// ✅ Upload PDF
// ✅ Extract text
// ✅ Analyze resume
// ✅ Save resume through canonical /api/resumes API
// ✅ Receive Resume ID
// ✅ Sync selectedResumeId
// ✅ Send resume text to parent
// ✅ Send analysis to parent
// ✅ Notify parent when resume is removed
//
// ============================================================

function ResumeUpload({
  onResumeTextExtracted,
  onAnalysisComplete,
  onResumeIdExtracted,
  onResumeRemoved,
}) {
  const {
    token,
    isAuthenticated,
  } = useAuth();

  const fileInputRef =
    useRef(null);

  // ==========================================================
  // STATE
  // ==========================================================

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
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    analysis,
    setAnalysis,
  ] = useState(null);

  const [
    resumeText,
    setResumeText,
  ] = useState("");

  const [
    resumeId,
    setResumeId,
  ] = useState("");

  // ==========================================================
  // FILE VALIDATION
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
  // RESUME ID EXTRACTOR
  // ==========================================================

  const extractResumeId =
    (data) => {
      const possibleIds = [
        data?.resumeId,

        data?.databaseId,

        data?.resume?._id,
        data?.resume?.id,
        data?.resume?.resumeId,

        data?.data?._id,
        data?.data?.id,
        data?.data?.resumeId,

        data?.data?.resume?._id,
        data?.data?.resume?.id,

        data?.result?._id,
        data?.result?.id,
        data?.result?.resumeId,

        data?.result?.resume?._id,
        data?.result?.resume?.id,

        data?._id,
        data?.id,
      ];

      const foundId =
        possibleIds.find(
          (value) =>
            value !==
              undefined &&
            value !==
              null &&
            String(
              value
            ).trim() !== ""
        );

      return String(
        foundId || ""
      ).trim();
    };

  // ==========================================================
  // RESUME TEXT EXTRACTOR
  // ==========================================================

  const extractResumeText =
    (data) => {
      const text =
        data?.resumeText ||
        data?.resume?.resumeText ||
        data?.text ||
        data?.data?.resumeText ||
        data?.data?.resume?.resumeText ||
        data?.result?.resumeText ||
        data?.result?.resume?.resumeText ||
        "";

      return String(
        text || ""
      ).trim();
    };

  // ==========================================================
  // ANALYSIS EXTRACTOR
  // ==========================================================

  const extractAnalysis =
    (data) => {
      return (
        data?.analysis ||
        data?.resume?.analysis ||
        data?.data?.analysis ||
        data?.data?.resume?.analysis ||
        data?.result?.analysis ||
        data?.result?.resume?.analysis ||
        null
      );
    };

  // ==========================================================
  // SELECTED RESUME SYNC
  // ==========================================================

  const syncSelectedResume =
    (
      id,
      resume = null
    ) => {
      const cleanId =
        String(
          id || ""
        ).trim();

      if (
        !cleanId
      ) {
        return;
      }

      localStorage.setItem(
        "selectedResumeId",
        cleanId
      );

      localStorage.setItem(
        "resumeId",
        cleanId
      );

      setResumeId(
        cleanId
      );

      window.dispatchEvent(
        new CustomEvent(
          "resume-selection-changed",
          {
            detail: {
              resumeId:
                cleanId,

              _id:
                cleanId,

              id:
                cleanId,

              resume,
            },
          }
        )
      );

      if (
        typeof onResumeIdExtracted ===
        "function"
      ) {
        onResumeIdExtracted(
          cleanId
        );
      }
    };

  // ==========================================================
  // CLEAR CURRENT RESULT
  // ==========================================================

  const clearCurrentResult =
    ({
      clearStoredResume = false,
    } = {}) => {
      setAnalysis(
        null
      );

      setResumeText(
        ""
      );

      if (
        clearStoredResume
      ) {
        setResumeId(
          ""
        );

        localStorage.removeItem(
          "selectedResumeId"
        );

        localStorage.removeItem(
          "resumeId"
        );

        window.dispatchEvent(
          new CustomEvent(
            "resume-selection-changed",
            {
              detail: {
                resumeId:
                  "",
              },
            }
          )
        );

        if (
          typeof onResumeIdExtracted ===
          "function"
        ) {
          onResumeIdExtracted(
            ""
          );
        }
      }

      if (
        typeof onResumeTextExtracted ===
        "function"
      ) {
        onResumeTextExtracted(
          ""
        );
      }

      if (
        typeof onAnalysisComplete ===
        "function"
      ) {
        onAnalysisComplete(
          null
        );
      }
    };

  // ==========================================================
  // SELECT FILE
  // ==========================================================

  const handleFile =
    (
      selectedFile
    ) => {
      setError("");

      setSuccessMessage(
        ""
      );

      clearCurrentResult({
        clearStoredResume:
          true,
      });

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
  // INPUT CHANGE
  // ==========================================================

  const handleInputChange =
    (event) => {
      const selectedFile =
        event.target.files?.[0];

      handleFile(
        selectedFile
      );

      event.target.value =
        "";
    };

  // ==========================================================
  // DRAG OVER
  // ==========================================================

  const handleDragOver =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !loading
      ) {
        setDragging(
          true
        );
      }
    };

  // ==========================================================
  // DRAG LEAVE
  // ==========================================================

  const handleDragLeave =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setDragging(
        false
      );
    };

  // ==========================================================
  // DROP
  // ==========================================================

  const handleDrop =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setDragging(
        false
      );

      if (
        loading
      ) {
        return;
      }

      const droppedFile =
        event.dataTransfer.files?.[0];

      handleFile(
        droppedFile
      );
    };

  // ==========================================================
  // FILE PICKER
  // ==========================================================

  const openFilePicker =
    () => {
      if (
        loading
      ) {
        return;
      }

      fileInputRef.current?.click();
    };

  // ==========================================================
  // REMOVE SELECTED FILE
  // ==========================================================

  const handleRemoveFile =
    () => {
      if (
        loading
      ) {
        return;
      }

      setFile(
        null
      );

      setError(
        ""
      );

      setSuccessMessage(
        ""
      );

      clearCurrentResult({
        clearStoredResume:
          true,
      });

      // --------------------------------------------------------
      // NOTIFY PARENT
      // --------------------------------------------------------

      if (
        typeof onResumeRemoved ===
        "function"
      ) {
        onResumeRemoved();
      }

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

  // ==========================================================
  // FORMAT FILE SIZE
  // ==========================================================

  const formatFileSize =
    (bytes) => {
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
        return "0 KB";
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
  // UPLOAD + ANALYZE
  // ==========================================================

  const handleAnalyze =
    async () => {
      try {
        setError(
          ""
        );

        setSuccessMessage(
          ""
        );

        setAnalysis(
          null
        );

        // ------------------------------------------------------
        // AUTH
        // ------------------------------------------------------

        const authToken =
          String(
            token ||
              localStorage.getItem(
                "token"
              ) ||
              ""
          ).trim();

        if (
          !authToken ||
          !isAuthenticated
        ) {
          setError(
            "You are not logged in. Please login before analyzing your resume."
          );

          return;
        }

        // ------------------------------------------------------
        // FILE
        // ------------------------------------------------------

        if (
          !file
        ) {
          setError(
            "Please select a PDF resume first."
          );

          return;
        }

        // ------------------------------------------------------
        // VALIDATE
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // FORM DATA
        // ------------------------------------------------------

        const formData =
          new FormData();

        formData.append(
          "resume",
          file
        );

        // ------------------------------------------------------
        // LOADING
        // ------------------------------------------------------

        setLoading(
          true
        );

        console.log(
          "=========================================="
        );

        console.log(
          "Uploading resume using canonical API..."
        );

        console.log(
          "Endpoint:",
          `${API_BASE_URL}/api/resumes`
        );

        console.log(
          "File:",
          file.name
        );

        console.log(
          "Size:",
          formatFileSize(
            file.size
          )
        );

        console.log(
          "=========================================="
        );

        // ------------------------------------------------------
        // CANONICAL API REQUEST
        // ------------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes`,
            {
              method:
                "POST",

              headers: {
                Authorization:
                  `Bearer ${authToken}`,
              },

              body:
                formData,
            }
          );

        // ------------------------------------------------------
        // RESPONSE TYPE
        // ------------------------------------------------------

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let data =
          null;

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          try {
            data =
              await response.json();
          } catch (
            responseError
          ) {
            console.error(
              "JSON parsing failed:",
              responseError
            );

            throw new Error(
              "Backend returned invalid JSON."
            );
          }
        } else {
          const responseText =
            await response.text();

          console.error(
            "Backend returned non-JSON:",
            responseText
          );

          throw new Error(
            `Backend returned ${response.status} instead of JSON.`
          );
        }

        console.log(
          "Backend response:",
          data
        );

        // ------------------------------------------------------
        // AUTH ERROR
        // ------------------------------------------------------

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            data?.message ||
              "Your login session is invalid or expired. Please login again."
          );
        }

        // ------------------------------------------------------
        // API ERROR
        // ------------------------------------------------------

        if (
          !response.ok ||
          data?.success ===
            false
        ) {
          throw new Error(
            data?.message ||
              "Resume upload and analysis failed."
          );
        }

        // ------------------------------------------------------
        // RESUME ID
        // ------------------------------------------------------

        const extractedResumeId =
          extractResumeId(
            data
          );

        console.log(
          "Resume ID:",
          extractedResumeId
        );

        if (
          !extractedResumeId
        ) {
          throw new Error(
            "Resume was saved, but the server did not return a resume ID."
          );
        }

        // ------------------------------------------------------
        // RESUME TEXT
        // ------------------------------------------------------

        const extractedText =
          extractResumeText(
            data
          );

        console.log(
          "Extracted text length:",
          extractedText.length
        );

        if (
          !extractedText
        ) {
          throw new Error(
            "Resume was uploaded, but no text could be returned from the server."
          );
        }

        // ------------------------------------------------------
        // ANALYSIS
        // ------------------------------------------------------

        const analysisResult =
          extractAnalysis(
            data
          );

        if (
          !analysisResult
        ) {
          console.warn(
            "No analysis object returned by backend."
          );
        }

        // ------------------------------------------------------
        // SAVE STATE
        // ------------------------------------------------------

        setResumeId(
          extractedResumeId
        );

        setResumeText(
          extractedText
        );

        setAnalysis(
          analysisResult
        );

        // ------------------------------------------------------
        // SAVE ACTIVE RESUME
        // ------------------------------------------------------

        const returnedResume =
          data?.resume ||
          data?.data?.resume ||
          data?.result?.resume ||
          null;

        syncSelectedResume(
          extractedResumeId,
          returnedResume
        );

        // ------------------------------------------------------
        // SEND TEXT TO PARENT
        // ------------------------------------------------------

        if (
          typeof onResumeTextExtracted ===
          "function"
        ) {
          onResumeTextExtracted(
            extractedText
          );
        }

        // ------------------------------------------------------
        // SEND ANALYSIS TO PARENT
        // ------------------------------------------------------

        if (
          typeof onAnalysisComplete ===
          "function"
        ) {
          onAnalysisComplete(
            analysisResult
          );
        }

        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        setSuccessMessage(
          "Resume uploaded, analyzed and saved successfully."
        );

        console.log(
          "=========================================="
        );

        console.log(
          "✅ Resume saved successfully."
        );

        console.log(
          "Resume ID:",
          extractedResumeId
        );

        console.log(
          "selectedResumeId:",
          localStorage.getItem(
            "selectedResumeId"
          )
        );

        console.log(
          "resumeId:",
          localStorage.getItem(
            "resumeId"
          )
        );

        console.log(
          "=========================================="
        );
      } catch (
        err
      ) {
        console.error(
          "Resume upload error:",
          err
        );

        setError(
          err?.message ||
            "Something went wrong while analyzing the resume."
        );

        setAnalysis(
          null
        );

        setResumeText(
          ""
        );

        setResumeId(
          ""
        );

        localStorage.removeItem(
          "selectedResumeId"
        );

        localStorage.removeItem(
          "resumeId"
        );

        window.dispatchEvent(
          new CustomEvent(
            "resume-selection-changed",
            {
              detail: {
                resumeId:
                  "",
              },
            }
          )
        );

        if (
          typeof onResumeTextExtracted ===
          "function"
        ) {
          onResumeTextExtracted(
            ""
          );
        }

        if (
          typeof onAnalysisComplete ===
          "function"
        ) {
          onAnalysisComplete(
            null
          );
        }

        if (
          typeof onResumeIdExtracted ===
          "function"
        ) {
          onResumeIdExtracted(
            ""
          );
        }
      } finally {
        setLoading(
          false
        );
      }
    };

  // ==========================================================
  // ATS SCORE
  // ==========================================================

  const atsScore =
    Math.min(
      Math.max(
        Number(
          analysis?.atsScore ??
            analysis?.score ??
            0
        ) || 0,
        0
      ),
      100
    );

  // ==========================================================
  // IMPROVEMENT ITEMS
  // ==========================================================

  const improvementItems =
    buildImprovementItems(
      analysis
    );

  const highPriorityItems =
    improvementItems.filter(
      (item) =>
        item.priority ===
        "High"
    );

  const mediumPriorityItems =
    improvementItems.filter(
      (item) =>
        item.priority ===
        "Medium"
    );

  const lowPriorityItems =
    improvementItems.filter(
      (item) =>
        item.priority ===
        "Low"
    );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section
      id="resume-upload"
      className="
        relative
        w-full
        scroll-mt-28
      "
    >
      <div
        className="
          mx-auto
          w-[92%]
          max-w-6xl
        "
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            mb-8
            text-center
          "
        >
          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-indigo-300
            "
          >
            Start here
          </p>

          <h2
            className="
              mt-3
              text-3xl
              font-bold
              tracking-[-0.03em]
              text-white
              md:text-4xl
            "
          >
            Upload your resume.
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-2xl
              text-sm
              leading-7
              text-slate-500
              md:text-base
            "
          >
            Upload one PDF. We'll extract the
            content, analyze your resume and save
            it to your account automatically.
          </p>
        </div>

        {/* ====================================================
            UPLOAD CARD
        ==================================================== */}

        <div
          className="
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.08]
            bg-[#0d0d12]
            p-1
            shadow-2xl
            shadow-black/20
          "
        >
          <div
            className="
              rounded-[26px]
              bg-white/[0.015]
              p-5
              md:p-7
            "
          >
            {/* DROP ZONE */}

            {!file && (
              <button
                type="button"
                onClick={
                  openFilePicker
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
                  loading
                }
                className={`
                  group
                  flex
                  min-h-[320px]
                  w-full
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-[24px]
                  border-2
                  border-dashed
                  p-8
                  text-center
                  outline-none
                  transition-all
                  ${
                    dragging
                      ? "border-indigo-400/50 bg-indigo-500/[0.08]"
                      : "border-white/[0.09] bg-black/10 hover:border-indigo-400/25 hover:bg-indigo-500/[0.025]"
                  }
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                `}
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

                <div
                  className="
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-[24px]
                    border
                    border-indigo-400/10
                    bg-indigo-500/[0.08]
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
                  Drop your resume here
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
                      text-[10px]
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
                      text-[10px]
                      text-slate-600
                    "
                  >
                    Maximum 10 MB
                  </span>

                  <span
                    className="
                      rounded-lg
                      border
                      border-white/[0.06]
                      bg-white/[0.02]
                      px-3
                      py-1.5
                      text-[10px]
                      text-slate-600
                    "
                  >
                    AI analysis included
                  </span>
                </div>
              </button>
            )}

            {/* SELECTED FILE */}

            {file && (
              <div
                className="
                  rounded-[24px]
                  border
                  border-indigo-400/10
                  bg-indigo-500/[0.03]
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
                        border
                        border-red-400/10
                        bg-red-500/[0.06]
                        text-xl
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
                          text-slate-600
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
                    onClick={
                      handleRemoveFile
                    }
                    disabled={
                      loading
                    }
                    className="
                      shrink-0
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

                <button
                  type="button"
                  onClick={
                    handleAnalyze
                  }
                  disabled={
                    loading
                  }
                  className="
                    mt-6
                    flex
                    min-h-14
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-indigo-500
                    px-6
                    py-4
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-indigo-500/10
                    transition
                    hover:-translate-y-0.5
                    hover:bg-indigo-400
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {loading ? (
                    <>
                      <span
                        className="
                          h-5
                          w-5
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      Uploading & analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Resume With AI

                      <span>
                        →
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
              mt-5
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

        {successMessage && (
          <div
            className="
              mt-5
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
            ✓ {successMessage}

            {resumeId && (
              <p
                className="
                  mt-1
                  break-all
                  text-[11px]
                  text-emerald-400/60
                "
              >
                Resume saved successfully.
              </p>
            )}
          </div>
        )}

        {/* ====================================================
            EXTRACTED TEXT STATUS
        ==================================================== */}

        {resumeText && (
          <div
            className="
              mt-5
              rounded-[26px]
              border
              border-emerald-500/10
              bg-emerald-500/[0.025]
              p-5
              md:p-6
            "
          >
            <div
              className="
                flex
                items-start
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500/10
                  text-sm
                  text-emerald-300
                "
              >
                ✓
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Resume ready
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
                  Your resume text has been
                  extracted and is now available
                  to the Job Match and Customize
                  Resume sections.
                </p>

                <p
                  className="
                    mt-2
                    text-[11px]
                    text-emerald-400/80
                  "
                >
                  {resumeText.length.toLocaleString(
                    "en-IN"
                  )}{" "}
                  characters extracted
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            ANALYSIS RESULT
        ==================================================== */}

        {analysis && (
          <div
            className="
              mt-6
              rounded-[28px]
              border
              border-white/[0.07]
              bg-white/[0.02]
              p-5
              md:p-7
            "
          >
            {/* HEADER */}

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
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-indigo-300
                  "
                >
                  Analysis complete
                </p>

                <h3
                  className="
                    mt-2
                    text-xl
                    font-bold
                    text-white
                    md:text-2xl
                  "
                >
                  Your resume results
                </h3>

                <p
                  className="
                    mt-1.5
                    text-xs
                    text-slate-600
                  "
                >
                  Your resume has been saved to
                  your account.
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-indigo-400/10
                  bg-indigo-500/[0.05]
                  px-5
                  py-4
                  text-center
                "
              >
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-slate-600
                  "
                >
                  ATS Score
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-black
                    text-indigo-300
                  "
                >
                  {atsScore}

                  <span
                    className="
                      text-sm
                      font-normal
                      text-slate-700
                    "
                  >
                    /100
                  </span>
                </p>
              </div>
            </div>

            {/* METRICS */}

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-3
                md:grid-cols-4
              "
            >
              <MetricCard
                value={
                  analysis.metrics
                    ?.quantifiedAchievements ||
                  0
                }
                label="Achievements"
              />

              <MetricCard
                value={
                  analysis.metrics
                    ?.actionVerbs ||
                  0
                }
                label="Action verbs"
              />

              <MetricCard
                value={
                  analysis.metrics
                    ?.skills ||
                  0
                }
                label="Skills"
              />

              <MetricCard
                value={
                  analysis.metrics
                    ?.bulletPoints ||
                  0
                }
                label="Bullet points"
              />
            </div>

            {/* IMPROVEMENTS */}

            <div
              className="
                mt-6
                rounded-2xl
                border
                border-indigo-500/[0.08]
                bg-indigo-500/[0.025]
                p-5
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-indigo-300
                "
              >
                What to improve
              </p>

              <h4
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-white
                "
              >
                Focus on the important issues first.
              </h4>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-2
                "
              >
                <PriorityCount
                  label="High"
                  count={
                    highPriorityItems.length
                  }
                  type="high"
                />

                <PriorityCount
                  label="Medium"
                  count={
                    mediumPriorityItems.length
                  }
                  type="medium"
                />

                <PriorityCount
                  label="Low"
                  count={
                    lowPriorityItems.length
                  }
                  type="low"
                />
              </div>

              {improvementItems.length >
                0 && (
                <div
                  className="
                    mt-5
                    space-y-2
                  "
                >
                  {improvementItems
                    .slice(
                      0,
                      6
                    )
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={`${item.title}-${index}`}
                          className="
                            rounded-xl
                            border
                            border-white/[0.05]
                            bg-black/10
                            p-3.5
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
                                text-xs
                                text-indigo-300
                              "
                            >
                              {item.icon ||
                                "→"}
                            </span>

                            <div>
                              <p
                                className="
                                  text-xs
                                  font-semibold
                                  text-white
                                "
                              >
                                {item.title}
                              </p>

                              <p
                                className="
                                  mt-1
                                  text-[11px]
                                  leading-5
                                  text-slate-600
                                "
                              >
                                {
                                  item.action
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                </div>
              )}

              {improvementItems.length ===
                0 && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-emerald-500/10
                    bg-emerald-500/[0.03]
                    p-3.5
                    text-xs
                    text-emerald-300
                  "
                >
                  ✓ No major improvement areas
                  were detected.
                </div>
              )}
            </div>

            {/* NEXT */}

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-white/[0.05]
                bg-black/10
                p-4
              "
            >
              <p
                className="
                  text-xs
                  leading-6
                  text-slate-500
                "
              >
                <span
                  className="
                    font-semibold
                    text-indigo-300
                  "
                >
                  Next:
                </span>{" "}
                Review your score above, then move
                to Job Match to compare this resume
                with a real job description.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// IMPROVEMENT ITEMS
// ============================================================

function buildImprovementItems(
  analysis
) {
  if (
    !analysis ||
    typeof analysis !==
      "object"
  ) {
    return [];
  }

  const items = [];

  const contact =
    analysis.contactInformation;

  if (
    contact &&
    contact.linkedinMention &&
    !contact.linkedin
  ) {
    items.push({
      priority:
        "High",

      title:
        "Add your LinkedIn profile URL",

      description:
        "Your resume mentions LinkedIn, but a clear profile URL was not detected.",

      action:
        "Add your complete professional LinkedIn profile URL.",

      icon:
        "in",
    });
  }

  const duplicateSkills =
    Array.isArray(
      analysis.duplicateSkills
    )
      ? analysis.duplicateSkills
      : [];

  if (
    duplicateSkills.length >
    0
  ) {
    items.push({
      priority:
        duplicateSkills.length >=
        5
          ? "High"
          : "Medium",

      title:
        "Reduce repeated skills",

      description:
        `${duplicateSkills.length} skill entries appear repeatedly in your resume.`,

      action:
        "List each skill once and demonstrate it through experience and achievements.",

      icon:
        "↻",
    });
  }

  const missingSections =
    Array.isArray(
      analysis.missingSections
    )
      ? analysis.missingSections
      : [];

  if (
    missingSections.length >
    0
  ) {
    items.push({
      priority:
        missingSections.length >=
        2
          ? "High"
          : "Medium",

      title:
        "Add important resume sections",

      description:
        `Potentially useful sections: ${missingSections.join(
          ", "
        )}.`,

      action:
        "Add only sections that genuinely apply to your background and target role.",

      icon:
        "+",
    });
  }

  const formattingIssues =
    Array.isArray(
      analysis
        ?.formattingQuality
        ?.issues
    )
      ? analysis
          .formattingQuality
          .issues
      : [];

  if (
    formattingIssues.length >
    0
  ) {
    items.push({
      priority:
        "Medium",

      title:
        "Fix formatting issues",

      description:
        `${formattingIssues.length} formatting issue(s) were detected.`,

      action:
        "Review spacing, alignment, consistency and typography.",

      icon:
        "⌁",
    });
  }

  const contentQuality =
    Number(
      analysis
        ?.categoryScores
        ?.contentQuality
    );

  if (
    Number.isFinite(
      contentQuality
    ) &&
    contentQuality <
      75
  ) {
    items.push({
      priority:
        "High",

      title:
        "Improve content quality",

      description:
        `Your content quality score is ${contentQuality}%.`,

      action:
        "Make bullets specific, concise and achievement-focused.",

      icon:
        "✦",
    });
  } else if (
    Number.isFinite(
      contentQuality
    ) &&
    contentQuality <
      90
  ) {
    items.push({
      priority:
        "Medium",

      title:
        "Strengthen content quality",

      description:
        `Your content quality score is ${contentQuality}%.`,

      action:
        "Strengthen weaker bullets with clearer outcomes and relevant numbers where truthful.",

      icon:
        "✦",
    });
  }

  const actionVerbScore =
    Number(
      analysis
        ?.categoryScores
        ?.actionVerbs
    );

  if (
    Number.isFinite(
      actionVerbScore
    ) &&
    actionVerbScore <
      70
  ) {
    items.push({
      priority:
        actionVerbScore <
        50
          ? "High"
          : "Medium",

      title:
        "Strengthen action verbs",

      description:
        `Your action verb score is ${actionVerbScore}%.`,

      action:
        "Start experience bullets with strong, specific action verbs.",

      icon:
        "→",
    });
  }

  const contactScore =
    Number(
      analysis
        ?.categoryScores
        ?.contactInformation
    );

  if (
    Number.isFinite(
      contactScore
    ) &&
    contactScore <
      75
  ) {
    items.push({
      priority:
        "High",

      title:
        "Improve contact information",

      description:
        `Your contact information score is ${contactScore}%.`,

      action:
        "Make sure email, phone and professional profile links are clearly visible.",

      icon:
        "@",
    });
  }

  const quantifiedScore =
    Number(
      analysis
        ?.categoryScores
        ?.quantifiedAchievements
    );

  if (
    Number.isFinite(
      quantifiedScore
    ) &&
    quantifiedScore <
      75
  ) {
    items.push({
      priority:
        quantifiedScore <
        50
          ? "High"
          : "Medium",

      title:
        "Add measurable achievements",

      description:
        `Your quantified achievements score is ${quantifiedScore}%.`,

      action:
        "Use genuine numbers, percentages or measurable outcomes where applicable.",

      icon:
        "%",
    });
  }

  const formattingScore =
    Number(
      analysis
        ?.categoryScores
        ?.formatting
    );

  if (
    Number.isFinite(
      formattingScore
    ) &&
    formattingScore <
      85
  ) {
    items.push({
      priority:
        "Medium",

      title:
        "Improve resume formatting",

      description:
        `Your formatting score is ${formattingScore}%.`,

      action:
        "Keep spacing, typography, headings and bullets consistent.",

      icon:
        "□",
    });
  }

  return items;
}

// ============================================================
// PRIORITY COUNT
// ============================================================

function PriorityCount({
  label,
  count,
  type,
}) {
  const styles = {
    high:
      "border-red-500/10 bg-red-500/[0.05] text-red-300",

    medium:
      "border-amber-500/10 bg-amber-500/[0.05] text-amber-300",

    low:
      "border-slate-500/10 bg-slate-500/[0.05] text-slate-300",
  };

  return (
    <div
      className={`
        rounded-xl
        border
        px-3
        py-2
        ${
          styles[type] ||
          styles.low
        }
      `}
    >
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-wider
        "
      >
        {label}
      </p>

      <p
        className="
          mt-0.5
          text-lg
          font-bold
          text-white
        "
      >
        {count}
      </p>
    </div>
  );
}

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({
  value,
  label,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.05]
        bg-black/10
        p-4
        text-center
      "
    >
      <p
        className="
          text-2xl
          font-black
          text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1.5
          text-[10px]
          text-slate-600
        "
      >
        {label}
      </p>
    </div>
  );
}

// ============================================================
// EXPORT
// ============================================================

export default ResumeUpload;