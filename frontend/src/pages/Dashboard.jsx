import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";


// ============================================================
// API
// ============================================================

const API_BASE_URL = "http://localhost:5000";


// ============================================================
// DASHBOARD
// ============================================================

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================================
  // AUTH
  // ==========================================================

  const {
    user,
    token,
    loading: authLoading,
    logout,
  } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const [resumes, setResumes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const [successMessage, setSuccessMessage] =
    useState("");


  // ==========================================================
  // FETCH RESUMES
  // ==========================================================

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError("");

      // --------------------------------------------------------
      // TOKEN CHECK
      // --------------------------------------------------------

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      // --------------------------------------------------------
      // API REQUEST
      // --------------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/api/resumes`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // --------------------------------------------------------
      // RESPONSE CONTENT TYPE
      // --------------------------------------------------------

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      const data = await response.json();

      console.log(
        "Resume History Response:",
        data
      );

      // --------------------------------------------------------
      // AUTH ERROR
      // --------------------------------------------------------

      if (response.status === 401) {
        logout();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // --------------------------------------------------------
      // API ERROR
      // --------------------------------------------------------

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to fetch resume history."
        );
      }

      // --------------------------------------------------------
      // RESUME DATA
      // --------------------------------------------------------

      const resumeList =
        Array.isArray(data.resumes)
          ? data.resumes
          : [];

      setResumes(resumeList);

    } catch (err) {
      console.error(
        "Fetch resumes error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while loading resumes."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    fetchResumes();
  }, [token, authLoading]);


  // ==========================================================
  // SUCCESS MESSAGE FROM RESUME DETAILS
  // ==========================================================

  useEffect(() => {
    const message =
      location.state?.message;

    if (!message) {
      return;
    }

    setSuccessMessage(message);

    // Remove navigation state
    navigate(location.pathname, {
      replace: true,
      state: {},
    });

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [
    location,
    navigate,
  ]);


  // ==========================================================
  // DELETE RESUME
  // ==========================================================

  const handleDelete = async (resumeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(resumeId);
      setError("");

      // --------------------------------------------------------
      // TOKEN CHECK
      // --------------------------------------------------------

      if (!token) {
        logout();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // --------------------------------------------------------
      // DELETE REQUEST
      // --------------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/api/resumes/${resumeId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // --------------------------------------------------------
      // RESPONSE TYPE
      // --------------------------------------------------------

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      const data = await response.json();

      console.log(
        "Delete Resume Response:",
        data
      );

      // --------------------------------------------------------
      // AUTH ERROR
      // --------------------------------------------------------

      if (response.status === 401) {
        logout();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // --------------------------------------------------------
      // API ERROR
      // --------------------------------------------------------

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to delete resume."
        );
      }

      // --------------------------------------------------------
      // REMOVE FROM UI
      // --------------------------------------------------------

      setResumes((previousResumes) =>
        previousResumes.filter(
          (resume) =>
            resume._id !== resumeId
        )
      );

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      setSuccessMessage(
        "Resume deleted successfully."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);

    } catch (err) {
      console.error(
        "Delete resume error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete resume."
      );

    } finally {
      setDeletingId(null);
    }
  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "Unknown date";
    }
  };


  // ==========================================================
  // GET ATS SCORE
  // ==========================================================

  const getATSScore = (resume) => {
    const score =
      resume?.analysis?.atsScore ??
      resume?.analysis?.score ??
      resume?.atsScore ??
      0;

    const numericScore =
      Number(score);

    if (!Number.isFinite(numericScore)) {
      return 0;
    }

    return Math.min(
      Math.max(numericScore, 0),
      100
    );
  };


  // ==========================================================
  // GET SCORE COLOR
  // ==========================================================

  const getScoreColor = (score) => {
    if (score >= 80) {
      return "text-emerald-400";
    }

    if (score >= 60) {
      return "text-amber-400";
    }

    return "text-red-400";
  };


  // ==========================================================
  // GET SCORE LABEL
  // ==========================================================

  const getScoreLabel = (score) => {
    if (score >= 80) {
      return "Excellent";
    }

    if (score >= 60) {
      return "Good";
    }

    if (score >= 40) {
      return "Needs Improvement";
    }

    return "Needs Work";
  };


  // ==========================================================
  // TOTAL RESUMES
  // ==========================================================

  const totalResumes =
    resumes.length;


  // ==========================================================
  // AVERAGE SCORE
  // ==========================================================

  const averageScore =
    totalResumes > 0
      ? Math.round(
          resumes.reduce(
            (total, resume) =>
              total +
              getATSScore(resume),
            0
          ) / totalResumes
        )
      : 0;


  // ==========================================================
  // BEST SCORE
  // ==========================================================

  const bestScore =
    totalResumes > 0
      ? Math.max(
          ...resumes.map(
            (resume) =>
              getATSScore(resume)
          )
        )
      : 0;


  // ==========================================================
  // AUTH LOADING
  // ==========================================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div
            className="
              w-12
              h-12
              border-4
              border-white/10
              border-t-indigo-500
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p className="mt-5 text-sm text-slate-400">
            Checking authentication...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // LOADING UI
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <Navbar />

        <main
          className="
            w-[90%]
            md:w-[85%]
            lg:w-[80%]
            max-w-7xl
            mx-auto
            py-16
          "
        >

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              min-h-[50vh]
            "
          >

            <div
              className="
                w-12
                h-12
                border-4
                border-white/10
                border-t-indigo-500
                rounded-full
                animate-spin
              "
            />

            <p
              className="
                mt-5
                text-slate-400
                text-sm
              "
            >
              Loading your resumes...
            </p>

          </div>

        </main>

      </div>
    );
  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
        overflow-x-hidden
      "
    >

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <Navbar />


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main
        className="
          w-[90%]
          md:w-[85%]
          lg:w-[80%]
          max-w-7xl
          mx-auto
          py-12
          md:py-16
        "
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-end
            md:justify-between
            gap-6
          "
        >

          <div>

            <p
              className="
                text-xs
                md:text-sm
                uppercase
                tracking-[0.2em]
                font-semibold
                text-indigo-400
              "
            >
              Dashboard
            </p>

            <h1
              className="
                mt-3
                text-3xl
                sm:text-4xl
                md:text-5xl
                font-bold
                text-white
              "
            >
              Your Resume Dashboard
            </h1>

            <p
              className="
                mt-4
                text-sm
                md:text-base
                text-slate-400
                max-w-2xl
                leading-7
              "
            >
              {user?.name
                ? `Welcome back, ${user.name}. `
                : ""}
              Manage your analyzed resumes,
              review ATS scores and improve
              your resume performance.
            </p>

          </div>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={fetchResumes}
              className="
                inline-flex
                items-center
                justify-center
                px-5
                py-3.5
                rounded-xl
                border
                border-white/10
                bg-white/5
                hover:bg-white/10
                text-white
                font-semibold
                transition
              "
            >
              ↻ Refresh
            </button>

            <Link
              to="/analyzer"
              className="
                inline-flex
                items-center
                justify-center
                px-6
                py-3.5
                rounded-xl
                bg-indigo-600
                hover:bg-indigo-500
                text-white
                font-semibold
                transition
                shadow-xl
                shadow-indigo-600/20
              "
            >
              Analyze New Resume →
            </Link>

          </div>

        </div>


        {/* ====================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {successMessage && (
          <div
            className="
              mt-8
              p-4
              rounded-2xl
              border
              border-emerald-500/20
              bg-emerald-500/10
              text-emerald-400
              text-sm
            "
          >
            ✓ {successMessage}
          </div>
        )}


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
              mt-8
              p-4
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/10
              text-red-400
              text-sm
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={fetchResumes}
              className="
                px-4
                py-2
                rounded-lg
                bg-red-500/10
                border
                border-red-500/20
                text-red-300
                hover:bg-red-500/20
                transition
                cursor-pointer
                flex-shrink-0
              "
            >
              Retry
            </button>

          </div>
        )}


        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-4
            mt-10
          "
        >

          <DashboardStat
            label="Total Resumes"
            value={totalResumes}
            icon="📄"
          />

          <DashboardStat
            label="Average ATS Score"
            value={`${averageScore}/100`}
            icon="📊"
          />

          <DashboardStat
            label="Best ATS Score"
            value={`${bestScore}/100`}
            icon="🏆"
          />

        </div>


        {/* ====================================================
            RESUME HISTORY
        ==================================================== */}

        <section className="mt-12">

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              mb-6
            "
          >

            <div>

              <h2
                className="
                  text-xl
                  md:text-2xl
                  font-bold
                  text-white
                "
              >
                Resume History
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Your previously analyzed resumes.
              </p>

            </div>

          </div>


          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {resumes.length === 0 && (
            <div
              className="
                rounded-3xl
                border
                border-white/10
                bg-white/[0.03]
                p-10
                md:p-16
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  w-20
                  h-20
                  rounded-2xl
                  bg-indigo-500/10
                  border
                  border-indigo-500/10
                  flex
                  items-center
                  justify-center
                  text-4xl
                "
              >
                📄
              </div>

              <h3
                className="
                  mt-6
                  text-xl
                  md:text-2xl
                  font-bold
                  text-white
                "
              >
                No resumes analyzed yet
              </h3>

              <p
                className="
                  mt-3
                  text-sm
                  text-slate-500
                  max-w-md
                  mx-auto
                  leading-6
                "
              >
                Upload your first resume to
                receive an ATS score and detailed
                improvement recommendations.
              </p>

              <Link
                to="/analyzer"
                className="
                  inline-flex
                  mt-7
                  px-6
                  py-3
                  rounded-xl
                  bg-indigo-600
                  hover:bg-indigo-500
                  text-white
                  font-semibold
                  transition
                "
              >
                Analyze Your First Resume
              </Link>

            </div>
          )}


          {/* ==================================================
              RESUME CARDS
          ================================================== */}

          {resumes.length > 0 && (
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-5
              "
            >

              {resumes.map((resume) => {

                const score =
                  getATSScore(resume);

                const isDeleting =
                  deletingId === resume._id;

                return (
                  <div
                    key={resume._id}
                    className="
                      rounded-3xl
                      border
                      border-white/10
                      bg-white/[0.03]
                      hover:bg-white/[0.05]
                      transition
                      overflow-hidden
                    "
                  >

                    {/* ========================================
                        CARD TOP
                    ======================================== */}

                    <div className="p-6">

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >

                        <div className="min-w-0">

                          <div
                            className="
                              w-11
                              h-11
                              rounded-xl
                              bg-indigo-500/10
                              border
                              border-indigo-500/10
                              flex
                              items-center
                              justify-center
                              text-xl
                            "
                          >
                            📄
                          </div>

                          <h3
                            className="
                              mt-4
                              text-base
                              font-semibold
                              text-white
                              truncate
                            "
                            title={
                              resume.originalName
                            }
                          >
                            {resume.originalName ||
                              resume.filename ||
                              "Resume"}
                          </h3>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-slate-500
                            "
                          >
                            Analyzed on{" "}
                            {formatDate(
                              resume.createdAt
                            )}
                          </p>

                        </div>


                        {/* =====================================
                            ATS SCORE
                        ===================================== */}

                        <div
                          className="
                            flex-shrink-0
                            text-right
                          "
                        >

                          <p
                            className="
                              text-[10px]
                              uppercase
                              tracking-widest
                              text-slate-600
                            "
                          >
                            ATS
                          </p>

                          <p
                            className={`
                              mt-1
                              text-3xl
                              font-bold
                              ${getScoreColor(score)}
                            `}
                          >
                            {score}
                          </p>

                          <p
                            className={`
                              mt-0.5
                              text-[10px]
                              ${getScoreColor(score)}
                            `}
                          >
                            {getScoreLabel(score)}
                          </p>

                        </div>

                      </div>


                      {/* ========================================
                          SCORE BAR
                      ======================================== */}

                      <div
                        className="
                          mt-6
                          w-full
                          h-2
                          rounded-full
                          bg-white/10
                          overflow-hidden
                        "
                      >

                        <div
                          className="
                            h-full
                            bg-indigo-500
                            rounded-full
                            transition-all
                            duration-700
                          "
                          style={{
                            width: `${score}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* ========================================
                        CARD FOOTER
                    ======================================== */}

                    <div
                      className="
                        px-6
                        py-4
                        border-t
                        border-white/5
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      <Link
                        to={`/resume/${resume._id}`}
                        className="
                          text-sm
                          font-semibold
                          text-indigo-400
                          hover:text-indigo-300
                          transition
                        "
                      >
                        View Details →
                      </Link>


                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            resume._id
                          )
                        }
                        disabled={isDeleting}
                        className="
                          text-sm
                          text-red-400
                          hover:text-red-300
                          transition
                          cursor-pointer
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}


// ============================================================
// DASHBOARD STAT
// ============================================================

function DashboardStat({
  label,
  value,
  icon,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        p-5
        md:p-6
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

        <div>

          <p
            className="
              text-xs
              uppercase
              tracking-widest
              text-slate-500
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2
              text-2xl
              md:text-3xl
              font-bold
              text-white
            "
          >
            {value}
          </p>

        </div>

        <div
          className="
            w-11
            h-11
            rounded-xl
            bg-indigo-500/10
            border
            border-indigo-500/10
            flex
            items-center
            justify-center
            text-xl
          "
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


export default Dashboard;