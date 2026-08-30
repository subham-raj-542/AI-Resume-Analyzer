
import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

const Login = () => {
  // ============================================================
  // AUTH
  // ============================================================

  const {
    login,
    loading: authLoading,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  // ============================================================
  // UI STATE
  // ============================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ============================================================
  // REDIRECT DESTINATION
  // ============================================================

  const redirectPath =
    location.state?.from?.pathname ||
    "/analyzer";

  // ============================================================
  // HANDLE LOGIN
  // ============================================================

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      // --------------------------------------------------------
      // CLEAR PREVIOUS ERROR
      // --------------------------------------------------------

      setError("");

      // --------------------------------------------------------
      // EMAIL VALIDATION
      // --------------------------------------------------------

      const cleanEmail =
        email.trim();

      if (
        !cleanEmail
      ) {
        setError(
          "Please enter your email."
        );

        return;
      }

      // --------------------------------------------------------
      // PASSWORD VALIDATION
      // --------------------------------------------------------

      if (
        !password
      ) {
        setError(
          "Please enter your password."
        );

        return;
      }

      // --------------------------------------------------------
      // LOGIN
      // --------------------------------------------------------

      try {
        setLoading(
          true
        );

        const data =
          await login({
            email:
              cleanEmail,
            password,
          });

        console.log(
          "Login successful:",
          data
        );

        // ------------------------------------------------------
        // REDIRECT AFTER SUCCESSFUL LOGIN
        // ------------------------------------------------------

        navigate(
          redirectPath,
          {
            replace: true,
          }
        );
      } catch (
        loginError
      ) {
        console.error(
          "Login error:",
          loginError
        );

        setError(
          loginError?.message ||
            "Login failed. Please check your credentials."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // ============================================================
  // AUTH RESTORE LOADING
  // ============================================================

  if (
    authLoading
  ) {
    return (
      <div
        className="
          min-h-screen
          bg-slate-950
          text-white
          flex
          items-center
          justify-center
          px-6
        "
      >
        <div
          className="
            text-center
          "
        >
          <div
            className="
              w-12
              h-12
              mx-auto
              rounded-xl
              border-4
              border-white/10
              border-t-indigo-500
              animate-spin
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-slate-400
            "
          >
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
        flex
        items-center
        justify-center
        px-[10%]
      "
    >
      <div
        className="
          w-full
          max-w-md
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-8
        "
      >
        {/* ======================================================
            LOGO
        ======================================================= */}

        <div
          className="
            flex
            justify-center
            mb-6
          "
        >
          <Link
            to="/"
            className="
              w-12
              h-12
              rounded-xl
              bg-indigo-600
              flex
              items-center
              justify-center
              font-bold
              shadow-lg
              shadow-indigo-600/20
            "
          >
            AI
          </Link>
        </div>

        {/* ======================================================
            HEADING
        ======================================================= */}

        <h1
          className="
            text-4xl
            font-bold
            text-center
            mb-2
          "
        >
          Welcome Back
        </h1>

        <p
          className="
            text-zinc-400
            text-center
            mb-8
          "
        >
          Login to continue analyzing resumes
        </p>

        {/* ======================================================
            ERROR MESSAGE
        ======================================================= */}

        {error && (
          <div
            className="
              mb-6
              p-4
              rounded-xl
              bg-red-500/10
              border
              border-red-500/30
              text-red-400
              text-sm
            "
          >
            {error}
          </div>
        )}

        {/* ======================================================
            FORM
        ======================================================= */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            space-y-5
          "
        >
          {/* ====================================================
              EMAIL
          ==================================================== */}

          <div>
            <label
              htmlFor="email"
              className="
                block
                mb-2
                text-sm
                font-medium
                text-zinc-200
              "
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={
                email
              }
              onChange={(
                event
              ) => {
                setEmail(
                  event.target.value
                );

                if (
                  error
                ) {
                  setError("");
                }
              }}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={
                loading
              }
              className="
                w-full
                p-4
                rounded-xl
                bg-zinc-800
                outline-none
                border
                border-zinc-700
                focus:border-indigo-500
                transition
                disabled:opacity-50
              "
            />
          </div>

          {/* ====================================================
              PASSWORD
          ==================================================== */}

          <div>
            <label
              htmlFor="password"
              className="
                block
                mb-2
                text-sm
                font-medium
                text-zinc-200
              "
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={
                password
              }
              onChange={(
                event
              ) => {
                setPassword(
                  event.target.value
                );

                if (
                  error
                ) {
                  setError("");
                }
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={
                loading
              }
              className="
                w-full
                p-4
                rounded-xl
                bg-zinc-800
                outline-none
                border
                border-zinc-700
                focus:border-indigo-500
                transition
                disabled:opacity-50
              "
            />
          </div>

          {/* ====================================================
              LOGIN BUTTON
          ==================================================== */}

          <button
            type="submit"
            disabled={
              loading
            }
            className="
              w-full
              py-4
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-500
              transition
              font-semibold
              disabled:opacity-50
              disabled:cursor-not-allowed
              cursor-pointer
            "
          >
            {loading ? (
              <span
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                "
              >
                <span
                  className="
                    w-5
                    h-5
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white
                    animate-spin
                  "
                />

                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* ======================================================
            REGISTER LINK
        ======================================================= */}

        <p
          className="
            text-center
            text-zinc-400
            mt-6
          "
        >
          Don't have an account?

          <Link
            to="/register"
            className="
              text-indigo-500
              ml-2
              hover:text-indigo-400
              transition
            "
          >
            Create Account
          </Link>
        </p>

        {/* ======================================================
            HOME LINK
        ======================================================= */}

        <div
          className="
            text-center
            mt-5
          "
        >
          <Link
            to="/"
            className="
              text-sm
              text-zinc-500
              hover:text-zinc-300
              transition
            "
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

