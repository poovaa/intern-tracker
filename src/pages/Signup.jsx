import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "INTERN",
    mentor: "",
  });

  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // LOAD MENTOR LIST
  // ============================================================

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoadingMentors(true);

      const response = await api.get("/auth/mentors/");

      console.log("Mentor API response:", response.data);

      setMentors(response.data.mentors || []);
    } catch (err) {
      console.error("Failed to load mentors:", err);

      setError("Unable to load mentor list.");
    } finally {
      setLoadingMentors(false);
    }
  };

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    // Clear error when user changes input
    if (error) {
      setError("");
    }
  };

  // ============================================================
  // HANDLE ROLE CHANGE
  // ============================================================

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;

    setForm({
      ...form,
      role: selectedRole,
      mentor: selectedRole === "INTERN" ? form.mentor : "",
    });

    setError("");
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Password validation
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    // Mentor validation for Intern
    if (form.role === "INTERN" && !form.mentor) {
      setError("Please select a mentor.");
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      // Send mentor only for Intern
      if (form.role === "INTERN") {
        requestData.mentor = Number(form.mentor);
      }

      console.log("Register data:", requestData);

      const response = await api.post(
        "/auth/register/",
        requestData
      );

      console.log("Register response:", response.data);

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      console.error("Signup error:", err);

      const backendError = err.response?.data;

      let message = "Unable to create account.";

      if (backendError?.error) {
        message = backendError.error;
      } else if (backendError?.detail) {
        message = backendError.detail;
      } else if (backendError?.message) {
        message = backendError.message;
      }

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-card">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="signup-header">
          <span className="signup-label">
            INTERN TRACKING SYSTEM
          </span>

          <h1>Create Account</h1>

          <p>
            Create your account to continue.
          </p>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form onSubmit={handleSubmit}>

          {/* USERNAME */}

          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>


          {/* EMAIL */}

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>


          {/* ACCOUNT TYPE */}

          <div className="form-group">
            <label>Account Type</label>

            <select
              name="role"
              value={form.role}
              onChange={handleRoleChange}
            >
              <option value="INTERN">
                Intern
              </option>

              <option value="MENTOR">
                Mentor
              </option>
            </select>
          </div>


          {/* ==================================================
              MENTOR
              Show only when account type is INTERN
          ================================================== */}

          {form.role === "INTERN" && (
            <div className="form-group">

              <label>Select Mentor</label>

              <select
                name="mentor"
                value={form.mentor}
                onChange={handleChange}
                required
                disabled={loadingMentors}
              >

                <option value="">
                  {loadingMentors
                    ? "Loading mentors..."
                    : "Select a mentor"}
                </option>

                {mentors.map((mentor) => (
                  <option
                    key={mentor.id}
                    value={mentor.id}
                  >
                    {mentor.first_name || mentor.last_name
                      ? `${mentor.first_name || ""} ${
                          mentor.last_name || ""
                        }`.trim() + ` (${mentor.username})`
                      : mentor.username}
                  </option>
                ))}

              </select>

              {/* No mentors available */}

              {!loadingMentors && mentors.length === 0 && (
                <small className="mentor-warning">
                  No mentors available. Please contact admin.
                </small>
              )}

            </div>
          )}


          {/* PASSWORD */}

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>


          {/* CONFIRM PASSWORD */}

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Confirm password"
              required
            />
          </div>


          {/* ERROR */}

          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="signup-success">
              {success}
            </div>
          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="signup-button"
            disabled={
              loading ||
              (form.role === "INTERN" &&
                mentors.length === 0)
            }
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>


        {/* ==================================================
            LOGIN
        ================================================== */}

        <div className="login-link">
          Already have an account?

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Login
          </button>
        </div>

      </div>

    </div>
  );
}

export default Signup;