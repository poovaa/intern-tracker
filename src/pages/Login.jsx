import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, AlertIcon, ArrowRightIcon } from "../components/Icons";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
  const response = await api.post("/auth/login/", {
    username: username.trim(),
    password,
  });

  // Save access token
  if (response.data.access) {
    localStorage.setItem("access_token", response.data.access);
  }

  // Save refresh token
  if (response.data.refresh) {
    localStorage.setItem("refresh_token", response.data.refresh);
  }

  // Get logged-in user information
  const userData = response.data.user || {
    username: username.trim(),
  };

  // Save user information
  localStorage.setItem("user", JSON.stringify(userData));

  // Redirect based on user role
  if (userData.role === "MENTOR") {
    navigate("/mentor/dashboard", { replace: true });
  } else {
    navigate("/dashboard", { replace: true });
  }

} catch (err) {
  console.error("Login failure:", err);

  if (err.response) {
    setError(
      err.response.data.error ||
      err.response.data.detail ||
      "Invalid username or password."
    );
  } else {
    setError("Unable to connect to server. Please try again.");
  }

} finally {
  setLoading(false);
}
  }

  //   try {
  //     const response = await api.post("/auth/login/", {
  //       username: username.trim(),
  //       password,
  //     });

  //     if (response.data.access) {
  //       localStorage.setItem("access_token", response.data.access);
  //     }
  //     if (response.data.refresh) {
  //       localStorage.setItem("refresh_token", response.data.refresh);
  //     }

  //     const userData = response.data.user || { username: username.trim() };
  //     localStorage.setItem("user", JSON.stringify(userData));

  //     navigate("/dashboard", { replace: true });
  //   } catch (err) {
  //     console.error("Login failure:", err);
  //     if (err.response) {
  //       setError(
  //         err.response.data.error ||
  //         err.response.data.detail ||
  //         "Invalid username or password."
  //       );
  //     } else {
  //       setError("Unable to connect to server. Please try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="login-page-wrapper">
      <div className="login-ambient-glow" aria-hidden="true" />
      <div className="login-grid-pattern" aria-hidden="true" />

      <main className="login-card animate-fade-in">
        <header className="login-header">
          <div className="login-brand-badge" aria-label="InternTrack Logo">
            IT
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to access your intern dashboard</p>
        </header>

        <form onSubmit={handleLogin} className="login-form" noValidate>
          <div className="input-group">
            <label className="input-label" htmlFor="username">
              Username
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <UserIcon size={18} />
              </span>
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <LockIcon size={18} />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
              
            </div>
          </div>

          {error && (
            <div className="login-error-banner" role="alert">
              <span className="error-icon-box">
                <AlertIcon size={16} />
              </span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner" />
                <span>Signing in...</span>

              </>
              
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRightIcon size={16} />
              </>
            )}
          </button>
        </form>



        <footer className="login-footer-tag">
        <span>Don't have an account?</span>

        <button
          type="button"
          className="create-account-btn"
          onClick={() => navigate("/signup")}
        >
          Create Account
        </button>
      </footer>
      </main>
    </div>
  );
}

export default Login;