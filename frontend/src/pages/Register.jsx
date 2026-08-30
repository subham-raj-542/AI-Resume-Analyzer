
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

const Register = () => {
  // ============================================================
  // AUTH
  // ============================================================

  const {
    register,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();

  const navigate =
    useNavigate();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [
    name,
    setName,
  ] = useState("");

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
  // REDIRECT ALREADY LOGGED-IN USER
  // ============================================================

  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated
    ) {
      navigate(
        "/analyzer",
        {
          replace: true,
        }
      );
    }
  }, [
    authLoading,
    isAuthenticated,
    navigate,
  ]);

  // ============================================================
  // HANDLE REGISTER
  // ============================================================

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      // --------------------------------------------------------
      // CLEAR ERROR
      // --------------------------------------------------------

      setError("");

      // --------------------------------------------------------
      // NAME VALIDATION
      // --------------------------------------------------------

      if (
        !name.trim()
      ) {
        setError(
          "Please enter your full name."
        );

        return;
      }

      // --------------------------------------------------------
      // EMAIL VALIDATION
      // --------------------------------------------------------

      if (
        !email.trim()
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
          "Please create a password."
        );

        return;
      }

      if (
        password.length <
        6
      ) {
        setError(
          "Password must be at least 6 characters long."
        );

        return;
      }

      // --------------------------------------------------------
      // REGISTER
      // --------------------------------------------------------

      try {
        setLoading(
          true
        );

        const data =
          await register({
            name:
              name.trim(),

            email:
              email.trim(),

            password,
          });

        console.log(
          "Registration successful:",
          data
        );

        // ------------------------------------------------------
        // REDIRECT
        // ------------------------------------------------------

        navigate(
          "/analyzer",
          {
            replace: true,
          }
        );
      } catch (
        registerError
      ) {
        console.error(
          "Registration error:",
          registerError
        );

        setError(
          registerError?.message ||
            "Registration failed. Please try again."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // ============================================================
  // AUTH CHECK LOADING
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
          Create Account
        </h1>

        <p
          className="
            text-zinc-400
            text-center
            mb-8
          "
        >
          Start improving your resume today
        </p>

        {/* ======================================================
            ERROR
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
              FULL NAME
          ==================================================== */}

          <div>
            <label
              htmlFor="name"
              className="
                block
                mb-2
                text-sm
                font-medium
                text-zinc-200
              "
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              value={
                name
              }
              onChange={(
                event
              ) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter your name"
              autoComplete="name"
              disabled={
                loading
              }
              className="
                w-full
                p-4
                rounded-xl
                bg-zinc-800
                border
                border-zinc-700
                outline-none
                focus:border-indigo-500
                transition
                disabled:opacity-50
              "
            />
          </div>

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
              ) =>
                setEmail(
                  event.target.value
                )
              }
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
                border
                border-zinc-700
                outline-none
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
              ) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Create password"
              autoComplete="new-password"
              disabled={
                loading
              }
              className="
                w-full
                p-4
                rounded-xl
                bg-zinc-800
                border
                border-zinc-700
                outline-none
                focus:border-indigo-500
                transition
                disabled:opacity-50
              "
            />

            <p
              className="
                mt-2
                text-xs
                text-zinc-500
              "
            >
              Password must contain at least 6 characters.
            </p>
          </div>

          {/* ====================================================
              REGISTER BUTTON
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

                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* ======================================================
            LOGIN LINK
        ======================================================= */}

        <p
          className="
            text-center
            text-zinc-400
            mt-6
          "
        >
          Already have an account?

          <Link
            to="/login"
            className="
              text-indigo-500
              ml-2
              hover:text-indigo-400
              transition
            "
          >
            Login
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

export default Register;

