import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { QRCodeCanvas } from "qrcode.react";
import "./MentorAttendanceQR.css";

function MentorAttendanceQR() {
  const navigate = useNavigate();

  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==================================================
  // GENERATE ATTENDANCE QR
  // ==================================================

  const generateQR = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        "/mentor/attendance/generate-qr/"
      );

      console.log("QR response:", res.data);

      setQrData(res.data);

    } catch (err) {
      console.error(
        "QR generation error:",
        err
      );

      // Unauthorized
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/";
        return;
      }

      setError(
        err.response?.data?.error ||
        "Unable to generate attendance QR."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==================================================
  // LOAD QR WHEN PAGE OPENS
  // ==================================================

  useEffect(() => {
    generateQR();
  }, []);


  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="mentor-qr-page">

      {/* ==================================================
          BACK BUTTON
      ================================================== */}

      <button
        type="button"
        className="qr-back-btn"
        onClick={() => navigate("/mentor/dashboard")}
      >
        ← Back to Dashboard
      </button>


      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="mentor-qr-header">

        <span className="qr-page-badge">
          ATTENDANCE
        </span>

        <h1>
          Daily Attendance QR
        </h1>

        <p>
          Display this QR code for your assigned interns
          to scan when checking in.
        </p>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mentor-qr-error">
          {error}
        </div>
      )}


      {/* ==================================================
          LOADING
      ================================================== */}

      {loading ? (

        <div className="mentor-qr-loading">
          Generating today's QR...
        </div>

      ) : qrData ? (

        <div className="mentor-qr-card">

          {/* ==================================================
              CARD HEADER
          ================================================== */}

          <div className="mentor-qr-card-header">

            <div>

              <h2>
                Today's Attendance QR
              </h2>

              <p>
                {qrData.date}
              </p>

            </div>

            <span className="qr-active-badge">
              ACTIVE
            </span>

          </div>


          {/* ==================================================
              QR CODE
          ================================================== */}

          <div className="qr-display-box">

            <QRCodeCanvas
              value={qrData.token}
              size={280}
              level="H"
            />

          </div>


          {/* ==================================================
              MENTOR INFORMATION
          ================================================== */}

          <div className="qr-mentor-info">

            <div className="qr-info-item">

              <span>
                Mentor
              </span>

              <strong>
                {qrData.mentor}
              </strong>

            </div>


            <div className="qr-info-item">

              <span>
                Date
              </span>

              <strong>
                {qrData.date}
              </strong>

            </div>

          </div>


          {/* ==================================================
              INSTRUCTIONS
          ================================================== */}

          <div className="qr-instruction">

            <strong>
              📱 How interns check in
            </strong>

            <p>
              Ask your intern to open
              <b> Attendance </b>,
              click <b>Check In</b>,
              and scan this QR code.
            </p>

          </div>


          {/* ==================================================
              REFRESH BUTTON
          ================================================== */}

          <button
            type="button"
            className="regenerate-qr-btn"
            onClick={generateQR}
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Refresh QR"}
          </button>

        </div>

      ) : null}

    </div>
  );
}

export default MentorAttendanceQR;