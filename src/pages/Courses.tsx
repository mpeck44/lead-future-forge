import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * /courses is retired as a standalone catalog. Legacy links (including
 * "#bundle" and per-course hashes) resolve to the dashboard's catalog
 * view, which renders the state-D purchase block regardless of the
 * user's current progress. Logged-out users pass through /auth via
 * ProtectedRoute; the intent hash (bundle vs. course slug) is
 * preserved in the URL so post-auth handling can restore it.
 */
const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash || "";
    navigate(`/dashboard?view=catalog${hash}`, { replace: true });
  }, [navigate, location.hash]);

  return null;
};

export default Courses;
