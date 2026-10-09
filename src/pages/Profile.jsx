import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import NavShell from "../components/NavShell";
import {
  MailIcon,
  PhoneIcon,
} from "../components/Icons";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("user");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async () => {
    try {
      const res = await api.get("/auth/me/");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.warn("Failed to fetch fresh user profile, using cached:", err);
      try {
        const cached = localStorage.getItem("user");
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch {
        // ignore parse error
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const getInitials = () => {
    const first = user.first_name || "";
    const last = user.last_name || "";
    if (first && last) {
      return (first[0] + last[0]).toUpperCase();
    }
    return (user.username || "U").substring(0, 2).toUpperCase();
  };

  const getFullName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name || user.username || "Intern";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Specified";
    try {
      return new Date(dateStr + "T00:00:00").toLocaleDateString([], {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading && !user.username) {
    return (
      <NavShell>
        <div className="state-container">
          <div className="loading-spinner" />
          <p className="state-title">Loading profile details...</p>
        </div>
      </NavShell>
    );
  }

  return (
    <NavShell>
      {/* Header */}
      <header className="page-header">
        <div className="page-header-text">
          <span className="page-category-badge">My Account</span>
          <h1 className="page-heading">Profile Details</h1>
          <p className="page-subheading">
            Review your personal information and active internship assignment details.
          </p>
        </div>
      </header>

      <div className="profile-layout-grid">
        {/* Left: Overview Card */}
        <aside className="profile-card-panel profile-overview-card">
          <div className="profile-avatar-large">
            {getInitials()}
          </div>

          <h2 className="profile-name">{getFullName()}</h2>
          <p className="profile-role-tag">
            {user.role || "Applicant"}
          </p>

          <span className="profile-status-pill">
            <span className="status-indicator-dot" />
            Active Intern
          </span>

          <div className="profile-card-divider" />

          <div className="profile-contact-list">
            <div className="contact-row-item">
              <div className="contact-icon-box">
                <MailIcon size={18} />
              </div>
              <div className="contact-text-box">
                <span className="contact-label">Email Address</span>
                <span className="contact-value">{user.email || "Not specified"}</span>
              </div>
            </div>

            <div className="contact-row-item">
              <div className="contact-icon-box">
                <PhoneIcon size={18} />
              </div>
              <div className="contact-text-box">
                <span className="contact-label">Phone Number</span>
                <span className="contact-value">{user.phone || "Not specified"}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right: Detailed Panels Stack */}
        <section className="profile-details-stack">
          {/* Panel 1: Personal Details */}
          <div className="profile-card-panel">
            <div className="panel-heading-row">
              <h2 className="panel-title">Personal Information</h2>
              <span className="panel-badge">Profile</span>
            </div>

            <div className="details-grid-two-col">
              <div className="detail-cell">
                <span className="detail-field-label">Full Name</span>
                <span className="detail-field-value">{getFullName()}</span>
              </div>

              <div className="detail-cell">
                <span className="detail-field-label">Username</span>
                <span className="detail-field-value">@{user.username || "--"}</span>
              </div>

              <div className="detail-cell">
                <span className="detail-field-label">Email Address</span>
                <span className="detail-field-value">{user.email || "--"}</span>
              </div>

              <div className="detail-cell">
                <span className="detail-field-label">Contact Phone</span>
                <span className="detail-field-value">{user.phone || "--"}</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Internship Information */}
          <div className="profile-card-panel">
            <div className="panel-heading-row">
              <h2 className="panel-title">Internship Assignment</h2>
              <span className="panel-badge">Internship</span>
            </div>

            <div className="details-grid-two-col">
              <div className="detail-cell">
                <span className="detail-field-label">Department</span>
                <span className="detail-field-value">
                  {user.department || "Development"}
                </span>
              </div>

              <div className="detail-cell">
                <span className="detail-field-label">Designated Role</span>
                <span className="detail-field-value">
                  {user.role || "Intern"}
                </span>
              </div>

              <div className="detail-cell">
                <span className="detail-field-label">Internship Start</span>
                <span className="detail-field-value">
                  {formatDate(user.internship_start)}
                </span>
              </div>

              <div className="detail-cell">
                <span className="detail-field-label">Internship End</span>
                <span className="detail-field-value">
                  {formatDate(user.internship_end)}
                </span>
              </div>

              <div className="detail-cell">
                <span className="detail-field-label">Assigned Mentor</span>
                <span className="detail-field-value">
                  {user.mentor ? `Mentor ID #${user.mentor}` : "Not Assigned"}
                </span>
              </div>

              <div className="detail-cell">
                <span className="detail-field-label">Portal Status</span>
                <span className="detail-field-value" style={{ color: "var(--success-text)" }}>
                  ● Verified Active
                </span>
              </div>
            </div>
          </div>

          {/* Panel 3: Account & System Details */}
          <div className="profile-card-panel">
            <div className="panel-heading-row">
              <h2 className="panel-title">Security & Account</h2>
              <span className="panel-badge">System</span>
            </div>

            <div className="details-grid-two-col">
              <div className="detail-cell">
                <span className="detail-field-label">User ID</span>
                <span className="detail-field-value">#{user.id || "--"}</span>
              </div>

              <div className="detail-cell">
                <span className="detail-field-label">Session Status</span>
                <span className="detail-field-value">Authenticated (JWT)</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </NavShell>
  );
}

export default Profile;
