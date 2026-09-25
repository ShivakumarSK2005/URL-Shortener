import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Message from "../components/Message.jsx";
import { deleteShortUrl, getMyUrls } from "../services/api.js";

function MyUrls() {
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingCode, setDeletingCode] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const handleCopy = async (shortCode) => {
    const fullShortUrl = `${window.location.origin}/api/urls/${shortCode}`;
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopiedCode(shortCode);
      setTimeout(() => {
        setCopiedCode("");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  useEffect(() => {
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

    fetchUrls();
  }, []);

  const handleDelete = async (shortCode) => {
    const confirmed = window.confirm(
      `Delete short URL ${shortCode}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingCode(shortCode);

    try {
      await deleteShortUrl(shortCode);
      setUrls((currentUrls) =>
        currentUrls.filter((url) => url.short_code !== shortCode)
      );
      setMessage("Short URL deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete short URL.");
    } finally {
      setDeletingCode("");
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <h1>My URLs</h1>
        <p className="muted">View your shortened links and check analytics.</p>
      </div>

      <div className="panel">
        {loading && <p>Loading URLs...</p>}
        <Message type="success">{message}</Message>
        <Message type="error">{error}</Message>

        {!loading && !error && urls.length === 0 && (
          <p className="empty-state">You have not created any short URLs yet.</p>
        )}

        {urls.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Short Code</th>
                  <th>Copy URL</th>
                  <th>Click Count</th>
                  <th>Analytics</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url.id || url.short_code}>
                    <td>
                      <a href={url.original_url} target="_blank" rel="noreferrer">
                        {url.original_url}
                      </a>
                    </td>
                    <td>{url.short_code}</td>
                    <td>
                      <button
                        type="button"
                        className={`copy-button ${copiedCode === url.short_code ? "copied" : ""}`}
                        onClick={() => handleCopy(url.short_code)}
                      >
                        {copiedCode === url.short_code ? "Copied!" : "Copy"}
                      </button>
                    </td>
                    <td>{url.click_count}</td>
                    <td>
                      <Link className="small-button" to={`/analytics/${url.short_code}`}>
                        View
                      </Link>
                    </td>
                      <td>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDelete(url.short_code)}
                          disabled={deletingCode === url.short_code}
                        >
                          {deletingCode === url.short_code ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default MyUrls;
