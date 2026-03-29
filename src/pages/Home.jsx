import React, { useState } from "react";
import { Compass } from "lucide-react";
import RegisterModal from "../components/RegisterModal";
import LoginModal from "../components/LoginModal";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <Compass className="logo-icon" />
          <span>CourseCompass</span>
        </div>

        <div className="nav-actions">
          <button className="btn btn-outline" onClick={() => setShowLogin(true)}>
            Login
          </button>
          <button className="btn btn-primary" onClick={() => setShowRegister(true)}>
            Register
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <h1>Find the Right Course for Your Future</h1>
        <p>
          CourseCompass helps South African students discover university courses
          they qualify for based on their APS score.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-large" onClick={() => setShowRegister(true)}>
            Get Started
          </button>
          <button className="btn btn-outline btn-large" onClick={() => setShowLogin(true)}>
            I Already Have an Account
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <h3>📊 Calculate APS</h3>
          <p>Enter your marks and get your APS score instantly</p>
        </div>

        <div className="feature-card">
          <h3>🎓 Find Courses</h3>
          <p>Discover courses you qualify for based on your score</p>
        </div>

        <div className="feature-card">
          <h3>🚀 Plan Your Future</h3>
          <p>Get personalized recommendations for your career path</p>
        </div>
      </section>

      {/* Modals */}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSuccess={() => {
            setShowRegister(false);
            setShowLogin(true); // open login modal after register
          }}
        />
      )}


      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false);
            navigate("/dashboard"); // after login go to dashboard
          }}
        />
      )}
    </div>
  );
};

export default Home;
