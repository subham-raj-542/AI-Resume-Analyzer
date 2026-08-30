
import {
  useEffect,
  useRef,
  useState,
} from "react";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import API_BASE_URL from "../api/apiConfig";

// ============================================================
// CUSTOMIZE YOUR RESUME
// ============================================================
//
// RESPONSIBILITY:
//
// ✅ Use selected saved resume
// ✅ Accept job description
// ✅ Generate customized resume
// ✅ Re-generate with edited JD
// ✅ Show customization insights
// ✅ Show final resume preview
// ✅ Download PDF
//
// NOT HERE:
//
// ❌ Resume upload
// ❌ Job Match
// ❌ Resume History
// ❌ Resume Delete
//
// ============================================================

// ============================================================
// SAFE HELPERS
// ============================================================

function safeText(value = "") {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    return "";
  }

  return String(
    value
  ).trim();
}

function safeArray(value) {
  return Array.isArray(
    value
  )
    ? value
    : [];
}

function objectText(value) {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return safeText(
      value
    );
  }

  if (
    !value ||
    typeof value !== "object"
  ) {
    return "";
  }

  return safeText(
    value.text ||
      value.description ||
      value.content ||
      value.details ||
      value.name ||
      value.title ||
      value.value ||
      ""
  );
}

function getSkillText(skill) {
  return objectText(
    skill
  );
}

function getBulletText(bullet) {
  if (
    typeof bullet === "string"
  ) {
    return safeText(
      bullet
    );
  }

  if (
    !bullet ||
    typeof bullet !== "object"
  ) {
    return "";
  }

  return safeText(
    bullet.text ||
      bullet.description ||
      bullet.content ||
      bullet.details ||
      bullet.bullet ||
      bullet.point ||
      bullet.achievement ||
      bullet.responsibility ||
      ""
  );
}

function getCertificationText(
  item
) {
  if (
    typeof item === "string"
  ) {
    return safeText(
      item
    );
  }

  if (
    !item ||
    typeof item !== "object"
  ) {
    return "";
  }

  return safeText(
    item.name ||
      item.title ||
      item.text ||
      item.description ||
      item.certification ||
      ""
  );
}

function getAchievementText(
  item
) {
  if (
    typeof item === "string"
  ) {
    return safeText(
      item
    );
  }

  if (
    !item ||
    typeof item !== "object"
  ) {
    return "";
  }

  return safeText(
    item.text ||
      item.description ||
      item.title ||
      item.name ||
      item.achievement ||
      ""
  );
}

function getLanguageText(
  item
) {
  if (
    typeof item === "string"
  ) {
    return safeText(
      item
    );
  }

  if (
    !item ||
    typeof item !== "object"
  ) {
    return "";
  }

  const name =
    safeText(
      item.name ||
        item.language ||
        item.title ||
        ""
    );

  const level =
    safeText(
      item.level ||
        item.proficiency ||
        item.fluency ||
        ""
    );

  return [
    name,
    level,
  ]
    .filter(
      Boolean
    )
    .join(
      " - "
    );
}

function getHobbyText(
  item
) {
  if (
    typeof item === "string"
  ) {
    return safeText(
      item
    );
  }

  if (
    !item ||
    typeof item !== "object"
  ) {
    return "";
  }

  return safeText(
    item.name ||
      item.title ||
      item.text ||
      item.hobby ||
      ""
  );
}

// ============================================================
// PDF SAFE CLONE
// ============================================================
//
// Creates a PDF-safe clone of the visible resume.
//
// Tailwind v4 can generate oklch/oklab colors which can cause
// html2canvas rendering problems.
//
// The clone removes classes and copies safe computed styles.
//
// ============================================================

function createPdfSafeClone(
  sourceElement
) {
  const clone =
    sourceElement.cloneNode(
      true
    );

  const sourceNodes = [
    sourceElement,
    ...sourceElement.querySelectorAll(
      "*"
    ),
  ];

  const cloneNodes = [
    clone,
    ...clone.querySelectorAll(
      "*"
    ),
  ];

  const styleProperties = [
    "box-sizing",

    "display",
    "position",

    "top",
    "right",
    "bottom",
    "left",

    "width",
    "min-width",
    "max-width",

    "height",
    "min-height",
    "max-height",

    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",

    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",

    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "font-variant",

    "line-height",
    "letter-spacing",
    "text-align",
    "text-transform",
    "text-decoration",
    "text-indent",

    "text-overflow",
    "white-space",
    "word-break",
    "overflow-wrap",

    "color",

    "background-color",
    "background-image",
    "background-position",
    "background-size",
    "background-repeat",

    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",

    "border-top-style",
    "border-right-style",
    "border-bottom-style",
    "border-left-style",

    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",

    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",

    "flex-direction",
    "flex-wrap",
    "flex-grow",
    "flex-shrink",
    "flex-basis",

    "justify-content",
    "align-items",
    "align-content",
    "align-self",

    "gap",
    "row-gap",
    "column-gap",

    "grid-template-columns",
    "grid-template-rows",
    "grid-column",
    "grid-row",

    "list-style-type",
    "list-style-position",

    "vertical-align",

    "opacity",
    "object-fit",
    "object-position",
  ];

  sourceNodes.forEach(
    (
      sourceNode,
      index
    ) => {
      const cloneNode =
        cloneNodes[index];

      if (
        !sourceNode ||
        !cloneNode
      ) {
        return;
      }

      cloneNode.removeAttribute(
        "class"
      );

      if (
        cloneNode.tagName?.toLowerCase() ===
        "style"
      ) {
        cloneNode.remove();
        return;
      }

      const computed =
        window.getComputedStyle(
          sourceNode
        );

      styleProperties.forEach(
        (
          property
        ) => {
          const value =
            computed.getPropertyValue(
              property
            );

          if (
            !value
          ) {
            return;
          }

          if (
            /oklch|oklab/i.test(
              value
            )
          ) {
            return;
          }

          cloneNode.style.setProperty(
            property,
            value
          );
        }
      );

      cloneNode.style.setProperty(
        "box-shadow",
        "none"
      );

      cloneNode.style.setProperty(
        "filter",
        "none"
      );

      cloneNode.style.setProperty(
        "text-shadow",
        "none"
      );

      if (
        cloneNode.tagName?.toLowerCase() ===
        "img"
      ) {
        cloneNode.style.setProperty(
          "display",
          "block"
        );

        cloneNode.style.setProperty(
          "max-width",
          "100%"
        );

        cloneNode.style.setProperty(
          "height",
          "auto"
        );
      }
    }
  );

  clone
    .querySelectorAll(
      "style, link[rel='stylesheet']"
    )
    .forEach(
      (node) =>
        node.remove()
    );

  // ----------------------------------------------------------
  // ROOT
  // ----------------------------------------------------------

  clone.style.setProperty(
    "background",
    "#ffffff"
  );

  clone.style.setProperty(
    "background-color",
    "#ffffff"
  );

  clone.style.setProperty(
    "color",
    "#18181b"
  );

  clone.style.setProperty(
    "box-shadow",
    "none"
  );

  clone.style.setProperty(
    "filter",
    "none"
  );

  clone.style.setProperty(
    "overflow",
    "visible"
  );

  clone.style.setProperty(
    "width",
    "794px"
  );

  clone.style.setProperty(
    "min-width",
    "794px"
  );

  clone.style.setProperty(
    "max-width",
    "794px"
  );

  clone.style.setProperty(
    "min-height",
    "1123px"
  );

  clone.style.setProperty(
    "box-sizing",
    "border-box"
  );

  clone.style.setProperty(
    "margin",
    "0"
  );

  clone.style.setProperty(
    "padding",
    "0"
  );

  clone.style.setProperty(
    "overflow-wrap",
    "break-word"
  );

  clone.style.setProperty(
    "word-break",
    "break-word"
  );

  // ----------------------------------------------------------
  // FORCE CHILDREN TO STAY INSIDE 794px
  // ----------------------------------------------------------

  clone
    .querySelectorAll(
      "*"
    )
    .forEach(
      (node) => {
        node.style.setProperty(
          "box-sizing",
          "border-box"
        );

        node.style.setProperty(
          "max-width",
          "100%"
        );

        node.style.setProperty(
          "overflow-wrap",
          "break-word"
        );

        node.style.setProperty(
          "word-break",
          "break-word"
        );
      }
    );

  // ----------------------------------------------------------
  // FLEX CONTAINERS
  // ----------------------------------------------------------

  clone
    .querySelectorAll(
      ".flex"
    )
    .forEach(
      (node) => {
        node.style.setProperty(
          "max-width",
          "100%"
        );

        node.style.setProperty(
          "min-width",
          "0"
        );
      }
    );

  // ----------------------------------------------------------
  // LONG TEXT ELEMENTS
  // ----------------------------------------------------------

  clone
    .querySelectorAll(
      "p, h1, h2, h3, h4, span, li"
    )
    .forEach(
      (node) => {
        node.style.setProperty(
          "overflow-wrap",
          "break-word"
        );

        node.style.setProperty(
          "word-break",
          "break-word"
        );

        node.style.setProperty(
          "white-space",
          "normal"
        );
      }
    );

  return clone;
}

