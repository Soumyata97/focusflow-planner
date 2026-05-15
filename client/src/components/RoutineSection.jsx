import React from "react";
import RoutineCard from "./RoutineCard";
import { FaSun, FaCloudSun, FaMoon, FaRegMoon } from "react-icons/fa";

const RoutineSection = ({ title, timeRange, routines, onToggleActive, onComplete, onEdit }) => {
  const getIcon = () => {
    const style = { color: "#6c5ce7", fontSize: "18px" };
    switch (title.toLowerCase()) {
      case "morning": return <FaSun style={style} />;
      case "afternoon": return <FaCloudSun style={style} />;
      case "evening": return <FaMoon style={style} />;
      case "night": return <FaRegMoon style={style} />;
      default: return null;
    }
  };

  if (routines.length === 0) return null;

  return (
    <div style={sectionContainer}>
      <div style={sectionHeader}>
        <div style={iconBox}>
          {getIcon()}
        </div>
        <h3 style={sectionTitle}>
          {title}
        </h3>
      </div>

      <div>
        {routines.map((routine) => (
          <RoutineCard 
            key={routine._id} 
            routine={routine} 
            onToggleActive={onToggleActive}
            onComplete={onComplete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};

/* STYLES */

const sectionContainer = {
  marginBottom: "36px",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "18px",
};

const iconBox = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "10px",
};



export default RoutineSection;

