import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/VerifyOTP.css";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(''); // ✅ single field
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes timer
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setUserCaptcha('');
  };

  useEffect(() => {
    generateCaptcha();
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem('resetEmail');

    if (!email) {
      return setMessage({ text: "Email not found. Please go back and enter your email.", type: 'error' });
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return setMessage({ text: "Please enter a valid 6-digit OTP.", type: 'error' });
    }

    if (userCaptcha !== captcha) {
      return setMessage({ text: "Captcha verification failed. Please try again.", type: 'error' });
    }

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });

      if (res.data.success) {
        setMessage({ text: 'OTP verified! Redirecting...', type: 'success' });
        setTimeout(() => navigate('/reset-password'), 1000);
      } else {
        setMessage({ text: res.data.message || 'OTP verification failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Server error during verification.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>Verify OTP</h2>
        <p className="subtitle">Enter the 6-digit OTP sent to your email</p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d{0,6}$/.test(val)) setOtp(val);
            }}
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="otp-single-input"
            required
          />

         <div className="captcha-row">
  <div className="captcha-box">{captcha}</div>
  <button
    type="button"
    className="refresh-captcha"
    onClick={generateCaptcha}
    aria-label="Refresh Captcha"
  >
    ↻
  </button>
</div>

<input
  type="text"
  value={userCaptcha}
  onChange={(e) => setUserCaptcha(e.target.value)}
  placeholder="Enter captcha"
  className="captcha-input"
  required
/>


          <button
            type="submit"
            className="verify-button"
            disabled={loading || otp.length !== 6 || !userCaptcha}
          >
            {loading ? "🔄 Verifying..." : "Verify OTP"}
          </button>
        </form>

        {message.text && (
          <div className={`otp-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="otp-resend">
          Didn't receive code?
          <button
            className="resend-link"
            disabled={timer > 0}
            onClick={() => {
              // Add resend OTP logic here
              setTimer(120);
              generateCaptcha();
            }}
          >
            Resend OTP {timer > 0 && `(${formatTime(timer)})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
