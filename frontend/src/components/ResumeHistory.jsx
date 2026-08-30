
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// ============================================================
// RESUME HISTORY
// ============================================================
//
// RESPONSIBILITY:
//
// ✅ Fetch logged-in user's resumes
// ✅ Show saved resumes
// ✅ Select active resume
// ✅ Replace existing resume
// ✅ Delete resume
// ✅ Persist selectedResumeId
//
// This component does NOT handle:
//
// ❌ Job Match
// ❌ Resume Customization
// ❌ PDF generation
// ❌ Resume tailoring
//
// ============================================================

function ResumeHistory() {
  const {
    token,
    isAuthenticated,
  } = useAuth();

  const fileInputRef =
    useRef(null);

  const [
    resumes,
    setResumes,
  ] = useState([]);

  const [
    selectedResumeId,
    setSelectedResumeId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState("");

  const [
    selectedUpdateResumeId,
    setSelectedUpdateResumeId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ============================================================
  // GET STORED SELECTED RESUME
  // ============================================================

  const getStoredSelectedResumeId =
    () => {
      return (
        localStorage.getItem(
          "selectedResumeId"
        ) ||
        localStorage.getItem(
          "resumeId"
        ) ||
        ""
      ).trim();
    };

  // ============================================================
  // SAVE SELECTED RESUME
  // ============================================================

  const selectResume = (
    id,
    resume
  ) => {
    const cleanId =
      String(
        id || ""
      ).trim();

    if (!cleanId) {
      return;
    }

    localStorage.setItem(
      "selectedResumeId",
      cleanId
    );

    localStorage.setItem(
      "resumeId",
      cleanId
    );

    setSelectedResumeId(
      cleanId
    );

    // Let other components know.
    window.dispatchEvent(
      new CustomEvent(
        "resume-selection-changed",
        {
          detail: {
            resumeId:
              cleanId,
            _id:
              cleanId,
            resume,
          },
        }
      )
    );

    setSuccess(
      "Resume selected successfully."
    );

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  };

  // ============================================================
  // FETCH RESUMES
  // ============================================================

  const fetchResumes =
    async () => {
      if (
        !token ||
        !isAuthenticated
      ) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "Server returned an invalid response."
          );
        }

        const data =
          await response.json();

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            data?.message ||
              "Your login session has expired."
          );
        }

        if (
          !response.ok ||
          data?.success === false
        ) {
          throw new Error(
            data?.message ||
              "Unable to load your resumes."
          );
        }

        let list = [];

        if (
          Array.isArray(
            data?.resumes
          )
        ) {
          list =
            data.resumes;
        } else if (
          Array.isArray(data)
        ) {
          list = data;
        } else if (
          Array.isArray(
            data?.data
          )
        ) {
          list =
            data.data;
        }

        const sorted =
          [...list].sort(
            (a, b) =>
              new Date(
                b?.updatedAt ||
                  b?.createdAt ||
                  0
              ).getTime() -
              new Date(
                a?.updatedAt ||
                  a?.createdAt ||
                  0
              ).getTime()
          );

        setResumes(
          sorted
        );

        // --------------------------------------------------------
        // RESTORE ACTIVE RESUME
        // --------------------------------------------------------

        const storedId =
          getStoredSelectedResumeId();

        const storedExists =
          storedId &&
          sorted.some(
            (resume) =>
              getResumeId(
                resume
              ) === storedId
          );

        if (
          storedExists
        ) {
          setSelectedResumeId(
            storedId
          );
        } else if (
          sorted.length > 0
        ) {
          const firstId =
            getResumeId(
              sorted[0]
            );

          if (
            firstId
          ) {
            selectResume(
              firstId,
              sorted[0]
            );
          }
        } else {
          localStorage.removeItem(
            "selectedResumeId"
          );

          localStorage.removeItem(
            "resumeId"
          );

          setSelectedResumeId(
            ""
          );
        }
      } catch (
        err
      ) {
        console.error(
          "Resume history error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load resume history."
        );
      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchResumes();
  }, [
    token,
    isAuthenticated,
  ]);

  // ============================================================
  // SELECT RESUME
  // ============================================================

  const handleSelectResume =
    (resume) => {
      const id =
        getResumeId(
          resume
        );

      if (!id) {
        setError(
          "This resume does not have a valid ID."
        );

        return;
      }

      selectResume(
        id,
        resume
      );
    };

  // ============================================================
  // DELETE RESUME
  // ============================================================

  const handleDeleteResume =
    async (resume) => {
      const id =
        getResumeId(
          resume
        );

      if (!id) {
        return;
      }

      const name =
        getResumeName(
          resume
        );

      const confirmed =
        window.confirm(
          `Delete "${name}"?\n\nThis cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          id
        );

        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes/${id}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let data = {};

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          data =
            await response.json();
        }

        if (
          !response.ok ||
          data?.success === false
        ) {
          throw new Error(
            data?.message ||
              "Unable to delete resume."
          );
        }

        const wasSelected =
          selectedResumeId === id;

        setResumes(
          (current) =>
            current.filter(
              (item) =>
                getResumeId(
                  item
                ) !== id
            )
        );

        if (
          wasSelected
        ) {
          localStorage.removeItem(
            "selectedResumeId"
          );

          localStorage.removeItem(
            "resumeId"
          );

          const remaining =
            resumes.filter(
              (item) =>
                getResumeId(
                  item
                ) !== id
            );

          const nextResume =
            remaining[0];

          if (
            nextResume
          ) {
            const nextId =
              getResumeId(
                nextResume
              );

            selectResume(
              nextId,
              nextResume
            );
          } else {
            setSelectedResumeId(
              ""
            );

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

        setSuccess(
          "Resume deleted successfully."
        );
      } catch (
        err
      ) {
        console.error(
          "Delete resume error:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete resume."
        );
      } finally {
        setDeletingId(
          ""
        );
      }
    };

  // ============================================================
  // START UPDATE
  // ============================================================

  const handleUpdateClick =
    (resume) => {
      const id =
        getResumeId(
          resume
        );

      if (!id) {
        setError(
          "This resume does not have a valid ID."
        );

        return;
      }

      setSelectedUpdateResumeId(
        id
      );

      fileInputRef.current?.click();
    };

  // ============================================================
  // UPDATE / REPLACE RESUME
  // ============================================================

  const handleUpdateResume =
    async (
      event
    ) => {
      const newFile =
        event.target.files?.[0];

      event.target.value =
        "";

      const id =
        selectedUpdateResumeId;

      if (
        !newFile ||
        !id
      ) {
        return;
      }

      // --------------------------------------------------------
      // VALIDATE PDF
      // --------------------------------------------------------

      const isPDF =
        newFile.type ===
          "application/pdf" ||
        newFile.name
          ?.toLowerCase()
          .endsWith(
            ".pdf"
          );

      if (!isPDF) {
        setError(
          "Only PDF resume files are allowed."
        );

        return;
      }

      const maxSize =
        10 * 1024 * 1024;

      if (
        newFile.size >
        maxSize
      ) {
        setError(
          "Resume file must be smaller than 10 MB."
        );

        return;
      }

      try {
        setUpdatingId(
          id
        );

        setError("");
        setSuccess("");

        const formData =
          new FormData();

        formData.append(
          "resume",
          newFile
        );

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes/${id}`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body:
                formData,
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let data = {};

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          data =
            await response.json();
        }

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            data?.message ||
              "Your login session has expired."
          );
        }

        if (
          !response.ok ||
          data?.success === false
        ) {
          throw new Error(
            data?.message ||
              "Unable to update resume."
          );
        }

        // ------------------------------------------------------
        // REFRESH LIST
        // ------------------------------------------------------

        await fetchResumes();

        const updatedResume =
          data?.resume;

        const updatedId =
          getResumeId(
            updatedResume
          ) || id;

        localStorage.setItem(
          "selectedResumeId",
          updatedId
        );

        localStorage.setItem(
          "resumeId",
          updatedId
        );

        setSelectedResumeId(
          updatedId
        );

        window.dispatchEvent(
          new CustomEvent(
            "resume-selection-changed",
            {
              detail: {
                resumeId:
                  updatedId,
                _id:
                  updatedId,
                resume:
                  updatedResume,
              },
            }
          )
        );

        setSuccess(
          "Resume replaced and re-analyzed successfully."
        );
      } catch (
        err
      ) {
        console.error(
          "Update resume error:",
          err
        );

        setError(
          err?.message ||
            "Unable to update resume."
        );
      } finally {
        setUpdatingId(
          ""
        );

        setSelectedUpdateResumeId(
          ""
        );
      }
    };

  // ============================================================
  // EMPTY / AUTH STATE
  // ============================================================

  if (
    !isAuthenticated ||
    !token
  ) {
    return (
      <div
        className="
          relative
          mx-auto
          w-[92%]
          max-w-6xl
          py-2
        "
      >
        <div
          className="
            rounded-[30px]
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
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-indigo-500/10
              text-xl
            "
          >
            🔒
          </div>

          <h3
            className="
              mt-5
              text-xl
              font-bold
              text-white
            "
          >
            Login to view your resumes
          </h3>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              leading-6
              text-slate-500
            "
          >
            Your saved resumes are private and
            available only to your authenticated
            account.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <section
      id="resume-history"
      className="
        relative
        w-full
        py-2
      "
    >
      {/* BACKGROUND */}

      <div
        className="
          pointer-events-none
          absolute
          -top-20
          right-[5%]
          h-72
          w-72
          rounded-full
          bg-cyan-500/[0.04]
          blur-[120px]
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          w-[92%]
          max-w-6xl
        "
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <div>
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
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.03]
                  text-[10px]
                  font-bold
                  text-slate-500
                "
              >
                08
              </span>

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-cyan-300
                "
              >
                Resume History
              </p>
            </div>

            <h2
              className="
                mt-3
                text-3xl
                font-bold
                tracking-[-0.03em]
                text-white
                md:text-4xl
              "
            >
              Your saved resumes.
            </h2>

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
              Keep multiple resume versions,
              choose the one you want to work with,
              replace an existing file, or remove an
              old version.
            </p>
          </div>

          <button
            type="button"
            onClick={
              fetchResumes
            }
            disabled={
              loading
            }
            className="
              w-fit
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.02]
              px-4
              py-2.5
              text-xs
              font-semibold
              text-slate-400
              transition
              hover:bg-white/[0.05]
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ====================================================
            INSTRUCTION
        ==================================================== */}

        <div
          className="
            mt-7
            rounded-2xl
            border
            border-cyan-500/[0.08]
            bg-cyan-500/[0.025]
            p-4
            md:p-5
          "
        >
          <div
            className="
              flex
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
                bg-cyan-500/10
                text-xs
                text-cyan-300
              "
            >
              ℹ
            </span>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                How to use your resume history
              </p>

              <p
                className="
                  mt-1.5
                  text-xs
                  leading-6
                  text-slate-500
                  md:text-sm
                "
              >
                Select a resume to make it your
                active resume. Use Replace to upload
                a newer PDF while keeping the same
                saved resume entry.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {error && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-red-500/10
              bg-red-500/[0.04]
              px-4
              py-3
              text-sm
              text-red-300
            "
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-emerald-500/10
              bg-emerald-500/[0.04]
              px-4
              py-3
              text-sm
              text-emerald-300
            "
          >
            ✓ {success}
          </div>
        )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading &&
          resumes.length ===
            0 && (
            <div
              className="
                mt-6
                rounded-[28px]
                border
                border-white/[0.07]
                bg-white/[0.02]
                p-10
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-2
                  border-white/[0.08]
                  border-t-cyan-300
                "
              />

              <p
                className="
                  mt-4
                  text-sm
                  text-slate-500
                "
              >
                Loading your resumes...
              </p>
            </div>
          )}

        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          resumes.length ===
            0 && (
            <div
              className="
                mt-6
                rounded-[28px]
                border
                border-white/[0.07]
                bg-white/[0.02]
                p-10
                text-center
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
                📄
              </div>

              <h3
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-white
                "
              >
                No saved resumes yet
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Upload a resume above and it will
                appear here automatically.
              </p>
            </div>
          )}

        {/* ====================================================
            RESUME LIST
        ==================================================== */}

        {resumes.length >
          0 && (
          <div
            className="
              mt-6
              grid
              gap-4
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

                const isSelected =
                  id ===
                  selectedResumeId;

                const name =
                  getResumeName(
                    resume
                  );

                const size =
                  formatFileSize(
                    Number(
                      resume?.fileSize ||
                        0
                    )
                  );

                const updatedAt =
                  formatDate(
                    resume?.updatedAt ||
                      resume?.createdAt
                  );

                const status =
                  String(
                    resume?.status ||
                      ""
                  ).toLowerCase();

                const atsScore =
                  Number(
                    resume?.analysis
                      ?.atsScore ??
                      resume?.analysis
                        ?.score ??
                      0
                  );

                return (
                  <article
                    key={
                      id ||
                      `${name}-${index}`
                    }
                    className={`
                      rounded-[26px]
                      border
                      p-5
                      md:p-6
                      transition
                      ${
                        isSelected
                          ? "border-cyan-400/20 bg-cyan-500/[0.035] shadow-xl shadow-cyan-500/[0.03]"
                          : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.025]"
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-5
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                      "
                    >
                      {/* LEFT */}

                      <div
                        className="
                          flex
                          min-w-0
                          items-start
                          gap-4
                        "
                      >
                        <div
                          className={`
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            ${
                              isSelected
                                ? "bg-cyan-500/10 text-cyan-300"
                                : "bg-white/[0.03] text-slate-500"
                            }
                          `}
                        >
                          📄
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
                            <h3
                              className="
                                max-w-[400px]
                                truncate
                                text-base
                                font-semibold
                                text-white
                              "
                            >
                              {
                                name
                              }
                            </h3>

                            {isSelected && (
                              <span
                                className="
                                  rounded-full
                                  border
                                  border-cyan-400/15
                                  bg-cyan-500/10
                                  px-2
                                  py-1
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  text-cyan-300
                                "
                              >
                                Active
                              </span>
                            )}
                          </div>

                          <div
                            className="
                              mt-2
                              flex
                              flex-wrap
                              gap-x-4
                              gap-y-1
                              text-xs
                              text-slate-600
                            "
                          >
                            <span>
                              {size}
                            </span>

                            <span>
                              Updated{" "}
                              {updatedAt}
                            </span>

                            {status && (
                              <span
                                className={
                                  status ===
                                  "analyzed"
                                    ? "text-emerald-400/70"
                                    : ""
                                }
                              >
                                {status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}

                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        {atsScore >
                          0 && (
                          <div
                            className="
                              mr-1
                              rounded-xl
                              border
                              border-white/[0.06]
                              bg-white/[0.02]
                              px-3
                              py-2
                              text-center
                            "
                          >
                            <p
                              className="
                                text-[9px]
                                uppercase
                                tracking-widest
                                text-slate-700
                              "
                            >
                              ATS
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-sm
                                font-bold
                                text-white
                              "
                            >
                              {Math.min(
                                Math.max(
                                  atsScore,
                                  0
                                ),
                                100
                              )}
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectResume(
                              resume
                            )
                          }
                          disabled={
                            isSelected
                          }
                          className="
                            rounded-xl
                            bg-white
                            px-4
                            py-2.5
                            text-xs
                            font-bold
                            text-slate-950
                            transition
                            hover:bg-slate-100
                            disabled:cursor-default
                            disabled:bg-cyan-500/10
                            disabled:text-cyan-300
                          "
                        >
                          {isSelected
                            ? "Selected"
                            : "Select"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateClick(
                              resume
                            )
                          }
                          disabled={
                            updatingId ===
                              id ||
                            deletingId ===
                              id
                          }
                          className="
                            rounded-xl
                            border
                            border-white/[0.07]
                            bg-white/[0.02]
                            px-4
                            py-2.5
                            text-xs
                            font-semibold
                            text-slate-400
                            transition
                            hover:bg-white/[0.05]
                            hover:text-white
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          {updatingId ===
                          id
                            ? "Replacing..."
                            : "Replace"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteResume(
                              resume
                            )
                          }
                          disabled={
                            deletingId ===
                              id ||
                            updatingId ===
                              id
                          }
                          className="
                            rounded-xl
                            border
                            border-red-500/10
                            bg-red-500/[0.03]
                            px-4
                            py-2.5
                            text-xs
                            font-semibold
                            text-red-300
                            transition
                            hover:bg-red-500/[0.08]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          {deletingId ===
                          id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {/* HIDDEN REPLACE INPUT */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={
            handleUpdateResume
          }
        />
      </div>
    </section>
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

function getResumeName(
  resume
) {
  return (
    String(
      resume?.originalName ||
        resume?.filename ||
        resume?.fileName ||
        "Resume.pdf"
    ).trim() ||
    "Resume.pdf"
  );
}

function formatFileSize(
  bytes
) {
  if (
    !bytes ||
    Number.isNaN(bytes)
  ) {
    return "Unknown size";
  }

  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function formatDate(
  value
) {
  if (!value) {
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
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default ResumeHistory;

