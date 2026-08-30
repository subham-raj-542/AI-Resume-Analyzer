
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// ============================================================
// COMPONENT
// ============================================================
//
// RESPONSIBILITY:
//
// ✅ View one saved resume
// ✅ Show resume metadata
// ✅ Show ATS analysis
// ✅ View original PDF
// ✅ Download original PDF
// ✅ Edit / replace resume
// ✅ Keep selected resume synced
//
// NOT HERE:
//
// ❌ Job Match
// ❌ Resume Tailoring
// ❌ Resume Builder
//
// Those belong to the unified Home workflow.
// ============================================================

function ResumeDetails() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    resume,
    setResume,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    pdfLoading,
    setPdfLoading,
  ] = useState(false);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    return String(
      localStorage.getItem(
        "token"
      ) || ""
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
          setLoading(true);
          setError("");

          const token =
            getToken();

          if (!token) {
            throw new Error(
              "Please login first."
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
                    `Bearer ${token}`,
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
              "Your login session has expired. Please login again."
            );
          }

          if (
            response.status ===
            404
          ) {
            throw new Error(
              "Resume not found."
            );
          }

          if (
            !response.ok
          ) {
            throw new Error(
              data?.message ||
                "Unable to load resume."
            );
          }

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
          }

          // ----------------------------------------------------
          // Keep this resume active.
          // ----------------------------------------------------

          localStorage.setItem(
            "selectedResumeId",
            id
          );

          localStorage.setItem(
            "resumeId",
            id
          );

          window.dispatchEvent(
            new CustomEvent(
              "resume-selection-changed",
              {
                detail: {
                  resumeId:
                    id,
                  resume:
                    savedResume,
                },
              }
            )
          );
        } catch (
          err
        ) {
          console.error(
            "Resume details error:",
            err
          );

          if (
            mounted
          ) {
            setError(
              err?.message ||
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
      mounted = false;
    };
  }, [id]);

  // ==========================================================
  // SELECT RESUME
  // ==========================================================

  const selectResume =
    () => {
      if (!id) {
        return;
      }

      localStorage.setItem(
        "selectedResumeId",
        id
      );

      localStorage.setItem(
        "resumeId",
        id
      );

      window.dispatchEvent(
        new CustomEvent(
          "resume-selection-changed",
          {
            detail: {
              resumeId:
                id,
              resume,
            },
          }
        )
      );
    };

  // ==========================================================
  // GO TO HISTORY
  // ==========================================================

  const handleBackToHistory =
    () => {
      navigate(
        "/resumes"
      );
    };

  // ==========================================================
  // GO TO EDIT
  // ==========================================================

  const handleEdit =
    () => {
      if (!id) {
        return;
      }

      selectResume();

      navigate(
        `/resumes/${id}/edit`
      );
    };

  // ==========================================================
  // GO TO CUSTOMIZER
  // ==========================================================

  const handleCustomize =
    () => {
      selectResume();

      navigate(
        "/",
        {
          state: {
            scrollTo:
              "customize-resume",
          },
        }
      );

      // --------------------------------------------------------
      // Fallback for browsers/history transitions where the Home
      // component needs the hash to identify the destination.
      // --------------------------------------------------------

      window.setTimeout(() => {
        const element =
          document.getElementById(
            "customize-resume"
          );

        if (element) {
          element.scrollIntoView({
            behavior:
              "smooth",
            block:
              "start",
          });
        }
      }, 120);
    };

  // ==========================================================
  // VIEW ORIGINAL PDF
  // ==========================================================

  const handleViewPDF =
    async () => {
      try {
        setError("");
        setPdfLoading(true);

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Please login first."
          );
        }

        if (!id) {
          throw new Error(
            "Resume ID is missing."
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes/${id}/file`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (!response.ok) {
          if (
            contentType.includes(
              "application/json"
            )
          ) {
            const data =
              await response.json();

            throw new Error(
              data?.message ||
                "Unable to open resume PDF."
            );
          }

          throw new Error(
            `Server returned ${response.status}.`
          );
        }

        const blob =
          await response.blob();

        if (!blob.size) {
          throw new Error(
            "Resume PDF is empty."
          );
        }

        const blobUrl =
          window.URL.createObjectURL(
            blob
          );

        window.open(
          blobUrl,
          "_blank",
          "noopener,noreferrer"
        );

        setTimeout(() => {
          window.URL.revokeObjectURL(
            blobUrl
          );
        }, 60000);
      } catch (
        err
      ) {
        console.error(
          "View PDF error:",
          err
        );

        setError(
          err?.message ||
            "Unable to open resume PDF."
        );
      } finally {
        setPdfLoading(
          false
        );
      }
    };

  // ==========================================================
  // DOWNLOAD ORIGINAL PDF
  // ==========================================================

  const handleDownloadPDF =
    async () => {
      try {
        setError("");
        setPdfLoading(true);

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Please login first."
          );
        }

        if (!id) {
          throw new Error(
            "Resume ID is missing."
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes/${id}/file?download=true`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (!response.ok) {
          if (
            contentType.includes(
              "application/json"
            )
          ) {
            const data =
              await response.json();

            throw new Error(
              data?.message ||
                "Unable to download resume PDF."
            );
          }

          throw new Error(
            `Server returned ${response.status}.`
          );
        }

        const blob =
          await response.blob();

        if (!blob.size) {
          throw new Error(
            "Resume PDF is empty."
          );
        }

        const blobUrl =
          window.URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        const fileName =
          String(
            resume?.originalName ||
              resume?.fileName ||
              "resume.pdf"
          )
            .replace(
              /[<>:"/\\|?*]+/g,
              "-"
            )
            .trim();

        anchor.href =
          blobUrl;

        anchor.download =
          fileName
            .toLowerCase()
            .endsWith(
              ".pdf"
            )
            ? fileName
            : `${fileName}.pdf`;

        document.body.appendChild(
          anchor
        );

        anchor.click();

        anchor.remove();

        setTimeout(() => {
          window.URL.revokeObjectURL(
            blobUrl
          );
        }, 1000);
      } catch (
        err
      ) {
        console.error(
          "Download PDF error:",
          err
        );

        setError(
          err?.message ||
            "Unable to download resume PDF."
        );
      } finally {
        setPdfLoading(
          false
        );
      }
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
  // FORMAT FILE SIZE
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
        return "Unknown size";
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
  // SAFE ARRAY
  // ==========================================================

  const safeArray =
    (value) =>
      Array.isArray(value)
        ? value
        : [];

  // ==========================================================
  // SCORE
  // ==========================================================

  const rawScore =
    Number(
      resume?.atsScore ??
        resume?.analysis?.atsScore ??
        resume?.analysis?.score ??
        0
    );

  const atsScore =
    Number.isFinite(
      rawScore
    )
      ? Math.min(
          100,
          Math.max(
            0,
            rawScore
          )
        )
      : 0;

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
              w-36
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
              mt-3
              h-5
              w-64
              animate-pulse
              rounded
              bg-white/[0.04]
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
  // ERROR STATE
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
            md:p-10
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
              bg-red-500/[0.06]
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
              md:text-3xl
            "
          >
            We couldn't open this resume.
          </h1>

          <p
            className="
              mx-auto
              mt-3
              max-w-lg
              text-sm
              leading-6
              text-slate-500
            "
          >
            {error}
          </p>

          <button
            type="button"
            onClick={
              handleBackToHistory
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

  if (!resume) {
    return null;
  }

  // ==========================================================
  // ANALYSIS DATA
  // ==========================================================

  const analysis =
    resume?.analysis || {};

  const metrics =
    analysis?.metrics || {};

  const categoryScores =
    analysis?.categoryScores || {};

  const strengths =
    safeArray(
      analysis?.strengths
    );

  const weaknesses =
    safeArray(
      analysis?.weaknesses
    );

  const suggestions =
    safeArray(
      analysis?.suggestions
    );

  const detectedSkills =
    safeArray(
      analysis?.skills
    );

  const missingSections =
    safeArray(
      analysis?.missingSections
    );

  const grade =
    resume?.grade ||
    analysis?.grade ||
    getGrade(
      atsScore
    );

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
          BACKGROUND
      ======================================================= */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -top-32
            right-[-120px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-indigo-500/[0.05]
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            bottom-[-180px]
            left-[-100px]
            h-[350px]
            w-[350px]
            rounded-full
            bg-violet-500/[0.04]
            blur-[130px]
          "
        />
      </div>

      {/* ======================================================
          HEADER
      ======================================================= */}

      <header
        className="
          relative
          z-10
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
            max-w-7xl
            py-8
          "
        >
          {/* BACK */}

          <button
            type="button"
            onClick={
              handleBackToHistory
            }
            className="
              text-xs
              font-medium
              text-slate-500
              transition
              hover:text-white
            "
          >
            ← Back to Resume History
          </button>

          {/* HEADER CONTENT */}

          <div
            className="
              mt-6
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div
              className="
                min-w-0
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    rounded-full
                    border
                    border-cyan-400/10
                    bg-cyan-500/[0.05]
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-cyan-300
                  "
                >
                  Resume Details
                </span>

                <span
                  className="
                    rounded-full
                    border
                    border-white/[0.06]
                    bg-white/[0.02]
                    px-3
                    py-1.5
                    text-[10px]
                    text-slate-600
                  "
                >
                  Saved Resume
                </span>
              </div>

              <h1
                className="
                  mt-4
                  max-w-4xl
                  break-words
                  text-3xl
                  font-bold
                  tracking-[-0.03em]
                  text-white
                  md:text-5xl
                "
              >
                {resume?.originalName ||
                  resume?.fileName ||
                  "Saved Resume"}
              </h1>

              <p
                className="
                  mt-3
                  text-sm
                  text-slate-600
                "
              >
                Uploaded{" "}
                {formatDate(
                  resume?.createdAt
                )}
              </p>
            </div>

            {/* ACTIONS */}

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >
              <button
                type="button"
                onClick={
                  handleViewPDF
                }
                disabled={
                  pdfLoading
                }
                className="
                  rounded-xl
                  border
                  border-indigo-400/10
                  bg-indigo-500/[0.07]
                  px-4
                  py-3
                  text-xs
                  font-semibold
                  text-indigo-200
                  transition
                  hover:bg-indigo-500/[0.12]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {pdfLoading
                  ? "Opening..."
                  : "View PDF"}
              </button>

              <button
                type="button"
                onClick={
                  handleDownloadPDF
                }
                disabled={
                  pdfLoading
                }
                className="
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  px-4
                  py-3
                  text-xs
                  font-semibold
                  text-slate-300
                  transition
                  hover:bg-white/[0.05]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {pdfLoading
                  ? "Processing..."
                  : "Download PDF"}
              </button>

              <button
                type="button"
                onClick={
                  handleEdit
                }
                className="
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  px-4
                  py-3
                  text-xs
                  font-semibold
                  text-slate-300
                  transition
                  hover:bg-white/[0.05]
                "
              >
                Edit / Replace
              </button>

              <button
                type="button"
                onClick={
                  handleCustomize
                }
                className="
                  rounded-xl
                  bg-white
                  px-4
                  py-3
                  text-xs
                  font-bold
                  text-slate-950
                  transition
                  hover:bg-slate-100
                "
              >
                Customize →
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main
        className="
          relative
          z-10
          mx-auto
          w-[92%]
          max-w-7xl
          py-8
          pb-20
        "
      >
        {/* ERROR */}

        {error && (
          <div
            className="
              mb-5
              rounded-2xl
              border
              border-red-500/10
              bg-red-500/[0.04]
              px-4
              py-3
              text-sm
              text-red-300
            "
          >
            ⚠️ {error}
          </div>
        )}

        {/* ====================================================
            FILE OVERVIEW
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
              gap-6
              lg:flex-row
              lg:items-center
              lg:justify-between
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

              <div
                className="
                  min-w-0
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
                  Original file
                </p>

                <h2
                  className="
                    mt-1
                    truncate
                    text-base
                    font-semibold
                    text-white
                  "
                >
                  {resume?.originalName ||
                    resume?.fileName ||
                    "Resume PDF"}
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  {formatFileSize(
                    resume?.fileSize
                  )}{" "}
                  •{" "}
                  {resume?.mimetype ||
                    "application/pdf"}
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  rounded-full
                  border
                  border-emerald-500/10
                  bg-emerald-500/[0.05]
                  px-3
                  py-1.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-emerald-300
                "
              >
                {resume?.status ||
                  "Uploaded"}
              </span>

              <span
                className="
                  rounded-full
                  border
                  border-cyan-400/10
                  bg-cyan-500/[0.05]
                  px-3
                  py-1.5
                  text-[10px]
                  font-semibold
                  text-cyan-300
                "
              >
                Active Resume
              </span>
            </div>
          </div>
        </section>

        {/* ====================================================
            SCORE GRID
        ==================================================== */}

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-4
            md:grid-cols-3
          "
        >
          <div
            className="
              rounded-[26px]
              border
              border-indigo-500/10
              bg-indigo-500/[0.025]
              p-6
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
              ATS Score
            </p>

            <div
              className="
                mt-3
                flex
                items-end
                justify-between
                gap-4
              "
            >
              <p
                className="
                  text-5xl
                  font-black
                  tracking-tight
                  text-indigo-300
                "
              >
                {atsScore}
              </p>

              <div
                className="
                  text-right
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-widest
                    text-slate-700
                  "
                >
                  Grade
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  {grade}
                </p>
              </div>
            </div>

            <div
              className="
                mt-5
                h-2
                overflow-hidden
                rounded-full
                bg-white/[0.05]
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-indigo-400
                "
                style={{
                  width:
                    `${atsScore}%`,
                }}
              />
            </div>
          </div>

          <div
            className="
              rounded-[26px]
              border
              border-white/[0.07]
              bg-white/[0.02]
              p-6
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
              Resume metrics
            </p>

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >
              <SmallMetric
                label="Skills"
                value={
                  metrics?.skills ||
                  detectedSkills.length ||
                  0
                }
              />

              <SmallMetric
                label="Bullets"
                value={
                  metrics?.bulletPoints ||
                  0
                }
              />

              <SmallMetric
                label="Action verbs"
                value={
                  metrics?.actionVerbs ||
                  0
                }
              />

              <SmallMetric
                label="Achievements"
                value={
                  metrics?.quantifiedAchievements ||
                  0
                }
              />
            </div>
          </div>

          <div
            className="
              rounded-[26px]
              border
              border-white/[0.07]
              bg-white/[0.02]
              p-6
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
              File information
            </p>

            <div
              className="
                mt-5
                space-y-3
              "
            >
              <InfoRow
                label="Created"
                value={
                  formatDate(
                    resume?.createdAt
                  )
                }
              />

              <InfoRow
                label="Updated"
                value={
                  formatDate(
                    resume?.updatedAt
                  )
                }
              />

              <InfoRow
                label="Size"
                value={
                  formatFileSize(
                    resume?.fileSize
                  )
                }
              />

              <InfoRow
                label="Format"
                value="PDF"
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            RECOMMENDATION
        ==================================================== */}

        {analysis?.overallRecommendation && (
          <section
            className="
              mt-5
              rounded-[26px]
              border
              border-violet-500/10
              bg-violet-500/[0.025]
              p-6
              md:p-7
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-violet-300
              "
            >
              AI Recommendation
            </p>

            <p
              className="
                mt-3
                max-w-4xl
                text-sm
                leading-7
                text-slate-400
                md:text-base
              "
            >
              {
                analysis.overallRecommendation
              }
            </p>
          </section>
        )}

        {/* ====================================================
            CATEGORY SCORES
        ==================================================== */}

        <section
          className="
            mt-5
            rounded-[28px]
            border
            border-white/[0.07]
            bg-white/[0.02]
            p-5
            md:p-7
          "
        >
          <SectionTitle
            eyebrow="Analysis"
            title="Score breakdown"
            description="See how different parts of the resume performed."
          />

          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-3
              md:grid-cols-2
            "
          >
            {Object.entries(
              categoryScores
            )
              .filter(
                ([, value]) =>
                  Number.isFinite(
                    Number(value)
                  )
              )
              .map(
                (
                  [key, value]
                ) => (
                  <ScoreRow
                    key={
                      key
                    }
                    title={
                      formatLabel(
                        key
                      )
                    }
                    score={
                      Number(value)
                    }
                  />
                )
              )}
          </div>
        </section>

        {/* ====================================================
            STRENGTHS + WEAKNESSES
        ==================================================== */}

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-2
          "
        >
          <AnalysisList
            title="Strengths"
            description="Things your resume is doing well."
            items={
              strengths
            }
            tone="success"
          />

          <AnalysisList
            title="Areas to improve"
            description="Issues that can reduce resume effectiveness."
            items={
              weaknesses
            }
            tone="warning"
          />
        </div>

        {/* ====================================================
            RECOMMENDATIONS
        ==================================================== */}

        <AnalysisList
          title="Recommendations"
          description="Practical suggestions generated by the analyzer."
          items={
            suggestions
          }
          tone="info"
        />

        {/* ====================================================
            SKILLS
        ==================================================== */}

        <section
          className="
            mt-5
            rounded-[28px]
            border
            border-white/[0.07]
            bg-white/[0.02]
            p-5
            md:p-7
          "
        >
          <SectionTitle
            eyebrow="Skills"
            title="Detected skills"
            description="Skills found in the uploaded resume."
          />

          {detectedSkills.length >
          0 ? (
            <div
              className="
                mt-5
                flex
                flex-wrap
                gap-2
              "
            >
              {detectedSkills.map(
                (
                  skill,
                  index
                ) => {
                  const value =
                    typeof skill ===
                    "string"
                      ? skill
                      : skill?.name ||
                        skill?.skill ||
                        skill?.title ||
                        "";

                  if (!value) {
                    return null;
                  }

                  return (
                    <span
                      key={`${value}-${index}`}
                      className="
                        rounded-xl
                        border
                        border-indigo-400/10
                        bg-indigo-500/[0.06]
                        px-3
                        py-2
                        text-xs
                        text-indigo-200
                      "
                    >
                      {
                        value
                      }
                    </span>
                  );
                }
              )}
            </div>
          ) : (
            <p
              className="
                mt-4
                text-sm
                text-slate-600
              "
            >
              No identifiable skills were
              detected.
            </p>
          )}
        </section>

        {/* ====================================================
            MISSING SECTIONS
        ==================================================== */}

        {missingSections.length >
          0 && (
          <section
            className="
              mt-5
              rounded-[28px]
              border
              border-amber-500/10
              bg-amber-500/[0.025]
              p-5
              md:p-7
            "
          >
            <SectionTitle
              eyebrow="Resume Structure"
              title="Potentially missing sections"
              description="Consider adding only sections that genuinely apply to your background."
            />

            <div
              className="
                mt-5
                flex
                flex-wrap
                gap-2
              "
            >
              {missingSections.map(
                (
                  section,
                  index
                ) => (
                  <span
                    key={`${section}-${index}`}
                    className="
                      rounded-xl
                      border
                      border-amber-500/10
                      bg-amber-500/[0.05]
                      px-3
                      py-2
                      text-xs
                      text-amber-300
                    "
                  >
                    {formatLabel(
                      section
                    )}
                  </span>
                )
              )}
            </div>
          </section>
        )}

        {/* ====================================================
            EXTRACTED TEXT
        ==================================================== */}

        {resume?.resumeText && (
          <details
            className="
              mt-5
              overflow-hidden
              rounded-[28px]
              border
              border-white/[0.07]
              bg-white/[0.02]
            "
          >
            <summary
              className="
                cursor-pointer
                px-5
                py-5
                text-sm
                font-semibold
                text-slate-300
                md:px-7
              "
            >
              View extracted resume text
            </summary>

            <div
              className="
                border-t
                border-white/[0.06]
                px-5
                py-5
                md:px-7
              "
            >
              <pre
                className="
                  whitespace-pre-wrap
                  break-words
                  font-sans
                  text-xs
                  leading-6
                  text-slate-500
                  md:text-sm
                "
              >
                {
                  resume.resumeText
                }
              </pre>
            </div>
          </details>
        )}

        {/* ====================================================
            FINAL ACTION
        ==================================================== */}

        <section
          className="
            mt-6
            rounded-[28px]
            border
            border-violet-500/10
            bg-gradient-to-r
            from-violet-500/[0.055]
            to-indigo-500/[0.025]
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
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-violet-300
                "
              >
                Next step
              </p>

              <h3
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-white
                "
              >
                Ready to target a job?
              </h3>

              <p
                className="
                  mt-1.5
                  max-w-2xl
                  text-xs
                  leading-6
                  text-slate-600
                  md:text-sm
                "
              >
                Go to Job Match first to understand
                your fit, then use Customize Your
                Resume for a job-focused version.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleCustomize
              }
              className="
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
              Customize Resume →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  eyebrow,
  title,
  description,
}) {
  return (
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
        {eyebrow}
      </p>

      <h2
        className="
          mt-2
          text-xl
          font-bold
          tracking-tight
          text-white
          md:text-2xl
        "
      >
        {title}
      </h2>

      {description && (
        <p
          className="
            mt-2
            max-w-2xl
            text-xs
            leading-6
            text-slate-600
            md:text-sm
          "
        >
          {description}
        </p>
      )}
    </div>
  );
}

