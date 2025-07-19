import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/ForgotPassword.css"; // Uses updated styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState('');
const [captchaInput, setCaptchaInput] = useState('');


  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/password/forgot', { email });

      setMessage(res.data.message || 'OTP sent successfully!');
      localStorage.setItem('resetEmail', email);
      setTimeout(() => navigate('/verify-otp'), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSendOTP}>
         
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter Your Registered Email"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
};


export default ForgotPassword;
