
// ============================================================
// TAILORED RESUME PREVIEW
// ============================================================

function TailoredResumePreview({
  resume = {},
}) {
  // ============================================================
  // SAFE DATA
  // ============================================================

  const safeResume =
    resume &&
    typeof resume === "object"
      ? resume
      : {};

  // ============================================================
  // HELPERS
  // ============================================================

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return "";
  };

  const getArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      return [value];
    }

    return [];
  };

  // ============================================================
  // PERSONAL INFORMATION
  // ============================================================

  const personalInfo =
    safeResume.personalInfo &&
    typeof safeResume.personalInfo === "object"
      ? safeResume.personalInfo
      : {};

  const candidateName =
    getValue(
      safeResume.name,
      safeResume.fullName,
      personalInfo.name,
      personalInfo.fullName
    ) || "Your Name";

  const email =
    getValue(
      safeResume.email,
      personalInfo.email
    );

  const phone =
    getValue(
      safeResume.phone,
      safeResume.phoneNumber,
      personalInfo.phone,
      personalInfo.phoneNumber
    );

  const location =
    getValue(
      safeResume.location,
      personalInfo.location,
      personalInfo.address
    );

  const linkedin =
    getValue(
      safeResume.linkedin,
      safeResume.linkedIn,
      personalInfo.linkedin,
      personalInfo.linkedIn
    );

  const github =
    getValue(
      safeResume.github,
      personalInfo.github
    );

  const portfolio =
    getValue(
      safeResume.portfolio,
      personalInfo.portfolio,
      personalInfo.website,
      safeResume.website
    );

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary =
    getValue(
      safeResume.summary,
      safeResume.professionalSummary,
      safeResume.profile
    );

  // ============================================================
  // SKILLS
  // ============================================================

  const skills =
    getArray(
      safeResume.skills
    );

  // ============================================================
  // EXPERIENCE
  // ============================================================

  const experience =
    Array.isArray(
      safeResume.experience
    )
      ? safeResume.experience
      : [];

  // ============================================================
  // PROJECTS
  // ============================================================

  const projects =
    Array.isArray(
      safeResume.projects
    )
      ? safeResume.projects
      : [];

  // ============================================================
  // EDUCATION
  // ============================================================

  const education =
    Array.isArray(
      safeResume.education
    )
      ? safeResume.education
      : [];

  // ============================================================
  // CERTIFICATIONS
  // ============================================================

  const certifications =
    getArray(
      safeResume.certifications
    );

  // ============================================================
  // ACHIEVEMENTS
  // ============================================================

  const achievements =
    getArray(
      safeResume.achievements
    );

  // ============================================================
  // LANGUAGES
  // ============================================================

  const languages =
    getArray(
      safeResume.languages
    );

  // ============================================================
  // EMPTY STATE
  // ============================================================

  const hasResumeContent =
    candidateName !== "Your Name" ||
    summary ||
    skills.length > 0 ||
    experience.length > 0 ||
    projects.length > 0 ||
    education.length > 0 ||
    certifications.length > 0 ||
    achievements.length > 0 ||
    languages.length > 0;

  if (!hasResumeContent) {
    return (
      <div className="w-full flex justify-center">

        <div className="w-full max-w-[794px] bg-white text-zinc-900 rounded-2xl shadow-2xl p-10">

          <div className="text-center py-16">

            <div className="text-5xl mb-4">
              📄
            </div>

            <h2 className="text-xl font-bold">
              Resume Preview Unavailable
            </h2>

            <p className="text-sm text-zinc-500 mt-2">
              No tailored resume data was returned by
              the server.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ============================================================
  // RESUME PREVIEW
  // ============================================================

  return (
    <div className="w-full overflow-x-auto bg-zinc-950 rounded-3xl p-4 md:p-8">

      <div
        id="professional-resume"
        className="w-[794px] min-h-[1123px] mx-auto bg-white text-zinc-900 shadow-2xl"
        style={{
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="px-[58px] pt-[52px] pb-[28px] border-b-2 border-zinc-900">

          <h1 className="text-[32px] leading-tight font-bold tracking-tight">
            {candidateName}
          </h1>

          {/* CONTACT INFORMATION */}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[12px] text-zinc-600">

            {email && (
              <span>
                {email}
              </span>
            )}

            {phone && (
              <>
                {email && (
                  <span className="text-zinc-300">
                    |
                  </span>
                )}

                <span>
                  {phone}
                </span>
              </>
            )}

            {location && (
              <>
                {(email || phone) && (
                  <span className="text-zinc-300">
                    |
                  </span>
                )}

                <span>
                  {location}
                </span>
              </>
            )}

            {linkedin && (
              <>
                {(email ||
                  phone ||
                  location) && (
                  <span className="text-zinc-300">
                    |
                  </span>
                )}

                <span className="break-all">
                  {linkedin}
                </span>
              </>
            )}

            {github && (
              <>
                {(email ||
                  phone ||
                  location ||
                  linkedin) && (
                  <span className="text-zinc-300">
                    |
                  </span>
                )}

                <span className="break-all">
                  {github}
                </span>
              </>
            )}

            {portfolio && (
              <>
                {(email ||
                  phone ||
                  location ||
                  linkedin ||
                  github) && (
                  <span className="text-zinc-300">
                    |
                  </span>
                )}

                <span className="break-all">
                  {portfolio}
                </span>
              </>
            )}

          </div>

        </header>

        {/* ======================================================
            BODY
        ====================================================== */}

        <main className="px-[58px] py-[32px] space-y-[27px]">

          {/* ====================================================
              PROFESSIONAL SUMMARY
          ==================================================== */}

          {summary && (
            <ResumeSection
              title="Professional Summary"
            >
              <p className="text-[13px] leading-[1.65] text-zinc-700">
                {summary}
              </p>
            </ResumeSection>
          )}

          {/* ====================================================
              SKILLS
          ==================================================== */}

          {skills.length > 0 && (
            <ResumeSection
              title="Skills"
            >

              <div className="flex flex-wrap gap-x-2 gap-y-2">

                {skills.map(
                  (skill, index) => {
                    const skillText =
                      typeof skill === "object"
                        ? getValue(
                            skill.name,
                            skill.title,
                            skill.skill,
                            skill.text
                          )
                        : skill;

                    if (!skillText) {
                      return null;
                    }

                    return (
                      <span
                        key={`skill-${index}`}
                        className="text-[12px] text-zinc-700"
                      >
                        {skillText}
                        {index <
                          skills.length - 1 && (
                          <span className="ml-2 text-zinc-400">
                            •
                          </span>
                        )}
                      </span>
                    );
                  }
                )}

              </div>

            </ResumeSection>
          )}

          {/* ====================================================
              EXPERIENCE
          ==================================================== */}

          {experience.length > 0 && (
            <ResumeSection
              title="Experience"
            >

              <div className="space-y-5">

                {experience.map(
                  (job, index) => {

                    if (
                      typeof job ===
                      "string"
                    ) {
                      return (
                        <div
                          key={`experience-${index}`}
                          className="text-[13px] leading-[1.6] text-zinc-700"
                        >
                          {job}
                        </div>
                      );
                    }

                    const jobTitle =
                      getValue(
                        job?.title,
                        job?.role,
                        job?.position
                      );

                    const company =
                      getValue(
                        job?.company,
                        job?.organization,
                        job?.employer
                      );

                    const locationValue =
                      getValue(
                        job?.location,
                        job?.city
                      );

                    const dates =
                      getValue(
                        job?.dates,
                        job?.date,
                        job?.duration
                      );

                    const startDate =
                      getValue(
                        job?.startDate,
                        job?.start
                      );

                    const endDate =
                      getValue(
                        job?.endDate,
                        job?.end
                      );

                    const description =
                      getValue(
                        job?.description,
                        job?.summary
                      );

                    const bullets =
                      getArray(
                        job?.bullets ||
                        job?.responsibilities ||
                        job?.achievements
                      );

                    const dateText =
                      dates ||
                      (
                        startDate ||
                        endDate
                      )
                        ? `${startDate || ""}${
                            startDate &&
                            endDate
                              ? " — "
                              : ""
                          }${endDate || ""}`
                        : "";

                    return (
                      <div
                        key={`experience-${index}`}
                        className="break-inside-avoid"
                      >

                        <div className="flex justify-between gap-5">

                          <div className="min-w-0">

                            {jobTitle && (
                              <h4 className="text-[14px] font-bold text-zinc-900">
                                {jobTitle}
                              </h4>
                            )}

                            {company && (
                              <p className="text-[13px] font-semibold text-zinc-700 mt-0.5">
                                {company}
                                {locationValue && (
                                  <span className="font-normal text-zinc-500">
                                    {" "}
                                    ·{" "}
                                    {locationValue}
                                  </span>
                                )}
                              </p>
                            )}

                          </div>

                          {dateText && (
                            <p className="text-[11px] text-zinc-500 whitespace-nowrap text-right">
                              {dateText}
                            </p>
                          )}

                        </div>

                        {description && (
                          <p className="text-[12.5px] leading-[1.6] text-zinc-700 mt-2">
                            {description}
                          </p>
                        )}

                        {bullets.length > 0 && (
                          <ul className="mt-2 pl-4 list-disc space-y-1">

                            {bullets.map(
                              (
                                bullet,
                                bulletIndex
                              ) => {

                                const bulletText =
                                  typeof bullet ===
                                  "object"
                                    ? getValue(
                                        bullet.text,
                                        bullet.description,
                                        bullet.title,
                                        bullet.content
                                      )
                                    : bullet;

                                if (
                                  !bulletText
                                ) {
                                  return null;
                                }

                                return (
                                  <li
                                    key={`bullet-${index}-${bulletIndex}`}
                                    className="text-[12.5px] leading-[1.55] text-zinc-700"
                                  >
                                    {bulletText}
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

          {/* ====================================================
              PROJECTS
          ==================================================== */}

          {projects.length > 0 && (
            <ResumeSection
              title="Projects"
            >

              <div className="space-y-4">

                {projects.map(
                  (project, index) => {

                    if (
                      typeof project ===
                      "string"
                    ) {
                      return (
                        <div
                          key={`project-${index}`}
                          className="text-[12.5px] leading-[1.6] text-zinc-700"
                        >
                          <span className="font-semibold text-zinc-900">
                            Project {index + 1}
                          </span>
                          {" — "}
                          {project}
                        </div>
                      );
                    }

                    const projectName =
                      getValue(
                        project?.name,
                        project?.title,
                        project?.projectName
                      );

                    const projectDescription =
                      getValue(
                        project?.description,
                        project?.summary,
                        project?.text,
                        project?.details,
                        project?.content
                      );

                    const projectTech =
                      getArray(
                        project?.technologies ||
                        project?.techStack ||
                        project?.skills
                      );

                    const projectLink =
                      getValue(
                        project?.link,
                        project?.url,
                        project?.github
                      );

                    return (
                      <div
                        key={`project-${index}`}
                        className="break-inside-avoid"
                      >

                        <div className="flex flex-wrap items-baseline gap-x-2">

                          {projectName && (
                            <h4 className="text-[14px] font-bold text-zinc-900">
                              {projectName}
                            </h4>
                          )}

                          {projectLink && (
                            <span className="text-[11px] text-zinc-500 break-all">
                              {projectLink}
                            </span>
                          )}

                        </div>

                        {projectDescription && (
                          <p className="text-[12.5px] leading-[1.6] text-zinc-700 mt-1">
                            {projectDescription}
                          </p>
                        )}

                        {projectTech.length > 0 && (
                          <p className="text-[11.5px] text-zinc-500 mt-1.5">
                            <span className="font-semibold text-zinc-600">
                              Technologies:
                            </span>{" "}
                            {projectTech
                              .map(
                                (
                                  technology
                                ) =>
                                  typeof technology ===
                                  "object"
                                    ? getValue(
                                        technology.name,
                                        technology.title,
                                        technology.text
                                      )
                                    : technology
                              )
                              .filter(Boolean)
                              .join(
                                ", "
                              )}
                          </p>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </ResumeSection>
          )}

          {/* ====================================================
              EDUCATION
          ==================================================== */}

          {education.length > 0 && (
            <ResumeSection
              title="Education"
            >

              <div className="space-y-4">

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
                        <div
                          key={`education-${index}`}
                          className="text-[13px] text-zinc-700"
                        >
                          {item}
                        </div>
                      );
                    }

                    const degree =
                      getValue(
                        item?.degree,
                        item?.qualification,
                        item?.title,
                        item?.program
                      );

                    const institution =
                      getValue(
                        item?.institution,
                        item?.university,
                        item?.college,
                        item?.school
                      );

                    const locationValue =
                      getValue(
                        item?.location,
                        item?.city
                      );

                    const dates =
                      getValue(
                        item?.dates,
                        item?.date,
                        item?.year,
                        item?.graduationYear
                      );

                    const field =
                      getValue(
                        item?.field,
                        item?.major,
                        item?.specialization
                      );

                    return (
                      <div
                        key={`education-${index}`}
                        className="flex justify-between gap-5 break-inside-avoid"
                      >

                        <div>

                          {degree && (
                            <h4 className="text-[13.5px] font-bold text-zinc-900">
                              {degree}
                            </h4>
                          )}

                          {institution && (
                            <p className="text-[12.5px] text-zinc-700 mt-0.5">
                              {institution}

                              {field && (
                                <span>
                                  {" "}
                                  · {field}
                                </span>
                              )}

                              {locationValue && (
                                <span className="text-zinc-500">
                                  {" "}
                                  · {locationValue}
                                </span>
                              )}
                            </p>
                          )}

                        </div>

                        {dates && (
                          <p className="text-[11px] text-zinc-500 whitespace-nowrap">
                            {dates}
                          </p>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </ResumeSection>
          )}

          {/* ====================================================
              CERTIFICATIONS
          ==================================================== */}

          {certifications.length > 0 && (
            <ResumeSection
              title="Certifications"
            >

              <ul className="space-y-1.5 pl-4 list-disc">

                {certifications.map(
                  (
                    certification,
                    index
                  ) => {

                    const text =
                      typeof certification ===
                      "object"
                        ? getValue(
                            certification.name,
                            certification.title,
                            certification.text,
                            certification.issuer
                          )
                        : certification;

                    if (!text) {
                      return null;
                    }

                    return (
                      <li
                        key={`certification-${index}`}
                        className="text-[12.5px] leading-[1.5] text-zinc-700"
                      >
                        {text}
                      </li>
                    );
                  }
                )}

              </ul>

            </ResumeSection>
          )}

          {/* ====================================================
              ACHIEVEMENTS
          ==================================================== */}

          {achievements.length > 0 && (
            <ResumeSection
              title="Achievements"
            >

              <ul className="space-y-1.5 pl-4 list-disc">

                {achievements.map(
                  (
                    achievement,
                    index
                  ) => {

                    const text =
                      typeof achievement ===
                      "object"
                        ? getValue(
                            achievement.title,
                            achievement.text,
                            achievement.description,
                            achievement.name
                          )
                        : achievement;

                    if (!text) {
                      return null;
                    }

                    return (
                      <li
                        key={`achievement-${index}`}
                        className="text-[12.5px] leading-[1.5] text-zinc-700"
                      >
                        {text}
                      </li>
                    );
                  }
                )}

              </ul>

            </ResumeSection>
          )}

          {/* ====================================================
              LANGUAGES
          ==================================================== */}

          {languages.length > 0 && (
            <ResumeSection
              title="Languages"
            >

              <p className="text-[12.5px] text-zinc-700">
                {languages
                  .map(
                    (language) =>
                      typeof language ===
                      "object"
                        ? getValue(
                            language.name,
                            language.language,
                            language.text
                          )
                        : language
                  )
                  .filter(Boolean)
                  .join(", ")}
              </p>

            </ResumeSection>
          )}

        </main>

      </div>

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
    <section className="break-inside-avoid">

      <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-zinc-900 border-b border-zinc-300 pb-1.5 mb-3">
        {title}
      </h2>

      {children}

    </section>
  );
}


export default TailoredResumePreview;

