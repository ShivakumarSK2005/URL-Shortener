import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Message from "../components/Message.jsx";
import { getUrlStats } from "../services/api.js";

function Analytics() {
  const { shortCode } = useParams();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getUrlStats(shortCode);
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [shortCode]);

  const createdDate = stats?.created_at
    ? new Date(stats.created_at).toLocaleString()
    : "Not available";

  return (
    <section className="page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p className="muted">Performance details for this short URL.</p>
      </div>

      <div className="panel">
        {loading && <p>Loading analytics...</p>}
        <Message type="error">{error}</Message>

        {stats && (
          <div className="stats-grid">
            <div>
              <span>Original URL</span>
              <strong>
                <a href={stats.original_url} target="_blank" rel="noreferrer">
                  {stats.original_url}
                </a>
              </strong>
            </div>
            <div>
              <span>Short Code</span>
              <strong>{stats.short_code}</strong>
            </div>
            <div>
              <span>Click Count</span>
              <strong>{stats.click_count}</strong>
            </div>
            <div>
              <span>Created Date</span>
              <strong>{createdDate}</strong>
            </div>
          </div>
        )}

        <Link className="back-link" to="/my-urls">
          Back to My URLs
        </Link>
      </div>
    </section>
  );
}

export default Analytics;
