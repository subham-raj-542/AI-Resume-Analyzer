
// ============================================================
// AI RESUME ANALYZER
// CENTRAL API CONFIGURATION
// ============================================================
//
// FRONTEND .env:
//
// VITE_API_URL=http://localhost:5000
//
// Example production:
//
// VITE_API_URL=https://your-backend-domain.com
//
// ============================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(
  /\/+$/,
  ""
);

// ============================================================
// EXPORT
// ============================================================

export default API_BASE_URL;

export {
  API_BASE_URL,
};

