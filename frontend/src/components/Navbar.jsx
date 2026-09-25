import { Link, NavLink, useNavigate } from "react-router-dom";
import { isAuthenticated, removeToken } from "../services/authService.js";
import { LinkIcon, ChartIcon, UserIcon, LogOutIcon } from "./Icons.jsx";

function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="brand">
          <img src="/logo.svg" alt="ShortLink Pro" className="brand-logo-img" />
          <span className="brand-title">
            ShortLink<span className="brand-badge">PRO</span>
          </span>
        </Link>

        <nav className="nav-links">
          {loggedIn ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/my-urls"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                My Links
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <UserIcon size={15} />
                <span>Profile</span>
              </NavLink>

              <button
                type="button"
                className="logout-nav-button"
                onClick={handleLogout}
                title="Log out of your account"
              >
                <LogOutIcon size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Sign In
              </NavLink>

              <NavLink to="/register" className="btn-primary small">
                Get Started Free →
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
