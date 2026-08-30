
import ResumeUpload from "./ResumeUpload";

// ============================================================
// RESUME UPLOADER
// ============================================================
//
// Compatibility wrapper around the single source of truth:
//
// ResumeUpload.jsx
//
// This component intentionally contains NO API logic.
//
// Actual upload + analysis logic lives in:
//
// frontend/src/components/ResumeUpload.jsx
//
// ============================================================
//
// FORWARDED CALLBACKS:
//
// ✅ Resume text
// ✅ Analysis result
// ✅ Resume ID
// ✅ Resume removal event
//
// ============================================================

function ResumeUploader({
  onResumeTextExtracted,
  onAnalysisComplete,
  onResumeIdExtracted,
  onResumeRemoved,
}) {
  return (
    <ResumeUpload
      onResumeTextExtracted={
        onResumeTextExtracted
      }

      onAnalysisComplete={
        onAnalysisComplete
      }

      onResumeIdExtracted={
        onResumeIdExtracted
      }

      onResumeRemoved={
        onResumeRemoved
      }
    />
  );
}

// ============================================================
// EXPORT
// ============================================================

export default ResumeUploader;

