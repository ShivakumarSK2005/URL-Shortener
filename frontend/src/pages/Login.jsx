import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Message from "../components/Message.jsx";
import {
  LinkIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon
} from "../components/Icons.jsx";
import { loginUser } from "../services/api.js";
import { saveToken } from "../services/authService.js";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(formData);
      saveToken(response.data.token);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-modern">
        <div className="auth-card-header">
          <div className="auth-logo-badge">
            <LinkIcon size={24} />
          </div>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            Sign in to manage and analyze your shortened links.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <span className="field-icon">
                <MailIcon size={18} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-with-icon">
              <span className="field-icon">
                <LockIcon size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {error && <Message type="error">{error}</Message>}

          <button type="submit" disabled={loading} className="btn-primary full-width">
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRightIcon size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="auth-link">
              Create an account free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
