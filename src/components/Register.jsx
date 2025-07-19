import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    image: null,
  });

  const [passwordError, setPasswordError] = useState("");
  const [isPasswordUsed, setIsPasswordUsed] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [imageError, setImageError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        setFormData((prev) => ({ ...prev, image: file }));
        setImageError("");
      } else {
        setImageError("❌ Please upload a valid image file.");
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      if (!passwordRegex.test(value)) {
        setPasswordError(
          "Password must be at least 6 characters, include 1 letter, 1 number & 1 special character."
        );
      } else {
        setPasswordError("");
        checkPasswordReuse(value);
      }
    }
  };

  const checkPasswordReuse = async (password) => {
    if (!passwordRegex.test(password)) return;

    setCheckingPassword(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      setIsPasswordUsed(data.exists);
    } catch (err) {
      console.error("Password check failed:", err);
    } finally {
      setCheckingPassword(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { fullName, email, password, image } = formData;

    if (!fullName || !email || !password || !image) {
      alert("⚠️ All fields including image are required!");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert("❌ Invalid password format.");
      return;
    }

    if (isPasswordUsed) {
      alert("❌ Password is already in use.");
      return;
    }

    const formattedName = fullName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    setLoading(true);

    // Step 1: Register in MongoDB backend
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: formattedName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "❌ Registration failed.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("MongoDB registration failed:", err);
      alert("🚨 Server error. Please try again later.");
      setLoading(false);
      return;
    }

    // Step 2: Upload image to S3 via backend
    const formDataForUpload = new FormData();
    const fileName = `${formattedName.replace(/\s+/g, "-")}-${email}.jpg`;
    formDataForUpload.append("image", image);
    formDataForUpload.append("fullName", formattedName);
    formDataForUpload.append("email", email);

    try {
      const uploadRes = await fetch("http://localhost:5000/api/employee/upload", {
        method: "POST",
        body: formDataForUpload,
      });

      const uploadData = await uploadRes.json();

      if (uploadRes.ok) {
        setMessage("✅ Registration complete. Image uploaded & processing triggered!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        alert(uploadData.message || "❌ Failed to upload image.");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("🚨 Error uploading image.");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="auth-container">
    <div className="auth-split">
      <div className="auth-box">
        <h2>Registration Form  </h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {passwordError && <p className="error-text">{passwordError}</p>}
          {checkingPassword ? (
            <p className="info-text">Checking password reuse...</p>
          ) : isPasswordUsed ? (
            <p className="error-text">This password is already in use.</p>
          ) : (
            formData.password &&
            passwordRegex.test(formData.password) && (
              <p className="success-text">✅ Password looks good!</p>
            )
          )}
          <div className="upload-wrapper">
  <input
    type="file"
    name="image"
    accept="image/*"
    onChange={handleChange}
    required
  />
  <span className="upload-note">
    Format: Firstname-Lastname-email.jpg/png
  </span>
</div>

{imageError && <p className="error-text">{imageError}</p>}
          <small class="info-text">
  
</small>

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {loading && <p className="loading-text">⏳ Registering, please wait...</p>}
        <p className="success-text">{message}</p>
        <p>
          Already have an account?{" "}
          <span className="login-link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>

      <div className="auth-illustration">
         <div className="info-placard">
           <img src="src\assets\logosafex.png" alt="Safex Logo" className="placard-logo" />
            <p>
      Safex is a secure and user-friendly platform designed to protect your data,
      streamline digital transactions, and empower privacy and store valuable data files inside a vault .It can work as a plugin to any web application  Join us today and
      experience the future of secure technology.
    </p>
          <label></label>
        </div>
      </div>
    </div>
  </div>
);

};

export default Register;
