import React from "react";
import * as FaIcons from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

const RoutineCard = ({ routine, onToggleActive, onComplete, onEdit }) => {
  const IconComponent = FaIcons[routine.iconName] || FaIcons.FaRegCircle;

  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const isCompletedToday = () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return routine.completedDays?.includes(today) || false;
  };

  const completedToday = isCompletedToday();

  return (
    <div style={cardStyle(completedToday)} onClick={() => onEdit(routine)}>
      <div style={leftContent}>
        {/* Icon / Completion Toggle */}
        <div 
          style={iconContainer(completedToday)}
          onClick={(e) => {
            e.stopPropagation();
            onComplete(routine._id);
          }}
        >
          <IconComponent size={18} />
        </div>

        <div style={textContainer}>
          <h4 style={titleStyle(completedToday)}>{routine.title}</h4>
          <div style={infoRow}>
            <span style={timeBadge}>{formatTime12h(routine.startTime)}</span>
            <span style={separator}>•</span>
            <span style={freqText}>{routine.frequency.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Completion Toggle */}
      <div 
        style={toggleOuter(completedToday)}
        onClick={(e) => {
          e.stopPropagation();
          onToggleActive(routine._id);
        }}
      >
        <div style={toggleInner(completedToday)} />
      </div>
    </div>
  );
};

/* STYLES */

const cardStyle = (completed) => ({
  background: "#ffffff",
  padding: "16px 20px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: completed ? "none" : "0 4px 20px rgba(0,0,0,0.03)",
  border: completed ? "1px solid #f0efff" : "1px solid #f8f9fa",
  marginBottom: "12px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  opacity: completed ? 0.6 : 1,
  backgroundColor: completed ? "#faf9ff" : "#fff",
});

const leftContent = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
};

const iconContainer = (completed) => ({
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f0efff",
  color: "#6c5ce7",
  transition: "all 0.2s ease",
});

const textContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const titleStyle = (completed) => ({
  fontSize: "16px",
  fontWeight: "700",
  color: completed ? "#94a3b8" : "#334155",
  margin: 0,
  textDecoration: completed ? "line-through" : "none",
});

const infoRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const timeBadge = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#6c5ce7",
  background: "#f0efff",
  padding: "2px 8px",
  borderRadius: "6px",
};

const separator = {
  fontSize: "12px",
  color: "#cbd5e1",
};

const freqText = {
  fontSize: "12px",
  fontWeight: "500",
  color: "#64748b",
  textTransform: "capitalize",
};

const toggleOuter = (active) => ({
  width: "48px",
  height: "24px",
  borderRadius: "12px",
  background: active ? "#6c5ce7" : "#e2e8f0",
  padding: "3px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
});

const toggleInner = (active) => ({
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  background: "#fff",
  transition: "all 0.3s ease",
  transform: active ? "translateX(24px)" : "translateX(0)",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
});

export default RoutineCard;

