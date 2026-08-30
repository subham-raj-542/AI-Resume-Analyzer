
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";

import {
  useAuth,
} from "../context/AuthContext";

import API_BASE_URL from "../api/apiConfig";

// ============================================================
// RESUME DASHBOARD
// ============================================================
//
// RESPONSIBILITY:
//
// ✅ Fetch all saved resumes of logged-in user
// ✅ Show resume history
// ✅ Show ATS score
// ✅ Show grade
// ✅ Show upload/update date
// ✅ Open resume details
// ✅ Edit / re-analyze resume
// ✅ Delete resume
// ✅ Keep selected resume synchronized
//
// ============================================================

function ResumeDashboard() {
  const navigate =
    useNavigate();

  const {
    token,
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    resumes,
    setResumes,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const [
    selectedResumeId,
    setSelectedResumeId,
  ] = useState(() =>
    getStoredResumeId()
  );

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken =
    useCallback(() => {
      const contextToken =
        String(
          token || ""
        ).trim();

      if (
        contextToken
      ) {
        return contextToken;
      }

      try {
        return String(
          localStorage.getItem(
            "token"
          ) || ""
        ).trim();
      } catch (
        storageError
      ) {
        console.error(
          "Unable to read token from localStorage:",
          storageError
        );

        return "";
      }
    }, [token]);

  // ==========================================================
  // FETCH ALL RESUMES
  // ==========================================================

  const fetchResumes =
    useCallback(
      async ({
        initial = false,
      } = {}) => {
        try {
          if (
            initial
          ) {
            setLoading(true);
          } else {
            setRefreshing(
              true
            );
          }

          setError("");

          const authToken =
            getToken();

          // ----------------------------------------------------
          // AUTH CHECK
          // ----------------------------------------------------

          if (
            !authToken ||
            !isAuthenticated
          ) {
            setResumes([]);

            setError(
              "Please login to view your saved resumes."
            );

            return;
          }

          // ----------------------------------------------------
          // REQUEST
          // ----------------------------------------------------

          const response =
            await fetch(
              `${API_BASE_URL}/api/resumes`,
              {
                method:
                  "GET",

                headers: {
                  Authorization:
                    `Bearer ${authToken}`,
                },
              }
            );

          // ----------------------------------------------------
          // RESPONSE TYPE
          // ----------------------------------------------------

          const contentType =
            response.headers.get(
              "content-type"
            ) || "";

          let data =
            {};

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
                "Resume list JSON parse error:",
                parseError
              );

              throw new Error(
                "Server returned invalid JSON."
              );
            }
          } else {
            const responseText =
              await response.text();

            console.error(
              "Resume list non-JSON response:",
              responseText
            );

            throw new Error(
              `Server returned ${response.status} instead of JSON.`
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
                "Your login session has expired. Please login again."
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
                "Unable to fetch your resumes."
            );
          }

          // ----------------------------------------------------
          // RESOLVE ARRAY
          // ----------------------------------------------------

          let resumeList =
            [];

          if (
            Array.isArray(
              data
            )
          ) {
            resumeList =
              data;
          } else if (
            Array.isArray(
              data?.resumes
            )
          ) {
            resumeList =
              data.resumes;
          } else if (
            Array.isArray(
              data?.data
            )
          ) {
            resumeList =
              data.data;
          } else if (
            Array.isArray(
              data?.data?.resumes
            )
          ) {
            resumeList =
              data.data.resumes;
          }

          // ----------------------------------------------------
          // SORT NEWEST FIRST
          // ----------------------------------------------------

          const sortedResumes =
            [...resumeList].sort(
              (
                a,
                b
              ) =>
                getTimestamp(
                  b?.updatedAt ||
                    b?.createdAt
                ) -
                getTimestamp(
                  a?.updatedAt ||
                    a?.createdAt
                )
            );

          setResumes(
            sortedResumes
          );

          // ----------------------------------------------------
          // SELECT ACTIVE RESUME
          // ----------------------------------------------------

          const storedId =
            getStoredResumeId();

          const storedResume =
            storedId
              ? sortedResumes.find(
                  (resume) =>
                    getResumeId(
                      resume
                    ) ===
                    storedId
                )
              : null;

          if (
            storedResume
          ) {
            const id =
              getResumeId(
                storedResume
              );

            if (
              id
            ) {
              setSelectedResumeId(
                id
              );
            }
          } else if (
            sortedResumes.length >
            0
          ) {
            const latestId =
              getResumeId(
                sortedResumes[0]
              );

            if (
              latestId
            ) {
              setSelectedResumeId(
                latestId
              );

              saveSelectedResumeId(
                latestId
              );

              window.dispatchEvent(
                new CustomEvent(
                  "resume-selection-changed",
                  {
                    detail: {
                      resumeId:
                        latestId,

                      resume:
                        sortedResumes[0],
                    },
                  }
                )
              );
            }
          } else {
            setSelectedResumeId(
              ""
            );

            clearStoredResumeId();

            window.dispatchEvent(
              new CustomEvent(
                "resume-selection-changed",
                {
                  detail: {
                    resumeId:
                      "",
                  },
                }
              )
            );
          }
        } catch (
          fetchError
        ) {
          console.error(
            "Resume dashboard fetch error:",
            fetchError
          );

          setError(
            fetchError?.message ||
              "Unable to load your resumes."
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      [
        getToken,
        isAuthenticated,
      ]
    );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (
      authLoading
    ) {
      return;
    }

    fetchResumes({
      initial: true,
    });
  }, [
    authLoading,
    fetchResumes,
  ]);

  // ==========================================================
  // LISTEN FOR RESUME SELECTION
  // ==========================================================

  useEffect(() => {
    const handleSelection =
      (event) => {
        const id =
          String(
            event?.detail?.resumeId ||
              event?.detail?._id ||
              event?.detail?.id ||
              ""
          ).trim();

        setSelectedResumeId(
          id
        );
      };

    window.addEventListener(
      "resume-selection-changed",
      handleSelection
    );

    return () => {
      window.removeEventListener(
        "resume-selection-changed",
        handleSelection
      );
    };
  }, []);

  // ==========================================================
  // SELECT RESUME
  // ==========================================================

  const handleSelectResume =
    (resume) => {
      const id =
        getResumeId(
          resume
        );

      if (
        !id
      ) {
        return;
      }

      setSelectedResumeId(
        id
      );

      saveSelectedResumeId(
        id
      );

      window.dispatchEvent(
        new CustomEvent(
          "resume-selection-changed",
          {
            detail: {
              resumeId:
                id,

              _id:
                id,

              id:
                id,

              resume,
            },
          }
        )
      );
    };

  // ==========================================================
  // OPEN RESUME
  // ==========================================================

  const handleOpenResume =
    (resume) => {
      const id =
        getResumeId(
          resume
        );

      if (
        !id
      ) {
        return;
      }

      handleSelectResume(
        resume
      );

      navigate(
        `/resumes/${id}`
      );
    };

  // ==========================================================
  // EDIT RESUME
  // ==========================================================

  const handleEditResume =
    (resume) => {
      const id =
        getResumeId(
          resume
        );

      if (
        !id
      ) {
        return;
      }

      handleSelectResume(
        resume
      );

      navigate(
        `/resumes/${id}/edit`
      );
    };

  // ==========================================================
  // DELETE RESUME
  // ==========================================================

  const handleDeleteResume =
    async (resume) => {
      const id =
        getResumeId(
          resume
        );

      if (
        !id ||
        deletingId
      ) {
        return;
      }

      const fileName =
        resume?.originalName ||
        resume?.fileName ||
        "this resume";

      const confirmed =
        window.confirm(
          `Delete "${fileName}"?\n\nThis will permanently remove the saved resume and its uploaded PDF.`
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        setDeletingId(
          id
        );

        setError("");

        const authToken =
          getToken();

        // ------------------------------------------------------
        // TOKEN CHECK
        // ------------------------------------------------------

        if (
          !authToken
        ) {
          throw new Error(
            "Authentication token is missing. Please login again."
          );
        }

        if (
          !isAuthenticated
        ) {
          throw new Error(
            "Your login session is no longer active. Please login again."
          );
        }

        console.log(
          "DELETE RESUME DEBUG:",
          {
            resumeId:
              id,

            tokenExists:
              Boolean(
                authToken
              ),

            tokenLength:
              authToken.length,

            isAuthenticated:
              isAuthenticated,

            endpoint:
              `${API_BASE_URL}/api/resumes/${id}`,
          }
        );

        // ------------------------------------------------------
        // DELETE REQUEST
        // ------------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes/${encodeURIComponent(
              id
            )}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${authToken}`,
              },
            }
          );

        // ------------------------------------------------------
        // RESPONSE
        // ------------------------------------------------------

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let data =
          {};

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
              "Delete JSON parse error:",
              parseError
            );

            throw new Error(
              "Server returned invalid JSON."
            );
          }
        } else {
          const responseText =
            await response.text();

          console.error(
            "Delete non-JSON response:",
            responseText
          );

          throw new Error(
            `Server returned ${response.status} instead of JSON.`
          );
        }

        console.log(
          "DELETE RESUME RESPONSE:",
          {
            status:
              response.status,

            data,
          }
        );

        // ------------------------------------------------------
        // AUTH ERROR
        // ------------------------------------------------------

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            data?.message ||
              "Your login session has expired. Please login again."
          );
        }

        // ------------------------------------------------------
        // API ERROR
        // ------------------------------------------------------

        if (
          !response.ok ||
          data?.success ===
            false
        ) {
          throw new Error(
            data?.message ||
              "Unable to delete resume."
          );
        }

        // ------------------------------------------------------
        // REMAINING RESUMES
        // ------------------------------------------------------

        const remaining =
          resumes.filter(
            (item) =>
              getResumeId(
                item
              ) !== id
          );

        // ------------------------------------------------------
        // UPDATE UI
        // ------------------------------------------------------

        setResumes(
          remaining
        );

        // ------------------------------------------------------
        // HANDLE ACTIVE SELECTION
        // ------------------------------------------------------

        if (
          selectedResumeId ===
          id
        ) {
          const nextResume =
            remaining[0] ||
            null;

          if (
            nextResume
          ) {
            const nextId =
              getResumeId(
                nextResume
              );

            if (
              nextId
            ) {
              setSelectedResumeId(
                nextId
              );

              saveSelectedResumeId(
                nextId
              );

              window.dispatchEvent(
                new CustomEvent(
                  "resume-selection-changed",
                  {
                    detail: {
                      resumeId:
                        nextId,

                      resume:
                        nextResume,
                    },
                  }
                )
              );
            }
          } else {
            setSelectedResumeId(
              ""
            );

            clearStoredResumeId();

            window.dispatchEvent(
              new CustomEvent(
                "resume-selection-changed",
                {
                  detail: {
                    resumeId:
                      "",
                  },
                }
              )
            );
          }
        }

        setError("");

        console.log(
          "✅ Resume deleted successfully:",
          id
        );
      } catch (
        deleteError
      ) {
        console.error(
          "Delete resume error:",
          deleteError
        );

        setError(
          deleteError?.message ||
            "Unable to delete resume."
        );
      } finally {
        setDeletingId(
          ""
        );
      }
    };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    () => {
      if (
        deletingId
      ) {
        return;
      }

      fetchResumes({
        initial:
          false,
      });
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    authLoading ||
    loading
  ) {
    return (
      <DashboardShell>
        <div
          className="
            min-h-[70vh]
            flex
            items-center
            justify-center
            py-20
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-[28px]
              border
              border-white/[0.08]
              bg-white/[0.02]
              p-8
              text-center
            "
          >
            <div
              className="
                mx-auto
                h-12
                w-12
                animate-spin
                rounded-full
                border-2
                border-indigo-400/20
                border-t-indigo-400
              "
            />

            <p
              className="
                mt-5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-indigo-300
              "
            >
              AI Resume Analyzer
            </p>

            <h2
              className="
                mt-2
                text-xl
                font-bold
                text-white
              "
            >
              Loading your resumes
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              Fetching your saved resume history.
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <DashboardShell>
      {/* ======================================================
          HEADER
      ======================================================= */}

      <section
        className="
          px-[5%]
          pb-8
          pt-12
          sm:px-[7%]
          lg:px-[10%]
          md:pt-16
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
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-indigo-400
                "
              >
                My Resumes
              </p>

              <h1
                className="
                  mt-3
                  text-4xl
                  font-black
                  tracking-[-0.04em]
                  text-white
                  sm:text-5xl
                "
              >
                Your resume library.
              </h1>

              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-500
                  md:text-base
                "
              >
                View, analyze, edit and customize the resumes
                saved to your account.
              </p>

              {user?.name && (
                <p
                  className="
                    mt-3
                    text-xs
                    text-slate-600
                  "
                >
                  Signed in as{" "}
                  <span
                    className="
                      text-slate-400
                    "
                  >
                    {user.name}
                  </span>
                </p>
              )}
            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >
              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  refreshing ||
                  Boolean(
                    deletingId
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-slate-300
                  transition
                  hover:bg-white/[0.05]
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {refreshing ? (
                  <>
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/20
                        border-t-white
                      "
                    />

                    Refreshing...
                  </>
                ) : (
                  <>
                    ↻ Refresh
                  </>
                )}
              </button>

              <Link
                to="/analyzer"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-500
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-indigo-500/10
                  transition
                  hover:bg-indigo-400
                "
              >
                + Upload New Resume
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <section
          className="
            px-[5%]
            pb-5
            sm:px-[7%]
            lg:px-[10%]
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              rounded-2xl
              border
              border-red-500/15
              bg-red-500/[0.05]
              px-5
              py-4
              text-sm
              leading-6
              text-red-300
            "
          >
            ⚠️ {error}
          </div>
        </section>
      )}

      {/* ======================================================
          SUMMARY STATS
      ======================================================= */}

      <section
        className="
          px-[5%]
          pb-6
          sm:px-[7%]
          lg:px-[10%]
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-7xl
            grid-cols-1
            gap-4
            sm:grid-cols-3
          "
        >
          <DashboardStat
            label="Saved Resumes"
            value={
              resumes.length
            }
            icon="📄"
          />

          <DashboardStat
            label="Analyzed"
            value={
              resumes.filter(
                (resume) =>
                  resume?.status ===
                    "analyzed" ||
                  Number(
                    resume?.atsScore
                  ) > 0
              ).length
            }
            icon="✓"
          />

          <DashboardStat
            label="Average ATS"
            value={
              resumes.length >
              0
                ? `${Math.round(
                    resumes.reduce(
                      (
                        total,
                        resume
                      ) =>
                        total +
                        normalizeScore(
                          resume?.atsScore
                        ),
                      0
                    ) /
                      resumes.length
                  )}%`
                : "0%"
            }
            icon="🎯"
          />
        </div>
      </section>

      {/* ======================================================
          RESUME LIST
      ======================================================= */}

      <section
        className="
          px-[5%]
          pb-20
          sm:px-[7%]
          lg:px-[10%]
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
          "
        >
          {resumes.length ===
          0 ? (
            <EmptyResumeState />
          ) : (
            <div
              className="
                grid
                grid-cols-1
                gap-5
                lg:grid-cols-2
              "
            >
              {resumes.map(
                (
                  resume,
                  index
                ) => {
                  const id =
                    getResumeId(
                      resume
                    );

                  const score =
                    normalizeScore(
                      resume?.atsScore ??
                        resume
                          ?.analysis
                          ?.atsScore
                    );

                  const grade =
                    resume?.grade ||
                    resume?.analysis
                      ?.grade ||
                    "—";

                  const fileName =
                    resume?.originalName ||
                    resume?.fileName ||
                    "Saved Resume";

                  const isSelected =
                    id &&
                    id ===
                      selectedResumeId;

                  const isDeleting =
                    deletingId === id;

                  return (
                    <ResumeCard
                      key={
                        id ||
                        `${fileName}-${index}`
                      }
                      resume={
                        resume
                      }
                      score={
                        score
                      }
                      grade={
                        grade
                      }
                      fileName={
                        fileName
                      }
                      selected={
                        isSelected
                      }
                      deleting={
                        isDeleting
                      }
                      onSelect={
                        handleSelectResume
                      }
                      onOpen={
                        handleOpenResume
                      }
                      onEdit={
                        handleEditResume
                      }
                      onDelete={
                        handleDeleteResume
                      }
                    />
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}

// ============================================================
// DASHBOARD SHELL
// ============================================================

function DashboardShell({
  children,
}) {
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
        {children}
      </main>

      <Footer />
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
        rounded-[24px]
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
        <div>
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-600
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-black
              text-white
            "
          >
            {value}
          </p>
        </div>

        <span
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-indigo-500/[0.08]
            text-lg
          "
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// RESUME CARD
// ============================================================

function ResumeCard({
  resume,
  score,
  grade,
  fileName,
  selected,
  deleting,
  onSelect,
  onOpen,
  onEdit,
  onDelete,
}) {
  const createdAt =
    formatDate(
      resume?.createdAt
    );

  const updatedAt =
    formatDate(
      resume?.updatedAt
    );

  const status =
    resume?.status ||
    "uploaded";

  const fileSize =
    formatFileSize(
      resume?.fileSize
    );

  return (
    <article
      className={`
        overflow-hidden
        rounded-[28px]
        border
        bg-white/[0.02]
        transition
        ${
          selected
            ? "border-indigo-400/20 shadow-xl shadow-indigo-500/[0.05]"
            : "border-white/[0.07]"
        }
      `}
    >
      {/* ====================================================
          TOP
      ==================================================== */}

      <div
        className="
          p-5
          md:p-6
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              min-w-0
              items-start
              gap-4
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-red-500/[0.08]
                text-xl
              "
            >
              📕
            </div>

            <div
              className="
                min-w-0
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <h2
                  className="
                    max-w-[420px]
                    truncate
                    text-base
                    font-bold
                    text-white
                  "
                  title={
                    fileName
                  }
                >
                  {fileName}
                </h2>

                {selected && (
                  <span
                    className="
                      rounded-full
                      border
                      border-indigo-400/10
                      bg-indigo-500/[0.08]
                      px-2
                      py-1
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-indigo-300
                    "
                  >
                    Selected
                  </span>
                )}
              </div>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-center
                  gap-x-3
                  gap-y-1
                  text-[11px]
                  text-slate-600
                "
              >
                <span>
                  Uploaded {createdAt}
                </span>

                {updatedAt !==
                  createdAt && (
                  <span>
                    Updated {updatedAt}
                  </span>
                )}

                <span>
                  {fileSize}
                </span>
              </div>
            </div>
          </div>

          {/* ATS */}

          <div
            className="
              shrink-0
              text-right
            "
          >
            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-slate-600
              "
            >
              ATS
            </p>

            <p
              className="
                mt-1
                text-3xl
                font-black
                text-indigo-300
              "
            >
              {score}
            </p>

            <p
              className="
                text-[10px]
                text-slate-600
              "
            >
              Grade {grade}
            </p>
          </div>
        </div>

        {/* ==================================================
            PROGRESS
        =================================================== */}

        <div
          className="
            mt-5
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
            "
            style={{
              width:
                `${score}%`,
            }}
          />
        </div>

        {/* ==================================================
            STATUS
        =================================================== */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <span
            className={`
              rounded-full
              border
              px-2.5
              py-1
              text-[9px]
              font-bold
              uppercase
              tracking-[0.12em]
              ${
                status ===
                "analyzed"
                  ? "border-emerald-500/10 bg-emerald-500/[0.05] text-emerald-300"
                  : status ===
                    "failed"
                  ? "border-red-500/10 bg-red-500/[0.05] text-red-300"
                  : "border-amber-500/10 bg-amber-500/[0.05] text-amber-300"
              }
            `}
          >
            {status}
          </span>

          <span
            className="
              text-[10px]
              text-slate-700
            "
          >
            Resume ID:{" "}
            {shortenId(
              getResumeId(
                resume
              )
            )}
          </span>
        </div>
      </div>

      {/* ====================================================
          ACTIONS
      ==================================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-px
          border-t
          border-white/[0.06]
          bg-white/[0.06]
          sm:grid-cols-4
        "
      >
        <DashboardAction
          label={
            selected
              ? "Selected"
              : "Select"
          }
          onClick={() =>
            onSelect(
              resume
            )
          }
          disabled={
            selected ||
            deleting
          }
        />

        <DashboardAction
          label="Open"
          onClick={() =>
            onOpen(
              resume
            )
          }
          disabled={
            deleting
          }
        />

        <DashboardAction
          label="Edit"
          onClick={() =>
            onEdit(
              resume
            )
          }
          disabled={
            deleting
          }
        />

        <DashboardAction
          label={
            deleting
              ? "Deleting..."
              : "Delete"
          }
          onClick={() =>
            onDelete(
              resume
            )
          }
          danger
          disabled={
            deleting
          }
        />
      </div>
    </article>
  );
}

// ============================================================
// DASHBOARD ACTION
// ============================================================

function DashboardAction({
  label,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className={`
        min-h-12
        bg-slate-950
        px-3
        py-3
        text-xs
        font-semibold
        transition
        ${
          danger
            ? "text-red-400 hover:bg-red-500/[0.05]"
            : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
        }
        disabled:cursor-not-allowed
        disabled:opacity-40
      `}
    >
      {label}
    </button>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyResumeState() {
  return (
    <div
      className="
        rounded-[30px]
        border
        border-dashed
        border-white/[0.08]
        bg-white/[0.015]
        px-6
        py-16
        text-center
        md:px-10
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
          bg-indigo-500/[0.08]
          text-2xl
        "
      >
        📄
      </div>

      <h2
        className="
          mt-5
          text-2xl
          font-bold
          text-white
        "
      >
        No saved resumes yet
      </h2>

      <p
        className="
          mx-auto
          mt-3
          max-w-xl
          text-sm
          leading-7
          text-slate-600
        "
      >
        Upload your first PDF resume from the analyzer.
        Once it is analyzed, it will appear here.
      </p>

      <Link
        to="/analyzer"
        className="
          mt-7
          inline-flex
          items-center
          justify-center
          rounded-2xl
          bg-indigo-500
          px-6
          py-3.5
          text-sm
          font-bold
          text-white
          transition
          hover:bg-indigo-400
        "
      >
        Upload Resume →
      </Link>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function getResumeId(
  resume
) {
  return String(
    resume?._id ||
      resume?.id ||
      resume?.resumeId ||
      ""
  ).trim();
}

function getStoredResumeId() {
  try {
    return String(
      localStorage.getItem(
        "selectedResumeId"
      ) ||
        localStorage.getItem(
          "resumeId"
        ) ||
        ""
    ).trim();
  } catch {
    return "";
  }
}

function saveSelectedResumeId(
  id
) {
  const cleanId =
    String(
      id || ""
    ).trim();

  if (
    !cleanId
  ) {
    return;
  }

  try {
    localStorage.setItem(
      "selectedResumeId",
      cleanId
    );

    localStorage.setItem(
      "resumeId",
      cleanId
    );
  } catch (
    storageError
  ) {
    console.error(
      "Resume selection storage error:",
      storageError
    );
  }
}

function clearStoredResumeId() {
  try {
    localStorage.removeItem(
      "selectedResumeId"
    );

    localStorage.removeItem(
      "resumeId"
    );
  } catch (
    storageError
  ) {
    console.error(
      "Resume storage cleanup error:",
      storageError
    );
  }
}

function normalizeScore(
  value
) {
  const score =
    Number(value);

  if (
    !Number.isFinite(
      score
    )
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        score
      )
    )
  );
}

function getTimestamp(
  value
) {
  const timestamp =
    new Date(
      value || 0
    ).getTime();

  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;
}

function formatDate(
  value
) {
  if (
    !value
  ) {
    return "Unknown";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatFileSize(
  bytes
) {
  const value =
    Number(bytes);

  if (
    !Number.isFinite(
      value
    ) ||
    value <= 0
  ) {
    return "Size unavailable";
  }

  if (
    value < 1024
  ) {
    return `${value} B`;
  }

  if (
    value <
    1024 * 1024
  ) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    value /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function shortenId(
  id
) {
  const value =
    String(
      id || ""
    ).trim();

  if (
    value.length <= 12
  ) {
    return value || "—";
  }

  return `${value.slice(
    0,
    6
  )}...${value.slice(
    -4
  )}`;
}

// ============================================================
// EXPORT
// ============================================================

export default ResumeDashboard;

