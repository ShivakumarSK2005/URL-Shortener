import { useEffect, useState } from "react";
import Message from "../components/Message.jsx";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  SparklesIcon
} from "../components/Icons.jsx";
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await updateProfile(formData);
      setMessage(response.data.message || "Profile updated successfully.");
      setEditing(false);
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
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
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = formData.username
    ? formData.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric"
      })
    : "Member";

  return (
    <div className="page-wrapper max-w-profile">
      <div className="profile-banner-card">
        <div className="profile-avatar-large">
          <span>{initials}</span>
        </div>
        <div className="profile-banner-details">
          <h2>{formData.username || "User Account"}</h2>
          <p className="profile-meta-text">
            <span>{formData.email}</span> • <span>Joined {memberSince}</span>
          </p>
        </div>
      </div>

      {message && <Message type="success">{message}</Message>}
      {error && <Message type="error">{error}</Message>}

      <div className="detail-panel-card">
        <div className="panel-header-row">
          <div>
            <h3>Account Details</h3>
            <p className="panel-desc">Manage your personal account information.</p>
          </div>
          {!editing && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditing(true)}
            >
              Edit Details
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <span className="spinner"></span>
            <p>Loading account details...</p>
          </div>
        ) : (
          <form onSubmit={handleProfileSubmit} className="modern-form">
            <div className="form-group">
              <label htmlFor="username">Username / Full Name</label>
              <div className="input-with-icon">
                <span className="field-icon">
                  <UserIcon size={18} />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!editing}
                  required
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
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div className="input-with-icon">
                <span className="field-icon">
                  <PhoneIcon size={18} />
                </span>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Not provided"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>
            </div>

            {editing && (
              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      <div className="detail-panel-card">
        <div className="panel-header-row">
          <div>
            <h3>Security & Password</h3>
            <p className="panel-desc">Update your password to keep your account safe.</p>
          </div>
          {!showPasswordForm && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowPasswordForm(true)}
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="modern-form animate-slide-up">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="input-with-icon">
                <span className="field-icon">
                  <LockIcon size={18} />
                </span>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-icon-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex="-1"
                >
                  {showCurrentPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                </button>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-with-icon">
                  <span className="field-icon">
                    <LockIcon size={18} />
                  </span>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 6 chars"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-icon-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex="-1"
                  >
                    {showNewPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-with-icon">
                  <span className="field-icon">
                    <LockIcon size={18} />
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-icon-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
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

            <div className="form-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                className="btn-primary"
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
