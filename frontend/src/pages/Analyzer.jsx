
import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import ResumeUploader from "../components/ResumeUploader";
import JobMatcher from "../components/JobMatcher";
import TailoredResume from "../components/TailoredResume";

// ============================================================
// ANALYZER PAGE
// ============================================================
//
// SECTION ORDER:
//
// 01. Resume Upload
// 02. ATS Score
// 03. AI Resume Analysis
// 04. Keyword Analysis
// 05. Job Match
// 06. Customize Your Resume
// 07. Skill Analysis
// 08. Smart Suggestions
//
// Each functionality is independent.
//
// ============================================================

function Analyzer({
  resumeText = "",
  analysisResult = null,
  resumeId: initialResumeId = "",
  onResumeTextExtracted,
  onAnalysisComplete,
}) {
  const location =
    useLocation();

  // ==========================================================
  // LOCAL STORAGE RESUME ID
  // ==========================================================

  const getStoredResumeId =
    () => {
      return String(
        localStorage.getItem(
          "selectedResumeId"
        ) ||
          localStorage.getItem(
            "resumeId"
          ) ||
          ""
      ).trim();
    };

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    currentResumeText,
    setCurrentResumeText,
  ] = useState(
    String(
      resumeText || ""
    )
  );

  const [
    currentAnalysis,
    setCurrentAnalysis,
  ] = useState(
    analysisResult || null
  );

  const [
    currentResumeId,
    setCurrentResumeId,
  ] = useState(
    () => {
      const propId =
        String(
          initialResumeId || ""
        ).trim();

      return (
        propId ||
        getStoredResumeId()
      );
    }
  );

  // ==========================================================
  // FEATURE FROM NAVIGATION
  // ==========================================================

  const selectedFeature =
    String(
      location.state?.scrollTo ||
        ""
    ).trim();

  // ==========================================================
  // FEATURE FLAGS
  // ==========================================================

  const isFullAnalyzer =
    !selectedFeature;

  const validFeatures = [
    "ats-score",
    "ai-analysis",
    "keyword-analysis",
    "job-matching",
    "customize-resume",
    "skill-analysis",
    "smart-suggestions",
  ];

  const isSpecificFeature =
    validFeatures.includes(
      selectedFeature
    );

  // ==========================================================
  // SYNC RESUME TEXT
  // ==========================================================

  useEffect(
    () => {
      const cleanText =
        String(
          resumeText || ""
        ).trim();

      if (
        cleanText
      ) {
        setCurrentResumeText(
          cleanText
        );
      }
    },
    [resumeText]
  );

  // ==========================================================
  // SYNC ANALYSIS
  // ==========================================================

  useEffect(
    () => {
      if (
        analysisResult
      ) {
        setCurrentAnalysis(
          analysisResult
        );
      }
    },
    [analysisResult]
  );

  // ==========================================================
  // SYNC INITIAL RESUME ID
  // ==========================================================

  useEffect(
    () => {
      const cleanId =
        String(
          initialResumeId || ""
        ).trim();

      if (
        !cleanId
      ) {
        return;
      }

      setCurrentResumeId(
        cleanId
      );

      localStorage.setItem(
        "selectedResumeId",
        cleanId
      );

      localStorage.setItem(
        "resumeId",
        cleanId
      );
    },
    [initialResumeId]
  );

  // ==========================================================
  // RESTORE STORED RESUME ID
  // ==========================================================

  useEffect(
    () => {
      const storedId =
        getStoredResumeId();

      if (
        !storedId
      ) {
        return;
      }

      setCurrentResumeId(
        (previousId) =>
          previousId ||
          storedId
      );
    },
    []
  );

  // ==========================================================
  // LISTEN FOR RESUME SELECTION
  // ==========================================================

  useEffect(
    () => {
      const handleResumeSelection =
        (
          event
        ) => {
          const id =
            String(
              event?.detail?.resumeId ||
                event?.detail?._id ||
                event?.detail?.id ||
                ""
            ).trim();

          setCurrentResumeId(
            id
          );
        };

      window.addEventListener(
        "resume-selection-changed",
        handleResumeSelection
      );

      return () => {
        window.removeEventListener(
          "resume-selection-changed",
          handleResumeSelection
        );
      };
    },
    []
  );

  // ==========================================================
  // RECEIVE RESUME TEXT
  // ==========================================================

  const handleResumeExtracted =
    (
      text
    ) => {
      const cleanText =
        String(
          text || ""
        ).trim();

      setCurrentResumeText(
        cleanText
      );

      if (
        typeof onResumeTextExtracted ===
        "function"
      ) {
        onResumeTextExtracted(
          cleanText
        );
      }
    };

  // ==========================================================
  // RECEIVE ANALYSIS
  // ==========================================================

  const handleAnalysisComplete =
    (
      analysis
    ) => {
      const cleanAnalysis =
        analysis || null;

      setCurrentAnalysis(
        cleanAnalysis
      );

      if (
        typeof onAnalysisComplete ===
        "function"
      ) {
        onAnalysisComplete(
          cleanAnalysis
        );
      }
    };

  // ==========================================================
  // RECEIVE RESUME ID
  // ==========================================================

  const handleResumeIdExtracted =
    (
      id
    ) => {
      const cleanId =
        String(
          id || ""
        ).trim();

      setCurrentResumeId(
        cleanId
      );

      if (
        cleanId
      ) {
        localStorage.setItem(
          "selectedResumeId",
          cleanId
        );

        localStorage.setItem(
          "resumeId",
          cleanId
        );
      } else {
        localStorage.removeItem(
          "selectedResumeId"
        );

        localStorage.removeItem(
          "resumeId"
        );
      }
    };

  // ==========================================================
  // HANDLE RESUME REMOVED
  // ==========================================================

  const handleResumeRemoved =
    () => {
      setCurrentResumeText(
        ""
      );

      setCurrentAnalysis(
        null
      );

      setCurrentResumeId(
        ""
      );

      localStorage.removeItem(
        "selectedResumeId"
      );

      localStorage.removeItem(
        "resumeId"
      );
    };

  // ==========================================================
  // SCROLL TO SECTION
  // ==========================================================

  useEffect(
    () => {
      if (
        !selectedFeature
      ) {
        return;
      }

      const targetId =
        selectedFeature;

      const timer =
        window.setTimeout(
          () => {
            document
              .getElementById(
                targetId
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",
                block:
                  "start",
              });
          },
          200
        );

      return () =>
        window.clearTimeout(
          timer
        );
    },
    [selectedFeature]
  );

  // ==========================================================
  // SHOULD SHOW FEATURE
  // ==========================================================

  const shouldShow =
    (
      feature
    ) =>
      isFullAnalyzer ||
      selectedFeature === feature ||
      !isSpecificFeature;

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
      "
    >
      <Navbar />

      <main>
        {/* ====================================================
            HERO
        ==================================================== */}

        <section
          className="
            px-[5%]
            pt-16
            pb-10
            sm:px-[7%]
            lg:px-[10%]
            md:pt-20
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
            "
          >
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
                  {getFeatureIcon(
                    selectedFeature
                  )}
                </span>

                {getFeatureLabel(
                  selectedFeature
                )}
              </span>

              <h1
                className="
                  mt-5
                  text-4xl
                  font-bold
                  tracking-[-0.04em]
                  text-white
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                {getFeatureTitle(
                  selectedFeature
                )}
              </h1>

              <p
                className="
                  mx-auto
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-500
                  md:text-base
                "
              >
                {getFeatureDescription(
                  selectedFeature
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            01 — RESUME UPLOAD
        ==================================================== */}

        <section
          id="resume-upload"
          className="
            px-[5%]
            pb-14
            scroll-mt-28
            sm:px-[7%]
            lg:px-[10%]
          "
        >
          <div
            className="
              mx-auto
              max-w-6xl
            "
          >
            <SectionIntro
              number="01"
              eyebrow="Resume Upload"
              title="Start with your resume"
              description="Upload your PDF first. Your resume will be extracted, analyzed and saved to your account."
              tone="indigo"
            />

            <ResumeUploader
              onResumeTextExtracted={
                handleResumeExtracted
              }
              onAnalysisComplete={
                handleAnalysisComplete
              }
              onResumeIdExtracted={
                handleResumeIdExtracted
              }
              onResumeRemoved={
                handleResumeRemoved
              }
            />
          </div>
        </section>

        {/* ====================================================
            02 — ATS SCORE
        ==================================================== */}

        {shouldShow(
          "ats-score"
        ) && (
          <ATSScoreSection
            analysis={
              currentAnalysis
            }
          />
        )}

        {/* ====================================================
            03 — AI ANALYSIS
        ==================================================== */}

        {shouldShow(
          "ai-analysis"
        ) && (
          <AIAnalysisSection
            analysis={
              currentAnalysis
            }
          />
        )}

        {/* ====================================================
            04 — KEYWORD ANALYSIS
        ==================================================== */}

        {shouldShow(
          "keyword-analysis"
        ) && (
          <KeywordAnalysisSection
            resumeText={
              currentResumeText
            }
          />
        )}

        {/* ====================================================
            05 — JOB MATCH
        ==================================================== */}

        {shouldShow(
          "job-matching"
        ) && (
          <section
            id="job-matching"
            className="
              scroll-mt-28
            "
          >
            <SectionWrapper>
              <SectionIntro
                number="05"
                eyebrow="Job Match"
                title="Measure your fit for the role"
                description="Paste a real job description to see your overall match, skill gaps and keyword gaps."
                tone="indigo"
              />

              <JobMatcher
                resumeText={
                  currentResumeText
                }
              />
            </SectionWrapper>
          </section>
        )}

        {/* ====================================================
            06 — CUSTOMIZE YOUR RESUME
        ==================================================== */}

        {shouldShow(
          "customize-resume"
        ) && (
          <section
            id="customize-resume"
            className="
              scroll-mt-28
            "
          >
            <SectionWrapper>
              <SectionIntro
                number="06"
                eyebrow="Customize Your Resume"
                title="Create a job-focused version"
                description="Use the job description to prioritize the strongest parts of your existing resume for that specific role."
                tone="violet"
              />

              <TailoredResume
                resumeText={
                  currentResumeText
                }
                resumeId={
                  currentResumeId
                }
              />
            </SectionWrapper>
          </section>
        )}

        {/* ====================================================
            07 — SKILL ANALYSIS
        ==================================================== */}

        {shouldShow(
          "skill-analysis"
        ) && (
          <SkillAnalysisSection
            resumeText={
              currentResumeText
            }
          />
        )}

        {/* ====================================================
            08 — SMART SUGGESTIONS
        ==================================================== */}

        {shouldShow(
          "smart-suggestions"
        ) && (
          <SuggestionsSection
            analysis={
              currentAnalysis
            }
          />
        )}
      </main>
    </div>
  );
}

