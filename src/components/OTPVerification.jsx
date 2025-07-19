import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/OtpVerification.css";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { name, email } = location.state || {};

  // Send OTP when page loads
  useEffect(() => {
    if (!email) {
      setMessage("❌ Email missing. Please login again.");
      setMessageType("error");
      setTimeout(() => navigate("/"), 3000);
    } else {
      sendOtp();
    }
  }, [email, navigate]);

  // Handle cooldown countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Function to send OTP
  const sendOtp = async () => {
    try {
      setMessage("📨 Sending OTP...");
      setMessageType("info");

      const res = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("OTP sent to your email.");
        setMessageType("success");
        setResendCooldown(30); // 30s cooldown
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setMessage("❌ Could not send OTP. Try again.");
      setMessageType("error");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || !/^\d{4,6}$/.test(otp)) {
      setMessage("❌ Enter a valid numeric OTP (4–6 digits).");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

     if (response.ok && data.success) {
  setMessage(" OTP Verified. Redirecting...");
  setMessageType("success");
  localStorage.setItem("isAuthenticated", "true");

  // Auto logout after 15 minutes
  setTimeout(() => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/";
  }, 15 * 60 * 1000);

  // Navigate to vault (final destination)
  navigate("/vault", { state: { name, email } });
      } else {
        setMessage(data?.message || "❌ Invalid OTP. Try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setMessage("❌ Server error. Try again later.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <h2>OTP Verification</h2>

      {name && email && (
        <p className="user-info">
          Welcome, <strong>{name}</strong> <br /> ({email})
        </p>
      )}

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="otp-input"
        maxLength={6}
        aria-label="Enter OTP"
      />

      <button
        onClick={handleVerifyOtp}
        className="verify-button"
        disabled={loading || otp.trim() === ""}
      >
        {loading ? "🔄 Verifying..." : "Verify OTP"}
      </button>

      <button
        onClick={sendOtp}
        className="resend-button"
        disabled={resendCooldown > 0}
        style={{ marginTop: "10px" }}
      >
        {resendCooldown > 0
          ? `⏳ Resend in ${resendCooldown}s`
          : "🔁 Resend OTP"}
      </button>

      {message && (
        <p className={`otp-message ${messageType}`}>{message}</p>
      )}
    </div>
  );
};

export default OtpVerification;
