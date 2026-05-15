import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const AnalyticsCard = ({ title, value, subtext, trend, icon, color }) => {
  const isPositive = trend >= 0;

  return (
    <div style={card}>
      <div style={header}>
        <div style={titleArea}>
          <p style={label}>{title}</p>
          <div style={valueArea}>
            <h2 style={valText}>{value}</h2>
          </div>
          <p style={subText}>{subtext}</p>
        </div>
        <div style={iconBox(color)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/* STYLES */

const card = {
  background: "#fff",
  padding: "24px",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(108,92,231,0.06)",
  border: "1px solid #f1f1f1",
  flex: 1,
  minWidth: "280px",
  transition: "transform 0.2s ease",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const titleArea = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#94a3b8",
  margin: 0,
};

const valueArea = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "8px",
};

const valText = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0,
};

const trendBadge = (positive) => ({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 8px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "700",
  background: positive ? "#f0fdf4" : "#fef2f2",
  color: positive ? "#22c55e" : "#ef4444",
});

const subText = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "4px 0 0",
};

const iconBox = (color) => ({
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  background: `${color}15`,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
});

export default AnalyticsCard;
