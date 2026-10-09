import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./MentorDashboard.css";



const loadInterns = async () => {
  try {
    const response = await api.get(
      "/mentor/mentors_interns/"
    );

    console.log("Mentor Interns:", response.data);

  } catch (error) {
    console.error(
      "Mentor Interns API Error:",
      error
    );
  }
};

 function MentorDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingLeaveId, setProcessingLeaveId] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  useEffect(() => {
    loadDashboard();
    loadInterns();

    const interval = setInterval(() => {
      loadDashboard();
    }, 60 * 1000); // 1 minute

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get(
        "/mentor/dashboard/"
      );

      console.log(
        "Mentor dashboard:",
        response.data
      );

      setData(response.data);

    } catch (error) {
      console.error(
        "Mentor dashboard error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        navigate("/");
      }

    } finally {
      setLoading(false);
    }
  };


  // INTERN DETAILS api 


  // ============================================================
  // ATTENDANCE QR
  // ============================================================

  const handleAttendanceQR = () => {
    navigate("/mentor/attendance-qr");
  };

  const handleAttendanceReport = () => {
  navigate("/mentor/attendance/report");
};

const handleViewInterns = () => {
  navigate("/mentor/interns");
};

  // ============================================================
  // APPROVE / REJECT LEAVE
  // ============================================================

  const handleLeaveAction = async (
    leaveId,
    action
  ) => {
    try {
      setProcessingLeaveId(leaveId);

      let endpoint = "";

      if (action === "APPROVE") {
        endpoint =
          `/mentor/leave-requests/${leaveId}/approve/`;
      } else {
        endpoint =
          `/mentor/leave-requests/${leaveId}/reject/`;
      }

      console.log(
        "Leave API:",
        endpoint
      );

      await api.put(endpoint);

      alert(
        action === "APPROVE"
          ? "Leave approved successfully."
          : "Leave rejected successfully."
      );

      // Reload dashboard
      await loadDashboard();

    } catch (error) {
      console.error(
        "Leave action error:",
        error
      );

      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to update leave request."
      );

    } finally {
      setProcessingLeaveId(null);
    }
  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="mentor-dashboard-loading">
        Loading dashboard...
      </div>
    );
  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="mentor-dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mentor-dashboard-header">

        <div>

          <p className="mentor-dashboard-label">
            MENTOR PORTAL
          </p>

          <h1>
            Welcome,{" "}
            {user.username || "Mentor"}
          </h1>

          <p className="mentor-dashboard-subtitle">
            Manage your interns and monitor their
            daily activities.
          </p>

        </div>


        {/* ==================================================
            RIGHT SIDE HEADER
        ================================================== */}

        <div className="mentor-header-actions">

          {/* Attendance QR Button */}

            <button
    type="button"
    className="mentor-action-btn"
    onClick={handleAttendanceReport}
  >
    📊 Attendance Report
  </button>

    <button
    type="button"
    className="mentor-action-btn"
    onClick={handleViewInterns}
  >
    👥 View Interns
  </button>

          <button
            type="button"
            className="mentor-action-btn"
            onClick={handleAttendanceQR}
          >
            📱 Attendance QR
          </button>


          {/* Profile */}

          <div className="mentor-profile-circle">
            {(user.username || "M")
              .charAt(0)
              .toUpperCase()}
          </div>

        </div>

      </div>


      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="mentor-stats-grid">

        {/* Total Interns */}

        <div className="mentor-stat-card">

          <div className="mentor-stat-icon">
            👥
          </div>

          <div>

            <span>
              Total Applicant
            </span>

            <strong>
              {data?.total_interns || 0}
            </strong>

          </div>

        </div>


        {/* Present Today */}

        <div className="mentor-stat-card">

          <div className="mentor-stat-icon">
            ✓
          </div>

          <div>

            <span>
              Present Today
            </span>

            <strong>
              {data?.present_today || 0}
            </strong>

          </div>

        </div>


        {/* Pending Leaves */}

        <div className="mentor-stat-card">

          <div className="mentor-stat-icon">
            📋
          </div>

          <div>

            <span>
              Pending Leaves
            </span>

            <strong>
              {data?.pending_leaves || 0}
            </strong>

          </div>

        </div>


        {/* Today's Work */}

        <div className="mentor-stat-card">

          <div className="mentor-stat-icon">
            💼
          </div>

          <div>

            <span>
              Today's Work
            </span>

            <strong>
              {data?.today_work || 0}
            </strong>

          </div>

        </div>

      </div>


      {/* ======================================================
          RECENT LEAVE REQUESTS
      ====================================================== */}

      <div className="mentor-dashboard-section">

        <div className="mentor-section-header">

          <div>

            <p className="section-small-label">
              ACTIVITY
            </p>

            <h2>
              Recent Leave Requests
            </h2>

          </div>

        </div>


        {/* ==================================================
            LEAVE LIST
        ================================================== */}

        {data?.recent_leaves?.length > 0 ? (

          <div className="mentor-leave-list">

            {data.recent_leaves.map(
              (leave) => (

                <div
                  className="mentor-leave-item"
                  key={leave.id}
                >

                  {/* ========================================
                      INTERN INFO
                  ======================================== */}

                  <div className="leave-intern-info">

                    <div className="leave-avatar">

                      {(leave.intern_name || "I")
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div>

                      <h3>
                        {leave.intern_name ||
                          "Unknown Intern"}
                      </h3>

                      <p>

                        {leave.leave_type ||
                          "Leave"}

                        {" • "}

                        {leave.start_date ||
                          leave.from_date ||
                          "-"}

                        {" → "}

                        {leave.end_date ||
                          leave.to_date ||
                          "-"}

                      </p>

                    </div>

                  </div>


                  {/* ========================================
                      RIGHT SIDE
                  ======================================== */}

                  <div className="leave-right-section">

                    {/* STATUS */}

                    <span
                      className={`leave-status ${
                        leave.status?.toLowerCase() ||
                        "pending"
                      }`}
                    >
                      {leave.status ||
                        "PENDING"}
                    </span>


                    {/* ====================================
                        APPROVE / REJECT
                    ==================================== */}

                    {leave.status ===
                      "PENDING" && (

                      <div className="leave-actions">

                        {/* APPROVE */}

                        <button
                          type="button"
                          className="leave-approve-btn"
                          disabled={
                            processingLeaveId ===
                            leave.id
                          }
                          onClick={() =>
                            handleLeaveAction(
                              leave.id,
                              "APPROVE"
                            )
                          }
                        >

                          {processingLeaveId ===
                          leave.id
                            ? "Processing..."
                            : "Approve"}

                        </button>


                        {/* REJECT */}

                        <button
                          type="button"
                          className="leave-reject-btn"
                          disabled={
                            processingLeaveId ===
                            leave.id
                          }
                          onClick={() =>
                            handleLeaveAction(
                              leave.id,
                              "REJECT"
                            )
                          }
                        >
                          Reject
                        </button>

                      </div>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          /* ================================================
             NO LEAVE REQUESTS
          ================================================ */

          <div className="mentor-empty-state">

            <div className="empty-icon">
              📋
            </div>

            <h3>
              No recent leave requests
            </h3>

            <p>
              Leave requests from your Applicant
              will appear here.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default MentorDashboard;
