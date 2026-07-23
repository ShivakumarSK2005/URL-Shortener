import { useState } from "react";
import Message from "../components/Message.jsx";
import { API_BASE_URL, shortenUrl } from "../services/api.js";

function Dashboard() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCopied(false);
    setShortUrl("");
    setLoading(true);

    try {
      const response = await shortenUrl(originalUrl);
      const shortCode = response.data.url.short_code;
      setShortUrl(`${API_BASE_URL}/api/urls/${shortCode}`);
      setOriginalUrl("");
    } catch (err) {
      if (!err.response) {
        setError(
          `Cannot reach the backend API at ${API_BASE_URL}. Browser error: ${err.message}.`
        );
        return;
      }

      const apiMessage = err.response.data?.message || "Could not shorten this URL.";
      const status = err.response.status;
      const errorCode = err.response.data?.code;
      const codeText = errorCode ? ` Error code: ${errorCode}.` : "";

      setError(`${apiMessage} Status: ${status}.${codeText}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
  };

  return (
    <section className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">Paste a long URL and generate a short link.</p>
      </div>

      <div className="panel">
        <form onSubmit={handleSubmit} className="url-form">
          <label htmlFor="originalUrl">Original URL</label>
          <div className="input-row">
            <input
              id="originalUrl"
              type="url"
              placeholder="https://www.google.com"
              value={originalUrl}
              onChange={(event) => setOriginalUrl(event.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Shortening..." : "Shorten URL"}
            </button>
          </div>
        </form>

        <Message type="error">{error}</Message>

        {shortUrl && (
          <div className="result-box">
            <span>{shortUrl}</span>
            <button type="button" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
