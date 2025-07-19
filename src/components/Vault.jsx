// Vault.jsx

import '../Styles/Vault.css';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Vault = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [timer, setTimer] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          navigate("/");
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [navigate]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData);
      setUploadedFiles([...uploadedFiles, response.data]);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const handleFileDelete = async (filename) => {
    try {
      await axios.delete(`http://localhost:5000/delete/${filename}`);
      setUploadedFiles(uploadedFiles.filter(file => file.filename !== filename));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="vault-wrapper">
      <div className="vault-card">
        <div className="vault-header">
          <h1 className="vault-title"> Safex Vault</h1>
          <p id="session-timer">Session expires in {formatTime(timer)}</p>
        </div>

        <div className="upload-section">
          <label className="upload-btn">
            📁 Upload File
            <input type="file" onChange={handleFileChange} hidden />
          </label>
          <p className="drag-note">or drag & drop your files here</p>
          {selectedFile && (
            <button className="confirm-btn" onClick={handleFileUpload}>
              🚀 Upload {selectedFile.name}
            </button>
          )}
        </div>

        <div className="file-list">
          {uploadedFiles.length > 0 ? (
            uploadedFiles.map((file, idx) => (
              <div key={idx} className="file-item">
                <span className="file-name">📄 {file.filename}</span>
                <span className="file-meta">{(file.size / 1024).toFixed(1)} KB</span>
                <a
                  href={`http://localhost:5000/uploads/${file.filename}`}
                  className="access-btn"
                  download
                >
                  ⬇️ Access
                </a>
                <button
                  className="delete-btn"
                  onClick={() => handleFileDelete(file.filename)}
                >
                  ❌
                </button>
              </div>
            ))
          ) : (
            <p className="no-files">No files uploaded.</p>
          )}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
           Logout
        </button>
      </div>
    </div>
  );
};

export default Vault;
