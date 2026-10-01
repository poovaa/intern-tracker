import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Mentor.css";

function MentorMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await api.get("/mentor/meetings/");

      setMeetings(
        response.data.meetings || response.data || []
      );
    } catch (error) {
      console.error("Failed to load meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMeeting = async (id, status) => {
    try {
      setProcessingId(id);

      await api.patch(
        `/mentor/meetings/${id}/`,
        {
          status: status,
        }
      );

      setMeetings((previous) =>
        previous.map((meeting) =>
          meeting.id === id
            ? {
                ...meeting,
                status: status,
              }
            : meeting
        )
      );

      alert(
        status === "APPROVED"
          ? "Meeting approved successfully."
          : "Meeting rejected successfully."
      );

    } catch (error) {
      console.error("Meeting update error:", error);

      alert(
        error.response?.data?.error ||
        "Unable to update meeting."
      );

    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        Loading meeting requests...
      </div>
    );
  }

  return (
    <div className="mentor-page">

      <div className="mentor-page-header">

        <div>
          <p className="mentor-label">
            MENTOR
          </p>

          <h1>Meeting Requests</h1>

          <p>
            Review meeting requests from your interns.
          </p>
        </div>

      </div>

      {meetings.length === 0 ? (
        <div className="empty-state">
          No meeting requests found.
        </div>
      ) : (
        <div className="meeting-list">

          {meetings.map((meeting) => (

            <div
              className="meeting-card"
              key={meeting.id}
            >

              <div className="meeting-card-header">

                <div className="meeting-intern">

                  <div className="meeting-avatar">
                    {(meeting.intern_name || "I")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3>
                      {meeting.intern_name ||
                        "Unknown Intern"}
                    </h3>

                    <p>
                      {meeting.intern_email || ""}
                    </p>
                  </div>

                </div>

                <span
                  className={`meeting-status ${
                    meeting.status?.toLowerCase()
                  }`}
                >
                  {meeting.status}
                </span>

              </div>

              <div className="meeting-details">

                <div>
                  <span>Meeting Title</span>

                  <strong>
                    {meeting.title || "Mentor Meeting"}
                  </strong>
                </div>

                <div>
                  <span>Date</span>

                  <strong>
                    {meeting.date || "-"}
                  </strong>
                </div>

                <div>
                  <span>Time</span>

                  <strong>
                    {meeting.time || "-"}
                  </strong>
                </div>

                <div>
                  <span>Reason</span>

                  <strong>
                    {meeting.reason || "No reason provided"}
                  </strong>
                </div>

              </div>

              {meeting.status === "PENDING" && (

                <div className="meeting-actions">

                  <button
                    className="approve-meeting-btn"
                    disabled={processingId === meeting.id}
                    onClick={() =>
                      updateMeeting(
                        meeting.id,
                        "APPROVED"
                      )
                    }
                  >
                    {processingId === meeting.id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    className="reject-meeting-btn"
                    disabled={processingId === meeting.id}
                    onClick={() =>
                      updateMeeting(
                        meeting.id,
                        "REJECTED"
                      )
                    }
                  >
                    Reject
                  </button>

                </div>

              )}

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default MentorMeetings;