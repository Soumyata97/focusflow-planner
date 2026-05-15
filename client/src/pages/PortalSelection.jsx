import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap, FaBriefcase } from "react-icons/fa";
import "../styles/PortalSelection.css";

const PortalSelection = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const existingRole = localStorage.getItem("role");
    if (existingRole && existingRole !== "undefined" && existingRole !== "null") {
      if (existingRole === "student") {
        navigate("/student/dashboard", { replace: true });
      } else if (existingRole === "professional") {
        navigate("/professional/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  const selectRole = async (role) => {
    try {

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/users/set-role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      

      const data = await response.json();

      console.log(data);

      localStorage.setItem("role", role);

      if (role === "student") {
        navigate("/student/dashboard", { replace: true });
      } else {
        navigate("/professional/dashboard", { replace: true });
      }

    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  return (
    <div className="portal-container">

      <h1 className="portal-title">Welcome to FocusFlow Planner</h1>

      <p className="portal-subtitle">
        Select your portal to customize your productivity experience.
      </p>

      <div className="portal-cards">

        {/* Student Card */}
        <div className="portal-card">

          <div className="portal-icon">
            <FaGraduationCap size={45} />
          </div>

          <h2>Student</h2>

          <p>
            Organize subjects, assignments, study sessions, and deadlines efficiently.
          </p>

          <button 
            className="portal-btn"
            onClick={() => selectRole("student")}
          >
            Continue as Student
          </button>

        </div>

        {/* Professional Card */}
        <div className="portal-card">

          <div className="portal-icon">
            <FaBriefcase size={45} />
          </div>

          <h2>Professional</h2>

          <p>
            Manage projects, tasks, meetings, and work schedules efficiently.
          </p>

          <button 
            className="portal-btn"
            onClick={() => selectRole("professional")}
          >
            Continue as Professional
          </button>

        </div>

      </div>

    </div>
  );
};

export default PortalSelection;