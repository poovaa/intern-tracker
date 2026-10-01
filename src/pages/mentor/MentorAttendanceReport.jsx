import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./MentorAttendanceReport.css";

function MentorAttendanceReport() {

  const navigate = useNavigate();

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [search, setSearch] = useState("");

  const [summary, setSummary] = useState({
    total_interns: 0,
    present: 0,
    late: 0,
    half_day: 0,
    absent: 0,
  });

  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // ==================================================
  // GET ATTENDANCE REPORT
  // ==================================================

  const loadReport = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get(
        "/mentor/attendance/report/",
        {
          params: {
            from_date: fromDate,
            to_date: toDate,
            search: search,
          },
        }
      );

      console.log(
        "Attendance Report:",
        response.data
      );

      setSummary(
        response.data.summary
      );

      setRecords(
        response.data.records
      );

    } catch (err) {

      console.error(
        "Attendance report error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/";
        return;
      }

      setError(
        err.response?.data?.error ||
        "Unable to load attendance report."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // LOAD REPORT
  // ==================================================

  useEffect(() => {

    loadReport();

  }, []);


  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (value) => {

    if (!value) {
      return "-";
    }

    const date = new Date(value);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (value) => {

    if (!value) {
      return "-";
    }

    const date = new Date(
      `${value}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==================================================
  // STATUS CLASS
  // ==================================================

  const getStatusClass = (status) => {

    switch (status) {

      case "PRESENT":
        return "status-present";

      case "LATE":
        return "status-late";

      case "HALF_DAY":
        return "status-half";

      case "ABSENT":
        return "status-absent";

      default:
        return "";

    }
  };


  return (
    <div className="attendance-report-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="attendance-report-header">

        <div>

          <button
            className="attendance-report-back"
            onClick={() =>
              navigate("/mentor/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <span className="report-badge">
            ATTENDANCE
          </span>

          <h1>
            Attendance Report
          </h1>

          <p>
            View attendance records of your assigned interns.
          </p>

        </div>

      </div>


      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="attendance-filters">

        <div className="filter-group">

          <label>
            From Date
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(e.target.value)
            }
          />

        </div>


        <div className="filter-group">

          <label>
            To Date
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(e.target.value)
            }
          />

        </div>


        <div className="filter-group search-group">

          <label>
            Search Intern
          </label>

          <input
            type="text"
            placeholder="Search username..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <button
          className="report-filter-btn"
          onClick={loadReport}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "Apply Filter"}
        </button>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="attendance-report-error">
          {error}
        </div>
      )}


      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div className="attendance-summary-grid">

        <div className="attendance-summary-card">

          <span>
            Total Interns
          </span>

          <strong>
            {summary.total_interns}
          </strong>

        </div>


        <div className="attendance-summary-card">

          <span>
            Present
          </span>

          <strong>
            {summary.present}
          </strong>

        </div>


        {/* <div className="attendance-summary-card">

          <span>
            Late
          </span>

          <strong>
            {summary.late}
          </strong>

        </div> */}


        {/* <div className="attendance-summary-card">

          <span>
            Half Day
          </span>

          <strong>
            {summary.half_day}
          </strong>

        </div> */}


        <div className="attendance-summary-card">

          <span>
            Absent
          </span>

          <strong>
            {summary.absent}
          </strong>

        </div>

      </div>


      {/* ==================================================
          REPORT TABLE
      ================================================== */}

      <div className="attendance-report-card">

        <div className="report-table-header">

          <div>

            <h2>
              Attendance Records
            </h2>

            <p>
              {fromDate} → {toDate}
            </p>

          </div>

          <span>
            {records.length} Records
          </span>

        </div>


        {loading ? (

          <div className="report-loading">
            Loading attendance...
          </div>

        ) : records.length === 0 ? (

          <div className="report-empty">
            No attendance records found.
          </div>

        ) : (

          <div className="report-table-wrapper">

            <table className="attendance-report-table">

              <thead>

                <tr>

                  <th>Intern</th>

                  <th>Date</th>

                  <th>Check In</th>

                  <th>Check Out</th>

                  <th>Working Hours</th>

                  <th>Status</th>

                </tr>

              </thead>


              <tbody>

                {records.map((record) => (

                  <tr key={record.id}>

                    <td>

                      <div className="intern-cell">

                        <div className="intern-avatar">
                          {record.intern_name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {record.intern_name}
                          </strong>

                          <small>
                            {record.intern_email}
                          </small>

                        </div>

                      </div>

                    </td>


                    <td>
                      {formatDate(record.date)}
                    </td>


                    <td>
                      {formatTime(record.check_in)}
                    </td>


                    <td>
                      {formatTime(record.check_out)}
                    </td>


                    <td>
                      {record.working_hours !== null
                        ? `${record.working_hours} hrs`
                        : "-"}
                    </td>


                    <td>

                      <span
                        className={`attendance-status ${getStatusClass(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default MentorAttendanceReport;