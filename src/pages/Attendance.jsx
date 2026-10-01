import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";

import api from "../api/axios";
import NavShell from "../components/NavShell";

import {
  AttendanceIcon,
  CheckIcon,
  ClockIcon,
  AlertIcon,
  CalendarIcon,
} from "../components/Icons";

import "./Attendance.css";


function Attendance() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [today, setToday] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // QR scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);

  // Keep scanner instance safely between renders
  const scannerRef = useRef(null);

  // Prevent multiple QR callbacks
  const scannedRef = useRef(false);


  // ==========================================================
  // LOAD ATTENDANCE DATA
  // ==========================================================

  const loadAttendanceData = useCallback(async () => {
    try {
      setError("");

      const [todayRes, listRes] = await Promise.all([
        api.get("/attendance/today/"),
        api.get("/attendance/"),
      ]);

      setToday(todayRes.data);
      setAttendanceList(listRes.data || []);

    } catch (err) {
      console.error("Attendance fetch error:", err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/", { replace: true });
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to load attendance details."
        );
      }

    } finally {
      setLoading(false);
    }
  }, [navigate]);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);


  // ==========================================================
  // CHECK IN BUTTON
  // ==========================================================

  const handleCheckIn = () => {
    setError("");
    setSuccess("");

    if (today?.check_in) {
      setError("You are already checked in today.");
      return;
    }

    scannedRef.current = false;
    setShowScanner(true);
  };


  // ==========================================================
  // VERIFY QR CODE
  // ==========================================================

  const verifyQRCode = async (decodedText) => {
    if (!decodedText) {
      return;
    }

    if (scannerLoading) {
      return;
    }

    try {
      setScannerLoading(true);
      setActionLoading(true);

      setError("");
      setSuccess("");

      console.log("=================================");
      console.log("QR SCANNED");
      console.log("Token:", decodedText);
      console.log("=================================");

      const res = await api.post(
        "/attendance/verify-qr/",
        {
          token: decodedText,
        }
      );

      console.log("QR verification response:", res.data);

      // Close scanner.
      // Scanner cleanup will happen automatically
      // in the useEffect cleanup.
      setShowScanner(false);

      setSuccess(
        res.data.message ||
        "Attendance marked successfully!"
      );

      // Reload today's attendance
      await loadAttendanceData();

    } catch (err) {
      console.error("QR verification error:", err);

      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid QR code. Please scan your mentor's QR code.";

      setError(backendError);

      // Allow user to scan again if verification failed
      scannedRef.current = false;

    } finally {
      setScannerLoading(false);
      setActionLoading(false);
    }
  };


  // ==========================================================
  // START / STOP QR SCANNER
  // ==========================================================

  useEffect(() => {
    if (!showScanner) {
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setError("");

        // Reset scan protection
        scannedRef.current = false;

        // Make sure old scanner doesn't remain
        scannerRef.current = null;

        const scanner = new Html5Qrcode(
          "attendance-qr-reader"
        );

        scannerRef.current = scanner;

        console.log("Starting QR scanner...");

        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (decodedText) => {

            if (!isMounted) {
              return;
            }

            // Prevent the same QR from triggering multiple times
            if (scannedRef.current) {
              return;
            }

            scannedRef.current = true;

            console.log(
              "QR decoded successfully:",
              decodedText
            );

            // IMPORTANT:
            // Do NOT call scanner.stop() here.
            //
            // setShowScanner(false) will trigger the
            // useEffect cleanup below, which stops the
            // scanner safely.
            await verifyQRCode(decodedText);
          },
          () => {
            // html5-qrcode continuously calls this
            // when no QR is detected.
            //
            // We intentionally do nothing here.
          }
        );

        if (isMounted) {
          console.log("QR scanner started successfully.");
        }

      } catch (err) {
        console.error(
          "Unable to start QR scanner:",
          err
        );

        if (isMounted) {
          setError(
            "Unable to access camera. Please allow camera permission and try again."
          );
        }
      }
    };

    startScanner();


    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      isMounted = false;

      const scanner = scannerRef.current;

      if (!scanner) {
        return;
      }

      console.log("QR scanner cleanup started.");

      try {
        const state = scanner.getState();

        console.log(
          "Current scanner state:",
          state
        );

        /*
          Html5Qrcode states:

          NOT_STARTED = 1
          SCANNING    = 2
          PAUSED      = 3
          UNKNOWN     = 0

          Only call stop() when it is actually scanning.
        */

        if (state === 2) {

          scanner
            .stop()
            .then(() => {
              console.log(
                "QR scanner stopped successfully."
              );
            })
            .catch((err) => {
              console.warn(
                "QR scanner stop warning:",
                err
              );
            });

        } else {
          console.log(
            "Scanner is already stopped/not scanning."
          );
        }

      } catch (err) {
        console.warn(
          "QR scanner cleanup warning:",
          err
        );
      }

      scannerRef.current = null;
    };

  }, [showScanner]);


  // ==========================================================
  // CLOSE SCANNER
  // ==========================================================

  const closeScanner = () => {

    if (scannerLoading) {
      return;
    }

    console.log("Closing QR scanner...");

    scannedRef.current = false;

    setShowScanner(false);
    setError("");
  };


  // ==========================================================
  // CHECK OUT
  // ==========================================================

  const handleCheckOut = async () => {

    try {
      setActionLoading(true);

      setError("");
      setSuccess("");

      console.log("Checking out...");

      const res = await api.post(
        "/attendance/check-out/"
      );

      console.log(
        "Check-out response:",
        res.data
      );

      setSuccess(
        res.data.message ||
        "Checked out successfully!"
      );

      await loadAttendanceData();

    } catch (err) {

      console.error(
        "Check-out error:",
        err
      );

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to process check-out."
      );

    } finally {
      setActionLoading(false);
    }
  };


  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (dateTime) => {

    if (!dateTime) {
      return "--:--";
    }

    try {

      return new Date(
        dateTime
      ).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    } catch {
      return dateTime;
    }
  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (dateStr) => {

    if (!dateStr) {
      return "--";
    }

    try {

      return new Date(
        dateStr + "T00:00:00"
      ).toLocaleDateString(
        [],
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );

    } catch {
      return dateStr;
    }
  };


  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  const getStatusClass = (status) => {

    if (!status) {
      return "not-marked";
    }

    return status
      .toLowerCase()
      .replace("_", "-");
  };


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {

    return (
      <NavShell>

        <div className="state-container">

          <div className="loading-spinner" />

          <p className="state-title">
            Loading attendance details...
          </p>

        </div>

      </NavShell>
    );
  }


  // ==========================================================
  // ATTENDANCE STATUS
  // ==========================================================

  const isCheckedIn =
    Boolean(today?.check_in);

  const isCheckedOut =
    Boolean(today?.check_out);


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <NavShell>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="page-header">

        <div className="page-header-text">

          <span className="page-category-badge">
            Time & Attendance
          </span>

          <h1 className="page-heading">
            Daily Attendance
          </h1>

          <p className="page-subheading">
            Track daily work hours, check-ins, and your
            verified attendance history.
          </p>

        </div>

      </header>


      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && !showScanner && (

        <div
          className="alert-banner error"
          role="alert"
        >

          <span className="alert-icon-wrap">
            <AlertIcon size={18} />
          </span>

          <span>
            {error}
          </span>

        </div>
      )}


      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {success && !showScanner && (

        <div
          className="alert-banner success"
          role="status"
        >

          <span className="alert-icon-wrap">
            <CheckIcon size={18} />
          </span>

          <span>
            {success}
          </span>

        </div>
      )}


      {/* ======================================================
          TODAY'S ATTENDANCE
      ====================================================== */}

      <section className="attendance-hero-card">

        {/* Header */}

        <div className="attendance-card-header">

          <div>

            <span className="page-category-badge">
              TODAY'S SHIFT
            </span>

            <h2 className="attendance-date-title">

              {new Date().toLocaleDateString(
                [],
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}

            </h2>

          </div>


          <div
            className={`attendance-status-badge ${getStatusClass(
              today?.status
            )}`}
          >

            {today?.status === "NOT_MARKED"
              ? "Not Marked"
              : today?.status || "Not Marked"}

          </div>

        </div>


        {/* ====================================================
            TIME CARDS
        ==================================================== */}

        <div className="today-stats-grid">

          {/* Check In */}

          <div className="time-card-box">

            <div className="time-card-icon">
              <ClockIcon size={20} />
            </div>

            <div className="time-card-info">

              <span className="time-card-label">
                Check In Time
              </span>

              <strong className="time-card-val">
                {formatTime(today?.check_in)}
              </strong>

            </div>

          </div>


          {/* Check Out */}

          <div className="time-card-box">

            <div className="time-card-icon">
              <ClockIcon size={20} />
            </div>

            <div className="time-card-info">

              <span className="time-card-label">
                Check Out Time
              </span>

              <strong className="time-card-val">
                {formatTime(today?.check_out)}
              </strong>

            </div>

          </div>


          {/* Working Hours */}

          <div className="time-card-box">

            <div className="time-card-icon">
              <AttendanceIcon size={20} />
            </div>

            <div className="time-card-info">

              <span className="time-card-label">
                Working Hours
              </span>

              <strong className="time-card-val">

                {today?.working_hours
                  ? `${today.working_hours} hrs`
                  : "--"}

              </strong>

            </div>

          </div>

        </div>


        {/* ====================================================
            ACTION BUTTONS
        ==================================================== */}

        <div className="attendance-actions-row">

          {/* CHECK IN */}

          <button
            className="check-btn check-in-btn"
            onClick={handleCheckIn}
            disabled={
              actionLoading ||
              isCheckedIn
            }
          >

            <CheckIcon size={18} />

            <span>

              {isCheckedIn
                ? "✓ Checked In"
                : "Check In"}

            </span>

          </button>


          {/* CHECK OUT */}

          <button
            className="check-btn check-out-btn"
            onClick={handleCheckOut}
            disabled={
              actionLoading ||
              !isCheckedIn ||
              isCheckedOut
            }
          >

            <ClockIcon size={18} />

            <span>

              {actionLoading && isCheckedIn
                ? "Processing..."
                : isCheckedOut
                ? "✓ Checked Out"
                : "Check Out"}

            </span>

          </button>

        </div>

      </section>


      {/* ======================================================
          ATTENDANCE HISTORY
      ====================================================== */}

      <section className="history-card">

        <div className="history-header">

          <h2 className="history-title">
            Attendance History
          </h2>

          <span className="history-badge">
            {attendanceList.length} Total Logs
          </span>

        </div>


        {attendanceList.length === 0 ? (

          <div className="history-empty-state">

            <CalendarIcon size={36} />

            <h3>
              No attendance records yet
            </h3>

            <p>
              Your recorded shifts and check-in
              history will show up here.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="custom-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {attendanceList.map(
                  (record) => (

                    <tr key={record.id}>

                      <td>

                        <span className="date-cell-strong">
                          {formatDate(record.date)}
                        </span>

                      </td>

                      <td>
                        {formatTime(
                          record.check_in
                        )}
                      </td>

                      <td>
                        {formatTime(
                          record.check_out
                        )}
                      </td>

                      <td>

                        {record.working_hours
                          ? `${record.working_hours} hrs`
                          : "--"}

                      </td>

                      <td>

                        <span
                          className={`history-status-tag ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ======================================================
          QR SCANNER MODAL
      ====================================================== */}

      {showScanner && (

        <div
          className="qr-scanner-overlay"
          onClick={closeScanner}
        >

          <div
            className="qr-scanner-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Scanner Header */}

            <div className="qr-scanner-header">

              <div>

                <span className="page-category-badge">
                  ATTENDANCE VERIFICATION
                </span>

                <h2>
                  Scan Mentor QR
                </h2>

                <p>
                  Ask your mentor to display today's
                  attendance QR code and scan it here.
                </p>

              </div>


              <button
                className="qr-close-btn"
                onClick={closeScanner}
                disabled={scannerLoading}
                aria-label="Close scanner"
              >
                ×
              </button>

            </div>


            {/* Scanner */}

            <div className="qr-scanner-container">

              <div
                id="attendance-qr-reader"
                className="attendance-qr-reader"
              />

            </div>


            {/* Scanner Error */}

            {error && (

              <div
                className="alert-banner error qr-error"
                role="alert"
              >

                <span className="alert-icon-wrap">
                  <AlertIcon size={18} />
                </span>

                <span>
                  {error}
                </span>

              </div>

            )}


            {/* Scanner Status */}

            <div className="qr-scanner-help">

              {scannerLoading ? (

                <>

                  <div className="loading-spinner small" />

                  <span>
                    Verifying attendance...
                  </span>

                </>

              ) : (

                <>

                  <span className="qr-scan-dot" />

                  <span>
                    Point your camera at your
                    mentor's QR code
                  </span>

                </>

              )}

            </div>


            {/* Cancel */}

            <button
              type="button"
              className="qr-cancel-btn"
              onClick={closeScanner}
              disabled={scannerLoading}
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </NavShell>
  );
}


export default Attendance;