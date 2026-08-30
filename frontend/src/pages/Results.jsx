import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const Results = () => {
  const location = useLocation();

  const [result, setResult] = useState(
    location.state?.result || null
  );

  // ============================================================
  // LOAD RESULT
  // ============================================================

  useEffect(() => {
    if (location.state?.result) {
      setResult(
        location.state.result
      );

      try {
        localStorage.setItem(
          "resumeAnalysis",
          JSON.stringify({
            result:
              location.state.result,
            savedAt:
              new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error(
          "Unable to save resume analysis:",
          error
        );
      }

      return;
    }

    try {
      const saved =
        localStorage.getItem(
          "resumeAnalysis"
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        setResult(
          parsed?.result ||
            parsed ||
            null
        );
      }
    } catch (error) {
      console.error(
        "Unable to load saved resume analysis:",
        error
      );
    }
  }, [location.state]);

  // ============================================================
  // SAFE DATA
  // ============================================================

  const atsScore =
    Number(
      result?.atsScore ??
        result?.score ??
        0
    );

  const categoryScores =
    result?.categoryScores ||
    {};

  const strengths =
    Array.isArray(
      result?.strengths
    )
      ? result.strengths
      : [];

  const weaknesses =
    Array.isArray(
      result?.weaknesses
    )
      ? result.weaknesses
      : [];

  const suggestions =
    Array.isArray(
      result?.suggestions
    )
      ? result.suggestions
      : [];

  const resumeName =
    result?.name ||
    result?.structuredResume?.name ||
    "Resume";

  const quantifiedAchievements =
    Number(
      result?.metrics
        ?.quantifiedAchievements ??
        0
    );

  const actionVerbs =
    Number(
      result?.metrics?.actionVerbs ??
        0
    );

  const resumeWords =
    Number(
      result?.metrics?.resumeWords ??
        0
    );

  const duplicateSkills =
    Number(
      result?.metrics?.duplicateSkills ??
        0
    );

  // ============================================================
  // SCORE STATUS
  // ============================================================

  const scoreStatus =
    useMemo(() => {
      if (atsScore >= 85) {
        return {
          label: "Excellent",
          color:
            "text-emerald-400",
          ring:
            "border-emerald-500",
        };
      }

      if (atsScore >= 70) {
        return {
          label: "Very Good",
          color:
            "text-green-400",
          ring:
            "border-green-500",
        };
      }

      if (atsScore >= 50) {
        return {
          label: "Needs Improvement",
          color:
            "text-yellow-400",
          ring:
            "border-yellow-500",
        };
      }

      return {
        label: "Needs Work",
        color:
          "text-red-400",
        ring:
          "border-red-500",
      };
    }, [atsScore]);

  // ============================================================
  // SCORE BREAKDOWN
  // ============================================================

  const breakdown = [
    {
      label:
        "Contact Information",
      value:
        Number(
          categoryScores
            ?.contactInformation ??
            0
        ),
    },
    {
      label:
        "Action Verbs",
      value:
        Number(
          categoryScores
            ?.actionVerbs ??
            0
        ),
    },
    {
      label:
        "Quantified Achievements",
      value:
        Number(
          categoryScores
            ?.quantifiedAchievements ??
            0
        ),
    },
    {
      label:
        "Skills",
      value:
        Number(
          categoryScores
            ?.skills ??
            0
        ),
    },
    {
      label:
        "Content Quality",
      value:
        Number(
          categoryScores
            ?.contentQuality ??
            0
        ),
    },
    {
      label:
        "Formatting",
      value:
        Number(
          categoryScores
            ?.formatting ??
            result?.formattingQuality
              ?.score ??
            0
        ),
    },
  ];

  // ============================================================
  // SAVE
  // ============================================================

  if (!result) {
    return (
      <div
        className="
          min-h-screen
          bg-[#070b14]
          text-white
          flex
          items-center
          justify-center
          px-6
        "
      >
        <div
          className="
            max-w-lg
            w-full
            text-center
            bg-[#0f172a]
            border
            border-white/10
            rounded-3xl
            p-10
          "
        >
          <div className="text-5xl mb-5">
            📄
          </div>

          <h1
            className="
              text-2xl
              font-bold
            "
          >
            No Analysis Found
          </h1>

          <p
            className="
              mt-3
              text-slate-400
              leading-7
            "
          >
            Analyze a resume first to
            view your ATS results.
          </p>

          <Link
            to="/analyzer"
            className="
              inline-flex
              mt-7
              px-7
              py-3.5
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-500
              transition
              font-semibold
            "
          >
            Analyze Resume →
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#070b14]
        text-white
      "
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-white/10
          bg-[#070b14]/90
          backdrop-blur-xl
        "
      >
        <div
          className="
            w-[90%]
            lg:w-[80%]
            max-w-7xl
            mx-auto
            h-20
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <Link
            to="/"
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-indigo-600
                flex
                items-center
                justify-center
                font-bold
                shadow-lg
                shadow-indigo-600/20
              "
            >
              AI
            </div>

            <div>
              <h1
                className="
                  font-bold
                  text-lg
                "
              >
                Resume
                <span className="text-indigo-400">
                  AI
                </span>
              </h1>

              <p
                className="
                  text-[10px]
                  text-slate-500
                "
              >
                Smart Career Assistant
              </p>
            </div>
          </Link>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <Link
              to="/dashboard"
              className="
                hidden
                sm:inline-flex
                px-5
                py-2.5
                rounded-xl
                border
                border-white/10
                bg-white/5
                hover:bg-white/10
                transition
                text-sm
                font-medium
              "
            >
              Dashboard
            </Link>

            <Link
              to="/analyzer"
              className="
                px-5
                py-2.5
                rounded-xl
                bg-indigo-600
                hover:bg-indigo-500
                transition
                text-sm
                font-semibold
              "
            >
              New Analysis
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main
        className="
          w-[90%]
          lg:w-[80%]
          max-w-7xl
          mx-auto
          py-12
          md:py-16
        "
      >
        {/* ======================================================
            TITLE
        ====================================================== */}

        <section className="mb-10">
          <p
            className="
              text-indigo-400
              text-sm
              font-semibold
            "
          >
            ✓ Resume Analysis Complete
          </p>

          <h1
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-bold
              mt-2
              tracking-tight
            "
          >
            Your Resume Results
          </h1>

          <p
            className="
              text-slate-400
              mt-4
              max-w-2xl
              leading-7
            "
          >
            Here's how{" "}
            <span className="text-slate-200">
              {resumeName}
            </span>{" "}
            performs against ATS
            screening criteria.
          </p>
        </section>

        {/* ======================================================
            SCORE AREA
        ====================================================== */}

        <section
          className="
            grid
            lg:grid-cols-3
            gap-6
          "
        >
          {/* Overall score */}

          <div
            className="
              bg-[#0f172a]
              border
              border-white/10
              rounded-3xl
              p-8
              sm:p-10
              text-center
            "
          >
            <p
              className="
                text-slate-400
                text-sm
              "
            >
              Overall ATS Score
            </p>

            <div
              className={`
                w-44
                h-44
                mx-auto
                my-8
                rounded-full
                border-[12px]
                ${scoreStatus.ring}
                flex
                items-center
                justify-center
                bg-[#0b1120]
              `}
            >
              <div>
                <span
                  className="
                    text-5xl
                    font-bold
                  "
                >
                  {atsScore}
                </span>

                <span
                  className="
                    text-slate-500
                    text-lg
                  "
                >
                  /100
                </span>
              </div>
            </div>

            <p
              className={`
                font-semibold
                ${scoreStatus.color}
              `}
            >
              {scoreStatus.label}
            </p>

            <p
              className="
                text-slate-500
                text-sm
                mt-2
                leading-6
              "
            >
              {result.overallRecommendation ||
                "Your resume has been evaluated across multiple ATS criteria."}
            </p>
          </div>

          {/* Breakdown */}

          <div
            className="
              lg:col-span-2
              bg-[#0f172a]
              border
              border-white/10
              rounded-3xl
              p-7
              sm:p-10
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                mb-8
              "
            >
              <div>
                <h2
                  className="
                    text-2xl
                    font-bold
                  "
                >
                  Score Breakdown
                </h2>

                <p
                  className="
                    text-slate-500
                    text-sm
                    mt-1
                  "
                >
                  Detailed resume performance
                </p>
              </div>

              <span
                className="
                  hidden
                  sm:inline-flex
                  px-3
                  py-1.5
                  rounded-full
                  bg-indigo-500/10
                  border
                  border-indigo-500/20
                  text-indigo-400
                  text-xs
                "
              >
                ATS Analysis
              </span>
            </div>

            <div className="space-y-6">
              {breakdown.map(
                (
                  item,
                  index
                ) => (
                  <ScoreBar
                    key={`${item.label}-${index}`}
                    label={
                      item.label
                    }
                    value={
                      item.value
                    }
                  />
                )
              )}
            </div>
          </div>
        </section>

        {/* ======================================================
            METRICS
        ====================================================== */}

        <section
          className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-4
            mt-6
          "
        >
          <MetricCard
            value={
              quantifiedAchievements
            }
            label="Quantified Achievements"
            color="text-emerald-400"
          />

          <MetricCard
            value={
              actionVerbs
            }
            label="Action Verbs"
            color="text-indigo-400"
          />

          <MetricCard
            value={
              resumeWords
            }
            label="Resume Words"
            color="text-cyan-400"
          />

          <MetricCard
            value={
              duplicateSkills
            }
            label="Duplicate Skills"
            color="text-yellow-400"
          />
        </section>

        {/* ======================================================
            STRENGTHS / IMPROVEMENTS
        ====================================================== */}

        <section
          className="
            grid
            md:grid-cols-2
            gap-6
            mt-6
          "
        >
          <ResultCard
            title="Strengths"
            icon="✅"
            description="What your resume is already doing well."
          >
            {strengths.length > 0 ? (
              <div className="space-y-3">
                {strengths.map(
                  (
                    item,
                    index
                  ) => (
                    <Bullet
                      key={`${item}-${index}`}
                      text={item}
                      type="success"
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyText>
                No strengths available.
              </EmptyText>
            )}
          </ResultCard>

          <ResultCard
            title="Improvements"
            icon="⚠️"
            description="What you should improve next."
          >
            {[
              ...weaknesses,
              ...suggestions,
            ].length > 0 ? (
              <div className="space-y-3">
                {[
                  ...weaknesses,
                  ...suggestions,
                ]
                  .slice(0, 8)
                  .map(
                    (
                      item,
                      index
                    ) => (
                      <Bullet
                        key={`${item}-${index}`}
                        text={item}
                        type="warning"
                      />
                    )
                  )}
              </div>
            ) : (
              <EmptyText>
                No improvement suggestions
                available.
              </EmptyText>
            )}
          </ResultCard>
        </section>

        {/* ======================================================
            RECOMMENDATION
        ====================================================== */}

        <section className="mt-6">
          <div
            className="
              rounded-3xl
              border
              border-indigo-500/20
              bg-indigo-500/[0.05]
              p-7
              sm:p-9
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
                  w-12
                  h-12
                  shrink-0
                  rounded-2xl
                  bg-indigo-500/10
                  flex
                  items-center
                  justify-center
                  text-xl
                "
              >
                💡
              </div>

              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                  "
                >
                  Overall Recommendation
                </h2>

                <p
                  className="
                    text-slate-400
                    leading-7
                    mt-2
                  "
                >
                  {result.overallRecommendation ||
                    "Focus on strengthening the areas with the lowest scores and keep your strongest measurable achievements prominent."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            ACTIONS
        ====================================================== */}

        <section
          className="
            flex
            flex-col
            sm:flex-row
            flex-wrap
            justify-center
            gap-4
            mt-10
          "
        >
          <Link
            to="/analyzer"
            className="
              inline-flex
              items-center
              justify-center
              px-7
              py-4
              rounded-2xl
              bg-indigo-600
              hover:bg-indigo-500
              transition
              font-semibold
            "
          >
            Analyze Another Resume →
          </Link>

          <Link
            to="/dashboard"
            className="
              inline-flex
              items-center
              justify-center
              px-7
              py-4
              rounded-2xl
              border
              border-white/10
              bg-white/5
              hover:bg-white/10
              transition
              font-semibold
            "
          >
            View Dashboard
          </Link>
        </section>
      </main>
    </div>
  );
};


// ============================================================
// SCORE BAR
// ============================================================

function ScoreBar({
  label,
  value,
}) {
  const safeValue =
    Math.min(
      Math.max(
        Number(value) || 0,
        0
      ),
      100
    );

  let barColor =
    "bg-indigo-500";

  if (safeValue >= 85) {
    barColor =
      "bg-emerald-500";
  } else if (
    safeValue >= 70
  ) {
    barColor =
      "bg-green-500";
  } else if (
    safeValue >= 50
  ) {
    barColor =
      "bg-yellow-500";
  } else {
    barColor =
      "bg-red-500";
  }

  return (
    <div>
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          mb-2
        "
      >
        <span
          className="
            text-sm
            text-slate-300
          "
        >
          {label}
        </span>

        <span
          className="
            text-sm
            font-semibold
            text-white
          "
        >
          {safeValue}%
        </span>
      </div>

      <div
        className="
          h-2
          rounded-full
          bg-slate-800
          overflow-hidden
        "
      >
        <div
          className={`
            h-full
            rounded-full
            transition-all
            duration-700
            ${barColor}
          `}
          style={{
            width:
              `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
};


// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({
  value,
  label,
  color,
}) {
  return (
    <div
      className="
        bg-[#0f172a]
        border
        border-white/10
        rounded-2xl
        p-5
        text-center
      "
    >
      <p
        className={`
          text-2xl
          font-bold
          ${color}
        `}
      >
        {value}
      </p>

      <p
        className="
          text-xs
          text-slate-500
          mt-2
          leading-5
        "
      >
        {label}
      </p>
    </div>
  );
};


// ============================================================
// RESULT CARD
// ============================================================

function ResultCard({
  title,
  icon,
  description,
  children,
}) {
  return (
    <div
      className="
        bg-[#0f172a]
        border
        border-white/10
        rounded-3xl
        p-7
        sm:p-8
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
          mb-6
        "
      >
        <div
          className="
            w-10
            h-10
            rounded-xl
            bg-white/5
            flex
            items-center
            justify-center
          "
        >
          {icon}
        </div>

        <div>
          <h2
            className="
              text-xl
              font-bold
            "
          >
            {title}
          </h2>

          <p
            className="
              text-xs
              text-slate-500
              mt-1
            "
          >
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
};


// ============================================================
// BULLET
// ============================================================

function Bullet({
  text,
  type,
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-xl
        border
        border-white/5
        bg-[#0b1120]
        p-4
      "
    >
      <span
        className={
          type === "warning"
            ? "text-yellow-400 mt-0.5"
            : "text-emerald-400 mt-0.5"
        }
      >
        {type === "warning"
          ? "→"
          : "✓"}
      </span>

      <p
        className="
          text-sm
          text-slate-300
          leading-6
        "
      >
        {text}
      </p>
    </div>
  );
};


// ============================================================
// EMPTY
// ============================================================

function EmptyText({
  children,
}) {
  return (
    <p
      className="
        text-sm
        text-slate-500
        leading-6
      "
    >
      {children}
    </p>
  );
};


export default Results;