// ============================================================
// SCORE ROW
// ============================================================

function ScoreRow({
  title,
  score,
}) {
  const safeScore =
    Math.min(
      100,
      Math.max(
        0,
        Number(score) || 0
      )
    );

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
          justify-between
          gap-4
        "
      >
        <span
          className="
            text-sm
            text-slate-400
          "
        >
          {title}
        </span>

        <span
          className="
            text-sm
            font-bold
            text-white
          "
        >
          {safeScore}%
        </span>
      </div>

      <div
        className="
          mt-3
          h-1.5
          overflow-hidden
          rounded-full
          bg-white/[0.05]
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-indigo-400
          "
          style={{
            width:
              `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// SMALL METRIC
// ============================================================

function SmallMetric({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.05]
        bg-black/10
        p-3
      "
    >
      <p
        className="
          text-lg
          font-bold
          text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
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
// INFO ROW
// ============================================================

function InfoRow({
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <span
        className="
          text-xs
          text-slate-600
        "
      >
        {label}
      </span>

      <span
        className="
          text-right
          text-xs
          text-slate-300
        "
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// ANALYSIS LIST
// ============================================================

function AnalysisList({
  title,
  description,
  items = [],
  tone = "info",
}) {
  const styles = {
    success: {
      border:
        "border-emerald-500/10",
      bg:
        "bg-emerald-500/[0.02]",
      title:
        "text-emerald-300",
      icon:
        "text-emerald-300",
      symbol:
        "✓",
    },

    warning: {
      border:
        "border-amber-500/10",
      bg:
        "bg-amber-500/[0.02]",
      title:
        "text-amber-300",
      icon:
        "text-amber-300",
      symbol:
        "!",
    },

    info: {
      border:
        "border-indigo-500/10",
      bg:
        "bg-indigo-500/[0.02]",
      title:
        "text-indigo-300",
      icon:
        "text-indigo-300",
      symbol:
        "→",
    },
  };

  const style =
    styles[tone] ||
    styles.info;

  const normalizedItems =
    Array.isArray(items)
      ? items
          .map(
            (item) =>
              typeof item ===
              "string"
                ? item
                : item?.message ||
                  item?.suggestion ||
                  item?.text ||
                  item?.description ||
                  ""
          )
          .filter(
            Boolean
          )
      : [];

  return (
    <section
      className={`
        mt-5
        rounded-[28px]
        border
        ${style.border}
        ${style.bg}
        p-5
        md:p-7
      `}
    >
      <h2
        className={`
          text-xl
          font-bold
          ${style.title}
          md:text-2xl
        `}
      >
        {title}
      </h2>

      {description && (
        <p
          className="
            mt-2
            text-xs
            leading-6
            text-slate-600
            md:text-sm
          "
        >
          {description}
        </p>
      )}

      {normalizedItems.length >
      0 ? (
        <div
          className="
            mt-5
            space-y-2
          "
        >
          {normalizedItems
            .slice(0, 12)
            .map(
              (
                item,
                index
              ) => (
                <div
                  key={`${item}-${index}`}
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-white/[0.05]
                    bg-black/10
                    p-3.5
                  "
                >
                  <span
                    className={`
                      pt-0.5
                      text-xs
                      font-bold
                      ${style.icon}
                    `}
                  >
                    {
                      style.symbol
                    }
                  </span>

                  <p
                    className="
                      text-sm
                      leading-6
                      text-slate-400
                    "
                  >
                    {item}
                  </p>
                </div>
              )
            )}
        </div>
      ) : (
        <p
          className="
            mt-4
            text-sm
            text-slate-600
          "
        >
          Nothing available.
        </p>
      )}
    </section>
  );
}

// ============================================================
// SCORE → GRADE
// ============================================================

function getGrade(
  score
) {
  if (
    score >= 90
  ) {
    return "A+";
  }

  if (
    score >= 80
  ) {
    return "A";
  }

  if (
    score >= 70
  ) {
    return "B";
  }

  if (
    score >= 60
  ) {
    return "C";
  }

  if (
    score >= 50
  ) {
    return "D";
  }

  return "Needs Work";
}

// ============================================================
// FORMAT LABEL
// ============================================================

function formatLabel(
  value
) {
  return String(
    value || ""
  )
    .replace(
      /([A-Z])/g,
      " $1"
    )
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .replace(
      /^./,
      (character) =>
        character.toUpperCase()
    );
}

export default ResumeDetails;

