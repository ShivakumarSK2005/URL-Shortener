import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Message from "../components/Message.jsx";
import {
  LinkIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  ChartIcon,
  SparklesIcon,
  ArrowRightIcon
} from "../components/Icons.jsx";
import { API_BASE_URL, URL_SERVICE_URL, getMyUrls, shortenUrl } from "../services/api.js";

function Dashboard() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({ totalUrls: 0, totalClicks: 0, recentUrls: [] });
  const [fetchingMetrics, setFetchingMetrics] = useState(true);

  const loadMetrics = async () => {
    try {
      const response = await getMyUrls();
      const urls = response.data.urls || [];
      const totalClicks = urls.reduce((acc, curr) => acc + (curr.click_count || 0), 0);
      setMetrics({
        totalUrls: urls.length,
        totalClicks,
        recentUrls: urls.slice(0, 3)
      });
    } catch {
      // Gracefully ignore metrics error on initial load
    } finally {
      setFetchingMetrics(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCopied(false);
    setShortUrl("");
    setShortCode("");
    setLoading(true);

    try {
      const response = await shortenUrl(originalUrl);
      const code = response.data.url.short_code;
      const base = URL_SERVICE_URL || window.location.origin;
      const cleanBase = base.replace(/\/+$/, "");
      const fullShortUrl = `${cleanBase}/api/urls/${code}`;

      setShortCode(code);
      setShortUrl(fullShortUrl);
      setOriginalUrl("");
      loadMetrics(); // refresh metrics in background
    } catch (err) {
      if (!err.response) {
        setError(
          `Cannot reach the backend API. Please check your network connection.`
        );
        return;
      }

      const apiMessage = err.response.data?.message || "Could not shorten this URL.";
      const status = err.response.status;
      setError(`${apiMessage} (Status: ${status})`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-badge">
          <SparklesIcon size={14} />
          <span>High-Performance Link Management</span>
        </div>
        <h1 className="hero-title">
          Shorten links, <span className="gradient-text">scale reach.</span>
        </h1>
        <p className="hero-subtitle">
          Transform long, cluttered URLs into clean, lightning-fast links backed by Redis caching and real-time click tracking.
        </p>

        {/* Shorten Input Card */}
        <div className="shorten-card">
          <form onSubmit={handleSubmit} className="shorten-form">
            <div className="url-input-container">
              <span className="input-icon">
                <LinkIcon size={20} />
              </span>
              <input
                id="originalUrl"
                type="url"
                placeholder="Paste your long destination URL (e.g., https://example.com/very-long-path)..."
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
                required
                autoComplete="off"
              />
              <button type="submit" disabled={loading} className="btn-primary shorten-btn">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Shortening...</span>
                  </>
                ) : (
                  <>
                    <span>Shorten Link</span>
                    <ArrowRightIcon size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && <Message type="error">{error}</Message>}

          {/* Generated Link Result Box */}
          {shortUrl && (
            <div className="result-card animate-slide-up">
              <div className="result-header">
                <span className="live-dot-badge">
                  <span className="dot"></span>
                  Link Ready
                </span>
                <span className="result-hint">Sub-millisecond Redis cached</span>
              </div>

              <div className="result-body">
                <div className="result-link-display">
                  <span className="short-url-text">{shortUrl}</span>
                </div>

                <div className="result-actions">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`btn-action ${copied ? "copied" : ""}`}
                  >
                    {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                    <span>{copied ? "Copied to clipboard!" : "Copy Link"}</span>
                  </button>

                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-action secondary"
                    title="Open link in new tab"
                  >
                    <ExternalLinkIcon size={16} />
                    <span>Visit</span>
                  </a>

                  {shortCode && (
                    <Link
                      to={`/analytics/${shortCode}`}
                      className="btn-action secondary"
                      title="Inspect link analytics"
                    >
                      <ChartIcon size={16} />
                      <span>Analytics</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KPI Stats Overview */}
      <section className="stats-overview-section">
        <div className="section-header-compact">
          <h2>Platform Overview</h2>
          <Link to="/my-urls" className="view-all-link">
            <span>Manage All Links</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap primary">
              <LinkIcon size={20} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Active Links</span>
              <strong className="kpi-value">
                {fetchingMetrics ? "..." : metrics.totalUrls}
              </strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap success">
              <ChartIcon size={20} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Total Clicks Recorded</span>
              <strong className="kpi-value">
                {fetchingMetrics ? "..." : metrics.totalClicks}
              </strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap accent">
              <SparklesIcon size={20} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Cache Redirection</span>
              <strong className="kpi-value text-accent">Redis TLS</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Links Preview */}
      {metrics.recentUrls.length > 0 && (
        <section className="recent-links-section">
          <div className="section-header-compact">
            <h2>Recent Links</h2>
            <Link to="/my-urls" className="view-all-link">
              View All ({metrics.totalUrls})
            </Link>
          </div>

          <div className="table-card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Short Link</th>
                    <th>Destination URL</th>
                    <th>Clicks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentUrls.map((item) => {
                    const base = URL_SERVICE_URL || window.location.origin;
                    const cleanBase = base.replace(/\/+$/, "");
                    const link = `${cleanBase}/api/urls/${item.short_code}`;
                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="code-badge">{item.short_code}</span>
                        </td>
                        <td>
                          <a
                            href={item.original_url}
                            target="_blank"
                            rel="noreferrer"
                            className="original-url-cell"
                            title={item.original_url}
                          >
                            {item.original_url}
                          </a>
                        </td>
                        <td>
                          <span className="click-pill">
                            <span className="pulse-dot"></span>
                            {item.click_count || 0} clicks
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/analytics/${item.short_code}`}
                            className="btn-table-action"
                          >
                            <ChartIcon size={14} />
                            <span>Stats</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
