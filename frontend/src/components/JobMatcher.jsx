
import { useState } from "react";

import API_BASE_URL from "../api/apiConfig";

// ============================================================
// JOB MATCHER
// ============================================================
//
// RESPONSIBILITY:
//
// ✅ Resume vs Job Description
// ✅ Overall Match Score
// ✅ Skill Match
// ✅ Keyword Match
// ✅ Matched Skills
// ✅ Missing Skills
// ✅ Matched Keywords
// ✅ Missing Keywords
// ✅ Match Summary
//
// NOT HERE:
//
// ❌ Resume Upload
// ❌ Resume Analysis
// ❌ Resume Editing
// ❌ Resume Tailoring
// ❌ PDF Generation
//
// ============================================================

function JobMatcher({
  resumeText = "",
}) {
  const [
    jobDescription,
    setJobDescription,
  ] = useState("");

  const [
    result,
    setResult,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // RESUME READY
  // ==========================================================

  const hasResume =
    Boolean(
      typeof resumeText ===
        "string" &&
      resumeText.trim()
    );

  // ==========================================================
  // JOB DESCRIPTION VALID
  // ==========================================================

  const jobDescriptionLength =
    jobDescription.trim().length;

  const isJobDescriptionValid =
    jobDescriptionLength >= 20;

  // ==========================================================
  // NORMALIZE SCORE
  // ==========================================================

  const normalizeScore = (
    value
  ) => {
    const numericValue =
      Number(
        value
      );

    if (
      !Number.isFinite(
        numericValue
      )
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          numericValue
        )
      )
    );
  };

  // ==========================================================
  // HANDLE MATCH
  // ==========================================================

  const handleMatch =
    async () => {
      setError("");

      // ------------------------------------------------------
      // RESUME
      // ------------------------------------------------------

      if (
        !hasResume
      ) {
        setError(
          "Please upload and analyze your resume before checking a job match."
        );

        return;
      }

      // ------------------------------------------------------
      // JOB DESCRIPTION
      // ------------------------------------------------------

      const jd =
        jobDescription.trim();

      if (
        !jd
      ) {
        setError(
          "Please paste the job description first."
        );

        return;
      }

      if (
        jd.length <
        20
      ) {
        setError(
          "Please enter a more complete job description."
        );

        return;
      }

      // ------------------------------------------------------
      // AUTH TOKEN
      // ------------------------------------------------------

      let token = "";

      try {
        token =
          String(
            localStorage.getItem(
              "token"
            ) || ""
          ).trim();
      } catch (
        tokenError
      ) {
        console.error(
          "Unable to read authentication token:",
          tokenError
        );
      }

      if (
        !token
      ) {
        setError(
          "Please login first."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        setResult(
          null
        );

        // ----------------------------------------------------
        // API REQUEST
        // ----------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/api/job-match`,
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
                  resumeText:
                    resumeText.trim(),

                  jobDescription:
                    jd,
                }),
            }
          );

        // ----------------------------------------------------
        // RESPONSE TYPE
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
          try {
            data =
              await response.json();
          } catch (
            parseError
          ) {
            console.error(
              "Job match JSON parse error:",
              parseError
            );

            throw new Error(
              "Backend returned invalid JSON."
            );
          }
        } else {
          const responseText =
            await response.text();

          console.error(
            "Job match non-JSON response:",
            responseText
          );

          throw new Error(
            `Backend returned ${response.status} instead of JSON.`
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
              "Your login session is invalid or expired. Please login again."
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
              "Unable to analyze the job match."
          );
        }

        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        if (
          !data?.result
        ) {
          throw new Error(
            "No job match result was returned by the server."
          );
        }

        setResult(
          data.result
        );

        setError("");

        // ----------------------------------------------------
        // SCROLL RESULT INTO VIEW
        // ----------------------------------------------------

        window.setTimeout(
          () => {
            document
              .getElementById(
                "job-match-results"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "start",
              });
          },
          50
        );
      } catch (
        err
      ) {
        console.error(
          "Job match error:",
          err
        );

        setError(
          err?.message ||
            "Something went wrong while analyzing the job."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // ==========================================================
  // CLEAR
  // ==========================================================

  const handleClear =
    () => {
      if (
        loading
      ) {
        return;
      }

      setJobDescription(
        ""
      );

      setResult(
        null
      );

      setError("");

      window.setTimeout(
        () => {
          document
            .getElementById(
              "job-match-description"
            )
            ?.focus();
        },
        0
      );
    };

  // ==========================================================
  // GO TO INPUT
  // ==========================================================

  const handleAnalyzeAnother =
    () => {
      setResult(
        null
      );

      setError("");

      window.setTimeout(
        () => {
          const textarea =
            document.getElementById(
              "job-match-description"
            );

          textarea?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "center",
          });

          textarea?.focus();
        },
        50
      );
    };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section
      id="job-matcher"
      className="
        relative
        w-full
        scroll-mt-28
        overflow-hidden
        py-20
        md:py-28
      "
    >
      {/* ======================================================
          BACKGROUND
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -top-40
          left-1/2
          h-[380px]
          w-[580px]
          -translate-x-1/2
          rounded-full
          bg-indigo-500/[0.05]
          blur-[140px]
        "
      />

      {/* ======================================================
          CONTAINER
      ======================================================= */}

      <div
        className="
          relative
          z-10
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
            mx-auto
            max-w-3xl
            text-center
          "
        >
          <span
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-indigo-400/10
              bg-indigo-500/[0.05]
              px-3.5
              py-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-indigo-300
            "
          >
            <span>
              ✦
            </span>

            Job Match
          </span>

          <h2
            className="
              mt-5
              text-3xl
              font-bold
              tracking-[-0.04em]
              text-white
              sm:text-4xl
              md:text-5xl
            "
          >
            See how well your resume
            <span className="text-indigo-400">
              {" "}
              fits the job.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-slate-500
              md:text-base
            "
          >
            Paste a real job description below.
            We'll compare it with your uploaded
            resume and show where you match and
            where gaps exist.
          </p>
        </div>

        {/* ====================================================
            INSTRUCTIONS
        ==================================================== */}

        <div
          className="
            mx-auto
            mt-8
            grid
            max-w-4xl
            grid-cols-1
            gap-3
            md:grid-cols-3
          "
        >
          <InstructionCard
            number="01"
            title="Have a resume"
            text="Upload and analyze your PDF first."
          />

          <InstructionCard
            number="02"
            title="Paste the job"
            text="Copy the complete job posting here."
          />

          <InstructionCard
            number="03"
            title="Check your fit"
            text="Review scores, skills and keywords."
          />
        </div>

        {/* ====================================================
            INPUT CARD
        ==================================================== */}

        <div
          className="
            mx-auto
            mt-5
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.08]
            bg-white/[0.02]
            shadow-2xl
            shadow-black/20
          "
        >
          {/* RESUME STATUS */}

          <div
            className={`
              border-b
              px-5
              py-4
              md:px-7
              ${
                hasResume
                  ? "border-emerald-500/10 bg-emerald-500/[0.025]"
                  : "border-amber-500/10 bg-amber-500/[0.025]"
              }
            `}
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <span
                className={`
                  h-2
                  w-2
                  shrink-0
                  rounded-full
                  ${
                    hasResume
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }
                `}
              />

              <div>
                <p
                  className="
                    text-xs
                    font-medium
                    text-slate-300
                    md:text-sm
                  "
                >
                  {hasResume
                    ? "Resume is ready for matching."
                    : "Upload and analyze a resume before using Job Match."}
                </p>

                {hasResume && (
                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-slate-600
                    "
                  >
                    {
                      resumeText.length
                    }{" "}
                    characters available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* INPUT */}

          <div
            className="
              p-5
              md:p-7
            "
          >
            <div
              className="
                flex
                items-end
                justify-between
                gap-4
              "
            >
              <div>
                <label
                  htmlFor="job-match-description"
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Paste the job description
                </label>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  Include the role, requirements,
                  responsibilities and preferred
                  skills.
                </p>
              </div>

              <span
                className="
                  shrink-0
                  text-[10px]
                  text-slate-700
                  md:text-xs
                "
              >
                {jobDescriptionLength.toLocaleString(
                  "en-IN"
                )}{" "}
                chars
              </span>
            </div>

            <textarea
              id="job-match-description"
              value={
                jobDescription
              }
              onChange={(
                event
              ) => {
                setJobDescription(
                  event.target.value
                );

                if (
                  error
                ) {
                  setError("");
                }
              }}
              disabled={
                loading
              }
              rows={12}
              placeholder={`Example:

Frontend Developer

Responsibilities:
• Build React applications
• Collaborate with engineering teams
• Improve performance

Requirements:
• React
• JavaScript
• HTML / CSS
• REST APIs
• Git`}
              className="
                mt-4
                min-h-[280px]
                w-full
                resize-y
                rounded-[22px]
                border
                border-white/[0.07]
                bg-black/20
                px-5
                py-5
                text-sm
                leading-7
                text-slate-200
                outline-none
                placeholder:text-slate-700
                transition
                focus:border-indigo-400/25
                focus:bg-indigo-500/[0.015]
                focus:ring-4
                focus:ring-indigo-500/[0.04]
                disabled:cursor-not-allowed
                disabled:opacity-50
                md:text-[15px]
              "
            />

            {/* INPUT HINT */}

            <div
              className="
                mt-3
                flex
                flex-col
                gap-1
                text-[11px]
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <span
                className={
                  isJobDescriptionValid
                    ? "text-emerald-400/70"
                    : "text-slate-600"
                }
              >
                {isJobDescriptionValid
                  ? "Job description is ready."
                  : "Enter at least 20 characters."}
              </span>

              <span
                className="
                  text-slate-700
                "
              >
                More complete JD = better comparison
              </span>
            </div>

            {/* ERROR */}

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

            {/* ACTIONS */}

            <div
              className="
                mt-6
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <button
                type="button"
                onClick={
                  handleMatch
                }
                disabled={
                  loading ||
                  !hasResume ||
                  !isJobDescriptionValid
                }
                className="
                  group
                  flex
                  min-h-14
                  flex-1
                  items-center
                  justify-center
                  gap-2
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

                    Analyzing match...
                  </>
                ) : (
                  <>
                    Analyze Job Match

                    <span
                      className="
                        transition
                        group-hover:translate-x-1
                      "
                    >
                      →
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleClear
                }
                disabled={
                  loading
                }
                className="
                  min-h-14
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  px-6
                  py-4
                  text-sm
                  font-semibold
                  text-slate-400
                  transition
                  hover:bg-white/[0.04]
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================
            RESULTS
        ==================================================== */}

        {result && (
          <MatchResults
            result={
              result
            }
            normalizeScore={
              normalizeScore
            }
            onAnalyzeAnother={
              handleAnalyzeAnother
            }
          />
        )}
      </div>
    </section>
  );
}

