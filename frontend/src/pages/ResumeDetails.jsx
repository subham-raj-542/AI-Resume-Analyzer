
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import API_BASE_URL from "../api/apiConfig";

// ============================================================
// COMPONENT
// ============================================================

function ResumeDetail() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    token,
    isAuthenticated,
  } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

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

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    const contextToken =
      String(
        token || ""
      ).trim();

    if (
      contextToken
    ) {
      return contextToken;
    }

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
  // FETCH RESUME
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
          // AUTH
          // --------------------------------------------------

          const authToken =
            getToken();

          if (
            !authToken ||
            !isAuthenticated
          ) {
            throw new Error(
              "Please login to view this resume."
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
          // REQUEST
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
          // RESPONSE TYPE
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
                "Resume details JSON parse error:",
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
              "Resume details non-JSON response:",
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
          // API ERROR
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

          if (
            !response.ok ||
            data?.success ===
              false
          ) {
            throw new Error(
              data?.message ||
                "Unable to load this resume."
            );
          }

          // --------------------------------------------------
          // RESOLVE RESUME
          // --------------------------------------------------

          const resumeData =
            data?.resume ||
            data?.data?.resume ||
            data?.data ||
            null;

          if (
            !resumeData
          ) {
            throw new Error(
              "Resume data was not returned by the server."
            );
          }

          if (
            mounted
          ) {
            setResume(
              resumeData
            );

            // ------------------------------------------------
            // KEEP THIS RESUME SELECTED
            // ------------------------------------------------

            const selectedId =
              String(
                resumeData._id ||
                  resumeData.id ||
                  id
              ).trim();

            if (
              selectedId
            ) {
              localStorage.setItem(
                "selectedResumeId",
                selectedId
              );

              localStorage.setItem(
                "resumeId",
                selectedId
              );

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
                        resumeData,
                    },
                  }
                )
              );
            }
          }
        } catch (
          err
        ) {
          console.error(
            "Resume detail error:",
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
      mounted =
        false;
    };
  }, [
    id,
    token,
    isAuthenticated,
  ]);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const getScore =
    () => {
      const score =
        Number(
          resume?.atsScore ??
            resume?.analysis?.atsScore ??
            resume?.analysis?.score ??
            0
        );

      if (
        !Number.isFinite(
          score
        )
      ) {
        return 0;
      }

      return Math.min(
        100,
        Math.max(
          0,
          Math.round(
            score
          )
        )
      );
    };

  const formatDate =
    (
      value
    ) => {
      if (
        !value
      ) {
        return "Unknown";
      }

      const date =
        new Date(
          value
        );

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
          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric",
        }
      );
    };

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
        return "—";
      }

      if (
        value <
        1024
      ) {
        return `${value} B`;
      }

      if (
        value <
        1024 * 1024
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

  const getArray =
    (
      value
    ) =>
      Array.isArray(
        value
      )
        ? value
        : [];

  const getText =
    (
      value
    ) =>
      String(
        value || ""
      ).trim();

  // ==========================================================
  // ANALYSIS
  // ==========================================================

  const analysis =
    resume?.analysis &&
    typeof resume.analysis ===
      "object"
      ? resume.analysis
      : {};

  const score =
    getScore();

  const grade =
    getText(
      resume?.grade ||
        analysis?.grade
    ) ||
    "—";

  const strengths =
    getArray(
      analysis?.strengths
    );

  const weaknesses =
    getArray(
      analysis?.weaknesses
    );

  const suggestions =
    getArray(
      analysis?.suggestions
    );

  const categoryScores =
    analysis?.categoryScores &&
    typeof analysis.categoryScores ===
      "object"
      ? analysis.categoryScores
      : {};

  const metrics =
    analysis?.metrics &&
    typeof analysis.metrics ===
      "object"
      ? analysis.metrics
      : {};

  // ==========================================================
  // BUTTONS
  // ==========================================================

  const handleTailor =
    () => {
      const resumeId =
        String(
          resume?._id ||
            resume?.id ||
            id
        ).trim();

      if (
        !resumeId
      ) {
        return;
      }

      localStorage.setItem(
        "selectedResumeId",
        resumeId
      );

      localStorage.setItem(
        "resumeId",
        resumeId
      );

      window.dispatchEvent(
        new CustomEvent(
          "resume-selection-changed",
          {
            detail: {
              resumeId,
            },
          }
        )
      );

      navigate(
        "/analyzer",
        {
          state: {
            scrollTo:
              "customize-resume",
          },
        }
      );
    };

  const handleBack =
    () => {
      navigate(
        "/resumes"
      );
    };

  const handleAnalyzer =
    () => {
      navigate(
        "/analyzer"
      );
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
              h-8
              w-56
              rounded-xl
              bg-slate-900
              animate-pulse
            "
          />

          <div
            className="
              mt-6
              h-32
              rounded-3xl
              bg-slate-900
              animate-pulse
            "
          />

          <div
            className="
              mt-6
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-5
            "
          >
            <div
              className="
                h-80
                rounded-3xl
                bg-slate-900
                animate-pulse
              "
            />

            <div
              className="
                lg:col-span-2
                h-80
                rounded-3xl
                bg-slate-900
                animate-pulse
              "
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error
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
              mx-auto
              w-20
              h-20
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

          <div
            className="
              mt-7
              flex
              justify-center
              gap-3
              flex-wrap
            "
          >
            <button
              type="button"
              onClick={
                handleBack
              }
              className="
                px-5
                py-3
                rounded-xl
                border
                border-white/10
                bg-white/5
                hover:bg-white/10
                text-slate-300
                font-medium
                transition
              "
            >
              ← My Resumes
            </button>

            <button
              type="button"
              onClick={
                handleAnalyzer
              }
              className="
                px-5
                py-3
                rounded-xl
                bg-indigo-600
                hover:bg-indigo-500
                text-white
                font-semibold
                transition
              "
            >
              Open Analyzer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN
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
          pb-8
        "
      >
        <div
          className="
            max-w-7xl
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
            ← Back to My Resumes
          </button>

          <div
            className="
              mt-6
              flex
              flex-col
              lg:flex-row
              lg:items-end
              lg:justify-between
              gap-6
            "
          >
            <div
              className="
                min-w-0
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
                Resume Details
              </p>

              <h1
                className="
                  mt-3
                  text-3xl
                  sm:text-4xl
                  font-bold
                  break-words
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
                  text-slate-500
                "
              >
                Uploaded{" "}
                {formatDate(
                  resume?.createdAt
                )}
              </p>
            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >
              <button
                type="button"
                onClick={
                  handleAnalyzer
                }
                className="
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  hover:bg-white/10
                  text-slate-300
                  font-medium
                  transition
                "
              >
                Open Analyzer
              </button>

              <button
                type="button"
                onClick={
                  handleTailor
                }
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-indigo-600
                  hover:bg-indigo-500
                  text-white
                  font-semibold
                  transition
                  shadow-lg
                  shadow-indigo-600/20
                "
              >
                ✨ Tailor This Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAIN CONTENT
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
            max-w-7xl
            mx-auto
            space-y-6
          "
        >
          {/* ==================================================
              OVERVIEW
          =================================================== */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-5
            "
          >
            {/* ATS */}

            <div
              className="
                rounded-3xl
                border
                border-indigo-500/20
                bg-indigo-500/[0.04]
                p-7
              "
            >
              <p
                className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-indigo-400
                  font-semibold
                "
              >
                ATS Score
              </p>

              <div
                className="
                  mt-4
                  flex
                  items-end
                  gap-2
                "
              >
                <span
                  className="
                    text-6xl
                    font-bold
                    text-white
                  "
                >
                  {score}
                </span>

                <span
                  className="
                    mb-2
                    text-slate-500
                  "
                >
                  / 100
                </span>
              </div>

              <div
                className="
                  mt-5
                  h-2
                  rounded-full
                  bg-white/10
                  overflow-hidden
                "
              >
                <div
                  className="
                    h-full
                    rounded-full
                    bg-indigo-500
                  "
                  style={{
                    width:
                      `${score}%`,
                  }}
                />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  text-indigo-300
                  font-medium
                "
              >
                Grade:{" "}
                {grade}
              </p>
            </div>

            {/* FILE INFO */}

            <div
              className="
                rounded-3xl
                border
                border-white/10
                bg-slate-900
                p-7
              "
            >
              <p
                className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-slate-500
                  font-semibold
                "
              >
                File Information
              </p>

              <div
                className="
                  mt-5
                  space-y-4
                "
              >
                <InfoRow
                  label="Original Name"
                  value={
                    resume?.originalName ||
                    "—"
                  }
                />

                <InfoRow
                  label="File Size"
                  value={
                    formatFileSize(
                      resume?.fileSize
                    )
                  }
                />

                <InfoRow
                  label="Status"
                  value={
                    resume?.status ||
                    "uploaded"
                  }
                />

                <InfoRow
                  label="Last Updated"
                  value={
                    formatDate(
                      resume?.updatedAt
                    )
                  }
                />
              </div>
            </div>

            {/* METRICS */}

            <div
              className="
                rounded-3xl
                border
                border-white/10
                bg-slate-900
                p-7
              "
            >
              <p
                className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-slate-500
                  font-semibold
                "
              >
                Resume Metrics
              </p>

              <div
                className="
                  mt-5
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <MiniMetric
                  value={
                    metrics.skills ??
                    0
                  }
                  label="Skills"
                />

                <MiniMetric
                  value={
                    metrics.actionVerbs ??
                    0
                  }
                  label="Action Verbs"
                />

                <MiniMetric
                  value={
                    metrics.bulletPoints ??
                    0
                  }
                  label="Bullets"
                />

                <MiniMetric
                  value={
                    metrics.resumeWords ??
                    0
                  }
                  label="Words"
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              CATEGORY SCORES
          =================================================== */}

          {Object.keys(
            categoryScores
          ).length > 0 && (
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
              <div>
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-widest
                    text-indigo-400
                    font-semibold
                  "
                >
                  ATS Breakdown
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-bold
                  "
                >
                  Category Performance
                </h2>
              </div>

              <div
                className="
                  mt-6
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >
                {Object.entries(
                  categoryScores
                ).map(
                  ([
                    key,
                    value,
                  ]) => {
                    const numericValue =
                      Math.min(
                        100,
                        Math.max(
                          0,
                          Math.round(
                            Number(
                              value
                            ) || 0
                          )
                        )
                      );

                    return (
                      <div
                        key={
                          key
                        }
                      >
                        <div
                          className="
                            flex
                            justify-between
                            gap-4
                            mb-2
                          "
                        >
                          <span
                            className="
                              text-sm
                              text-slate-400
                            "
                          >
                            {formatLabel(
                              key
                            )}
                          </span>

                          <span
                            className="
                              text-sm
                              font-semibold
                              text-white
                            "
                          >
                            {numericValue}%
                          </span>
                        </div>

                        <div
                          className="
                            h-2
                            rounded-full
                            bg-white/10
                            overflow-hidden
                          "
                        >
                          <div
                            className="
                              h-full
                              rounded-full
                              bg-indigo-500
                            "
                            style={{
                              width:
                                `${numericValue}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* ==================================================
              STRENGTHS + WEAKNESSES
          =================================================== */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-5
            "
          >
            <ListCard
              title="Strengths"
              icon="✓"
              items={
                strengths
              }
              tone="success"
              emptyText="No strengths were returned by the analysis."
            />

            <ListCard
              title="Areas To Improve"
              icon="→"
              items={
                weaknesses
              }
              tone="warning"
              emptyText="No major weaknesses were returned."
            />
          </div>

          {/* ==================================================
              SUGGESTIONS
          =================================================== */}

          <ListCard
            title="Smart Suggestions"
            icon="✨"
            items={
              suggestions
            }
            tone="info"
            numbered
            emptyText="No additional suggestions were returned."
          />

          {/* ==================================================
              EXTRACTED TEXT
          =================================================== */}

          {resume?.resumeText && (
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
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-3
                "
              >
                <div>
                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-indigo-400
                      font-semibold
                    "
                  >
                    Extracted Resume Text
                  </p>

                  <h2
                    className="
                      mt-2
                      text-xl
                      font-bold
                    "
                  >
                    Original Resume Content
                  </h2>
                </div>

                <span
                  className="
                    text-xs
                    text-slate-600
                  "
                >
                  {
                    resume.resumeText.length.toLocaleString(
                      "en-IN"
                    )
                  }{" "}
                  characters
                </span>
              </div>

              <div
                className="
                  mt-5
                  max-h-[500px]
                  overflow-y-auto
                  rounded-2xl
                  border
                  border-white/5
                  bg-slate-950
                  p-5
                "
              >
                <pre
                  className="
                    whitespace-pre-wrap
                    break-words
                    font-sans
                    text-sm
                    text-slate-400
                    leading-7
                  "
                >
                  {
                    resume.resumeText
                  }
                </pre>
              </div>
            </section>
          )}
        </div>
      </main>
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
        items-start
        justify-between
        gap-4
        py-2
        border-b
        border-white/5
        last:border-0
      "
    >
      <span
        className="
          text-xs
          text-slate-500
        "
      >
        {label}
      </span>

      <span
        className="
          text-sm
          text-slate-300
          text-right
          break-all
        "
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// MINI METRIC
// ============================================================

function MiniMetric({
  value,
  label,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/5
        bg-slate-950
        p-4
        text-center
      "
    >
      <p
        className="
          text-2xl
          font-bold
          text-indigo-400
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-[11px]
          text-slate-600
        "
      >
        {label}
      </p>
    </div>
  );
}

// ============================================================
// LIST CARD
// ============================================================

function ListCard({
  title,
  icon,
  items = [],
  tone = "info",
  numbered = false,
  emptyText,
}) {
  const toneMap = {
    success:
      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",

    warning:
      "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",

    info:
      "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  };

  const toneClass =
    toneMap[tone] ||
    toneMap.info;

  return (
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
          items-center
          gap-3
        "
      >
        <span
          className="
            w-9
            h-9
            rounded-xl
            bg-indigo-500/10
            border
            border-indigo-500/20
            flex
            items-center
            justify-center
            text-indigo-400
          "
        >
          {icon}
        </span>

        <h2
          className="
            text-xl
            font-bold
            text-white
          "
        >
          {title}
        </h2>
      </div>

      {items.length >
      0 ? (
        <div
          className="
            mt-5
            space-y-3
          "
        >
          {items
            .slice(
              0,
              10
            )
            .map(
              (
                item,
                index
              ) => {
                const text =
                  typeof item ===
                  "string"
                    ? item
                    : item?.text ||
                      item?.message ||
                      item?.suggestion ||
                      item?.description ||
                      "";

                return (
                  <div
                    key={`${text}-${index}`}
                    className="
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      border
                      border-white/5
                      bg-slate-950
                      p-4
                    "
                  >
                    {numbered ? (
                      <span
                        className="
                          w-7
                          h-7
                          shrink-0
                          rounded-lg
                          bg-indigo-500/10
                          border
                          border-indigo-500/20
                          flex
                          items-center
                          justify-center
                          text-xs
                          font-semibold
                          text-indigo-400
                        "
                      >
                        {index + 1}
                      </span>
                    ) : (
                      <span
                        className={`
                          w-7
                          h-7
                          shrink-0
                          rounded-lg
                          border
                          flex
                          items-center
                          justify-center
                          text-sm
                          ${toneClass}
                        `}
                      >
                        {icon}
                      </span>
                    )}

                    <p
                      className="
                        text-sm
                        text-slate-300
                        leading-6
                      "
                    >
                      {text ||
                        "Review this item."}
                    </p>
                  </div>
                );
              }
            )}
        </div>
      ) : (
        <p
          className="
            mt-5
            text-sm
            text-slate-600
          "
        >
          {emptyText}
        </p>
      )}
    </section>
  );
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
      /[_-]/g,
      " "
    )
    .replace(
      /^./,
      (
        character
      ) =>
        character.toUpperCase()
    )
    .trim();
}

// ============================================================
// EXPORT
// ============================================================

export default ResumeDetail;

