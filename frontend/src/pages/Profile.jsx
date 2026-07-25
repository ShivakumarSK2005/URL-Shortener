import { useEffect, useState } from "react";
import Message from "../components/Message.jsx";
import { changePassword, getProfile, updateProfile } from "../services/api.js";

function Profile() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const user = response.data.user;

        setFormData({
          username: user.username,
          email: user.email,
          phoneNumber: user.phone_number || ""
        });
        setCreatedAt(user.created_at);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handlePasswordChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await updateProfile(formData);
      const user = response.data.user;

      setFormData({
        username: user.username,
        email: user.email,
        phoneNumber: user.phone_number || ""
      });
      setMessage(response.data.message || "Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setMessage(response.data.message || "Password changed successfully.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setMessage("");
    setError("");
  };

  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleString()
    : "Not available";

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Profile</h1>
          <p className="muted">View and update your account information.</p>
        </div>
      </div>

      <div className="profile-layout">
        <div className="panel profile-summary">
          <div className="avatar">{formData.username.charAt(0).toUpperCase() || "U"}</div>
          <h2>{formData.username || "User"}</h2>
          <p>{formData.email || "No email available"}</p>
          <p>{formData.phoneNumber || "No phone number added"}</p>
          <span>Joined {joinedDate}</span>
        </div>

        <div className="panel">
          <div className="panel-title-row">
            <div>
              <h2>Account Details</h2>
              <p>Keep your profile information up to date.</p>
            </div>
            {!editing && !loading && (
              <button type="button" className="secondary-button" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
          </div>

          {loading && <p>Loading profile...</p>}
          <Message type="success">{message}</Message>
          <Message type="error">{error}</Message>

          {!loading && (
            <form onSubmit={handleSubmit} className="form">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                disabled={!editing}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing}
                required
              />

              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Add phone number"
              />

              {editing && (
                <div className="button-row">
                  <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className="secondary-button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="panel password-panel">
          <div className="panel-title-row">
            <div>
              <h2>Password</h2>
              <p>Change your password after confirming the current one.</p>
            </div>
            {!showPasswordForm && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="form">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />

              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
              />

              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
              />

              <div className="button-row">
                <button type="submit" disabled={changingPassword}>
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default Profile;