// ============================================================
// INSTRUCTION CARD
// ============================================================

function InstructionCard({
  number,
  title,
  text,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.015]
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
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-indigo-500/[0.08]
            text-[9px]
            font-bold
            text-indigo-300
          "
        >
          {number}
        </span>

        <p
          className="
            text-xs
            font-semibold
            text-white
          "
        >
          {title}
        </p>
      </div>

      <p
        className="
          mt-3
          text-[11px]
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
// MATCH RESULTS
// ============================================================

function MatchResults({
  result,
  normalizeScore,
  onAnalyzeAnother,
}) {
  const matchScore =
    normalizeScore(
      result?.matchScore
    );

  const skillScore =
    normalizeScore(
      result?.skillScore
    );

  const keywordScore =
    normalizeScore(
      result?.keywordScore
    );

  const matchedSkills =
    normalizeItems(
      result?.matchedSkills
    );

  const missingSkills =
    normalizeItems(
      result?.missingSkills
    );

  const matchedKeywords =
    normalizeItems(
      result?.matchedKeywords
    );

  const missingKeywords =
    normalizeItems(
      result?.missingKeywords
    );

  const matchLevel =
    String(
      result?.matchLevel ||
        getMatchLevel(
          matchScore
        )
    );

  const summary =
    String(
      result?.summary ||
        result?.matchMessage ||
        ""
    ).trim();

  return (
    <div
      id="job-match-results"
      className="
        mt-12
        scroll-mt-28
      "
    >
      {/* ==================================================
          RESULT HEADER
      ================================================== */}

      <div
        className="
          text-center
        "
      >
        <span
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-emerald-500/10
            bg-emerald-500/[0.04]
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-emerald-300
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-400
            "
          />

          Analysis Complete
        </span>

        <h3
          className="
            mt-4
            text-3xl
            font-bold
            tracking-[-0.03em]
            text-white
            md:text-4xl
          "
        >
          Your job match
        </h3>

        <p
          className="
            mx-auto
            mt-3
            max-w-2xl
            text-sm
            leading-6
            text-slate-600
          "
        >
          Your current resume was compared
          against the job description.
        </p>
      </div>

      {/* ==================================================
          HERO SCORE
      ================================================== */}

      <div
        className="
          mt-8
          overflow-hidden
          rounded-[30px]
          border
          border-white/[0.08]
          bg-gradient-to-br
          from-indigo-500/[0.07]
          via-white/[0.02]
          to-transparent
          p-6
          md:p-8
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-8
            md:flex-row
          "
        >
          <ScoreCircle
            score={
              matchScore
            }
          />

          <div
            className="
              flex-1
              text-center
              md:text-left
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-indigo-300
              "
            >
              Overall alignment
            </p>

            <h4
              className="
                mt-2
                text-2xl
                font-bold
                text-white
                md:text-3xl
              "
            >
              {matchLevel}
            </h4>

            {summary && (
              <p
                className="
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-500
                  md:text-base
                "
              >
                {summary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          SCORE BREAKDOWN
      ================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-3
        "
      >
        <ScoreCard
          title="Overall Match"
          value={
            matchScore
          }
        />

        <ScoreCard
          title="Skill Match"
          value={
            skillScore
          }
        />

        <ScoreCard
          title="Keyword Match"
          value={
            keywordScore
          }
        />
      </div>

      {/* ==================================================
          SKILL RESULTS
      ================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-4
          lg:grid-cols-2
        "
      >
        <TagCard
          title="Matched Skills"
          subtitle="Skills already found in your resume."
          items={
            matchedSkills
          }
          tone="success"
        />

        <TagCard
          title="Missing Skills"
          subtitle="Skills requested by the job but not detected in your resume."
          items={
            missingSkills
          }
          tone="danger"
        />
      </div>

      {/* ==================================================
          KEYWORD RESULTS
      ================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-4
          lg:grid-cols-2
        "
      >
        <TagCard
          title="Matched Keywords"
          subtitle="Relevant terms already present in your resume."
          items={
            matchedKeywords
          }
          tone="indigo"
        />

        <TagCard
          title="Missing Keywords"
          subtitle="Relevant job terms not detected in your resume."
          items={
            missingKeywords
          }
          tone="warning"
        />
      </div>

      {/* ==================================================
          NEXT STEP
      ================================================== */}

      <div
        className="
          mt-5
          rounded-[26px]
          border
          border-violet-500/10
          bg-violet-500/[0.025]
          p-5
          md:p-6
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
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-violet-500/10
              text-sm
              text-violet-300
            "
          >
            02
          </span>

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              Next: Customize your resume
            </p>

            <p
              className="
                mt-1.5
                text-xs
                leading-6
                text-slate-600
                md:text-sm
              "
            >
              Use the separate{" "}
              <span className="text-violet-300">
                Customize Your Resume
              </span>{" "}
              section to create a job-focused
              version using this job description.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================
          ANOTHER JOB
      ================================================== */}

      <button
        type="button"
        onClick={
          onAnalyzeAnother
        }
        className="
          mt-4
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
        "
      >
        Analyze another job
      </button>
    </div>
  );
}

// ============================================================
// SCORE CIRCLE
// ============================================================

function ScoreCircle({
  score,
}) {
  const radius =
    60;

  const circumference =
    2 *
    Math.PI *
    radius;

  const offset =
    circumference *
    (
      1 -
      score /
        100
    );

  return (
    <div
      className="
        relative
        h-40
        w-40
        shrink-0
      "
    >
      <svg
        viewBox="0 0 160 160"
        className="
          h-full
          w-full
          -rotate-90
        "
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="
            text-white/[0.06]
          "
        />

        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            offset
          }
          className="
            text-indigo-400
            transition-all
            duration-700
          "
        />
      </svg>

      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <span
          className="
            text-4xl
            font-black
            tracking-tight
            text-white
          "
        >
          {score}
        </span>

        <span
          className="
            mt-1
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-slate-600
          "
        >
          Match
        </span>
      </div>
    </div>
  );
}

// ============================================================
// SCORE CARD
// ============================================================

function ScoreCard({
  title,
  value,
}) {
  return (
    <div
      className="
        rounded-[22px]
        border
        border-white/[0.07]
        bg-white/[0.02]
        p-5
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
        <p
          className="
            text-xs
            text-slate-600
          "
        >
          {title}
        </p>

        <span
          className="
            h-2
            w-2
            rounded-full
            bg-indigo-400
          "
        />
      </div>

      <p
        className="
          mt-3
          text-3xl
          font-bold
          tracking-tight
          text-white
        "
      >
        {value}%
      </p>

      <div
        className="
          mt-4
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
            transition-all
            duration-700
          "
          style={{
            width:
              `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// TAG CARD
// ============================================================

function TagCard({
  title,
  subtitle,
  items = [],
  tone = "success",
}) {
  const values =
    normalizeItems(
      items
    );

  const cardStyles = {
    success:
      "border-emerald-500/10 bg-emerald-500/[0.025]",

    danger:
      "border-red-500/10 bg-red-500/[0.025]",

    indigo:
      "border-indigo-500/10 bg-indigo-500/[0.025]",

    warning:
      "border-amber-500/10 bg-amber-500/[0.025]",
  };

  const tagStyles = {
    success:
      "border-emerald-500/10 bg-emerald-500/[0.05] text-emerald-300",

    danger:
      "border-red-500/10 bg-red-500/[0.05] text-red-300",

    indigo:
      "border-indigo-500/10 bg-indigo-500/[0.05] text-indigo-300",

    warning:
      "border-amber-500/10 bg-amber-500/[0.05] text-amber-300",
  };

  return (
    <div
      className={`
        rounded-[24px]
        border
        p-5
        md:p-6
        ${
          cardStyles[tone] ||
          cardStyles.success
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <h4
            className="
              text-lg
              font-bold
              text-white
            "
          >
            {title}
          </h4>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-slate-600
            "
          >
            {subtitle}
          </p>
        </div>

        <span
          className="
            shrink-0
            rounded-full
            border
            border-white/[0.06]
            bg-white/[0.02]
            px-2.5
            py-1
            text-[10px]
            text-slate-600
          "
        >
          {values.length}
        </span>
      </div>

      {values.length >
      0 ? (
        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-2
          "
        >
          {values.map(
            (
              item,
              index
            ) => (
              <span
                key={`${item}-${index}`}
                className={`
                  rounded-lg
                  border
                  px-3
                  py-1.5
                  text-[11px]
                  ${
                    tagStyles[tone] ||
                    tagStyles.success
                  }
                `}
              >
                {item}
              </span>
            )
          )}
        </div>
      ) : (
        <div
          className="
            mt-5
            rounded-xl
            border
            border-white/[0.05]
            bg-black/10
            px-4
            py-3
          "
        >
          <p
            className="
              text-xs
              text-slate-600
            "
          >
            Nothing found here.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// NORMALIZE ITEMS
// ============================================================

function normalizeItems(
  items
) {
  if (
    !Array.isArray(
      items
    )
  ) {
    return [];
  }

  return items
    .map(
      (
        item
      ) => {
        if (
          typeof item ===
          "string"
        ) {
          return item.trim();
        }

        if (
          typeof item ===
          "number"
        ) {
          return String(
            item
          );
        }

        if (
          item &&
          typeof item ===
            "object"
        ) {
          return String(
            item.name ||
              item.skill ||
              item.keyword ||
              item.title ||
              item.text ||
              item.value ||
              ""
          ).trim();
        }

        return "";
      }
    )
    .filter(
      Boolean
    );
}

// ============================================================
// MATCH LEVEL
// ============================================================

function getMatchLevel(
  score
) {
  if (
    score >= 85
  ) {
    return "Excellent Match";
  }

  if (
    score >= 70
  ) {
    return "Strong Match";
  }

  if (
    score >= 50
  ) {
    return "Moderate Match";
  }

  return "Low Match";
}

// ============================================================
// EXPORT
// ============================================================

export default JobMatcher;

