import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import safexLogo from "../assets/logosafex.png"; // Replace with your logo path
import illustration from "../assets/illustration.jpg"; // Replace with your illustration image*/
import "../styles/styles.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) return alert("Please enter both fields!");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Login successful!");
        localStorage.setItem("token", data.token || "dummy_token");
        localStorage.setItem("email", data.email || email);
        navigate("/facial-recognition");
      } else {
        alert(data.message || "❌ Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("🚨 Server error. Try again later.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <img src={safexLogo} alt="SAFEX Logo" className="safex-logo-small" />
        <h2>Welcome Back!</h2>
        <p>Enter your credentials to continue</p>

        <form onSubmit={handleLogin}>
          <label>Email address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        
          <div className="login-options">
            <label>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              Remember for 30 days
            </label>
            <span className="link" onClick={() => navigate("/forgot-password")}>Forgot password</span>
          </div>

          <button type="submit" className="primary-btn">Sign in</button>

       <button type="button" className="google-btn">
  Sign in with Google
</button>
          <p className="signup-text">
            Don’t have an account? <span className="link" onClick={() => navigate("/register")}>Sign up</span>
          </p>
        </form>
      </div>

      <div className="login-illustration">
        <img src={illustration} alt="Login Visual" />
      </div>
    </div>
  );
};

export default Login;