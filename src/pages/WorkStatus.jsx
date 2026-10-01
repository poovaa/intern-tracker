import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";

import NavShell from "../components/NavShell";

import {
  AlertIcon,
  CheckIcon,
  PlusIcon,
} from "../components/Icons";

import api from "../api/axios";

import "./WorkStatus.css";

function WorkStatus() {
  // =========================================================
  // EMAILJS CONFIG
  // =========================================================

  const EMAILJS_SERVICE_ID =
    import.meta.env.VITE_EMAILJS_SERVICE_ID;

  const EMAILJS_TEMPLATE_ID =
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  const EMAILJS_PUBLIC_KEY =
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const peek = (val) =>
    val
      ? `${val.slice(0, 6)}... (${val.length} chars)`
      : "❌ MISSING";

  console.log("[EmailJS] Credential check →", {
    SERVICE_ID: peek(
      import.meta.env.VITE_EMAILJS_SERVICE_ID
    ),
    TEMPLATE_ID: peek(
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    ),
    PUBLIC_KEY: peek(
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ),
  });

  // =========================================================
  // USER DETAILS
  // =========================================================

  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Unable to read user:", error);
    }

    return {};
  };

  const user = getLoggedInUser();

  const internName =
    user.name ||
    user.full_name ||
    user.username ||
    "Intern";

  const internEmail =
    user.email ||
    user.email_address ||
    "";

  // =========================================================
  // FORM STATE
  // =========================================================

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    task: "",
    status: "IN_PROGRESS",
    hours_worked: "",
    blocker: "",
  });

  // =========================================================
  // EMAIL STATE
  // =========================================================

  const [emailInput, setEmailInput] = useState("");

  const [emails, setEmails] = useState([]);

  // =========================================================
  // WORK STATUS HISTORY STATE
  // =========================================================

  const [workStatuses, setWorkStatuses] = useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [historyError, setHistoryError] =
    useState("");

  // =========================================================
  // SELECTED WORK STATUS
  // Used for popup/details view
  // =========================================================

  const [selectedWorkStatus, setSelectedWorkStatus] =
    useState(null);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // GET WORK STATUS HISTORY
  // =========================================================

  const fetchWorkStatusHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      console.log(
        "📥 Fetching work status history..."
      );

      const response = await api.get(
        "/work-status/history/"
      );

      console.log(
        "✅ Work status history:",
        response.data
      );

      setWorkStatuses(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "❌ Failed to fetch work status history:",
        err
      );

      console.error(
        "API RESPONSE:",
        err?.response?.data
      );

      setHistoryError(
        err?.response?.data?.detail ||
          "Unable to load work status history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // =========================================================
  // LOAD HISTORY WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    fetchWorkStatusHistory();
  }, []);

  // =========================================================
  // ADD EMAIL
  // =========================================================

  const addEmail = () => {
    const email = emailInput.trim();

    if (!email) {
      setError(
        "Please enter an email address."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (emails.includes(email)) {
      setError(
        "This email has already been added."
      );
      return;
    }

    setEmails((prev) => [
      ...prev,
      email,
    ]);

    setEmailInput("");

    setError("");
  };

  // =========================================================
  // REMOVE EMAIL
  // =========================================================

  const removeEmail = (emailToRemove) => {
    setEmails((prev) =>
      prev.filter(
        (email) => email !== emailToRemove
      )
    );
  };

  // =========================================================
  // EMAIL ENTER KEY
  // =========================================================

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "NOT_STARTED":
        return "Not Started";

      case "IN_PROGRESS":
        return "In Progress";

      case "COMPLETED":
        return "Completed";

      case "BLOCKED":
        return "Blocked";

      default:
        return status || "-";
    }
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "NOT_STARTED":
        return "history-status-not-started";

      case "IN_PROGRESS":
        return "history-status-in-progress";

      case "COMPLETED":
        return "history-status-completed";

      case "BLOCKED":
        return "history-status-blocked";

      default:
        return "";
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // SEND WORK STATUS
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(
      "🔥 SEND WORK STATUS BUTTON CLICKED"
    );

    setError("");
    setSuccess("");

    // -------------------------------------------------------
    // VALIDATE TASK
    // -------------------------------------------------------

    if (!form.task.trim()) {
      setError(
        "Please describe the task you worked on."
      );
      return;
    }

    // -------------------------------------------------------
    // VALIDATE EMAILS
    // -------------------------------------------------------

    if (emails.length === 0) {
      setError(
        "Please add at least one email address."
      );
      return;
    }

    // -------------------------------------------------------
    // VALIDATE EMAILJS
    // -------------------------------------------------------

    if (
      !EMAILJS_SERVICE_ID ||
      !EMAILJS_TEMPLATE_ID ||
      !EMAILJS_PUBLIC_KEY
    ) {
      console.error(
        "EmailJS environment variables are missing."
      );

      setError(
        "Email service is not configured. Please check EmailJS settings."
      );

      return;
    }

    // -------------------------------------------------------
    // VALIDATE INTERN EMAIL
    // -------------------------------------------------------

    if (!internEmail) {
      setError(
        "Your email address could not be found. Please login again."
      );

      return;
    }

    try {
      setSubmitting(true);

      console.log(
        "==============================="
      );

      console.log(
        "📋 SAVING WORK STATUS"
      );

      console.log(
        "Intern Name:",
        internName
      );

      console.log(
        "Intern Email:",
        internEmail
      );

      console.log(
        "Task:",
        form.task
      );

      console.log(
        "Status:",
        form.status
      );

      console.log(
        "Hours:",
        form.hours_worked
      );

      console.log(
        "Blocker:",
        form.blocker
      );

      console.log(
        "==============================="
      );

      // =====================================================
      // 1. SAVE TO DJANGO DATABASE
      // =====================================================

      const workStatusData = {
        task: form.task.trim(),

        status: form.status,

        hours_worked: form.hours_worked
          ? Number(form.hours_worked)
          : null,

        blocker:
          form.blocker.trim() || "",
      };

      console.log(
        "📤 Sending work status to Django:",
        workStatusData
      );

      const dbResponse = await api.post(
        "/work-status/create/",
        workStatusData
      );

      console.log(
        "✅ Work status saved to database:",
        dbResponse.data
      );

      // =====================================================
      // 2. SEND EMAIL TO EVERY RECIPIENT
      // =====================================================

      for (const recipientEmail of emails) {
        const templateParams = {
          to_email: recipientEmail,

          reply_to: internEmail,

          intern_name: internName,

          intern_email: internEmail,

          task: form.task.trim(),

          status: form.status,

          hours_worked: form.hours_worked
            ? `${form.hours_worked} hrs`
            : "Not specified",

          blocker:
            form.blocker.trim() || "None",
        };

        console.log(
          "📧 Sending email to:",
          recipientEmail
        );

        console.log(
          "TEMPLATE PARAMS:",
          templateParams
        );

        const response = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );

        console.log(
          "✅ EmailJS response:",
          response
        );
      }

      // =====================================================
      // 3. SUCCESS
      // =====================================================

      const successMessage =
        "Work status saved and sent successfully!";

      setSuccess(successMessage);

      window.alert(successMessage);

      // =====================================================
      // 4. CLEAR FORM
      // =====================================================

      setForm({
        task: "",
        status: "IN_PROGRESS",
        hours_worked: "",
        blocker: "",
      });

      setEmails([]);

      setEmailInput("");

      // =====================================================
      // 5. REFRESH HISTORY
      // =====================================================

      console.log(
        "🔄 Refreshing work status history..."
      );

      await fetchWorkStatusHistory();
    } catch (err) {
      console.error(
        "==============================="
      );

      console.error(
        "❌ WORK STATUS ERROR"
      );

      console.error(
        "ERROR:",
        err
      );

      console.error(
        "API RESPONSE:",
        err?.response?.data
      );

      console.error(
        "==============================="
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to save/send work status. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // CLOSE DETAILS POPUP
  // =========================================================

  const closeWorkStatusModal = () => {
    setSelectedWorkStatus(null);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <NavShell>
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <header className="page-header">
        <div className="page-header-text">
          <span className="page-category-badge">
            Daily Log
          </span>

          <h1 className="page-heading">
            Work Status
          </h1>

          <p className="page-subheading">
            Record your work and send today's
            status directly to your mentor or team.
          </p>
        </div>
      </header>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          className="alert-banner error"
          role="alert"
        >
          <span className="alert-icon-wrap">
            <AlertIcon size={18} />
          </span>

          <span>{error}</span>
        </div>
      )}

      {/* ===================================================
          SUCCESS
      =================================================== */}

      {success && (
        <div
          className="alert-banner success"
          role="status"
        >
          <span className="alert-icon-wrap">
            <CheckIcon size={18} />
          </span>

          <span>{success}</span>
        </div>
      )}

      {/* ===================================================
          FORM
      =================================================== */}

      <div className="work-single-container">
        <section className="work-panel-card">

          {/* CARD HEADER */}

          <div className="panel-heading-row">
            <div>
              <h2 className="panel-title">
                Record Today's Work
              </h2>

              <p className="panel-description">
                Complete the details below and
                send your work status by email.
              </p>
            </div>

            <span className="panel-badge">
              Daily Entry
            </span>
          </div>

          {/* FORM */}

          <form
            className="work-form-container"
            onSubmit={handleSubmit}
          >

            {/* TASK */}

            <div className="form-field-group">
              <label
                className="form-label"
                htmlFor="task"
              >
                Task Description
              </label>

              <textarea
                id="task"
                name="task"
                rows="5"
                placeholder="Describe the tasks, features, or bug fixes you worked on today..."
                value={form.task}
                onChange={handleChange}
                required
              />
            </div>

            {/* STATUS */}

            <div className="form-field-group">
              <label
                className="form-label"
                htmlFor="status"
              >
                Progress Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="NOT_STARTED">
                  Not Started
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="BLOCKED">
                  Blocked
                </option>
              </select>
            </div>

            {/* HOURS */}

            <div className="form-field-group">
              <label
                className="form-label"
                htmlFor="hours_worked"
              >
                Hours Dedicated
              </label>

              <input
                id="hours_worked"
                type="number"
                name="hours_worked"
                min="0"
                max="24"
                step="0.5"
                placeholder="e.g. 7.5"
                value={form.hours_worked}
                onChange={handleChange}
              />
            </div>

            {/* BLOCKER */}

            <div className="form-field-group">
              <label
                className="form-label"
                htmlFor="blocker"
              >
                Blockers / Issues

                <span className="optional-tag">
                  (Optional)
                </span>
              </label>

              <textarea
                id="blocker"
                name="blocker"
                rows="3"
                placeholder="Note any impediment, dependency delay, or question for your mentor..."
                value={form.blocker}
                onChange={handleChange}
              />
            </div>

            {/* RECIPIENT EMAILS */}

            <div className="form-field-group">
              <label className="form-label">
                Send Work Status To
              </label>

              <div className="email-input-wrapper">

                {/* EMAIL TAGS */}

                <div className="email-tags">
                  {emails.map((email) => (
                    <div
                      className="email-tag"
                      key={email}
                    >
                      <span>{email}</span>

                      <button
                        type="button"
                        className="email-remove-btn"
                        onClick={() =>
                          removeEmail(email)
                        }
                        aria-label={`Remove ${email}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* EMAIL INPUT */}

                <div className="email-input-row">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) =>
                      setEmailInput(
                        e.target.value
                      )
                    }
                    onKeyDown={
                      handleEmailKeyDown
                    }
                    placeholder="Enter email address"
                  />

                  <button
                    type="button"
                    className="add-email-btn"
                    onClick={addEmail}
                  >
                    Add
                  </button>
                </div>
              </div>

              <p className="email-help-text">
                Add one or more email addresses.
                Press Enter or click Add.
              </p>
            </div>

            {/* SUBMIT BUTTON */}

            <div className="form-btns-row">
              <button
                type="submit"
                className="work-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="btn-spinner" />

                    <span>
                      Sending...
                    </span>
                  </>
                ) : (
                  <>
                    <PlusIcon size={16} />

                    <span>
                      Send Work Status
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* ==================================================
          WORK STATUS HISTORY
      ================================================== */}

      <section className="work-history-section">

        <div className="history-header">
          <div>
            <p className="section-label">
              WORK STATUS
            </p>

            <h2>
              Work Status History
            </h2>
          </div>

          <span className="history-count">
            {workStatuses.length} Records
          </span>
        </div>

        {historyLoading ? (
          <div className="history-message">
            Loading work status history...
          </div>
        ) : historyError ? (
          <div className="history-error">
            {historyError}
          </div>
        ) : workStatuses.length === 0 ? (
          <div className="history-message">
            No work status records found.
          </div>
        ) : (
          <div className="work-table-wrapper">
            <table className="work-status-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Hours</th>
                  <th>Blocker</th>
                  <th>Email</th>
                </tr>
              </thead>

              <tbody>
                {workStatuses.map(
                  (item, index) => (
                    <tr
                      key={item.id}
                      onClick={() =>
                        setSelectedWorkStatus(
                          item
                        )
                      }
                      className="work-status-row"
                    >
                      <td className="serial-number">
                        {index + 1}
                      </td>

                      <td className="date-cell">
                        {formatDate(
                          item.created_at
                        )}
                      </td>

                      <td className="task-cell">
                        <strong>
                          {item.task}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(
                            item.status
                          )}
                        </span>
                      </td>

                      <td className="hours-cell">
                        {item.hours_worked
                          ? `${item.hours_worked} hrs`
                          : "-"}
                      </td>

                      <td className="blocker-cell">
                        {item.blocker || "None"}
                      </td>

                      <td className="email-cell">
                        {item.email || "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>
          </div>
        )}
      </section>

      {/* ==================================================
          WORK STATUS DETAILS POPUP
      ================================================== */}

      {selectedWorkStatus && (
        <div
          className="work-status-modal-overlay"
          onClick={closeWorkStatusModal}
        >
          <div
            className="work-status-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">
              <div>
                <p className="section-label">
                  WORK STATUS
                </p>

                <h2>
                  Daily Work Status
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeWorkStatusModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* INTRO */}

            <p className="modal-intro">
              Here is the work status from{" "}
              <strong>
                {selectedWorkStatus.username ||
                  internName}
              </strong>
              .
            </p>

            {/* DETAILS TABLE */}

            <table className="work-detail-table">
              <tbody>

                <tr>
                  <td>
                    Applicant Name
                  </td>

                  <td>
                    {selectedWorkStatus.username ||
                      internName}
                  </td>
                </tr>

                <tr>
                  <td>
                    Applicant Email
                  </td>

                  <td>
                    {selectedWorkStatus.email ||
                      internEmail}
                  </td>
                </tr>

                <tr>
                  <td>
                    Number of Hours
                  </td>

                  <td>
                    {selectedWorkStatus.hours_worked
                      ? `${selectedWorkStatus.hours_worked} hrs`
                      : "Not specified"}
                  </td>
                </tr>

                <tr>
                  <td>
                    Description of Work
                  </td>

                  <td>
                    {selectedWorkStatus.task ||
                      "-"}
                  </td>
                </tr>

                <tr>
                  <td>
                    Status
                  </td>

                  <td>
                    <span
                      className={`status-badge ${getStatusClass(
                        selectedWorkStatus.status
                      )}`}
                    >
                      {getStatusLabel(
                        selectedWorkStatus.status
                      )}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>
                    Blockers / Issues
                  </td>

                  <td>
                    {selectedWorkStatus.blocker ||
                      "None"}
                  </td>
                </tr>

              </tbody>
            </table>

          </div>
        </div>
      )}

    </NavShell>
  );
}

export default WorkStatus;