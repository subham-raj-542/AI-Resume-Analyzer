function Stats() {
  const stats = [
    { number: "98%", label: "ATS Compatibility" },
    { number: "10K+", label: "Resumes Analyzed" },
    { number: "95%", label: "User Satisfaction" },
    { number: "24/7", label: "AI Assistance" },
  ];

  return (
    <section className="my-12 py-6 w-full flex justify-center">
      <div className="w-[85%] max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-indigo-400">
                {stat.number}
              </h3>
              <p className="text-sm text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;