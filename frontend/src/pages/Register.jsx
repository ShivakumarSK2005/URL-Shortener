import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Message from "../components/Message.jsx";
import {
  LinkIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  SparklesIcon
} from "../components/Icons.jsx";
import { loginUser, registerUser } from "../services/api.js";
import { saveToken } from "../services/authService.js";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
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
    setMessage("");
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });

      let token = response.data?.token;

      // Fallback: If backend hasn't returned a token, log in directly
      if (!token) {
        const loginRes = await loginUser({
          email: formData.email,
          password: formData.password
        });
        token = loginRes.data?.token;
      }

      if (token) {
        saveToken(token);
        navigate("/dashboard", { replace: true });
        return;
      }

      setMessage("Registration successful. Logging you in...");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      if (!err.response) {
        setError(
          `Cannot connect to backend service. Please check your network connection.`
        );
        return;
      }

      const apiMessage = err.response.data?.message || "Registration failed.";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-modern">
        <div className="auth-card-header">
          <div className="auth-logo-badge">
            <SparklesIcon size={24} />
          </div>
          <h2>Create your account</h2>
          <p className="auth-subtitle">
            Get started with free, high-speed URL shortening and analytics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-group">
            <label htmlFor="username">Full Name / Username</label>
            <div className="input-with-icon">
              <span className="field-icon">
                <UserIcon size={18} />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="John Doe"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          </div>

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
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number (Optional)</label>
            <div className="input-with-icon">
              <span className="field-icon">
                <PhoneIcon size={18} />
              </span>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phoneNumber}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="field-icon">
                  <LockIcon size={18} />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <span className="field-icon">
                  <LockIcon size={18} />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password-icon-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon size={17} />
                  ) : (
                    <EyeIcon size={17} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && <Message type="error">{error}</Message>}
          {message && <Message type="success">{message}</Message>}

          <button type="submit" disabled={loading} className="btn-primary full-width">
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Creating account & signing in...</span>
              </>
            ) : (
              <>
                <span>Create Account & Sign In</span>
                <ArrowRightIcon size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
