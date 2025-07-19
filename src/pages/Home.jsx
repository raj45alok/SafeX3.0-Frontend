import React from "react";
import { Link } from "react-router-dom";
import "../styles/styles.css"; 

const Home = () => {
  return (
    <div className="container">
      <h1>Welcome to SafeX 3.0</h1>
      <p>Secure Authentication with Facial Recognition</p>
      <div className="btn-container">
        <Link to="/login" className="btn">Login</Link>
        <Link to="/register" className="btn">Register</Link>
      </div>
    </div>
  );
};

export default Home;
