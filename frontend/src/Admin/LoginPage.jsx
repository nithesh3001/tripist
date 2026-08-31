import React, { useState } from "react";
import logo1 from "../assets/logo 3.png";
import { api, auth } from "./api";
import './LoginPage.css';

export default function LoginPage({ onLoginSuccess }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const { token, user } = await api.login(
        credentials.username,
        credentials.password
      );
      auth.setToken(token);
      onLoginSuccess(user);
    } catch (err) {
      setLoginError(err.message || "Invalid username or password");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-card-header">
          <img src={logo1} alt="Tripist Logo" className="login-logo" />
          <h3>Admin</h3>
          <p>Portal Access</p>
        </div>

        <div className="login-card-body">
          {loginError && (
            <div className="alert alert-danger d-flex align-items-center py-2 px-3 small rounded-3 mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-6"></i>
              <div>{loginError}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Username
              </label>
              <div className="custom-input-group">
                <i className="bi bi-person input-icon"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Password
              </label>
              <div className="custom-input-group">
                <i className="bi bi-lock input-icon"></i>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-trip-gold w-100 mb-3"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                <>
                  Sign In <i className="bi bi-arrow-right-short ms-1"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}