// ============================================================
// COMPONENT
// ============================================================

function TailoredResume({
  resumeText = "",
  resumeId = "",
}) {
  const [
    jobDescription,
    setJobDescription,
  ] = useState("");

  const [
    result,
    setResult,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    resolvedResumeId,
    setResolvedResumeId,
  ] = useState("");

  const [
    resolvingResume,
    setResolvingResume,
  ] = useState(true);

  const resumePreviewRef =
    useRef(null);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
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
        "Unable to read authentication token:",
        storageError
      );

      return "";
    }
  };

  // ==========================================================
  // RESUME ID
  // ==========================================================

  const getStoredResumeId = () => {
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
    } catch (
      storageError
    ) {
      console.error(
        "Unable to read stored resume ID:",
        storageError
      );

      return "";
    }
  };

  const extractResumeId = (
    resume
  ) => {
    return String(
      resume?._id ||
        resume?.id ||
        resume?.resumeId ||
        ""
    ).trim();
  };

  const saveResumeId = (
    id
  ) => {
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
        "Unable to save resume ID:",
        storageError
      );
    }

    setResolvedResumeId(
      cleanId
    );
  };

  // ==========================================================
  // RECOVER SAVED RESUME
  // ==========================================================

  const recoverResumeId =
    async () => {
      try {
        const token =
          getToken();

        if (
          !token
        ) {
          return "";
        }

        const response =
          await fetch(
            `${API_BASE_URL}/api/resumes`,
            {
              method:
                "GET",

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
          return "";
        }

        const data =
          await response.json();

        if (
          !response.ok ||
          data?.success ===
            false
        ) {
          return "";
        }

        let resumes =
          [];

        if (
          Array.isArray(
            data
          )
        ) {
          resumes =
            data;
        } else if (
          Array.isArray(
            data?.resumes
          )
        ) {
          resumes =
            data.resumes;
        } else if (
          Array.isArray(
            data?.data
          )
        ) {
          resumes =
            data.data;
        } else if (
          Array.isArray(
            data?.data?.resumes
          )
        ) {
          resumes =
            data.data.resumes;
        }

        if (
          resumes.length ===
          0
        ) {
          return "";
        }

        const storedId =
          getStoredResumeId();

        if (
          storedId
        ) {
          const storedResume =
            resumes.find(
              (
                item
              ) =>
                extractResumeId(
                  item
                ) ===
                storedId
            );

          if (
            storedResume
          ) {
            const id =
              extractResumeId(
                storedResume
              );

            if (
              id
            ) {
              saveResumeId(
                id
              );

              return id;
            }
          }
        }

        const sorted =
          [
            ...resumes,
          ].sort(
            (
              a,
              b
            ) =>
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

        const latestId =
          extractResumeId(
            sorted[0]
          );

        if (
          latestId
        ) {
          saveResumeId(
            latestId
          );

          return latestId;
        }

        return "";
      } catch (
        recoveryError
      ) {
        console.error(
          "Resume recovery error:",
          recoveryError
        );

        return "";
      }
    };

  // ==========================================================
  // INITIALIZE RESUME
  // ==========================================================

  useEffect(
    () => {
      let mounted =
        true;

      const initialize =
        async () => {
          try {
            const propId =
              String(
                resumeId || ""
              ).trim();

            const storedId =
              getStoredResumeId();

            const directId =
              propId ||
              storedId;

            if (
              directId
            ) {
              if (
                mounted
              ) {
                saveResumeId(
                  directId
                );

                setResolvingResume(
                  false
                );
              }

              return;
            }

            const recoveredId =
              await recoverResumeId();

            if (
              mounted
            ) {
              if (
                recoveredId
              ) {
                saveResumeId(
                  recoveredId
                );
              }

              setResolvingResume(
                false
              );
            }
          } catch (
            initializationError
          ) {
            console.error(
              "Resume initialization error:",
              initializationError
            );

            if (
              mounted
            ) {
              setResolvingResume(
                false
              );
            }
          }
        };

      initialize();

      return () => {
        mounted =
          false;
      };
    },
    [resumeId]
  );

  // ==========================================================
  // RESUME SELECTION EVENT
  // ==========================================================

  useEffect(
    () => {
      const handleSelection =
        (
          event
        ) => {
          const selectedId =
            String(
              event?.detail?.resumeId ||
                event?.detail?._id ||
                event?.detail?.id ||
                ""
            ).trim();

          if (
            selectedId
          ) {
            saveResumeId(
              selectedId
            );

            setResult(
              null
            );

            setError(
              ""
            );
          }
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
    },
    []
  );

  // ==========================================================
  // EXTRACT TAILORED RESULT
  // ==========================================================

  const extractTailoredResume =
    (data) => {
      if (
        data?.tailoredResume &&
        typeof data.tailoredResume ===
          "object"
      ) {
        return data.tailoredResume;
      }

      if (
        data?.result?.tailoredResume &&
        typeof data.result.tailoredResume ===
          "object"
      ) {
        return data.result.tailoredResume;
      }

      if (
        data?.result?.structuredResume &&
        typeof data.result.structuredResume ===
          "object"
      ) {
        return data.result.structuredResume;
      }

      if (
        data?.structuredResume &&
        typeof data.structuredResume ===
          "object"
      ) {
        return data.structuredResume;
      }

      if (
        data?.result &&
        typeof data.result ===
          "object" &&
        !Array.isArray(
          data.result
        )
      ) {
        return data.result;
      }

      return null;
    };

  // ==========================================================
  // CUSTOMIZE RESUME
  // ==========================================================

  const handleCustomize =
    async () => {
      setError("");

      const finalResumeId =
        String(
          resumeId ||
            resolvedResumeId ||
            getStoredResumeId() ||
            ""
        ).trim();

      const cleanedJobDescription =
        jobDescription.trim();

      // --------------------------------------------------------
      // RESUME CHECK
      // --------------------------------------------------------

      if (
        !finalResumeId
      ) {
        const recoveredId =
          await recoverResumeId();

        if (
          !recoveredId
        ) {
          setError(
            "Please upload or select a saved resume first."
          );

          return;
        }
      }

      // --------------------------------------------------------
      // JOB DESCRIPTION CHECK
      // --------------------------------------------------------

      if (
        !cleanedJobDescription
      ) {
        setError(
          "Please paste a job description first."
        );

        return;
      }

      if (
        cleanedJobDescription.length <
        20
      ) {
        setError(
          "Please enter a more complete job description."
        );

        return;
      }

      // --------------------------------------------------------
      // AUTH
      // --------------------------------------------------------

      const token =
        getToken();

      if (
        !token
      ) {
        setError(
          "Please login first."
        );

        return;
      }

      const activeResumeId =
        finalResumeId ||
        resolvedResumeId ||
        getStoredResumeId();

      if (
        !activeResumeId
      ) {
        setError(
          "No saved resume is selected."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        setResult(
          null
        );

        // ------------------------------------------------------
        // CURRENT CANONICAL CUSTOMIZATION API
        // ------------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/api/resume-tailor`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  resumeId:
                    activeResumeId,

                  resumeText:
                    typeof resumeText ===
                    "string"
                      ? resumeText
                      : "",

                  jobDescription:
                    cleanedJobDescription,
                }),
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
              "Customization JSON parse error:",
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
            "Customization non-JSON response:",
            responseText
          );

          throw new Error(
            `Server returned ${response.status} instead of JSON.`
          );
        }

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
              "Unable to customize your resume."
          );
        }

        // ------------------------------------------------------
        // RESULT
        // ------------------------------------------------------

        const tailoredResume =
          extractTailoredResume(
            data
          );

        if (
          !tailoredResume
        ) {
          throw new Error(
            "Customized resume data was not returned by the server."
          );
        }

        saveResumeId(
          data?.resumeId ||
            activeResumeId
        );

        setResult(
          tailoredResume
        );

        setError("");

        // ------------------------------------------------------
        // SCROLL TO RESULT
        // ------------------------------------------------------

        window.setTimeout(
          () => {
            document
              .getElementById(
                "customized-resume-result"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "start",
              });
          },
          100
        );
      } catch (
        customizationError
      ) {
        console.error(
          "Customize resume error:",
          customizationError
        );

        setError(
          customizationError?.message ||
            "Something went wrong while customizing your resume."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // ==========================================================
  // EDIT / NEW JD
  // ==========================================================

  const handleEditJob =
    () => {
      setResult(
        null
      );

      setError("");

      window.setTimeout(
        () => {
          document
            .getElementById(
              "customize-job-description"
            )
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "center",
            });

          document
            .getElementById(
              "customize-job-description"
            )
            ?.focus();
        },
        50
      );
    };

  const handleStartOver =
    () => {
      if (
        loading ||
        downloading
      ) {
        return;
      }

      setJobDescription(
        ""
      );

      setResult(
        null
      );

      setError("");

      window.setTimeout(
        () => {
          document
            .getElementById(
              "customize-job-description"
            )
            ?.focus();
        },
        0
      );
    };

  // ==========================================================
  // PDF DOWNLOAD
  // ==========================================================

  const handleDownloadPDF =
    async () => {
      const sourceElement =
        resumePreviewRef.current;

      if (
        !sourceElement
      ) {
        setError(
          "Resume preview is not available."
        );

        return;
      }

      let exportWrapper =
        null;

      try {
        setDownloading(
          true
        );

        setError("");

        // ------------------------------------------------------
        // WAIT FOR SCREEN PAINT
        // ------------------------------------------------------

        await new Promise(
          (
            resolve
          ) => {
            requestAnimationFrame(
              () => {
                requestAnimationFrame(
                  resolve
                );
              }
            );
          }
        );

        // ------------------------------------------------------
        // WAIT FOR FONTS
        // ------------------------------------------------------

        if (
          document.fonts?.ready
        ) {
          try {
            await document.fonts.ready;
          } catch {
            // Ignore font loading error.
          }
        }

        // ------------------------------------------------------
        // WAIT FOR IMAGES
        // ------------------------------------------------------

        const sourceImages =
          Array.from(
            sourceElement.querySelectorAll(
              "img"
            )
          );

        await Promise.all(
          sourceImages.map(
            (
              image
            ) =>
              new Promise(
                (
                  resolve
                ) => {
                  if (
                    image.complete
                  ) {
                    resolve();
                    return;
                  }

                  image.onload =
                    resolve;

                  image.onerror =
                    resolve;
                }
              )
          )
        );

        // ------------------------------------------------------
        // CREATE PDF SAFE CLONE
        // ------------------------------------------------------

        const safeClone =
          createPdfSafeClone(
            sourceElement
          );

        // ------------------------------------------------------
        // EXPORT WRAPPER
        // ------------------------------------------------------

        exportWrapper =
          document.createElement(
            "div"
          );

        exportWrapper.style.position =
          "fixed";

        exportWrapper.style.left =
          "-100000px";

        exportWrapper.style.top =
          "0";

        exportWrapper.style.width =
          "794px";

        exportWrapper.style.minWidth =
          "794px";

        exportWrapper.style.maxWidth =
          "794px";

        exportWrapper.style.margin =
          "0";

        exportWrapper.style.padding =
          "0";

        exportWrapper.style.background =
          "#ffffff";

        exportWrapper.style.overflow =
          "visible";

        exportWrapper.style.boxSizing =
          "border-box";

        exportWrapper.appendChild(
          safeClone
        );

        document.body.appendChild(
          exportWrapper
        );

        // ------------------------------------------------------
        // WAIT FOR CLONE PAINT
        // ------------------------------------------------------

        await new Promise(
          (
            resolve
          ) => {
            requestAnimationFrame(
              () => {
                requestAnimationFrame(
                  resolve
                );
              }
            );
          }
        );

        // ------------------------------------------------------
        // FORCE EXACT ROOT WIDTH
        // ------------------------------------------------------

        safeClone.style.width =
          "794px";

        safeClone.style.minWidth =
          "794px";

        safeClone.style.maxWidth =
          "794px";

        safeClone.style.overflow =
          "visible";

        // ------------------------------------------------------
        // GET RENDER DIMENSIONS
        // ------------------------------------------------------

        const renderWidth =
          794;

        const renderHeight =
          Math.max(
            safeClone.scrollHeight,
            safeClone.offsetHeight,
            safeClone.clientHeight,
            1123
          );

        console.log(
          "PDF render dimensions:",
          {
            width:
              renderWidth,

            height:
              renderHeight,
          }
        );

        // ------------------------------------------------------
        // RENDER HTML TO CANVAS
        // ------------------------------------------------------

        const canvas =
          await html2canvas(
            safeClone,
            {
              scale:
                2,

              useCORS:
                true,

              allowTaint:
                false,

              backgroundColor:
                "#ffffff",

              width:
                renderWidth,

              height:
                renderHeight,

              windowWidth:
                renderWidth,

              windowHeight:
                Math.max(
                  renderHeight,
                  1123
                ),

              scrollX:
                0,

              scrollY:
                0,

              logging:
                false,

              imageTimeout:
                15000,

              removeContainer:
                true,

              foreignObjectRendering:
                false,
            }
          );

        // ------------------------------------------------------
        // VALIDATE CANVAS
        // ------------------------------------------------------

        if (
          !canvas ||
          canvas.width <=
            0 ||
          canvas.height <=
            0
        ) {
          throw new Error(
            "Resume could not be rendered into a canvas."
          );
        }

        console.log(
          "Canvas dimensions:",
          {
            width:
              canvas.width,

            height:
              canvas.height,
          }
        );

        // ------------------------------------------------------
        // CREATE PDF
        // ------------------------------------------------------

        const pdf =
          new jsPDF({
            orientation:
              "portrait",

            unit:
              "mm",

            format:
              "a4",

            compress:
              true,

            putOnlyUsedFonts:
              true,
          });

        // ------------------------------------------------------
        // A4 SIZE
        // ------------------------------------------------------

        const pageWidth =
          210;

        const pageHeight =
          297;

        // ------------------------------------------------------
        // CANVAS → PDF RATIO
        // ------------------------------------------------------

        const canvasWidth =
          canvas.width;

        const canvasHeight =
          canvas.height;

        const pdfScale =
          pageWidth /
          canvasWidth;

        const pagePixelHeight =
          Math.floor(
            pageHeight /
              pdfScale
          );

        // ------------------------------------------------------
        // FILE NAME
        // ------------------------------------------------------

        const rawName =
          String(
            result?.name ||
              "customized-resume"
          ).trim();

        const filename =
          rawName
            .replace(
              /[^a-zA-Z0-9]+/g,
              "-"
            )
            .replace(
              /^-+|-+$/g,
              ""
            )
            .toLowerCase() ||
          "customized-resume";

        // ------------------------------------------------------
        // PAGE LOOP
        // ------------------------------------------------------

        let sourceY =
          0;

        let pageNumber =
          0;

        while (
          sourceY <
          canvasHeight
        ) {
          const remainingHeight =
            canvasHeight -
            sourceY;

          const currentSliceHeight =
            Math.min(
              pagePixelHeight,
              remainingHeight
            );

          // ----------------------------------------------------
          // CREATE PAGE CANVAS
          // ----------------------------------------------------

          const pageCanvas =
            document.createElement(
              "canvas"
            );

          pageCanvas.width =
            canvasWidth;

          pageCanvas.height =
            currentSliceHeight;

          const context =
            pageCanvas.getContext(
              "2d"
            );

          if (
            !context
          ) {
            throw new Error(
              "Could not create PDF page canvas."
            );
          }

          context.fillStyle =
            "#ffffff";

          context.fillRect(
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          // ----------------------------------------------------
          // COPY EXACT FULL-WIDTH SLICE
          // ----------------------------------------------------

          context.drawImage(
            canvas,

            0,
            sourceY,

            canvasWidth,
            currentSliceHeight,

            0,
            0,

            canvasWidth,
            currentSliceHeight
          );

          // ----------------------------------------------------
          // PAGE IMAGE
          // ----------------------------------------------------

          const pageImage =
            pageCanvas.toDataURL(
              "image/jpeg",
              0.97
            );

          // ----------------------------------------------------
          // ADD PAGE
          // ----------------------------------------------------

          if (
            pageNumber >
            0
          ) {
            pdf.addPage();
          }

          const currentPdfHeight =
            currentSliceHeight *
            pdfScale;

          pdf.addImage(
            pageImage,

            "JPEG",

            0,
            0,

            pageWidth,
            currentPdfHeight,

            undefined,
            "FAST"
          );

          sourceY +=
            currentSliceHeight;

          pageNumber++;

          console.log(
            `PDF page ${pageNumber} generated.`
          );
        }

        // ------------------------------------------------------
        // SAVE
        // ------------------------------------------------------

        pdf.save(
          `${filename}.pdf`
        );

        console.log(
          "✅ Customized resume PDF generated successfully."
        );
      } catch (
        pdfError
      ) {
        console.error(
          "PDF download error:",
          pdfError
        );

        setError(
          "Unable to download the resume PDF. Please try again."
        );
      } finally {
        if (
          exportWrapper?.parentNode
        ) {
          exportWrapper.parentNode.removeChild(
            exportWrapper
          );
        }

        setDownloading(
          false
        );
      }
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    resolvingResume
  ) {
    return (
      <section
        id="customize-resume"
        className="
          relative
          w-full
          scroll-mt-28
          py-20
          md:py-28
        "
      >
        <div
          className="
            mx-auto
            w-[92%]
            max-w-6xl
          "
        >
          <LoadingCard
            text="Preparing your resume workspace..."
          />
        </div>
      </section>
    );
  }

  // ==========================================================
  // RESULT
  // ==========================================================

  if (
    result
  ) {
    return (
      <CustomizedResumeResult
        result={
          result
        }
        jobDescription={
          jobDescription
        }
        downloading={
          downloading
        }
        onDownloadPDF={
          handleDownloadPDF
        }
        onEditJob={
          handleEditJob
        }
        onStartOver={
          handleStartOver
        }
        resumePreviewRef={
          resumePreviewRef
        }
        error={
          error
        }
      />
    );
  }

  // ==========================================================
  // INPUT
  // ==========================================================

  const hasResume =
    Boolean(
      resumeId ||
        resolvedResumeId ||
        getStoredResumeId()
    );

  const jdLength =
    jobDescription.trim().length;

  const validJobDescription =
    jdLength >= 20;

  return (
    <section
      id="customize-resume"
      className="
        relative
        w-full
        scroll-mt-28
        overflow-hidden
        py-20
        md:py-28
      "
    >
      {/* BACKGROUND */}

      <div
        className="
          pointer-events-none
          absolute
          -top-40
          left-1/2
          h-[400px]
          w-[600px]
          -translate-x-1/2
          rounded-full
          bg-violet-500/[0.05]
          blur-[150px]
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
        {/* HEADER */}

        <div
          className="
            mx-auto
            max-w-3xl
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
              border-violet-400/10
              bg-violet-500/[0.05]
              px-3.5
              py-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-violet-300
            "
          >
            <span>
              ✦
            </span>

            Customize Your Resume
          </span>

          <h2
            className="
              mt-5
              text-3xl
              font-bold
              tracking-[-0.04em]
              text-white
              sm:text-4xl
              md:text-5xl
            "
          >
            Make your resume fit the role.
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
            Paste the job description you're
            applying for. We'll reorganize and
            optimize your existing resume around
            the role without inventing experience
            or skills.
          </p>
        </div>

        {/* INSTRUCTIONS */}

        <div
          className="
            mx-auto
            mt-8
            grid
            max-w-4xl
            grid-cols-1
            gap-3
            md:grid-cols-3
          "
        >
          <InstructionCard
            number="01"
            title="Select your resume"
            text="Use an analyzed resume from your account."
          />

          <InstructionCard
            number="02"
            title="Paste the job description"
            text="Use the complete role requirements and responsibilities."
          />

          <InstructionCard
            number="03"
            title="Customize & download"
            text="Generate a focused version and export it as PDF."
          />
        </div>

        {/* RESUME STATUS */}

        <div
          className={`
            mx-auto
            mt-5
            max-w-4xl
            rounded-2xl
            border
            px-4
            py-4
            ${
              hasResume
                ? "border-emerald-500/10 bg-emerald-500/[0.025]"
                : "border-amber-500/10 bg-amber-500/[0.025]"
            }
          `}
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className={`
                h-2
                w-2
                rounded-full
                ${
                  hasResume
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }
              `}
            />

            <div>
              <p
                className="
                  text-xs
                  font-medium
                  text-slate-300
                  md:text-sm
                "
              >
                {hasResume
                  ? "Your saved resume is ready."
                  : "No saved resume is selected yet."}
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-slate-600
                  md:text-xs
                "
              >
                {hasResume
                  ? "This resume will be used as the source for customization."
                  : "Upload and analyze a resume above before continuing."}
              </p>
            </div>
          </div>
        </div>

        {/* INPUT CARD */}

        <div
          className="
            mx-auto
            mt-5
            max-w-4xl
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.08]
            bg-white/[0.02]
            shadow-2xl
            shadow-black/20
          "
        >
          <div
            className="
              p-5
              md:p-7
            "
          >
            <div
              className="
                flex
                items-end
                justify-between
                gap-4
              "
            >
              <div>
                <label
                  htmlFor="customize-job-description"
                  className="
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  Paste the job description
                </label>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  Include the role, responsibilities,
                  requirements and preferred skills.
                </p>
              </div>

              <span
                className="
                  shrink-0
                  text-[10px]
                  text-slate-700
                  md:text-xs
                "
              >
                {jdLength.toLocaleString(
                  "en-IN"
                )}{" "}
                chars
              </span>
            </div>

            <textarea
              id="customize-job-description"
              value={
                jobDescription
              }
              onChange={(
                event
              ) => {
                setJobDescription(
                  event.target.value
                );

                if (
                  error
                ) {
                  setError(
                    ""
                  );
                }
              }}
              disabled={
                loading
              }
              rows={
                14
              }
              placeholder={`Example:

Frontend Developer

Responsibilities:
• Build and maintain React applications
• Collaborate with engineering teams
• Improve application performance

Requirements:
• React
• JavaScript
• HTML / CSS
• REST APIs
• Git`}
              className="
                mt-4
                min-h-[320px]
                w-full
                resize-y
                rounded-[22px]
                border
                border-white/[0.07]
                bg-black/20
                px-5
                py-5
                text-sm
                leading-7
                text-slate-200
                outline-none
                placeholder:text-slate-700
                transition
                focus:border-violet-400/25
                focus:bg-violet-500/[0.015]
                focus:ring-4
                focus:ring-violet-500/[0.04]
                disabled:cursor-not-allowed
                disabled:opacity-50
                md:text-[15px]
              "
            />

            <div
              className="
                mt-3
                flex
                flex-col
                gap-1
                text-[11px]
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <span
                className={
                  validJobDescription
                    ? "text-emerald-400/70"
                    : "text-slate-600"
                }
              >
                {validJobDescription
                  ? "Job description is ready."
                  : "Enter at least 20 characters."}
              </span>

              <span
                className="
                  text-slate-700
                "
              >
                Existing experience only • No fake skills
              </span>
            </div>

            {error && (
              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-red-500/10
                  bg-red-500/[0.04]
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-red-300
                "
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="button"
              onClick={
                handleCustomize
              }
              disabled={
                loading ||
                !hasResume ||
                !validJobDescription
              }
              className="
                mt-6
                flex
                min-h-14
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-violet-500
                px-6
                py-4
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-violet-500/10
                transition
                hover:-translate-y-0.5
                hover:bg-violet-400
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {loading ? (
                <>
                  <span
                    className="
                      h-5
                      w-5
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />

                  Customizing your resume...
                </>
              ) : (
                <>
                  ✦ Customize My Resume

                  <span>
                    →
                  </span>
                </>
              )}
            </button>

            <p
              className="
                mt-3
                text-center
                text-[10px]
                text-slate-700
              "
            >
              You can edit the job description
              and regenerate as many times as needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CUSTOMIZED RESULT
// ============================================================

function CustomizedResumeResult({
  result,
  jobDescription,
  downloading,
  onDownloadPDF,
  onEditJob,
  onStartOver,
  resumePreviewRef,
  error,
}) {
  const metadata =
    result?.metadata ||
    {};

  const requiredSkills =
    safeArray(
      metadata.requiredSkills
    );

  const matchedSkills =
    safeArray(
      metadata.matchedSkills
    );

  const missingSkills =
    safeArray(
      metadata.missingSkills
    );

  const matchedKeywords =
    safeArray(
      metadata.matchedKeywords
    );

  const missingKeywords =
    safeArray(
      metadata.missingKeywords
    );

  const skills =
    safeArray(
      result?.skills
    );

  const experience =
    safeArray(
      result?.experience
    );

  const projects =
    safeArray(
      result?.projects
    );

  const education =
    safeArray(
      result?.education
    );

  const certifications =
    safeArray(
      result?.certifications
    );

  const achievements =
    safeArray(
      result?.achievements
    );

  const languages =
    safeArray(
      result?.languages
    );

  const hobbies =
    safeArray(
      result?.hobbies
    );

  // ==========================================================
  // SCORES
  // ==========================================================

  const calculatedSkillScore =
    requiredSkills.length >
    0
      ? Math.round(
          (
            matchedSkills.length /
            requiredSkills.length
          ) *
            100
        )
      : 0;

  const skillScore =
    Number(
      result?.skillScore
    ) ||
    calculatedSkillScore;

  const keywordTotal =
    matchedKeywords.length +
    missingKeywords.length;

  const calculatedKeywordScore =
    keywordTotal >
    0
      ? Math.round(
          (
            matchedKeywords.length /
            keywordTotal
          ) *
            100
        )
      : 0;

  const keywordScore =
    Number(
      result?.keywordScore
    ) ||
    calculatedKeywordScore;

  const experienceScore =
    experience.length >
    0
      ? Math.min(
          100,
          experience.length *
            25
        )
      : 0;

  const roleScore =
    skillScore >= 80
      ? 100
      : skillScore >= 60
      ? 80
      : skillScore >= 40
      ? 60
      : skillScore;

  const calculatedMatchScore =
    Math.round(
      (
        skillScore +
        keywordScore +
        experienceScore +
        roleScore
      ) / 4
    );

  const serverScore =
    Number(
      result?.tailoringScore
    ) || 0;

  const matchScore =
    Math.min(
      100,
      Math.max(
        0,
        serverScore ||
          calculatedMatchScore
      )
    );

  const matchLevel =
    matchScore >= 85
      ? "Excellent alignment"
      : matchScore >= 70
      ? "Strong alignment"
      : matchScore >= 50
      ? "Moderate alignment"
      : "Needs improvement";

  // ==========================================================
  // PERSONAL DATA
  // ==========================================================

  const name =
    safeText(
      result?.name
    ) ||
    "Your Name";

  const email =
    safeText(
      result?.email
    );

  const phone =
    safeText(
      result?.phone
    );

  const location =
    safeText(
      result?.location
    );

  const linkedin =
    safeText(
      result?.linkedin
    );

  const github =
    safeText(
      result?.github
    );

  const portfolio =
    safeText(
      result?.portfolio
    );

  const website =
    safeText(
      result?.website
    );

  const summary =
    safeText(
      result?.summary
    );

  const objective =
    safeText(
      result?.objective
    );

  const profile =
    safeText(
      result?.profile
    );

  return (
    <section
      id="customized-resume-result"
      className="
        relative
        w-full
        scroll-mt-28
        overflow-hidden
        py-20
        md:py-28
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -top-40
          left-1/2
          h-[380px]
          w-[600px]
          -translate-x-1/2
          rounded-full
          bg-emerald-500/[0.035]
          blur-[150px]
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          w-[92%]
          max-w-7xl
        "
      >
        {/* RESULT HEADER */}

        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-500/10
                bg-emerald-500/[0.04]
                px-3.5
                py-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.17em]
                text-emerald-300
              "
            >
              <span>
                ✓
              </span>

              Customization Complete
            </span>

            <h2
              className="
                mt-4
                text-3xl
                font-bold
                tracking-[-0.04em]
                text-white
                md:text-5xl
              "
            >
              Your customized resume.
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
              Your existing resume has been
              reorganized and prioritized for the
              job description you provided.
            </p>
          </div>

          {/* ACTIONS */}

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
                onEditJob
              }
              className="
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
              "
            >
              Edit Job Description
            </button>

            <button
              type="button"
              onClick={
                onDownloadPDF
              }
              disabled={
                downloading
              }
              className="
                rounded-xl
                bg-white
                px-5
                py-3
                text-sm
                font-bold
                text-slate-950
                transition
                hover:bg-slate-100
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {downloading
                ? "Generating PDF..."
                : "Download PDF ↓"}
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="
              mt-5
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

        {/* JOB SUMMARY */}

        <div
          className="
            mt-6
            rounded-[26px]
            border
            border-violet-500/10
            bg-violet-500/[0.025]
            p-5
            md:p-6
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-violet-500/10
                text-sm
                text-violet-300
              "
            >
              JD
            </span>

            <div className="min-w-0">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-violet-300
                "
              >
                Target job
              </p>

              <p
                className="
                  mt-2
                  line-clamp-3
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                {jobDescription}
              </p>
            </div>
          </div>
        </div>

        {/* SCORE OVERVIEW */}

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            lg:grid-cols-5
          "
        >
          <ScoreCard
            title="Overall"
            value={
              matchScore
            }
          />

          <ScoreCard
            title="Skills"
            value={
              Math.min(
                100,
                Math.max(
                  0,
                  skillScore
                )
              )
            }
          />

          <ScoreCard
            title="Keywords"
            value={
              Math.min(
                100,
                Math.max(
                  0,
                  keywordScore
                )
              )
            }
          />

          <ScoreCard
            title="Experience"
            value={
              Math.min(
                100,
                Math.max(
                  0,
                  experienceScore
                )
              )
            }
          />

          <ScoreCard
            title="Role Fit"
            value={
              Math.min(
                100,
                Math.max(
                  0,
                  roleScore
                )
              )
            }
          />
        </div>

        {/* ALIGNMENT */}

        <div
          className="
            mt-5
            rounded-[28px]
            border
            border-white/[0.07]
            bg-white/[0.02]
            p-6
            md:p-7
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-indigo-300
                "
              >
                Job alignment
              </p>

              <h3
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-white
                "
              >
                {matchLevel}
              </h3>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                The customized version prioritizes
                the most relevant parts of your
                existing background.
              </p>
            </div>

            <div
              className="
                shrink-0
                rounded-2xl
                border
                border-indigo-400/10
                bg-indigo-500/[0.05]
                px-5
                py-4
                text-center
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
                Alignment
              </p>

              <p
                className="
                  mt-1
                  text-3xl
                  font-black
                  text-indigo-300
                "
              >
                {matchScore}

                <span
                  className="
                    text-sm
                    font-normal
                    text-slate-700
                  "
                >
                  /100
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* SKILLS */}

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-2
          "
        >
          <InsightTagCard
            title="Prioritized skills"
            subtitle="Skills aligned with the target role."
            items={
              matchedSkills.length >
              0
                ? matchedSkills
                : skills
            }
            tone="success"
          />

          <InsightTagCard
            title="Skills to strengthen"
            subtitle="Job requirements not strongly represented."
            items={
              missingSkills
            }
            tone="warning"
          />
        </div>

        {/* KEYWORDS */}

        <div
          className="
            mt-4
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-2
          "
        >
          <InsightTagCard
            title="Relevant keywords"
            subtitle="Important role terms already supported."
            items={
              matchedKeywords
            }
            tone="indigo"
          />

          <InsightTagCard
            title="Missing keywords"
            subtitle="Terms that may need stronger evidence."
            items={
              missingKeywords
            }
            tone="danger"
          />
        </div>

        {/* RESUME PREVIEW */}

        <div
          className="
            mt-8
            overflow-x-auto
            pb-8
          "
        >
          <div
            ref={
              resumePreviewRef
            }
            className="
              resume-pdf
              mx-auto
              w-[794px]
              min-w-[794px]
              max-w-[794px]
              overflow-visible
              bg-white
              text-zinc-900
              shadow-2xl
            "
            style={{
              width:
                "794px",

              minWidth:
                "794px",

              maxWidth:
                "794px",

              backgroundColor:
                "#ffffff",

              color:
                "#18181b",

              boxSizing:
                "border-box",

              fontFamily:
                "Arial, Helvetica, sans-serif",

              lineHeight:
                "1.45",
            }}
          >
            <style>
              {`
                .resume-pdf {
                  box-sizing: border-box;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }

                .resume-pdf * ,
                .resume-pdf *::before,
                .resume-pdf *::after {
                  box-sizing: border-box;
                }

                .resume-pdf .resume-section {
                  width: 100%;
                  position: relative;
                }

                .resume-pdf .resume-section-title {
                  break-after: avoid;
                  page-break-after: avoid;
                }

                .resume-pdf .resume-item,
                .resume-pdf .pdf-keep-together {
                  break-inside: avoid;
                  page-break-inside: avoid;
                }

                .resume-pdf li {
                  break-inside: avoid;
                  page-break-inside: avoid;
                }

                .resume-pdf p,
                .resume-pdf h1,
                .resume-pdf h2,
                .resume-pdf h3,
                .resume-pdf h4 {
                  orphans: 3;
                  widows: 3;
                }

                .resume-pdf img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                }
              `}
            </style>

            {/* HEADER */}

            <div
              className="
                resume-header
                pdf-keep-together
                border-b-2
                border-zinc-800
                px-[55px]
                pb-[26px]
                pt-[48px]
              "
              style={{
                breakInside:
                  "avoid",

                pageBreakInside:
                  "avoid",

                backgroundColor:
                  "#ffffff",

                color:
                  "#18181b",

                width:
                  "100%",

                boxSizing:
                  "border-box",
              }}
            >
              <h1
                className="
                  text-[30px]
                  font-bold
                  tracking-tight
                  text-zinc-950
                "
              >
                {name}
              </h1>

              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  gap-x-5
                  gap-y-1.5
                  text-[12px]
                  text-zinc-600
                "
              >
                {email && (
                  <span>
                    {email}
                  </span>
                )}

                {phone && (
                  <span>
                    {phone}
                  </span>
                )}

                {location && (
                  <span>
                    {location}
                  </span>
                )}

                {linkedin && (
                  <span
                    style={{
                      overflowWrap:
                        "break-word",
                    }}
                  >
                    {linkedin}
                  </span>
                )}

                {github && (
                  <span
                    style={{
                      overflowWrap:
                        "break-word",
                    }}
                  >
                    {github}
                  </span>
                )}

                {portfolio && (
                  <span
                    style={{
                      overflowWrap:
                        "break-word",
                    }}
                  >
                    {portfolio}
                  </span>
                )}

                {website && (
                  <span
                    style={{
                      overflowWrap:
                        "break-word",
                    }}
                  >
                    {website}
                  </span>
                )}
              </div>
            </div>

            {/* BODY */}

            <div
              className="
                px-[55px]
                pb-[45px]
                pt-[30px]
              "
            >
              {/* SUMMARY */}

              {summary && (
                <ResumeSection
                  title="Professional Summary"
                >
                  <p
                    className="
                      text-[13px]
                      leading-[1.65]
                      text-zinc-700
                    "
                  >
                    {summary}
                  </p>
                </ResumeSection>
              )}

              {/* PROFILE */}

              {profile &&
                !summary && (
                  <ResumeSection
                    title="Profile"
                  >
                    <p
                      className="
                        text-[13px]
                        leading-[1.65]
                        text-zinc-700
                      "
                    >
                      {profile}
                    </p>
                  </ResumeSection>
                )}

              {/* OBJECTIVE */}

              {objective &&
                !summary &&
                !profile && (
                  <ResumeSection
                    title="Career Objective"
                  >
                    <p
                      className="
                        text-[13px]
                        leading-[1.65]
                        text-zinc-700
                      "
                    >
                      {objective}
                    </p>
                  </ResumeSection>
                )}

              {/* SKILLS */}

              {skills.length >
                0 && (
                <ResumeSection
                  title="Skills"
                >
                  <div
                    className="
                      flex
                      flex-wrap
                      gap-x-4
                      gap-y-2
                    "
                  >
                    {skills.map(
                      (
                        skill,
                        index
                      ) => {
                        const text =
                          getSkillText(
                            skill
                          );

                        if (
                          !text
                        ) {
                          return null;
                        }

                        return (
                          <span
                            key={`${text}-${index}`}
                            className="
                              text-[13px]
                              font-medium
                              text-zinc-800
                            "
                          >
                            {text}
                          </span>
                        );
                      }
                    )}
                  </div>
                </ResumeSection>
              )}

              {/* EXPERIENCE */}

              {experience.length >
                0 && (
                <ResumeSection
                  title="Experience"
                >
                  <div
                    className="
                      space-y-5
                    "
                  >
                    {experience.map(
                      (
                        job,
                        index
                      ) => {
                        const title =
                          safeText(
                            job?.title ||
                              job?.role ||
                              job?.position ||
                              job?.jobTitle ||
                              ""
                          );

                        const company =
                          safeText(
                            job?.company ||
                              job?.organization ||
                              job?.employer ||
                              job?.companyName ||
                              ""
                          );

                        const jobLocation =
                          safeText(
                            job?.location ||
                              ""
                          );

                        const dates =
                          safeText(
                            job?.dates ||
                              job?.duration ||
                              job?.period ||
                              ""
                          );

                        const startDate =
                          safeText(
                            job?.startDate ||
                              job?.start ||
                              job?.from ||
                              ""
                          );

                        const endDate =
                          safeText(
                            job?.endDate ||
                              job?.end ||
                              job?.to ||
                              ""
                          );

                        const description =
                          safeText(
                            job?.description ||
                              job?.summary ||
                              job?.details ||
                              ""
                          );

                        const bullets =
                          safeArray(
                            job?.bullets
                          );

                        return (
                          <div
                            key={index}
                            className="
                              resume-item
                              pdf-keep-together
                            "
                          >
                            <div
                              className="
                                flex
                                min-w-0
                                justify-between
                                gap-5
                              "
                            >
                              <div
                                className="
                                  min-w-0
                                  flex-1
                                "
                              >
                                {title && (
                                  <h4
                                    className="
                                      text-[15px]
                                      font-bold
                                      text-zinc-900
                                    "
                                  >
                                    {title}
                                  </h4>
                                )}

                                {company && (
                                  <p
                                    className="
                                      mt-0.5
                                      text-[13px]
                                      font-semibold
                                      text-zinc-700
                                    "
                                  >
                                    {company}
                                  </p>
                                )}

                                {jobLocation && (
                                  <p
                                    className="
                                      mt-0.5
                                      text-[12px]
                                      text-zinc-500
                                    "
                                  >
                                    {jobLocation}
                                  </p>
                                )}
                              </div>

                              {(dates ||
                                startDate ||
                                endDate) && (
                                <p
                                  className="
                                    max-w-[180px]
                                    shrink-0
                                    whitespace-normal
                                    text-right
                                    text-[11.5px]
                                    text-zinc-500
                                  "
                                >
                                  {dates ||
                                    `${startDate}${
                                      endDate
                                        ? ` - ${endDate}`
                                        : ""
                                    }`}
                                </p>
                              )}
                            </div>

                            {description && (
                              <p
                                className="
                                  mt-2
                                  text-[12.5px]
                                  leading-[1.6]
                                  text-zinc-700
                                "
                              >
                                {description}
                              </p>
                            )}

                            {bullets.length >
                              0 && (
                              <ul
                                className="
                                  mt-2
                                  list-disc
                                  space-y-1
                                  pl-5
                                  text-[12.5px]
                                  text-zinc-700
                                "
                              >
                                {bullets.map(
                                  (
                                    bullet,
                                    bulletIndex
                                  ) => {
                                    const text =
                                      getBulletText(
                                        bullet
                                      );

                                    if (
                                      !text
                                    ) {
                                      return null;
                                    }

                                    return (
                                      <li
                                        key={
                                          bulletIndex
                                        }
                                        className="
                                          leading-[1.5]
                                        "
                                      >
                                        {text}
                                      </li>
                                    );
                                  }
                                )}
                              </ul>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </ResumeSection>
              )}

              {/* PROJECTS */}

              {projects.length >
                0 && (
                <ResumeSection
                  title="Projects"
                >
                  <div
                    className="
                      space-y-4
                    "
                  >
                    {projects.map(
                      (
                        project,
                        index
                      ) => {
                        const projectName =
                          typeof project ===
                          "string"
                            ? ""
                            : safeText(
                                project?.name ||
                                  project?.title ||
                                  project?.projectName ||
                                  ""
                              );

                        const projectText =
                          typeof project ===
                          "string"
                            ? safeText(
                                project
                              )
                            : safeText(
                                project?.text ||
                                  project?.description ||
                                  project?.details ||
                                  project?.content ||
                                  project?.summary ||
                                  ""
                              );

                        const technologies =
                          typeof project ===
                          "object"
                            ? safeArray(
                                project?.technologies ||
                                  project?.techStack ||
                                  project?.skills ||
                                  project?.tools
                              )
                            : [];

                        const projectUrl =
                          typeof project ===
                          "object"
                            ? safeText(
                                project?.url ||
                                  project?.link ||
                                  project?.github ||
                                  ""
                              )
                            : "";

                        return (
                          <div
                            key={index}
                            className="
                              resume-item
                              pdf-keep-together
                            "
                          >
                            {projectName && (
                              <h4
                                className="
                                  text-[14px]
                                  font-bold
                                  text-zinc-900
                                "
                              >
                                {projectName}
                              </h4>
                            )}

                            {technologies.length >
                              0 && (
                              <p
                                className="
                                  mt-1
                                  text-[11px]
                                  text-zinc-500
                                "
                              >
                                Technologies:{" "}
                                {technologies
                                  .map(
                                    objectText
                                  )
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    ", "
                                  )}
                              </p>
                            )}

                            {projectText && (
                              <p
                                className="
                                  mt-1.5
                                  text-[12.5px]
                                  leading-[1.55]
                                  text-zinc-700
                                "
                              >
                                {projectText}
                              </p>
                            )}

                            {projectUrl && (
                              <p
                                className="
                                  mt-1
                                  break-words
                                  text-[11px]
                                  text-zinc-500
                                "
                              >
                                {projectUrl}
                              </p>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </ResumeSection>
              )}

              {/* EDUCATION */}

              {education.length >
                0 && (
                <ResumeSection
                  title="Education"
                >
                  <div
                    className="
                      space-y-4
                    "
                  >
                    {education.map(
                      (
                        item,
                        index
                      ) => {
                        if (
                          typeof item ===
                          "string"
                        ) {
                          return (
                            <p
                              key={index}
                              className="
                                resume-item
                                text-[13px]
                                text-zinc-700
                              "
                            >
                              {item}
                            </p>
                          );
                        }

                        if (
                          !item ||
                          typeof item !==
                            "object"
                        ) {
                          return null;
                        }

                        const degree =
                          safeText(
                            item?.degree ||
                              item?.qualification ||
                              item?.title ||
                              ""
                          );

                        const institution =
                          safeText(
                            item?.institution ||
                              item?.school ||
                              item?.college ||
                              item?.university ||
                              ""
                          );

                        const eduLocation =
                          safeText(
                            item?.location ||
                              ""
                          );

                        const year =
                          safeText(
                            item?.year ||
                              item?.date ||
                              item?.graduationYear ||
                              ""
                          );

                        return (
                          <div
                            key={index}
                            className="
                              resume-item
                              pdf-keep-together
                            "
                          >
                            {degree && (
                              <h4
                                className="
                                  text-[14px]
                                  font-bold
                                  text-zinc-900
                                "
                              >
                                {degree}
                              </h4>
                            )}

                            {institution && (
                              <p
                                className="
                                  mt-0.5
                                  text-[13px]
                                  font-medium
                                  text-zinc-700
                                "
                              >
                                {institution}
                              </p>
                            )}

                            {(eduLocation ||
                              year) && (
                              <div
                                className="
                                  mt-0.5
                                  flex
                                  flex-wrap
                                  gap-4
                                  text-[12px]
                                  text-zinc-500
                                "
                              >
                                {eduLocation && (
                                  <span>
                                    {eduLocation}
                                  </span>
                                )}

                                {year && (
                                  <span>
                                    {year}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </ResumeSection>
              )}

              {/* CERTIFICATIONS */}

              {certifications.length >
                0 && (
                <ResumeSection
                  title="Certifications"
                >
                  <ul
                    className="
                      list-disc
                      space-y-1.5
                      pl-5
                    "
                  >
                    {certifications.map(
                      (
                        item,
                        index
                      ) => {
                        const text =
                          getCertificationText(
                            item
                          );

                        if (
                          !text
                        ) {
                          return null;
                        }

                        return (
                          <li
                            key={index}
                            className="
                              resume-item
                              text-[12.5px]
                              text-zinc-700
                            "
                          >
                            {text}
                          </li>
                        );
                      }
                    )}
                  </ul>
                </ResumeSection>
              )}

              {/* ACHIEVEMENTS */}

              {achievements.length >
                0 && (
                <ResumeSection
                  title="Achievements"
                >
                  <ul
                    className="
                      list-disc
                      space-y-1.5
                      pl-5
                    "
                  >
                    {achievements.map(
                      (
                        item,
                        index
                      ) => {
                        const text =
                          getAchievementText(
                            item
                          );

                        if (
                          !text
                        ) {
                          return null;
                        }

                        return (
                          <li
                            key={index}
                            className="
                              resume-item
                              leading-[1.5]
                              text-[12.5px]
                              text-zinc-700
                            "
                          >
                            {text}
                          </li>
                        );
                      }
                    )}
                  </ul>
                </ResumeSection>
              )}

              {/* LANGUAGES */}

              {languages.length >
                0 && (
                <ResumeSection
                  title="Languages"
                >
                  <p
                    className="
                      text-[13px]
                      text-zinc-700
                    "
                  >
                    {languages
                      .map(
                        getLanguageText
                      )
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      )}
                  </p>
                </ResumeSection>
              )}

              {/* HOBBIES */}

              {hobbies.length >
                0 && (
                <ResumeSection
                  title="Hobbies & Interests"
                >
                  <p
                    className="
                      text-[13px]
                      text-zinc-700
                    "
                  >
                    {hobbies
                      .map(
                        getHobbyText
                      )
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      )}
                  </p>
                </ResumeSection>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}

        <div
          className="
            mt-4
            flex
            flex-col
            gap-3
            sm:flex-row
          "
        >
          <button
            type="button"
            onClick={
              onEditJob
            }
            className="
              flex-1
              rounded-2xl
              border
              border-violet-500/10
              bg-violet-500/[0.025]
              px-5
              py-4
              text-sm
              font-semibold
              text-violet-300
              transition
              hover:bg-violet-500/[0.05]
            "
          >
            Edit Job Description & Regenerate
          </button>

          <button
            type="button"
            onClick={
              onStartOver
            }
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.02]
              px-5
              py-4
              text-sm
              font-semibold
              text-slate-500
              transition
              hover:bg-white/[0.04]
              hover:text-white
            "
          >
            Start New Customization
          </button>
        </div>

        {/* DISCLAIMER */}

        <p
          className="
            mx-auto
            mt-5
            max-w-2xl
            text-center
            text-[10px]
            leading-5
            text-slate-700
          "
        >
          Customization prioritizes information already
          present in your resume. Always review the final
          version before applying.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// INSTRUCTION CARD
// ============================================================

function InstructionCard({
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
        bg-white/[0.015]
        p-4
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
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-violet-500/[0.08]
            text-[9px]
            font-bold
            text-violet-300
          "
        >
          {number}
        </span>

        <p
          className="
            text-xs
            font-semibold
            text-white
          "
        >
          {title}
        </p>
      </div>

      <p
        className="
          mt-3
          text-[11px]
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
// SCORE CARD
// ============================================================

function ScoreCard({
  title,
  value,
}) {
  const safeScore =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          value
        ) || 0
      )
    );

  return (
    <div
      className="
        rounded-[22px]
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
          gap-3
        "
      >
        <p
          className="
            text-xs
            text-slate-600
          "
        >
          {title}
        </p>

        <span
          className="
            h-2
            w-2
            rounded-full
            bg-violet-400
          "
        />
      </div>

      <p
        className="
          mt-3
          text-3xl
          font-bold
          tracking-tight
          text-white
        "
      >
        {safeScore}%
      </p>

      <div
        className="
          mt-4
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
            bg-violet-400
            transition-all
            duration-700
          "
          style={{
            width:
              `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// INSIGHT TAG CARD
// ============================================================

function InsightTagCard({
  title,
  subtitle,
  items = [],
  tone = "success",
}) {
  const values =
    safeArray(
      items
    )
      .map(
        objectText
      )
      .filter(
        Boolean
      );

  const cardStyles = {
    success:
      "border-emerald-500/10 bg-emerald-500/[0.025]",

    warning:
      "border-amber-500/10 bg-amber-500/[0.025]",

    indigo:
      "border-indigo-500/10 bg-indigo-500/[0.025]",

    danger:
      "border-red-500/10 bg-red-500/[0.025]",
  };

  const tagStyles = {
    success:
      "border-emerald-500/10 bg-emerald-500/[0.05] text-emerald-300",

    warning:
      "border-amber-500/10 bg-amber-500/[0.05] text-amber-300",

    indigo:
      "border-indigo-500/10 bg-indigo-500/[0.05] text-indigo-300",

    danger:
      "border-red-500/10 bg-red-500/[0.05] text-red-300",
  };

  return (
    <div
      className={`
        rounded-[24px]
        border
        p-5
        md:p-6
        ${
          cardStyles[tone] ||
          cardStyles.success
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <h4
            className="
              text-lg
              font-bold
              text-white
            "
          >
            {title}
          </h4>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-slate-600
            "
          >
            {subtitle}
          </p>
        </div>

        <span
          className="
            shrink-0
            rounded-full
            border
            border-white/[0.06]
            bg-white/[0.02]
            px-2.5
            py-1
            text-[10px]
            text-slate-600
          "
        >
          {values.length}
        </span>
      </div>

      {values.length >
      0 ? (
        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-2
          "
        >
          {values.map(
            (
              item,
              index
            ) => (
              <span
                key={`${item}-${index}`}
                className={`
                  rounded-lg
                  border
                  px-3
                  py-1.5
                  text-[11px]
                  ${
                    tagStyles[tone] ||
                    tagStyles.success
                  }
                `}
              >
                {item}
              </span>
            )
          )}
        </div>
      ) : (
        <div
          className="
            mt-5
            rounded-xl
            border
            border-white/[0.05]
            bg-black/10
            px-4
            py-3
          "
        >
          <p
            className="
              text-xs
              text-slate-600
            "
          >
            Nothing to highlight here.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// RESUME SECTION
// ============================================================

function ResumeSection({
  title,
  children,
}) {
  return (
    <section
      className="
        resume-section
        mb-7
      "
    >
      <h3
        className="
          resume-section-title
          mb-4
          border-b
          border-zinc-300
          pb-1.5
          text-[12px]
          font-bold
          uppercase
          tracking-[0.15em]
          text-zinc-900
        "
      >
        {title}
      </h3>

      {children}
    </section>
  );
}

// ============================================================
// LOADING CARD
// ============================================================

function LoadingCard({
  text,
}) {
  return (
    <div
      className="
        rounded-[30px]
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
          h-10
          w-10
          animate-spin
          rounded-full
          border-2
          border-white/10
          border-t-violet-400
        "
      />

      <p
        className="
          mt-5
          text-sm
          font-medium
          text-slate-400
        "
      >
        {text}
      </p>
    </div>
  );
}

// ============================================================
// EXPORT
// ============================================================

export default TailoredResume;
