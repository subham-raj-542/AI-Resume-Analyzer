function Testimonials() {
  const testimonials = [
    {
      name: "Subham Raj",
      role: "Software Developer",
      text: "The AI suggestions helped me identify important keywords that were missing from my resume.",
    },
    {
      name: "Ravi Singh",
      role: "Computer Science Student",
      text: "The ATS score made it incredibly easy to understand where my resume needed improvement.",
    },
    {
      name: "Ankit Raj",
      role: "Frontend Developer",
      text: "The job matching feature is extremely useful when applying for different companies.",
    },
  ];

  return (
    <section className="py-6 my-12 w-full flex justify-center border-t border-white/5">
      <div className="w-[85%] max-w-6xl mx-auto flex flex-col items-center">

        {/* Heading Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            User Reviews
          </p>
          <h2 className="text-3xl md:text-5xl font-bold">
            Loved By Job Seekers
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full justify-center">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-yellow-400 tracking-wider">
                  ★★★★★
                </div>
                <p className="mt-5 text-slate-400 leading-7">
                  "{testimonial.text}"
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <p className="font-semibold text-white">
                  {testimonial.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Testimonials;