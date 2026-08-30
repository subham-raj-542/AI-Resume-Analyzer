
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Analyzer from "./pages/Analyzer";

import ResumeDashboard from "./components/ResumeDashboard";
import ResumeDetails from "./components/ResumeDetails";
import EditResume from "./components/EditResume";
import ProtectedRoute from "./components/ProtectedRoute";

// ============================================================
// APP ROUTES
// ============================================================
//
// PUBLIC
//   /
//   /login
//   /register
//
// PROTECTED
//   /analyzer
//   /resumes
//   /resumes/:id
//   /resumes/:id/edit
//
// ============================================================

function App() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ======================================================= */}

      <Route
        path="/"
        element={
          <Home />
        }
      />

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      <Route
        path="/register"
        element={
          <Register />
        }
      />

      {/* ======================================================
          PROTECTED ROUTES
      ======================================================= */}

      <Route
        element={
          <ProtectedRoute />
        }
      >
        {/* ----------------------------------------------------
            ANALYZER
        ----------------------------------------------------- */}

        <Route
          path="/analyzer"
          element={
            <Analyzer />
          }
        />

        {/* ----------------------------------------------------
            MY RESUMES
        ----------------------------------------------------- */}

        <Route
          path="/resumes"
          element={
            <ResumeDashboard />
          }
        />

        {/* ----------------------------------------------------
            RESUME DETAILS
        ----------------------------------------------------- */}

        <Route
          path="/resumes/:id"
          element={
            <ResumeDetails />
          }
        />

        {/* ----------------------------------------------------
            REPLACE / RE-ANALYZE RESUME
        ----------------------------------------------------- */}

        <Route
          path="/resumes/:id/edit"
          element={
            <EditResume />
          }
        />
      </Route>

      {/* ======================================================
          FALLBACK
      ======================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;

