function Hero() {
  return (
    <section id="home" className="relative overflow-hidden mt-12 w-full flex justify-center">
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[140px]" />

      <div className="w-[85%] max-w-6xl mx-auto relative">
        <div className="min-h-[550px] flex flex-col items-center justify-center text-center">

          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 text-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Resume Analyzer
          </div>

          {/* Heading */}
          <h1 className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            Build a Resume That
            <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Gets You Hired
            </span>
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-2xl text-base md:text-lg text-slate-400 leading-8">
            Upload your resume and let our AI analyze your ATS score,
            skills, experience, keywords and give you personalized
            recommendations to improve your chances of getting hired.
          </p>

          {/* Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-5">
            <a
              href="#analyzer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5 transition-all"
            >
              Analyze My Resume →
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold transition-all"
            >
              See How It Works
            </a>
          </div>

          {/* Trust */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <span>✓ Free Analysis</span>
            <span>✓ ATS Friendly</span>
            <span>✓ AI Suggestions</span>
            <span>✓ Secure</span>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero