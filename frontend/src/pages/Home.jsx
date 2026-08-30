
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ============================================================
// HOME PAGE
// ============================================================
//
// HOME IS ONLY FOR:
//
// ✅ Product introduction
// ✅ Explain workflow
// ✅ Show key benefits
// ✅ Guide user toward Analyzer
//
// NOT HERE:
//
// ❌ Resume Upload
// ❌ Resume Analysis
// ❌ Job Match
// ❌ Customize Resume
// ❌ Resume History
//
// All actual tools live inside /analyzer.
// ============================================================

function Home() {
  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
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
            relative
            overflow-hidden
            px-[5%]
            pb-20
            pt-20
            sm:px-[7%]
            md:pb-28
            md:pt-28
            lg:px-[10%]
          "
        >
          {/* Background glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[-180px]
              h-[500px]
              w-[700px]
              -translate-x-1/2
              rounded-full
              bg-indigo-500/[0.07]
              blur-[150px]
            "
          />

          <div
            className="
              relative
              z-10
              mx-auto
              max-w-7xl
            "
          >
            <div
              className="
                mx-auto
                max-w-4xl
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
                  px-4
                  py-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-indigo-300
                "
              >
                <span>✦</span>
                AI Resume Platform
              </span>

              <h1
                className="
                  mt-6
                  text-4xl
                  font-black
                  tracking-[-0.05em]
                  text-white
                  sm:text-5xl
                  md:text-6xl
                  lg:text-7xl
                "
              >
                Build a resume that
                <span
                  className="
                    block
                    text-indigo-400
                  "
                >
                  gets noticed.
                </span>
              </h1>

              <p
                className="
                  mx-auto
                  mt-6
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-500
                  sm:text-base
                  md:text-lg
                "
              >
                Analyze your resume, understand your
                ATS performance, match it against real
                jobs and create a job-focused version
                using AI.
              </p>

              {/* Hero actions */}

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-3
                  sm:flex-row
                "
              >
                <Link
                  to="/analyzer"
                  className="
                    inline-flex
                    min-h-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-500
                    px-7
                    py-4
                    text-sm
                    font-bold
                    text-white
                    shadow-xl
                    shadow-indigo-500/10
                    transition
                    hover:-translate-y-0.5
                    hover:bg-indigo-400
                  "
                >
                  Open Resume Analyzer
                  <span className="ml-2">
                    →
                  </span>
                </Link>

                <Link
                  to="/resumes"
                  className="
                    inline-flex
                    min-h-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/[0.07]
                    bg-white/[0.02]
                    px-7
                    py-4
                    text-sm
                    font-semibold
                    text-slate-300
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  View My Resumes
                </Link>
              </div>
            </div>

            {/* =================================================
                PRODUCT PREVIEW
            ================================================= */}

            <div
              className="
                mx-auto
                mt-16
                max-w-5xl
              "
            >
              <div
                className="
                  overflow-hidden
                  rounded-[30px]
                  border
                  border-white/[0.08]
                  bg-white/[0.02]
                  p-2
                  shadow-2xl
                  shadow-black/30
                "
              >
                <div
                  className="
                    rounded-[24px]
                    border
                    border-white/[0.05]
                    bg-slate-900
                    p-5
                    sm:p-7
                  "
                >
                  {/* Fake browser header */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/40" />
                  </div>

                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-1
                      gap-4
                      md:grid-cols-4
                    "
                  >
                    <PreviewCard
                      number="01"
                      title="Upload"
                      text="Add your resume PDF."
                    />

                    <PreviewCard
                      number="02"
                      title="Analyze"
                      text="Understand ATS and AI feedback."
                    />

                    <PreviewCard
                      number="03"
                      title="Match"
                      text="Compare against a target job."
                    />

                    <PreviewCard
                      number="04"
                      title="Customize"
                      text="Create a focused resume version."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            CORE FEATURES
        ==================================================== */}

        <section
          className="
            border-t
            border-white/[0.05]
            px-[5%]
            py-20
            sm:px-[7%]
            md:py-28
            lg:px-[10%]
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
            "
          >
            <SectionHeader
              eyebrow="What you can do"
              title="Everything you need to improve your resume."
              description="Each tool has one clear job, so you always know what to use next."
            />

            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                lg:grid-cols-4
              "
            >
              <FeatureCard
                number="01"
                icon="🎯"
                title="ATS Score"
                text="See how your resume performs against common ATS screening criteria."
              />

              <FeatureCard
                number="02"
                icon="🧠"
                title="AI Analysis"
                text="Understand your resume strengths, weaknesses, metrics and content quality."
              />

              <FeatureCard
                number="03"
                icon="💼"
                title="Job Match"
                text="Compare your resume with a real job description and find skill or keyword gaps."
              />

              <FeatureCard
                number="04"
                icon="✨"
                title="Customize Resume"
                text="Create a job-focused version of your existing resume using the target role."
              />
            </div>

            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-4
                md:grid-cols-3
              "
            >
              <FeatureCard
                number="05"
                icon="📊"
                title="Skill Analysis"
                text="Understand which skills are supported by your current resume."
              />

              <FeatureCard
                number="06"
                icon="🔑"
                title="Keyword Analysis"
                text="Identify important terms that matter for your target position."
              />

              <FeatureCard
                number="07"
                icon="💡"
                title="Smart Suggestions"
                text="Turn analysis results into practical improvements before applying."
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            HOW IT WORKS
        ==================================================== */}

        <section
          className="
            border-t
            border-white/[0.05]
            px-[5%]
            py-20
            sm:px-[7%]
            md:py-28
            lg:px-[10%]
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
            "
          >
            <SectionHeader
              eyebrow="Simple workflow"
              title="From resume to job-ready version."
              description="The platform guides you through the process without mixing different tools together."
            />

            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                lg:grid-cols-4
              "
            >
              <WorkflowCard
                number="01"
                title="Upload"
                text="Upload your PDF resume and let the system extract and save it."
              />

              <WorkflowCard
                number="02"
                title="Analyze"
                text="Review your ATS score and understand the quality of your resume."
              />

              <WorkflowCard
                number="03"
                title="Match"
                text="Paste a target job to see your fit, skills and missing keywords."
              />

              <WorkflowCard
                number="04"
                title="Customize"
                text="Create a focused version specifically for that role."
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            CLEAR DIFFERENCE
        ==================================================== */}

        <section
          className="
            border-t
            border-white/[0.05]
            px-[5%]
            py-20
            sm:px-[7%]
            md:py-28
            lg:px-[10%]
          "
        >
          <div
            className="
              mx-auto
              grid
              max-w-6xl
              grid-cols-1
              gap-5
              lg:grid-cols-2
            "
          >
            <InfoPanel
              eyebrow="Job Match"
              title="How well do I fit this job?"
              description="Use Job Match when you want to understand your current compatibility with a specific job description."
              icon="💼"
            />

            <InfoPanel
              eyebrow="Customize Your Resume"
              title="How should my resume fit this job?"
              description="Use Customize Your Resume after matching to create a job-focused version from your existing resume."
              icon="✨"
            />
          </div>
        </section>

        {/* ====================================================
            CTA
        ==================================================== */}

        <section
          className="
            border-t
            border-white/[0.05]
            px-[5%]
            py-20
            sm:px-[7%]
            md:py-28
            lg:px-[10%]
          "
        >
          <div
            className="
              relative
              mx-auto
              max-w-5xl
              overflow-hidden
              rounded-[32px]
              border
              border-indigo-400/10
              bg-indigo-500/[0.04]
              p-8
              text-center
              md:p-12
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-[-160px]
                h-[300px]
                w-[500px]
                -translate-x-1/2
                rounded-full
                bg-indigo-500/[0.06]
                blur-[120px]
              "
            />

            <div className="relative z-10">
              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.17em]
                  text-indigo-300
                "
              >
                Ready to start?
              </span>

              <h2
                className="
                  mt-4
                  text-3xl
                  font-black
                  tracking-[-0.04em]
                  text-white
                  sm:text-4xl
                "
              >
                Make your next application stronger.
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
                Upload your resume once, then use each
                tool for its specific purpose.
              </p>

              <Link
                to="/analyzer"
                className="
                  mt-7
                  inline-flex
                  min-h-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white
                  px-7
                  py-4
                  text-sm
                  font-bold
                  text-slate-950
                  transition
                  hover:bg-slate-100
                "
              >
                Start Analyzing →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  eyebrow,
  title,
  description,
}) {
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
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.18em]
          text-indigo-300
        "
      >
        {eyebrow}
      </span>

      <h2
        className="
          mt-3
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
// PREVIEW CARD
// ============================================================

