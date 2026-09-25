import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Message from "../components/Message.jsx";
import {
  LinkIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  ChartIcon,
  SparklesIcon,
  ArrowRightIcon,
  GlobeIcon
} from "../components/Icons.jsx";
import { URL_SERVICE_URL, getUrlStats } from "../services/api.js";

function Analytics() {
  const { shortCode } = useParams();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getUrlStats(shortCode);
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load link statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [shortCode]);

  const base = URL_SERVICE_URL || window.location.origin;
  const cleanBase = base.replace(/\/+$/, "");
  const fullShortUrl = `${cleanBase}/api/urls/${shortCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const createdDate = stats?.created_at
    ? new Date(stats.created_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "Recently";

  return (
    <div className="page-wrapper">
      <div className="breadcrumb-nav">
        <Link to="/my-urls" className="back-breadcrumb-link">
          ← Back to All Links
        </Link>
      </div>

      <div className="page-header-row">
        <div>
          <span className="eyebrow">Real-Time Performance</span>
          <h1 className="page-title">
            Analytics for <span className="code-badge large">{shortCode}</span>
          </h1>
          <p className="page-subtitle">
            Tracking click engagement, cache performance, and redirection metrics.
          </p>
        </div>

        <div className="header-action-group">
          <button
            type="button"
            className={`btn-action ${copied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            <span>{copied ? "Copied Link!" : "Copy Link"}</span>
          </button>

          <a
            href={fullShortUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            <span>Test Redirect</span>
            <ExternalLinkIcon size={15} />
          </a>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <span className="spinner large"></span>
          <p>Gathering performance metrics...</p>
        </div>
      )}

      {error && <Message type="error">{error}</Message>}

      {stats && (
        <>
          {/* Main KPI Stat Cards */}
          <div className="kpi-grid">
            <div className="kpi-card highlight-card">
              <div className="kpi-icon-wrap primary">
                <ChartIcon size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Total Clicks</span>
                <strong className="kpi-value text-primary large">
                  {stats.click_count || 0}
                </strong>
                <span className="kpi-subtext">Real-time tracked</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap success">
                <SparklesIcon size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Cache Acceleration</span>
                <strong className="kpi-value text-success">Redis Tier 1</strong>
                <span className="kpi-subtext">&lt; 1ms resolution</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap accent">
                <GlobeIcon size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Redirect Method</span>
                <strong className="kpi-value">HTTP 302 Found</strong>
                <span className="kpi-subtext">Direct browser forwarding</span>
              </div>
            </div>
          </div>

          {/* Detailed Info Card */}
          <div className="detail-panel-card">
            <h3 className="card-section-title">Link Specification</h3>

            <div className="spec-list">
              <div className="spec-row">
                <span className="spec-label">Original Long URL:</span>
                <div className="spec-value-wrap">
                  <a
                    href={stats.original_url}
                    target="_blank"
                    rel="noreferrer"
                    className="spec-link"
                  >
                    <span>{stats.original_url}</span>
                    <ExternalLinkIcon size={14} />
                  </a>
                </div>
              </div>

              <div className="spec-row">
                <span className="spec-label">Shortened URL:</span>
                <div className="spec-value-wrap">
                  <span className="code-text">{fullShortUrl}</span>
                </div>
              </div>

              <div className="spec-row">
                <span className="spec-label">Creation Timestamp:</span>
                <span className="spec-value">{createdDate}</span>
              </div>

              <div className="spec-row">
                <span className="spec-label">Link Status:</span>
                <span className="live-status-tag">
                  <span className="dot"></span> Active & Serving
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
