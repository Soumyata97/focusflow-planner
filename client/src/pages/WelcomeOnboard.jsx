import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBullseye, FaCalendarCheck, FaClock, FaChartLine, FaArrowRight } from "react-icons/fa";
import "../styles/welcome.css";

function WelcomeOnboard() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-left">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              background: "linear-gradient(135deg, #6c5ce7, #8e7cfb)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 20px 50px rgba(108,92,231,0.25)"
            }}>
              <FaBullseye size={52} color="#fff" />
            </div>
            <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>FocusFlow Planner</span>
          </div>
        </div>

        <div className="welcome-right">
          <h1 className="welcome-title">
            Welcome to FocusFlow!
          </h1>

          <p className="welcome-subtitle">
            Let's get you set up for success. Achieve your goals with smart
            planning and distraction-free work sessions tailored just for you.
          </p>

          <div className="welcome-features">
            <div className="feature-card">
              <FaCalendarCheck size={24} color="#6c5ce7" />
              <h4>Smart Planning</h4>
              <p>Organize your day effectively</p>
            </div>

            <div className="feature-card">
              <FaClock size={24} color="#0984e3" />
              <h4>Deep Focus</h4>
              <p>Stay in the zone with timers</p>
            </div>

            <div className="feature-card">
              <FaChartLine size={24} color="#00b894" />
              <h4>Track Progress</h4>
              <p>Visualize your productivity</p>
            </div>
          </div>

          <div className="welcome-actions">
            <button
              className="get-started-btn"
              onClick={() => navigate("/portal-selection", { replace: true })}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              Get Started <FaArrowRight size={14} />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeOnboard;
