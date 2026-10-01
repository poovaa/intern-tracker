import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import NavShell from "../components/NavShell";
import {
  CheckIcon,
  ClockIcon,
  LeaveIcon,
  WorkIcon,
  CalendarIcon,
  ArrowRightIcon,
  AlertIcon,
} from "../components/Icons";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const fetchDashboard = useCallback(async () => {
    setError("");
    try {
      const response = await api.get("/dashboard/");
      setData(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/", { replace: true });
      } else {
        setError("Unable to load dashboard details from server.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    fetchDashboard();
  }, [fetchDashboard, navigate]);

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString + "T00:00:00").toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getTodayFormatted = () => {
    return new Date().toLocaleDateString([], {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <NavShell>
        <div className="state-container">
          <div className="loading-spinner" />
          <p className="state-title">Loading your dashboard...</p>
        </div>
      </NavShell>
    );
  }

  if (error) {
    return (
      <NavShell>
        <div className="state-container">
          <AlertIcon size={40} className="text-danger" />
          <h2 className="state-title">{error}</h2>
          <button className="state-btn" onClick={fetchDashboard}>
            Retry
          </button>
        </div>
      </NavShell>
    );
  }

  const attendance = data?.attendance || {};
  const leave = data?.leave || {};
  const intern = data?.intern || {};
  const todayWork = data?.today_work || [];

  const displayName =
    intern.name ||
    user.first_name ||
    user.username ||
    "Intern";

  const isCheckedIn = Boolean(attendance.check_in);
  const isCheckedOut = Boolean(attendance.check_out);

  const getAttendanceStatusBadge = () => {
    const status = attendance.today;
    if (status === "PRESENT") {
      return <span className="hero-badge present">Present</span>;
    }
    if (status === "LATE") {
      return <span className="hero-badge late">Late</span>;
    }
    return <span className="hero-badge not-marked">Not Marked</span>;
  };

  return (
    <NavShell>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-text">
          <span className="page-category-badge">Workspace Overview</span>
          <h1 className="page-heading">Welcome back, {displayName} 👋</h1>
          <p className="page-subheading">Here is your daily activity and internship progress.</p>
        </div>

        <div className="header-date-badge">
          <CalendarIcon size={16} />
          <span>{getTodayFormatted()}</span>
        </div>
      </header>

      {/* Today's Attendance Hero Banner */}
      <section className="today-hero-card">
        <div className="today-hero-left">
          <span className="hero-pill">
            <ClockIcon size={14} />
            Today's Attendance
          </span>
          <div className="hero-status-row">
            <h2 className="hero-status-title">
              {!isCheckedIn
                ? "Shift Not Started"
                : isCheckedOut
                ? "Shift Completed"
                : "Shift In Progress"}
            </h2>
            {getAttendanceStatusBadge()}
          </div>
          <div className="hero-time-details">
            <div className="hero-time-item">
              <span>Check-in:</span>
              <strong>{formatTime(attendance.check_in)}</strong>
            </div>
            <div className="hero-time-item">
              <span>Check-out:</span>
              <strong>{formatTime(attendance.check_out)}</strong>
            </div>
            {attendance.working_hours && (
              <div className="hero-time-item">
                <span>Total:</span>
                <strong>{attendance.working_hours} hrs</strong>
              </div>
            )}
          </div>
        </div>

        <div className="today-hero-right">
          {!isCheckedIn ? (
            <button
              className="hero-action-btn"
              onClick={() => navigate("/attendance")}
            >
              <span>Check In Now</span>
              <ArrowRightIcon size={16} />
            </button>
          ) : !isCheckedOut ? (
            <button
              className="hero-action-btn"
              onClick={() => navigate("/attendance")}
            >
              <span>Check Out Now</span>
              <ArrowRightIcon size={16} />
            </button>
          ) : (
            <div className="hero-completed-pill">
              <CheckIcon size={18} />
              <span>Shift Complete</span>
            </div>
          )}
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="metrics-grid" aria-label="Key Metrics">
        <article className="metric-card">
          <div className="metric-icon-box present">
            <CheckIcon size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{attendance.total_present_days || 0}</span>
            <span className="metric-label">Present Days</span>
          </div>
        </article>

        {/* <article className="metric-card"> */}
          {/* <div className="metric-icon-box late">
            <ClockIcon size={24} />
          </div>
          {/* <div className="metric-data">
            <span className="metric-value">{attendance.total_late_days || 0}</span>
            <span className="metric-label">Late Days</span>
          </div> */}
        {/* </article> */} 

        <article className="metric-card">
          <div className="metric-icon-box pending">
            <CalendarIcon size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{leave.pending || 0}</span>
            <span className="metric-label">Pending Leaves</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-icon-box approved">
            <LeaveIcon size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{leave.approved || 0}</span>
            <span className="metric-label">Approved Leaves</span>
          </div>
        </article>
      </section>

      {/* Split Grid */}
      <section className="dashboard-split-grid">
        {/* Left: Today's Work Updates */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <h2 className="card-header-title">Today's Work Log</h2>
            <button
              className="card-header-link"
              onClick={() => navigate("/work-status")}
            >
              <span>View All</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>

          {todayWork.length === 0 ? (
            <div className="dashboard-empty-state">
              <div className="empty-icon-wrap">
                <WorkIcon size={24} />
              </div>
              <h3 className="empty-title">No work submitted today</h3>
              <p className="empty-desc">
                Keep your mentors in sync by recording what you worked on today.
              </p>
              <button
                className="empty-cta-btn"
                onClick={() => navigate("/work-status")}
              >
                <span>+ Log Today's Work</span>
              </button>
            </div>
          ) : (
            <div className="task-list">
              {todayWork.map((item) => (
                <div key={item.id} className="task-item">
                  <div className="task-content-left">
                    <p className="task-title">{item.task}</p>
                    <div className="task-meta">
                      {item.hours_worked && (
                        <span>⏱ {item.hours_worked} hrs</span>
                      )}
                      {item.blocker && (
                        <span className="task-blocker-text">
                          Blocker: {item.blocker}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`status-badge ${(
                      item.status || ""
                    ).toLowerCase()}`}
                  >
                    {(item.status || "").replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Internship Info & Quick Links */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <h2 className="card-header-title">Internship Details</h2>
          </div>

          <div className="info-details-list">
            <div className="info-row">
              <span className="info-label">Department</span>
              <span className="info-value">
                {intern.department || user.department || "Engineering"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Start Date</span>
              <span className="info-value">
                {formatDate(intern.internship_start || user.internship_start)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">End Date</span>
              <span className="info-value">
                {formatDate(intern.internship_end || user.internship_end)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value">
                {user.role || "Intern"}
              </span>
            </div>
          </div>

          <div className="quick-actions-grid">
            <button
              className="quick-action-link"
              onClick={() => navigate("/attendance")}
            >
              <span>Manage Attendance</span>
              <ArrowRightIcon size={14} />
            </button>
            <button
              className="quick-action-link"
              onClick={() => navigate("/leave")}
            >
              <span>Apply for Leave</span>
              <ArrowRightIcon size={14} />
            </button>
            <button
              className="quick-action-link"
              onClick={() => navigate("/work-status")}
            >
              <span>Submit Work Status</span>
              <ArrowRightIcon size={14} />
            </button>
            <button
              className="quick-action-link"
              onClick={() => navigate("/profile")}
            >
              <span>View Full Profile</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      </section>
    </NavShell>
  );
}

export default Dashboard;