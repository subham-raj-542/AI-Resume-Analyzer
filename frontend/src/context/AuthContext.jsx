
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../api/authApi";

const AuthContext =
  createContext(null);

// ============================================================
// AUTH PROVIDER
// ============================================================
//
// RESPONSIBILITY:
//
// ✅ Login
// ✅ Register
// ✅ Logout
// ✅ JWT persistence
// ✅ Session restoration
// ✅ Current-user recovery
// ✅ Authentication state
// ✅ Loading state
//
// ============================================================

export const AuthProvider = ({
  children,
}) => {
  // ==========================================================
  // USER
  // ==========================================================

  const [user, setUser] =
    useState(null);

  // ==========================================================
  // TOKEN
  // ==========================================================

  const [token, setToken] =
    useState(() => {
      try {
        return (
          localStorage.getItem(
            "token"
          ) || ""
        ).trim();
      } catch (error) {
        console.error(
          "Unable to read auth token:",
          error
        );

        return "";
      }
    });

  // ==========================================================
  // AUTH LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  // ==========================================================
  // CLEAR AUTH
  // ==========================================================

  const clearAuth = () => {
    try {
      localStorage.removeItem(
        "token"
      );

      // Remove active resume selection too.
      localStorage.removeItem(
        "selectedResumeId"
      );

      localStorage.removeItem(
        "resumeId"
      );
    } catch (error) {
      console.error(
        "Auth cleanup error:",
        error
      );
    }

    setToken("");
    setUser(null);

    // Notify resume-aware components.
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
  };

  // ==========================================================
  // RESTORE LOGIN SESSION
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const restoreUser =
      async () => {
        let savedToken = "";

        try {
          savedToken =
            (
              localStorage.getItem(
                "token"
              ) || ""
            ).trim();
        } catch (
          error
        ) {
          console.error(
            "Unable to read saved token:",
            error
          );
        }

        // ------------------------------------------------------
        // NO TOKEN
        // ------------------------------------------------------

        if (
          !savedToken
        ) {
          if (
            mounted
          ) {
            setToken("");
            setUser(null);
            setLoading(false);
          }

          return;
        }

        // ------------------------------------------------------
        // VERIFY TOKEN WITH BACKEND
        // ------------------------------------------------------

        try {
          const data =
            await getCurrentUser(
              savedToken
            );

          if (
            !mounted
          ) {
            return;
          }

          const currentUser =
            data?.user || null;

          // ----------------------------------------------------
          // USER NOT RETURNED
          // ----------------------------------------------------

          if (
            !currentUser
          ) {
            console.warn(
              "Current user was not returned during session restore."
            );

            clearAuth();

            return;
          }

          // ----------------------------------------------------
          // RESTORE SUCCESS
          // ----------------------------------------------------

          setUser(
            currentUser
          );

          setToken(
            savedToken
          );
        } catch (
          error
        ) {
          console.error(
            "Session restore failed:",
            error
          );

          if (
            mounted
          ) {
            clearAuth();
          }
        } finally {
          if (
            mounted
          ) {
            setLoading(false);
          }
        }
      };

    restoreUser();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    credentials
  ) => {
    const data =
      await loginUser(
        credentials
      );

    const newToken =
      String(
        data?.token || ""
      ).trim();

    const loggedInUser =
      data?.user || null;

    if (
      !newToken
    ) {
      throw new Error(
        "Login successful but token was not received."
      );
    }

    try {
      localStorage.setItem(
        "token",
        newToken
      );
    } catch (
      error
    ) {
      console.error(
        "Unable to save login token:",
        error
      );

      throw new Error(
        "Login succeeded, but the session could not be saved."
      );
    }

    setToken(
      newToken
    );

    setUser(
      loggedInUser
    );

    return data;
  };

  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = async (
    userData
  ) => {
    const data =
      await registerUser(
        userData
      );

    const newToken =
      String(
        data?.token || ""
      ).trim();

    const registeredUser =
      data?.user || null;

    if (
      !newToken
    ) {
      throw new Error(
        "Registration successful but token was not received."
      );
    }

    try {
      localStorage.setItem(
        "token",
        newToken
      );
    } catch (
      error
    ) {
      console.error(
        "Unable to save registration token:",
        error
      );

      throw new Error(
        "Registration succeeded, but the session could not be saved."
      );
    }

    setToken(
      newToken
    );

    setUser(
      registeredUser
    );

    return data;
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    clearAuth();
  };

  // ==========================================================
  // AUTHENTICATED STATE
  // ==========================================================

  const isAuthenticated =
    Boolean(
      token &&
      user
    );

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value =
    useMemo(
      () => ({
        user,
        token,
        loading,
        isAuthenticated,

        login,
        register,
        logout,
      }),
      [
        user,
        token,
        loading,
        isAuthenticated,
      ]
    );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// USE AUTH
// ============================================================

export const useAuth = () => {
  const context =
    useContext(
      AuthContext
    );

  if (
    !context
  ) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;

