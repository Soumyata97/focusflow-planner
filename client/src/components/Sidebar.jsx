import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaCalendarAlt,
  FaTasks,
  FaRedo,
  FaClock,
  FaFolder,
  FaChartBar,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  //GET ROLE
  const role = localStorage.getItem("role") || "student"; // fallback

  // ACTIVE CHECK (SMART)
  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={sidebar}>

      {/* LOGO */}
      <div>
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "400", color: "#000000", fontFamily: "'Agbalumo', system-ui" }}>FocusFlow Planner</h2>
        </div>

        {/* MENU */}
        <ul style={{ listStyle: "none", padding: 0 }}>

          <Link to={`/${role}/dashboard`} style={linkStyle}>
            <li style={isActive("dashboard") ? activeItem : menuItem}>
              <FaThLarge /> Dashboard
            </li>
          </Link>

          <Link to={`/${role}/timeline`} style={linkStyle}>
            <li style={isActive("timeline") ? activeItem : menuItem}>
              <FaCalendarAlt /> Timeline Planner
            </li>
          </Link>

          <Link to={`/${role}/tasks`} style={linkStyle}>
            <li style={isActive("tasks") ? activeItem : menuItem}>
              <FaTasks /> Tasks
            </li>
          </Link>

          <Link to={`/${role}/routines`} style={linkStyle}>
            <li style={isActive("routines") ? activeItem : menuItem}>
              <FaRedo /> Routines
            </li>
          </Link>

          <Link to={`/${role}/pomodoro`} style={linkStyle}>
            <li style={isActive("pomodoro") ? activeItem : menuItem}>
              <FaClock /> Pomodoro
            </li>
          </Link>

          <Link to={`/${role}/projects`} style={linkStyle}>
            <li style={isActive("projects") ? activeItem : menuItem}>
              <FaFolder /> 
              {role === "student" ? "Subjects" : "Projects"}
            </li>
          </Link>

          <Link to={`/${role}/analytics`} style={linkStyle}>
            <li style={isActive("analytics") ? activeItem : menuItem}>
              <FaChartBar /> Analytics
            </li>
          </Link>

          <Link to={`/${role}/settings`} style={linkStyle}>
            <li style={isActive("settings") ? activeItem : menuItem}>
              <FaCog /> Settings
            </li>
          </Link>

        </ul>
      </div>

      {/* LOGOUT */}
      <div style={logout} onClick={() => setShowLogoutConfirm(true)}>
        <FaSignOutAlt /> Logout
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

/* STYLES */

const sidebar = {
  width: "240px",
  height: "100vh",
  boxSizing: "border-box",
  background: "transparent",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  borderRight: "none"
};

const menuItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 12px",
  borderRadius: "10px",
  marginBottom: "8px",
  cursor: "pointer",
  color: "#555",
  fontSize: "14px"
};

const activeItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 12px",
  borderRadius: "10px",
  marginBottom: "8px",
  background: "#ece9ff",
  color: "#6c5ce7",
  fontWeight: "600",
  fontSize: "14px"
};

const logout = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  borderRadius: "10px",
  cursor: "pointer",
  color: "#777",
  fontSize: "14px",
  marginTop: "auto",
};

const linkStyle = {
  textDecoration: "none"
};

export default Sidebar;