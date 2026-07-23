import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Message from "../components/Message.jsx";
import { registerUser } from "../services/api.js";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
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

    try {
      await registerUser(formData);
      setMessage("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      if (!err.response) {
        setError(
          `Cannot reach the backend API. Browser error: ${err.message}. Check Docker containers and API gateway.`
        );
        return;
      }

      const apiMessage = err.response.data?.message || "Registration failed.";
      const status = err.response.status;
      const errorCode = err.response.data?.code;
      const codeText = errorCode ? ` Error code: ${errorCode}.` : "";

      setError(`${apiMessage} Status: ${status}.${codeText}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Register</h1>
        <p className="muted">Create an account to start shortening URLs.</p>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />

          <Message type="success">{message}</Message>
          <Message type="error">{error}</Message>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="form-footer">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
