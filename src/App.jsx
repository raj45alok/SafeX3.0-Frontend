import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import FacialRecognition from "./components/FacialRecognition";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOTP from "./components/VerifyOTP";         // Forgot Password Flow
import ResetPassword from "./components/ResetPassword";
import OTPVerification from "./components/OTPVerification"; // Registration/Login Flow
import Vault from "./components/Vault";                // ✅ New Vault Component

function App() {
    return (
        <Router>
            <Routes>
                {/* Default Route */}
                <Route path="/" element={<Login />} />

                {/* Auth Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/OTP-verification" element={<OTPVerification />} />
                <Route path="/facial-recognition" element={<FacialRecognition />} />

                {/* Forgot Password Flow */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* 🔐 Safex Vault Route */}
                <Route path="/vault" element={<Vault />} />

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
