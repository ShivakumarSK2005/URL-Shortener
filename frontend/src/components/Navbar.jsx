import { Link, NavLink, useNavigate } from "react-router-dom";
import { isAuthenticated, removeToken } from "../services/authService.js";

function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/dashboard" className="brand">
        <img src="/link-logo.webp" alt="" />
        URL Shortener
      </Link>

      <nav className="nav-links">
        {loggedIn ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/my-urls">My URLs</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <button type="button" className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
