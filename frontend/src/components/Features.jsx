
import { useNavigate } from "react-router-dom";

function Features() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🎯",
      title: "ATS Score",
      description:
        "Check your resume's ATS compatibility, score breakdown and overall resume quality.",
      target: "ats-score",
      action: "Check ATS Score",
    },
    {
      icon: "🧠",
      title: "AI Resume Analysis",
      description:
        "Get complete AI-powered feedback about your resume structure, content and quality.",
      target: "ai-analysis",
      action: "Analyze Resume",
    },
    {
      icon: "🔑",
      title: "Keyword Analysis",
      description:
        "Discover relevant job keywords and identify important terms missing from your resume.",
      target: "keyword-analysis",
      action: "Analyze Keywords",
    },
    {
      icon: "💼",
      title: "Job Matching",
      description:
        "Compare your resume with a target job description and discover your match score.",
      target: "job-matching",
      action: "Match Resume",
    },
    {
      icon: "📊",
      title: "Skill Analysis",
      description:
        "Identify matching skills and discover which skills may need improvement.",
      target: "skill-analysis",
      action: "Analyze Skills",
    },
    {
      icon: "✨",
      title: "Smart Suggestions",
      description:
        "Receive practical recommendations to make your resume stronger.",
      target: "smart-suggestions",
      action: "View Suggestions",
    },
  ];

  const handleFeatureClick = (feature) => {
    navigate("/analyzer", {
      state: {
        scrollTo: feature.target,
      },
    });
  };

  return (
    <section
      id="features"
      className="
        w-full
        py-20
        md:py-24
        my-10
        flex
        justify-center
        border-t
        border-white/5
      "
    >
      <div
        className="
          w-[90%]
          md:w-[85%]
          lg:w-[80%]
          max-w-6xl
          mx-auto
        "
      >
        {/* HEADER */}

        <div
          className="
            max-w-3xl
            mx-auto
            text-center
            mb-14
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              border
              border-indigo-500/20
              bg-indigo-500/10
              text-indigo-400
              text-xs
              sm:text-sm
              font-medium
            "
          >
            <span>⚡</span>
            Powerful Features
          </div>

          <h2
            className="
              mt-5
              text-3xl
              sm:text-4xl
              md:text-5xl
              font-bold
              text-white
              leading-tight
            "
          >
            Everything You Need
            <span
              className="
                block
                text-indigo-400
                mt-2
              "
            >
              For a Better Resume
            </span>
          </h2>

          <p
            className="
              max-w-2xl
              mx-auto
              mt-5
              text-sm
              sm:text-base
              text-slate-400
              leading-7
            "
          >
            Analyze your resume, match it with
            jobs and get practical recommendations
            to improve your chances of getting
            shortlisted.
          </p>
        </div>

        {/* FEATURE GRID */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-5
            md:gap-6
            w-full
          "
        >
          {features.map((feature) => (
            <button
              key={feature.title}
              type="button"
              onClick={() =>
                handleFeatureClick(feature)
              }
              className="
                group
                relative
                w-full
                text-left
                rounded-3xl
                border
                border-white/10
                bg-[#0f172a]
                p-6
                sm:p-7
                md:p-8
                hover:bg-[#111827]
                hover:border-indigo-500/30
                hover:-translate-y-1
                active:translate-y-0
                transition-all
                duration-300
                cursor-pointer
                overflow-hidden
              "
            >
              {/* Glow */}

              <div
                className="
                  absolute
                  -top-16
                  -right-16
                  w-32
                  h-32
                  rounded-full
                  bg-indigo-500/0
                  group-hover:bg-indigo-500/10
                  blur-3xl
                  transition-all
                  duration-500
                "
              />

              {/* ICON */}

              <div
                className="
                  relative
                  w-14
                  h-14
                  rounded-2xl
                  bg-indigo-500/10
                  border
                  border-indigo-500/10
                  flex
                  items-center
                  justify-center
                  text-2xl
                  group-hover:scale-105
                  group-hover:bg-indigo-500/15
                  transition-all
                  duration-300
                "
              >
                {feature.icon}
              </div>

              {/* TITLE */}

              <h3
                className="
                  relative
                  mt-6
                  text-xl
                  md:text-2xl
                  font-semibold
                  text-white
                "
              >
                {feature.title}
              </h3>

              {/* DESCRIPTION */}

              <p
                className="
                  relative
                  mt-3
                  text-sm
                  text-slate-400
                  leading-7
                "
              >
                {feature.description}
              </p>

              {/* ACTION */}

              <div
                className="
                  relative
                  mt-6
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-sm
                    font-semibold
                    text-indigo-400
                    group-hover:text-indigo-300
                    transition
                  "
                >
                  {feature.action}
                </span>

                <span
                  className="
                    w-9
                    h-9
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    flex
                    items-center
                    justify-center
                    text-slate-400
                    group-hover:text-white
                    group-hover:border-indigo-500/20
                    group-hover:bg-indigo-500/10
                    transition-all
                  "
                >
                  →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}

        <div
          className="
            w-full
            mt-8
            rounded-3xl
            border
            border-indigo-500/15
            bg-indigo-500/[0.04]
            p-6
            sm:p-8
            md:p-10
            text-center
          "
        >
          <div
            className="
              w-12
              h-12
              mx-auto
              rounded-2xl
              bg-indigo-500/10
              border
              border-indigo-500/10
              flex
              items-center
              justify-center
              text-xl
              mb-5
            "
          >
            🚀
          </div>

          <h3
            className="
              text-xl
              sm:text-2xl
              md:text-3xl
              font-bold
              text-white
            "
          >
            Ready to improve your resume?
          </h3>

          <p
            className="
              max-w-xl
              mx-auto
              mt-3
              text-sm
              text-slate-400
              leading-6
            "
          >
            Upload your resume and unlock ATS
            scoring, keyword analysis, job matching
            and smart suggestions.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/analyzer", {
                state: {
                  scrollTo: "ai-analysis",
                },
              })
            }
            className="
              mt-6
              inline-flex
              items-center
              justify-center
              gap-2
              min-h-12
              px-6
              py-3
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-500
              active:bg-indigo-700
              text-white
              font-semibold
              transition-all
              shadow-lg
              shadow-indigo-600/20
            "
          >
            Analyze My Resume
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default Features;