function PreviewCard({
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
        bg-white/[0.02]
        p-5
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <span
          className="
            text-[10px]
            font-bold
            tracking-widest
            text-indigo-300
          "
        >
          {number}
        </span>

        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-indigo-400
          "
        />
      </div>

      <h3
        className="
          mt-6
          text-lg
          font-bold
          text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
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
// FEATURE CARD
// ============================================================

function FeatureCard({
  number,
  icon,
  title,
  text,
}) {
  return (
    <div
      className="
        rounded-[26px]
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-6
        transition
        hover:-translate-y-0.5
        hover:border-white/[0.1]
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <span
          className="
            text-[10px]
            font-bold
            tracking-[0.16em]
            text-slate-700
          "
        >
          {number}
        </span>

        <span
          className="
            text-xl
          "
        >
          {icon}
        </span>
      </div>

      <h3
        className="
          mt-7
          text-lg
          font-bold
          text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-slate-600
        "
      >
        {text}
      </p>
    </div>
  );
}

// ============================================================
// WORKFLOW CARD
// ============================================================

function WorkflowCard({
  number,
  title,
  text,
}) {
  return (
    <div
      className="
        rounded-[26px]
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-6
      "
    >
      <span
        className="
          inline-flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-indigo-500/[0.08]
          text-xs
          font-bold
          text-indigo-300
        "
      >
        {number}
      </span>

      <h3
        className="
          mt-6
          text-lg
          font-bold
          text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-slate-600
        "
      >
        {text}
      </p>
    </div>
  );
}

// ============================================================
// INFO PANEL
// ============================================================

function InfoPanel({
  eyebrow,
  title,
  description,
  icon,
}) {
  return (
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
          items-center
          gap-3
        "
      >
        <span
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-white/[0.04]
            text-xl
          "
        >
          {icon}
        </span>

        <span
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-slate-600
          "
        >
          {eyebrow}
        </span>
      </div>

      <h3
        className="
          mt-6
          text-2xl
          font-bold
          tracking-tight
          text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-3
          text-sm
          leading-7
          text-slate-500
        "
      >
        {description}
      </p>
    </div>
  );
}

export default Home;

