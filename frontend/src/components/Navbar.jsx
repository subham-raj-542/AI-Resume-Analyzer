
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

// ============================================================
// NAVBAR
// ============================================================

function Navbar() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    token,
    isAuthenticated,
    logout,
    user,
  } = useAuth();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] = useState(false);

  // ==========================================================
  // AUTH
  // ==========================================================

  const authenticated =
    Boolean(
      isAuthenticated &&
        token
    );

  // ==========================================================
  // CLOSE MENUS
  // ==========================================================

  const closeMenus =
    () => {
      setMobileOpen(
        false
      );

      setUserMenuOpen(
        false
      );
    };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout =
    () => {
      try {
        if (
          typeof logout ===
          "function"
        ) {
          logout();
        }
      } catch (
        error
      ) {
        console.error(
          "Logout error:",
          error
        );
      }

      // Clear selected resume.
      localStorage.removeItem(
        "selectedResumeId"
      );

      localStorage.removeItem(
        "resumeId"
      );

      // Notify the rest of the app.
      window.dispatchEvent(
        new CustomEvent(
          "resume-selection-changed",
          {
            detail: {
              resumeId: "",
            },
          }
        )
      );

      closeMenus();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  // ==========================================================
  // CLICK OUTSIDE USER MENU
  // ==========================================================

  useEffect(
    () => {
      const handleOutsideClick =
        (
          event
        ) => {
          if (
            !event.target.closest(
              "[data-navbar-user-menu]"
            )
          ) {
            setUserMenuOpen(
              false
            );
          }
        };

      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleOutsideClick
        );
      };
    },
    []
  );

  // ==========================================================
  // CLOSE MOBILE MENU ON ROUTE CHANGE
  // ==========================================================

  useEffect(
    () => {
      setMobileOpen(
        false
      );

      setUserMenuOpen(
        false
      );
    },
    [location.pathname]
  );

  // ==========================================================
  // BODY SCROLL LOCK
  // ==========================================================

  useEffect(
    () => {
      if (
        mobileOpen
      ) {
        document.body.style.overflow =
          "hidden";
      } else {
        document.body.style.overflow =
          "";
      }

      return () => {
        document.body.style.overflow =
          "";
      };
    },
    [mobileOpen]
  );

  // ==========================================================
  // USER DISPLAY NAME
  // ==========================================================

  const displayName =
    String(
      user?.name ||
        user?.username ||
        user?.email ||
        "Account"
    ).trim();

  const displayInitial =
    displayName
      .charAt(0)
      .toUpperCase() ||
    "A";

  // ==========================================================
  // NAV ITEM
  // ==========================================================

  const DesktopNavLink = ({
    to,
    children,
    end = false,
  }) => {
    return (
      <NavLink
        to={to}
        end={end}
        className={({
          isActive,
        }) => `
          relative
          py-2
          text-sm
          font-medium
          transition-colors
          ${
            isActive
              ? "text-white"
              : "text-slate-400 hover:text-white"
          }
        `}
      >
        {({
          isActive,
        }) => (
          <>
            {children}

            <span
              className={`
                absolute
                left-0
                right-0
                -bottom-0.5
                mx-auto
                h-px
                rounded-full
                bg-indigo-400
                transition
                ${
                  isActive
                    ? "w-full opacity-100"
                    : "w-0 opacity-0"
                }
              `}
            />
          </>
        )}
      </NavLink>
    );
  };

  // ==========================================================
  // MOBILE NAV ITEM
  // ==========================================================

  const MobileNavLink = ({
    to,
    children,
    end = false,
  }) => {
    return (
      <NavLink
        to={to}
        end={end}
        onClick={
          closeMenus
        }
        className={({
          isActive,
        }) => `
          block
          rounded-2xl
          px-4
          py-3.5
          text-sm
          font-medium
          transition
          ${
            isActive
              ? "bg-indigo-500/[0.08] text-white"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
          }
        `}
      >
        {children}
      </NavLink>
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-white/[0.07]
        bg-slate-950/80
        backdrop-blur-2xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-[72px]
          w-[92%]
          max-w-7xl
          items-center
          justify-between
          gap-6
        "
      >
        {/* ==================================================
            LOGO
        =================================================== */}

        <Link
          to="/"
          onClick={
            closeMenus
          }
          className="
            flex
            shrink-0
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-indigo-400/10
              bg-indigo-500/[0.08]
              text-lg
              text-indigo-300
            "
          >
            ✦
          </div>

          <div
            className="
              hidden
              sm:block
            "
          >
            <p
              className="
                text-sm
                font-bold
                leading-none
                text-white
              "
            >
              AI Resume
            </p>

            <p
              className="
                mt-1
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-indigo-400
              "
            >
              Analyzer
            </p>
          </div>
        </Link>

        {/* ==================================================
            DESKTOP NAVIGATION
        =================================================== */}

        <nav
          className="
            hidden
            items-center
            gap-8
            lg:flex
          "
        >
          <DesktopNavLink
            to="/"
            end
          >
            Home
          </DesktopNavLink>

          {authenticated && (
            <>
              <DesktopNavLink
                to="/analyzer"
              >
                Analyzer
              </DesktopNavLink>

              <DesktopNavLink
                to="/resumes"
              >
                My Resumes
              </DesktopNavLink>
            </>
          )}
        </nav>

        {/* ==================================================
            DESKTOP RIGHT
        =================================================== */}

        <div
          className="
            hidden
            items-center
            gap-3
            lg:flex
          "
        >
          {!authenticated ? (
            <>
              <Link
                to="/login"
                onClick={
                  closeMenus
                }
                className="
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-300
                  transition
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={
                  closeMenus
                }
                className="
                  rounded-xl
                  bg-indigo-500
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-indigo-500/10
                  transition
                  hover:bg-indigo-400
                "
              >
                Get Started
              </Link>
            </>
          ) : (
            <div
              className="
                relative
              "
              data-navbar-user-menu
            >
              <button
                type="button"
                onClick={() =>
                  setUserMenuOpen(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  px-3
                  py-2
                  transition
                  hover:bg-white/[0.05]
                "
              >
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-indigo-500/[0.09]
                    text-xs
                    font-bold
                    text-indigo-300
                  "
                >
                  {displayInitial}
                </div>

                <span
                  className="
                    max-w-[120px]
                    truncate
                    text-sm
                    font-medium
                    text-slate-300
                  "
                >
                  {displayName}
                </span>

                <span
                  className="
                    text-xs
                    text-slate-600
                  "
                >
                  {userMenuOpen
                    ? "▲"
                    : "▼"}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-full
                    mt-2
                    w-56
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-slate-900
                    shadow-2xl
                    shadow-black/30
                  "
                >
                  <div
                    className="
                      border-b
                      border-white/[0.06]
                      px-4
                      py-4
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-slate-600
                      "
                    >
                      Signed in as
                    </p>

                    <p
                      className="
                        mt-1
                        truncate
                        text-sm
                        text-slate-300
                      "
                    >
                      {displayName}
                    </p>
                  </div>

                  <Link
                    to="/analyzer"
                    onClick={
                      closeMenus
                    }
                    className="
                      block
                      px-4
                      py-3
                      text-sm
                      text-slate-300
                      transition
                      hover:bg-white/[0.04]
                      hover:text-white
                    "
                  >
                    Resume Analyzer
                  </Link>

                  <Link
                    to="/resumes"
                    onClick={
                      closeMenus
                    }
                    className="
                      block
                      px-4
                      py-3
                      text-sm
                      text-slate-300
                      transition
                      hover:bg-white/[0.04]
                      hover:text-white
                    "
                  >
                    My Resumes
                  </Link>

                  <div
                    className="
                      h-px
                      bg-white/[0.06]
                    "
                  />

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="
                      w-full
                      px-4
                      py-3
                      text-left
                      text-sm
                      text-red-400
                      transition
                      hover:bg-red-500/[0.06]
                    "
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================================================
            MOBILE TOGGLE
        =================================================== */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (
                current
              ) =>
                !current
            )
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            text-sm
            text-slate-300
            transition
            hover:bg-white/[0.05]
            lg:hidden
          "
          aria-label={
            mobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={
            mobileOpen
          }
        >
          {mobileOpen
            ? "✕"
            : "☰"}
        </button>
      </div>

      {/* ======================================================
          MOBILE MENU
      ======================================================= */}

      {mobileOpen && (
        <div
          className="
            border-t
            border-white/[0.06]
            bg-slate-950
            lg:hidden
          "
        >
          <div
            className="
              mx-auto
              w-[92%]
              max-w-7xl
              py-4
            "
          >
            <div
              className="
                space-y-1
              "
            >
              <MobileNavLink
                to="/"
                end
              >
                Home
              </MobileNavLink>

              {authenticated && (
                <>
                  <MobileNavLink
                    to="/analyzer"
                  >
                    Analyzer
                  </MobileNavLink>

                  <MobileNavLink
                    to="/resumes"
                  >
                    My Resumes
                  </MobileNavLink>

                  <div
                    className="
                      my-3
                      h-px
                      bg-white/[0.06]
                    "
                  />

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="
                      w-full
                      rounded-2xl
                      px-4
                      py-3.5
                      text-left
                      text-sm
                      font-medium
                      text-red-400
                      transition
                      hover:bg-red-500/[0.06]
                    "
                  >
                    Logout
                  </button>
                </>
              )}

              {!authenticated && (
                <>
                  <div
                    className="
                      my-3
                      h-px
                      bg-white/[0.06]
                    "
                  />

                  <MobileNavLink
                    to="/login"
                  >
                    Login
                  </MobileNavLink>

                  <Link
                    to="/register"
                    onClick={
                      closeMenus
                    }
                    className="
                      mt-1
                      block
                      rounded-2xl
                      bg-indigo-500
                      px-4
                      py-3.5
                      text-center
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-indigo-400
                    "
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

