import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import NavShell from "../components/NavShell";
import {
  LeaveIcon,
  AlertIcon,
  CheckIcon,
  CalendarIcon,
  PlusIcon,
} from "../components/Icons";
import "./Leave.css";

function Leave() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    leave_type: "CASUAL",
    from_date: "",
    to_date: "",
    reason: "",
  });

  const loadLeaves = useCallback(async () => {
    try {
      setError("");

      const res = await api.get("/leave/my/");
      setLeaves(res.data || []);
    } catch (err) {
      console.error("Leave load error:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/", { replace: true });
      } else {
        setError(
          err.response?.data?.error ||
          "Unable to load leave details."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // useEffect(() => {
  //   loadLeaves();
  // }, [loadLeaves]
  // );
  useEffect(() => {
  loadLeaves();

  const interval = setInterval(() => {
    loadLeaves();
  },60 * 1000); 

  return () => {
    clearInterval(interval);
  };
}, [loadLeaves]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.from_date || !form.to_date) {
      setError("Please select both start and end dates.");
      return;
    }

    if (form.to_date < form.from_date) {
      setError("End date cannot be prior to start date.");
      return;
    }

    if (!form.reason.trim()) {
      setError("Please provide a reason for your leave request.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/leave/apply/", form);

      setSuccess(
        res.data.message || "Leave application submitted successfully."
      );
      setForm({
        leave_type: "CASUAL",
        from_date: "",
        to_date: "",
        reason: "",
      });

      await loadLeaves();
    } catch (err) {
      console.error("Leave submit error:", err);
      setError(
        err.response?.data?.error ||
        "Unable to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    try {
      return new Date(dateStr + "T00:00:00").toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getLeaveTypeName = (type) => {
    const map = {
      CASUAL: "Casual Leave",
      SICK: "Sick Leave",
      EARNED: "Earned Leave",
      PERSONAL: "Personal Leave",
      OTHER: "Other Reason",
    };
    return map[type] || type;
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() || "pending";
  };

  if (loading) {
    return (
      <NavShell>
        <div className="state-container">
          <div className="loading-spinner" />
          <p className="state-title">Loading leave requests...</p>
        </div>
      </NavShell>
    );
  }

  return (
    <NavShell>
      {/* Header */}
      <header className="page-header">
        <div className="page-header-text">
          <span className="page-category-badge">Time Off</span>
          <h1 className="page-heading">Leave Management</h1>
          <p className="page-subheading">
            Submit time-off requests and track the review status with your mentor.
          </p>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <div className="alert-banner error" role="alert">
          <span className="alert-icon-wrap">
            <AlertIcon size={18} />
          </span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-banner success" role="status">
          <span className="alert-icon-wrap">
            <CheckIcon size={18} />
          </span>
          <span>{success}</span>
        </div>
      )}

      {/* Grid */}
      <div className="leave-grid">
        {/* Left: Apply For Leave */}
        <section className="leave-panel-card">
          <div className="panel-heading-row">
            <h2 className="panel-title">Apply for Leave</h2>
            <span className="panel-badge">New Request</span>
          </div>

          <form className="leave-form-container" onSubmit={handleSubmit}>
            <div className="form-field-group">
              <label className="form-label" htmlFor="leave_type">
                Leave Category
              </label>
              <select
                id="leave_type"
                name="leave_type"
                value={form.leave_type}
                onChange={handleChange}
                required
              >
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="EARNED">Earned Leave</option>
                <option value="PERSONAL">Personal Leave</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>

            <div className="dates-two-col">
              <div className="form-field-group">
                <label className="form-label" htmlFor="from_date">
                  From Date
                </label>
                <input
                  id="from_date"
                  type="date"
                  name="from_date"
                  value={form.from_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label" htmlFor="to_date">
                  To Date
                </label>
                <input
                  id="to_date"
                  type="date"
                  name="to_date"
                  min={form.from_date}
                  value={form.to_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="reason">
                Reason for Leave
              </label>
              <textarea
                id="reason"
                name="reason"
                rows="4"
                placeholder="State the reason for your absence clearly..."
                value={form.reason}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="leave-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="btn-spinner" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <PlusIcon size={16} />
                  <span>Submit Leave Request</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right: History */}
        <section className="leave-panel-card">
          <div className="panel-heading-row">
            <h2 className="panel-title">My Leave History</h2>
            <span className="panel-badge">
              {leaves.length} Applications
            </span>
          </div>

          {leaves.length === 0 ? (
            <div className="empty-leave-state">
              <LeaveIcon size={36} />
              <h3>No leave requests found</h3>
              <p>Applications you submit will appear here along with mentor approvals.</p>
            </div>
          ) : (
            <div className="requests-list">
              {leaves.map((item) => (
                <article key={item.id} className="request-card-item">
                  <div className="request-card-top">
                    <div>
                      <h3 className="request-type-title">
                        {getLeaveTypeName(item.leave_type)}
                      </h3>
                      <div className="request-date-range">
                        <CalendarIcon size={14} />
                        <span>
                          {formatDate(item.from_date)} — {formatDate(item.to_date)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`leave-status-tag ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="request-reason-text">{item.reason}</p>

                  {item.admin_remarks && (
                    <div className="admin-remark-callout">
                      <strong>Mentor Remarks:</strong> {item.admin_remarks}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </NavShell>
  );
}

export default Leave;