import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FacialRecognition.css";

const FacialRecognition = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState("");
  const [userEmail, setUserEmail] = useState("Guest");
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        alert("Failed to access webcam. Please allow camera access.");
      }
    };
    startWebcam();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token) {
      console.warn("⛔ No token found. Redirecting to login...");
      navigate("/");
    } else {
      setUserEmail(email || "Guest");
      setPageReady(true);
    }
  }, [navigate]);

  if (!pageReady) return <div className="loading">🔄 Loading Facial Recognition...</div>;

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const namedBlob = new File([blob], `captured-${Date.now()}.png`, { type: "image/png" });
          setCapturedImage(namedBlob);
          setUploadedImage(null);
          setRecognitionResult("");
        }
      }, "image/png");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      setCapturedImage(null);
      setRecognitionResult("");
    }
  };

  const handleVerifyFace = async (fileKey) => {
    try {
      const response = await fetch("/api/rekognition/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: {
            bucket: "visitors-images-store",
            key: fileKey,
          },
          collectionId: "employees",
        }),
      });

      const data = await response.json();
      if (data?.matchedFaceId) {
        alert(`✅ Face Verified: ${data.similarity.toFixed(2)}% similarity`);
        return true;
      } else {
        alert("❌ No face match found.");
        return false;
      }
    } catch (err) {
      console.error("Rekognition error:", err);
      alert("Error during face verification.");
      return false;
    }
  };

  const performRecognition = async () => {
    setLoading(true);
    setRecognitionResult("");

    const selectedImage = capturedImage || uploadedImage;

    if (!selectedImage) {
      setRecognitionResult("❌ No image selected or captured.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const uploadRes = await fetch("http://localhost:5000/api/s3/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.fileKey) throw new Error("Upload failed.");

      const imageKey = uploadData.fileKey;
      const isFaceMatch = await handleVerifyFace(imageKey);

      if (!isFaceMatch) {
        setRecognitionResult("❌ Face not recognized or not found in collection.");
        setLoading(false);
        return;
      }

      // const apiUrl = `https://7qfgh71fzj.execute-api.ap-south-1.amazonaws.com/dev/recognize?imageKey=${encodeURIComponent(imageKey)}`;
      // new api
      const apiUrl = `https://ntzc2f3mnh.execute-api.ap-south-1.amazonaws.com/dev/recognize?imageKey=${encodeURIComponent(imageKey)}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok && data?.employee) {
        const { firstName, lastName, email } = data.employee;
        const fullName = `${firstName} ${lastName}`;

        setRecognitionResult(`✅ Face Matched: ${fullName} (${email})`);

        setTimeout(() => {
       //   navigate("/otp-verification", {
         navigate("/OTP-verification", {
           


            state: {
              name: fullName,
              email: email,
            },
          });
        }, 1500);
      } else {
        setRecognitionResult(`❌ ${data?.message || "Face not recognized."}`);
      }
    } catch (error) {
      console.error("Recognition error:", error);
      //setRecognitionResult("❌ Error during recognition processsss.");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/");
  };

 return (
  <div className="facial-recognition-container">
    <div className="top-bar">
      <span className="user-info">🔐 Logged in as: {userEmail}</span>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>

    <h2 className="heading">SafeX Facial Recognition System</h2>

    <div className="video-image-wrapper">
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline />
        <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />
      </div>
      <div class="capture-note">
  <strong>Note for capturing image:</strong><br />
  • Ensure your full face is clearly visible in the frame.<br />
  • Avoid having anyone else in the background.<br />
  • Stand in front of a clean and plain background.<br />
  • Make sure the lighting is adequate and evenly distributed.
</div>


      <div className="image-preview">
        {capturedImage && <img src={URL.createObjectURL(capturedImage)} alt="Captured" />}
        {uploadedImage && <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" />}
      </div>
    </div>

    <div className="button-group">
      <button onClick={captureImage}>📸 Capture from Webcam</button>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={performRecognition} disabled={loading || (!capturedImage && !uploadedImage)}>
        {loading ? "🔍 Authenticating..." : "🔐 Upload & Authenticate"}
      </button>
    </div>

    {recognitionResult && <p className="result-message">{recognitionResult}</p>}
  </div> // ✅ this was missing
);}


export default FacialRecognition;
