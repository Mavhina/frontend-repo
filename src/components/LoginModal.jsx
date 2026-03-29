import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./RegisterModal.css";

const LoginModal = ({ onClose }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // ✅ Save JWT
      const token = res.data.token;
      localStorage.setItem("jwt", token);

      // ✅ Decode role and redirect accordingly
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role = decoded.role || decoded.roles?.[0] || "";

      onClose();

      if (role === "TUTOR") {
        navigate("/tutor/dashboard");
      } else {
        navigate("/app/dashboard");
      }
    } catch (err) {
      console.log("LOGIN ERROR FULL:", err);
      console.log("LOGIN ERROR RESPONSE:", err.response?.status, err.response?.data);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>Welcome Back</h2>
        <p>Login to continue your journey</p>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;