// ============================================================
// SECTION WRAPPER
// ============================================================

function SectionWrapper({
  children,
}) {
  return (
    <section
      className="
        w-full
        border-t
        border-white/[0.05]
        py-20
        md:py-28
      "
    >
      <div
        className="
          mx-auto
          w-[92%]
          max-w-6xl
        "
      >
        {children}
      </div>
    </section>
  );
}

// ============================================================
// SECTION INTRO
// ============================================================

function SectionIntro({
  number,
  eyebrow,
  title,
  description,
  tone = "indigo",
}) {
  const styles = {
    indigo:
      "border-indigo-400/10 bg-indigo-500/[0.04] text-indigo-300",

    violet:
      "border-violet-400/10 bg-violet-500/[0.04] text-violet-300",

    emerald:
      "border-emerald-400/10 bg-emerald-500/[0.04] text-emerald-300",
  };

  return (
    <div
      className="
        mx-auto
        mb-10
        max-w-3xl
        text-center
      "
    >
      <span
        className={`
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          px-3.5
          py-2
          text-[10px]
          font-bold
          uppercase
          tracking-[0.17em]
          ${styles[tone] || styles.indigo}
        `}
      >
        <span
          className="
            opacity-60
          "
        >
          {number}
        </span>

        {eyebrow}
      </span>

      <h2
        className="
          mt-5
          text-3xl
          font-bold
          tracking-[-0.035em]
          text-white
          sm:text-4xl
        "
      >
        {title}
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
        {description}
      </p>
    </div>
  );
}

