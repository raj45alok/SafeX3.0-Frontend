# SafeX 3.0 – Frontend

SafeX is a secure facial authentication platform built with modern web technologies.  
This is the **frontend** part of the application, developed using **React** and **Vite**.
A secure, multi-layered authentication system built with React.js and Vite  that provides a modern and interactive UI for user registration, facial recognition login, and vault access.

##  Features

- User registration with form validation
- Login using password + facial recognition
- OTP verification for final authentication
- Webcam integration for live face capture
- Secure communication with AWS backend APIs
- Conditional rendering based on auth stages
- Dashboard access after successful verification

##  Tech Stack

- **Frontend**: React.js, HTML5, CSS3, JavaScript
- **Camera Access**: Webcam.js, and Axios 
- **API Integration**: Axios, Fetch API
- **Authentication Flow**: Password ➜ Face Recognition ➜ OTP Verification ➜ Vault 

##  Project Structure

/SafeX3.0-Frontend
├── /components
├── /pages
├── /utils
├── /assets
├── App.js
├── index.js
└── package.json



## 🌐 API Integration

- **POST** `/register` → Register new user
- **POST** `/login` → Validate credentials
- **POST** `/verify-face` → Send face image for verification
- **POST** `/verify-otp` → Final OTP validation

> All APIs require CORS-enabled endpoints from backend.

## 🧪 How to Run Locally

```bash
git clone https://github.com/raj45alok/SafeX3.0-Frontend.git
cd SafeX3.0-Frontend
npm install
npm run dev

Author
Alok Raj
Email: rajalok10375@gmail.com

