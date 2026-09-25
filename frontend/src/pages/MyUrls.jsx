import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Message from "../components/Message.jsx";
import {
  LinkIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  ChartIcon,
  TrashIcon,
  SearchIcon,
  SparklesIcon
} from "../components/Icons.jsx";
import { URL_SERVICE_URL, deleteShortUrl, getMyUrls } from "../services/api.js";

function MyUrls() {
  const [urls, setUrls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingCode, setDeletingCode] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const handleCopy = async (shortCode) => {
    const base = URL_SERVICE_URL || window.location.origin;
    const cleanBase = base.replace(/\/+$/, "");
    const fullShortUrl = `${cleanBase}/api/urls/${shortCode}`;
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopiedCode(shortCode);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch {
      // fallback
    }
  };

  const fetchUrls = async () => {
    try {
      const response = await getMyUrls();
      setUrls(response.data.urls || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your URLs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleDelete = async (shortCode) => {
    const confirmed = window.confirm(
      `Delete short URL "${shortCode}"? This will permanently remove it from the database and Redis cache.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingCode(shortCode);

    try {
      await deleteShortUrl(shortCode);
      setUrls((currentUrls) =>
        currentUrls.filter((url) => url.short_code !== shortCode)
      );
      setMessage(`Short link ${shortCode} deleted successfully.`);
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete URL.");
    } finally {
      setDeletingCode("");
    }
  };

  const filteredUrls = urls.filter(
    (item) =>
      item.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.original_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClicks = urls.reduce((acc, curr) => acc + (curr.click_count || 0), 0);

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div>
          <span className="eyebrow">Link Management</span>
          <h1 className="page-title">My Links</h1>
          <p className="page-subtitle">
            Manage your shortened URLs, monitor real-time engagement, and inspect traffic analytics.
          </p>
        </div>

        <Link to="/dashboard" className="btn-primary">
          <SparklesIcon size={16} />
          <span>Create New Link</span>
        </Link>
      </div>

      {/* KPI Header Bar */}
      <div className="links-summary-bar">
        <div className="summary-pill">
          <span className="summary-label">Total Links:</span>
          <strong>{urls.length}</strong>
        </div>
        <div className="summary-pill">
          <span className="summary-label">Total Clicks:</span>
          <strong className="text-primary">{totalClicks}</strong>
        </div>
        <div className="summary-pill">
          <span className="summary-label">Status:</span>
          <span className="live-status-tag">
            <span className="dot"></span> Online
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-filter-card">
        <div className="search-input-wrap">
          <SearchIcon size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by short code or original URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </button>
        )}
      </div>

      {message && <Message type="success">{message}</Message>}
      {error && <Message type="error">{error}</Message>}

      {/* Links Data Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <span className="spinner large"></span>
            <p>Loading your shortened links...</p>
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon-wrap">
              <LinkIcon size={36} />
            </div>
            <h3>{searchTerm ? "No matching links found" : "No links generated yet"}</h3>
            <p>
              {searchTerm
                ? "Try searching for a different keyword or short code."
                : "Create your first branded short link in seconds from the dashboard."}
            </p>
            {!searchTerm && (
              <Link to="/dashboard" className="btn-primary">
                Shorten a URL Now →
              </Link>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Short Code</th>
                  <th>Destination URL</th>
                  <th>Clicks</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUrls.map((url) => {
                  const base = URL_SERVICE_URL || window.location.origin;
                  const cleanBase = base.replace(/\/+$/, "");
                  const fullShortUrl = `${cleanBase}/api/urls/${url.short_code}`;
                  const isCopied = copiedCode === url.short_code;
                  const isDeleting = deletingCode === url.short_code;
                  const dateFormatted = new Date(url.created_at).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric", year: "numeric" }
                  );

                  return (
                    <tr key={url.id} className="table-row-hover">
                      <td>
                        <div className="code-pill-cell">
                          <span className="code-badge">{url.short_code}</span>
                          <button
                            type="button"
                            className={`btn-icon-copy ${isCopied ? "copied" : ""}`}
                            onClick={() => handleCopy(url.short_code)}
                            title="Copy short link"
                          >
                            {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="destination-cell">
                          <a
                            href={url.original_url}
                            target="_blank"
                            rel="noreferrer"
                            className="url-truncate-link"
                            title={url.original_url}
                          >
                            <span>{url.original_url}</span>
                            <ExternalLinkIcon size={13} className="ext-icon" />
                          </a>
                        </div>
                      </td>

                      <td>
                        <span className="click-pill">
                          <span className="pulse-dot"></span>
                          {url.click_count || 0}
                        </span>
                      </td>

                      <td>
                        <span className="date-cell">{dateFormatted}</span>
                      </td>

                      <td>
                        <div className="row-actions-right">
                          <a
                            href={fullShortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="action-btn"
                            title="Open short link"
                          >
                            <ExternalLinkIcon size={15} />
                          </a>

                          <Link
                            to={`/analytics/${url.short_code}`}
                            className="action-btn"
                            title="View Link Analytics"
                          >
                            <ChartIcon size={15} />
                          </Link>

                          <button
                            type="button"
                            className="action-btn danger"
                            onClick={() => handleDelete(url.short_code)}
                            disabled={isDeleting}
                            title="Delete link"
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyUrls;
