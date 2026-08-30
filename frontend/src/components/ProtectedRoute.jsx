
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// ============================================================
// PROTECTED ROUTE
// ============================================================
//
// RESPONSIBILITY:
//
// ✅ Wait for authentication restore
// ✅ Prevent unauthenticated access
// ✅ Preserve requested URL
// ✅ Allow authenticated users through
//
// ============================================================

function ProtectedRoute() {
  const location =
    useLocation();

  const {
    user,
    token,
    loading,
  } = useAuth();

  // ==========================================================
  // AUTH RESTORE IN PROGRESS
  // ==========================================================

  if (
    loading
  ) {
    return (
      <div
        className="
          min-h-screen
          w-full
          bg-[#07070a]
          text-white
          flex
          items-center
          justify-center
          px-6
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
            shadow-2xl
            shadow-black/20
          "
        >
          {/* LOADER */}

          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-indigo-400/10
              bg-indigo-500/[0.08]
            "
          >
            <span
              className="
                h-6
                w-6
                animate-spin
                rounded-full
                border-2
                border-indigo-300/20
                border-t-indigo-300
              "
            />
          </div>

          {/* TEXT */}

          <p
            className="
              mt-6
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
            Restoring your session
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Please wait while we securely verify
            your login session.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // AUTH CHECK
  // ==========================================================

  const authenticated =
    Boolean(
      user &&
      token
    );

  // ==========================================================
  // NOT AUTHENTICATED
  // ==========================================================

  if (
    !authenticated
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname:
              location.pathname,

            search:
              location.search,

            hash:
              location.hash,
          },
        }}
      />
    );
  }

  // ==========================================================
  // AUTHENTICATED
  // ==========================================================

  return <Outlet />;
}

export default ProtectedRoute;

