import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ResetPassword.css'; // Optional styling

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem('resetEmail');

  useEffect(() => {
    if (!email) {
      setMessage("❌ Email not found. Please restart the process.");
    }
  }, [email]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) return;

    if (!/^\d{4,6}$/.test(otp)) {
      return setMessage("❌ Please enter a valid 4–6 digit OTP.");
    }

    if (password.length < 6) {
      return setMessage("❌ Password must be at least 6 characters long.");
    }

    try {
      setLoading(true);
      setMessage('');

      const res = await axios.post('http://localhost:5000/api/password/reset', {
        email,
        otp,
        newPassword: password,
      });

      setMessage('✅ Password reset successful. Redirecting to login...');
      localStorage.removeItem('resetEmail');

      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>Reset Password</h2>
        <form onSubmit={handleReset}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading || !otp.trim() || !password.trim()}>
            {loading ? '🔄 Resetting...' : 'Reset Password'}
          </button>
        </form>
        {message && <p className="reset-message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
