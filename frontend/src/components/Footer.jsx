function Footer() {
  return (
    <footer className="border-t border-white/10">

      <div className="w-[80%] mx-auto">

        <div className="py-16 grid md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-2">

            <a
              href="#home"
              className="inline-flex items-center gap-3"
            >

              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
                AI
              </div>

              <h2 className="font-bold text-xl">
                Resume<span className="text-indigo-400">AI</span>
              </h2>

            </a>

            <p className="mt-6 max-w-md text-sm text-slate-500 leading-7">
              AI-powered resume analysis designed to help job seekers
              create stronger, ATS-friendly resumes and improve their
              chances of getting hired.
            </p>

          </div>

          {/* Product */}
          <div>

            <h3 className="font-semibold">
              Product
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-500">

              <a href="#features" className="hover:text-white">
                Features
              </a>

              <a href="#analyzer" className="hover:text-white">
                Resume Analyzer
              </a>

              <a href="#how-it-works" className="hover:text-white">
                How It Works
              </a>

            </div>

          </div>

          {/* Company */}
          <div>

            <h3 className="font-semibold">
              Company
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-500">

              <a href="#" className="hover:text-white">
                About
              </a>

              <a href="#" className="hover:text-white">
                Contact
              </a>

              <a href="#" className="hover:text-white">
                Privacy
              </a>

            </div>

          </div>

        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-3 text-sm text-slate-600">

          <p>
            © 2026 ResumeAI. All rights reserved.
          </p>

          <p>
            Built with ❤️ and AI
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;