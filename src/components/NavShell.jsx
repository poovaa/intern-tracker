import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardIcon,
  AttendanceIcon,
  LeaveIcon,
  WorkIcon,
  ProfileIcon,
  LogoutIcon,
} from "./Icons";
import "./NavShell.css";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", short: "Dashboard", Icon: DashboardIcon },
  { path: "/attendance", label: "Attendance", short: "Attendance", Icon: AttendanceIcon },
  { path: "/leave", label: "Leave", short: "Leave", Icon: LeaveIcon },
  { path: "/work-status", label: "Work Status", short: "Work", Icon: WorkIcon },
  { path: "/profile", label: "Profile", short: "Profile", Icon: ProfileIcon },
];

function getInitial(user) {
  return (user?.first_name || user?.username || "U").charAt(0).toUpperCase();
}

function getFullName(user) {
  if (user?.first_name && user?.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user?.first_name || user?.username || "Intern";
}

export default function NavShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      {/* Desktop Sidebar (>= 1024px) */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand-wrapper">
          <div className="brand-badge">IT</div>
          <div className="brand-info">
            <span className="brand-title">InternTrack</span>
            <span className="brand-subtitle">Intern Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav-list" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.Icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`sidebar-nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav-icon">
                  <Icon size={19} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">{getInitial(user)}</div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{getFullName(user)}</span>
              <span className="sidebar-user-role">{user.department || user.role || "Intern"}</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
            <LogoutIcon size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header (< 1024px) */}
      <header className="mobile-top-header">
        <div className="mobile-brand">
          <div className="mobile-brand-badge">IT</div>
          <span className="mobile-brand-title">InternTrack</span>
        </div>
        <div className="mobile-header-actions">
          <div className="mobile-user-avatar" title={getFullName(user)}>
            {getInitial(user)}
          </div>
          <button className="mobile-logout-btn" onClick={handleLogout} title="Sign Out">
            <LogoutIcon size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main-content">
        <div className="content-container animate-fade-in">{children}</div>
      </main>

      {/* Mobile Bottom Navigation (< 1024px) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.Icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`mobile-nav-link ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="nav-icon">
                <Icon size={20} />
              </span>
              <span>{item.short}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
