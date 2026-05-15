import React from "react";
import { FaFire, FaCheckCircle, FaListUl } from "react-icons/fa";

const RoutineStatsCards = ({ streak, totalActive, totalRoutines }) => {
  return (
    <div style={statsGrid}>
      {/* Current Streak */}
      <div style={card}>
        <div style={cardContent}>
          <p style={cardLabel}>Current Streak</p>
          <h3 style={cardValue}>{streak} Days</h3>
        </div>
        <div style={iconWrapper("#f5f0ff", "#6c5ce7")}>
          <FaFire size={22} />
        </div>
      </div>

      {/* Completed Today */}
      <div style={card}>
        <div style={cardContent}>
          <p style={cardLabel}>Completed Today</p>
          <h3 style={cardValue}>{totalActive} Done</h3>
        </div>
        <div style={iconWrapper("#f5f0ff", "#6c5ce7")}>
          <FaCheckCircle size={22} />
        </div>
      </div>

      {/* Total Routines */}
      <div style={card}>
        <div style={cardContent}>
          <p style={cardLabel}>Total Routines</p>
          <h3 style={cardValue}>{totalRoutines} Routines</h3>
        </div>
        <div style={iconWrapper("#f5f0ff", "#6c5ce7")}>
          <FaListUl size={22} />
        </div>
      </div>
    </div>
  );
};

/* STYLES */

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px",
  marginBottom: "32px",
};

const card = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 10px 25px rgba(108,92,231,0.06)",
  border: "1px solid #f1f1f1",
  position: "relative",
  overflow: "hidden",
};

const cardContent = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const cardLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#94a3b8",
  margin: 0,
};

const cardValue = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0,
};

const iconWrapper = (bgColor, color) => ({
  background: bgColor,
  color: color,
  width: "56px",
  height: "56px",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
});



export default RoutineStatsCards;