// ============================================================
// ATS SCORE
// ============================================================

function ATSScoreSection({
  analysis,
}) {
  const score =
    clamp(
      analysis?.atsScore ??
        analysis?.score
    );

  return (
    <SectionWrapper>
      <section
        id="ats-score"
        className="
          scroll-mt-28
        "
      >
        <SectionIntro
          number="02"
          eyebrow="ATS Score"
          title="See your resume's ATS performance"
          description="Understand how well your resume is structured for automated screening systems."
        />

        {!analysis ? (
          <EmptyState
            icon="🎯"
            title="Your ATS score will appear here"
            description="Upload and analyze your resume above to generate your score."
          />
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-5
              lg:grid-cols-3
            "
          >
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                rounded-[28px]
                border
                border-indigo-500/10
                bg-indigo-500/[0.025]
                p-8
              "
            >
              <div
                className="
                  relative
                  flex
                  h-44
                  w-44
                  items-center
                  justify-center
                  rounded-full
                  border-[12px]
                  border-indigo-500/20
                "
              >
                <div
                  className="
                    absolute
                    inset-[-12px]
                    rounded-full
                    border-[12px]
                    border-indigo-400
                  "
                  style={{
                    clipPath: `inset(${
                      100 -
                      score
                    }% 0 0 0)`,
                  }}
                />

                <div className="text-center">
                  <p
                    className="
                      text-5xl
                      font-black
                      text-white
                    "
                  >
                    {score}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-widest
                      text-slate-600
                    "
                  >
                    / 100
                  </p>
                </div>
              </div>

              <p
                className="
                  mt-5
                  text-sm
                  font-semibold
                  text-indigo-300
                "
              >
                {
                  analysis.grade ||
                  "Resume Score"
                }
              </p>
            </div>

            <div
              className="
                lg:col-span-2
                rounded-[28px]
                border
                border-white/[0.07]
                bg-white/[0.02]
                p-6
                md:p-7
              "
            >
              <h3
                className="
                  text-xl
                  font-bold
                  text-white
                "
              >
                Score breakdown
              </h3>

              <div
                className="
                  mt-6
                  space-y-5
                "
              >
                {Object.entries(
                  analysis.categoryScores ||
                    {}
                )
                  .filter(
                    ([, value]) =>
                      Number.isFinite(
                        Number(value)
                      )
                  )
                  .map(
                    ([
                      key,
                      value,
                    ]) => {
                      const categoryScore =
                        clamp(
                          value
                        );

                      return (
                        <div
                          key={key}
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
                                text-slate-500
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
                              {
                                categoryScore
                              }%
                            </span>
                          </div>

                          <div
                            className="
                              mt-2
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
                                  `${categoryScore}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
          </div>
        )}
      </section>
    </SectionWrapper>
  );
}

// ============================================================
// AI ANALYSIS
// ============================================================

function AIAnalysisSection({
  analysis,
}) {
  const metrics =
    analysis?.metrics ||
    {};

  const strengths =
    normalizeList(
      analysis?.strengths
    );

  const weaknesses =
    normalizeList(
      analysis?.weaknesses
    );

  return (
    <SectionWrapper>
      <section
        id="ai-analysis"
        className="
          scroll-mt-28
        "
      >
        <SectionIntro
          number="03"
          eyebrow="AI Resume Analysis"
          title="Understand what works in your resume"
          description="Review resume metrics, strengths and the main areas that need attention."
        />

        {!analysis ? (
          <EmptyState
            icon="🧠"
            title="No AI analysis yet"
            description="Upload and analyze your resume above to see detailed feedback."
          />
        ) : (
          <div
            className="
              space-y-5
            "
          >
            <div
              className="
                grid
                grid-cols-2
                gap-3
                md:grid-cols-4
              "
            >
              <MetricCard
                value={
                  metrics.quantifiedAchievements ||
                  0
                }
                label="Achievements"
              />

              <MetricCard
                value={
                  metrics.actionVerbs ||
                  0
                }
                label="Action verbs"
              />

              <MetricCard
                value={
                  metrics.skills ||
                  0
                }
                label="Skills"
              />

              <MetricCard
                value={
                  metrics.bulletPoints ||
                  0
                }
                label="Bullet points"
              />
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
              "
            >
              <SimpleListCard
                title="Strengths"
                items={
                  strengths
                }
                tone="success"
              />

              <SimpleListCard
                title="Areas to improve"
                items={
                  weaknesses
                }
                tone="warning"
              />
            </div>

            {analysis.overallRecommendation && (
              <div
                className="
                  rounded-[26px]
                  border
                  border-indigo-500/10
                  bg-indigo-500/[0.025]
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
                    text-indigo-300
                  "
                >
                  AI recommendation
                </p>

                <p
                  className="
                    mt-3
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
              </div>
            )}
          </div>
        )}
      </section>
    </SectionWrapper>
  );
}

// ============================================================
// KEYWORD ANALYSIS
// ============================================================

function KeywordAnalysisSection({
  resumeText,
}) {
  return (
    <SectionWrapper>
      <section
        id="keyword-analysis"
        className="
          scroll-mt-28
        "
      >
        <SectionIntro
          number="04"
          eyebrow="Keyword Analysis"
          title="Understand the keywords your target role needs"
          description="This section prepares you to compare your resume against an actual job description."
        />

        <div
          className="
            rounded-[28px]
            border
            border-white/[0.07]
            bg-white/[0.02]
            p-6
            md:p-8
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-center
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
                bg-indigo-500/[0.08]
                text-2xl
              "
            >
              🔑
            </div>

            <div className="flex-1">
              <h3
                className="
                  text-xl
                  font-bold
                  text-white
                "
              >
                Keyword comparison
              </h3>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                {resumeText
                  ? "Your resume is ready. Use Job Match to compare it with the exact wording used in a target job posting."
                  : "Upload and analyze your resume first. Then compare it with a target job."}
              </p>
            </div>

            <a
              href="#job-matching"
              className="
                shrink-0
                rounded-xl
                border
                border-indigo-400/10
                bg-indigo-500/[0.05]
                px-5
                py-3
                text-sm
                font-semibold
                text-indigo-300
                transition
                hover:bg-indigo-500/[0.09]
              "
            >
              Open Job Match →
            </a>
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
}

// ============================================================
// SKILL ANALYSIS
// ============================================================

function SkillAnalysisSection({
  resumeText,
}) {
  return (
    <SectionWrapper>
      <section
        id="skill-analysis"
        className="
          scroll-mt-28
        "
      >
        <SectionIntro
          number="07"
          eyebrow="Skill Analysis"
          title="Understand your skill gaps"
          description="Use a target job to identify which skills are already supported and which skills may need stronger evidence."
        />

        <div
          className="
            rounded-[28px]
            border
            border-white/[0.07]
            bg-white/[0.02]
            p-6
            md:p-8
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-center
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
                bg-emerald-500/[0.08]
                text-2xl
              "
            >
              📊
            </div>

            <div className="flex-1">
              <h3
                className="
                  text-xl
                  font-bold
                  text-white
                "
              >
                Skill matching
              </h3>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                {resumeText
                  ? "Your resume is ready. Enter a target job in Job Match to identify relevant skill gaps."
                  : "Upload and analyze your resume before comparing your skills."}
              </p>
            </div>

            <a
              href="#job-matching"
              className="
                shrink-0
                rounded-xl
                border
                border-emerald-400/10
                bg-emerald-500/[0.05]
                px-5
                py-3
                text-sm
                font-semibold
                text-emerald-300
                transition
                hover:bg-emerald-500/[0.09]
              "
            >
              Open Skill Match →
            </a>
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
}

// ============================================================
// SMART SUGGESTIONS
// ============================================================

function SuggestionsSection({
  analysis,
}) {
  const suggestions =
    normalizeList(
      analysis?.suggestions
    );

  const weaknesses =
    normalizeList(
      analysis?.weaknesses
    );

  const items =
    [
      ...suggestions,
      ...weaknesses,
    ].slice(
      0,
      10
    );

  return (
    <SectionWrapper>
      <section
        id="smart-suggestions"
        className="
          scroll-mt-28
        "
      >
        <SectionIntro
          number="08"
          eyebrow="Smart Suggestions"
          title="Know exactly what to improve"
          description="Turn your resume analysis into practical, actionable improvements."
        />

        {!analysis ? (
          <EmptyState
            icon="✨"
            title="No suggestions yet"
            description="Analyze your resume first to generate smart suggestions."
          />
        ) : items.length ===
          0 ? (
          <EmptyState
            icon="✅"
            title="No major suggestions found"
            description="Your current analysis did not return additional recommendations."
          />
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-3
              md:grid-cols-2
            "
          >
            {items.map(
              (
                item,
                index
              ) => (
                <div
                  key={`${item}-${index}`}
                  className="
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-white/[0.02]
                    p-5
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
                        bg-indigo-500/[0.08]
                        text-xs
                        text-indigo-300
                      "
                    >
                      {index + 1}
                    </span>

                    <p
                      className="
                        text-sm
                        leading-6
                        text-slate-300
                      "
                    >
                      {item}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </SectionWrapper>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div
      className="
        rounded-[28px]
        border
        border-dashed
        border-white/[0.07]
        bg-white/[0.015]
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
          bg-white/[0.03]
          text-2xl
        "
      >
        {icon}
      </div>

      <h3
        className="
          mt-5
          text-xl
          font-bold
          text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mx-auto
          mt-3
          max-w-xl
          text-sm
          leading-6
          text-slate-600
        "
      >
        {description}
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
        rounded-[22px]
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-5
        text-center
      "
    >
      <p
        className="
          text-2xl
          font-black
          text-white
          md:text-3xl
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
// SIMPLE LIST
// ============================================================

function SimpleListCard({
  title,
  items = [],
  tone = "success",
}) {
  const isSuccess =
    tone ===
    "success";

  return (
    <div
      className="
        rounded-[26px]
        border
        border-white/[0.07]
        bg-white/[0.02]
        p-5
        md:p-6
      "
    >
      <h3
        className={`
          text-xl
          font-bold
          ${
            isSuccess
              ? "text-emerald-300"
              : "text-amber-300"
          }
        `}
      >
        {title}
      </h3>

      {items.length >
      0 ? (
        <div
          className="
            mt-5
            space-y-2
          "
        >
          {items
            .slice(
              0,
              8
            )
            .map(
              (
                item,
                index
              ) => (
                <div
                  key={`${item}-${index}`}
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
                      className={
                        isSuccess
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }
                    >
                      {isSuccess
                        ? "✓"
                        : "→"}
                    </span>

                    <p
                      className="
                        text-sm
                        leading-6
                        text-slate-300
                      "
                    >
                      {item}
                    </p>
                  </div>
                </div>
              )
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
          No information available.
        </p>
      )}
    </div>
  );
}

// ============================================================
// NORMALIZE LIST
// ============================================================

function normalizeList(
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
          item &&
          typeof item ===
            "object"
        ) {
          return String(
            item.message ||
              item.suggestion ||
              item.text ||
              item.description ||
              item.title ||
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
// CLAMP
// ============================================================

function clamp(
  value
) {
  return Math.min(
    100,
    Math.max(
      0,
      Number(value) ||
        0
    )
  );
}

// ============================================================
// FORMAT LABEL
// ============================================================

function formatLabel(
  value
) {
  return String(
    value
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
      /^./,
      (
        character
      ) =>
        character.toUpperCase()
    )
    .trim();
}

// ============================================================
// FEATURE ICON
// ============================================================

function getFeatureIcon(
  feature
) {
  const icons = {
    "ats-score":
      "🎯",

    "ai-analysis":
      "🧠",

    "keyword-analysis":
      "🔑",

    "job-matching":
      "💼",

    "customize-resume":
      "✨",

    "skill-analysis":
      "📊",

    "smart-suggestions":
      "💡",
  };

  return (
    icons[feature] ||
    "✦"
  );
}

// ============================================================
// FEATURE LABEL
// ============================================================

function getFeatureLabel(
  feature
) {
  const labels = {
    "ats-score":
      "ATS Score",

    "ai-analysis":
      "AI Resume Analysis",

    "keyword-analysis":
      "Keyword Analysis",

    "job-matching":
      "Job Match",

    "customize-resume":
      "Customize Your Resume",

    "skill-analysis":
      "Skill Analysis",

    "smart-suggestions":
      "Smart Suggestions",
  };

  return (
    labels[feature] ||
    "AI Resume Analyzer"
  );
}

// ============================================================
// FEATURE TITLE
// ============================================================

function getFeatureTitle(
  feature
) {
  const titles = {
    "ats-score":
      "Check Your ATS Score",

    "ai-analysis":
      "Analyze Your Resume With AI",

    "keyword-analysis":
      "Understand Job Keywords",

    "job-matching":
      "See How Well Your Resume Fits the Job",

    "customize-resume":
      "Customize Your Resume for the Role",

    "skill-analysis":
      "Understand Your Skill Gaps",

    "smart-suggestions":
      "Get Smart Resume Suggestions",
  };

  return (
    titles[feature] ||
    "Build a stronger resume with AI"
  );
}

// ============================================================
// FEATURE DESCRIPTION
// ============================================================

function getFeatureDescription(
  feature
) {
  const descriptions = {
    "ats-score":
      "Upload your resume and review its ATS performance.",

    "ai-analysis":
      "Get AI-powered feedback about resume quality, strengths and weaknesses.",

    "keyword-analysis":
      "Understand the keywords that matter when comparing your resume with a target job.",

    "job-matching":
      "Paste a job description and measure how closely your resume matches it.",

    "customize-resume":
      "Create a job-focused version of your existing resume using a target job description.",

    "skill-analysis":
      "Identify which skills match your target role and where gaps may exist.",

    "smart-suggestions":
      "Turn your resume analysis into practical improvements.",
  };

  return (
    descriptions[feature] ||
    "Upload your resume and use the complete AI-powered resume workflow."
  );
}

export default Analyzer;

