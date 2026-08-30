import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// ============================================================
// PUBLIC ROUTE
// ============================================================
//
// Ye route sirf unauthenticated users ke liye hai.
//
// Agar user already logged in hai:
//
// /login
// /register
//
// se automatically:
//
// /dashboard
//
// par redirect hoga.
//
// ============================================================

const PublicRoute = () => {
  // ==========================================================
  // AUTH STATE
  // ==========================================================

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  // ==========================================================
  // AUTH CHECK LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />

          <p className="mt-5 text-sm text-slate-400">
            Checking authentication...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================================
  // ALREADY AUTHENTICATED
  // ==========================================================

  if (isAuthenticated || user) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // ==========================================================
  // NOT AUTHENTICATED
  // ==========================================================

  return <Outlet />;
};

export default PublicRoute;