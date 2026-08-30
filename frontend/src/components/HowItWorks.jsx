function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Resume",
      description:
        "Upload your resume in PDF format using our simple upload interface.",
    },
    {
      number: "02",
      title: "AI Analyzes",
      description:
        "Our AI analyzes your resume structure, skills, keywords and experience.",
    },
    {
      number: "03",
      title: "Get Your Score",
      description:
        "Receive your ATS score and detailed resume performance report.",
    },
    {
      number: "04",
      title: "Improve & Apply",
      description:
        "Follow AI recommendations and improve your chances of getting hired.",
    },
  ];

  return (
    <section id="how-it-works" className="py-12 my-6 w-full flex justify-center border-t border-white/5">
      <div className="w-[85%] max-w-6xl mx-auto flex flex-col items-center">

        {/* Heading Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl md:text-5xl font-bold">
            How It Works
          </h2>
          <p className="mt-5 text-slate-400">
            Analyze your resume in four simple steps.
          </p>
        </div>

        {/* Steps Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full justify-center">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all flex flex-col items-start"
            >
              <span className="text-5xl font-black text-indigo-500/20">
                {step.number}
              </span>
              <h3 className="mt-5 text-xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-3 text-sm text-slate-400 leading-7">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;