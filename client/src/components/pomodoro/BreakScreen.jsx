import React from "react";
import { FaTint, FaWalking, FaChild } from "react-icons/fa";

const BreakScreen = ({ timeLeft }) => {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div style={containerStyle}>
      <div style={timerText}>{formatTime(timeLeft)}</div>
      <h3 style={titleStyle}>Break – Recovery Time</h3>
      <p style={subtitleStyle}>
        Step away from your work. It's time to recharge your mind and body.
      </p>

      <div style={tipsGrid}>
        <div style={tipCard}>
          <div style={iconCircle("#74b9ff")}>
            <FaTint style={iconStyle("#0984e3")} />
          </div>
          <span style={tipText}>Drink Water</span>
        </div>
        <div style={tipCard}>
          <div style={iconCircle("#55efc4")}>
            <FaWalking style={iconStyle("#00b894")} />
          </div>
          <span style={tipText}>Short Walk</span>
        </div>
        <div style={tipCard}>
          <div style={iconCircle("#ffeaa7")}>
            <FaChild style={iconStyle("#fdcb6e")} />
          </div>
          <span style={tipText}>Stretch Body</span>
        </div>
      </div>
    </div>
  );
};

/* STYLES */

const containerStyle = {
  width: "100%",
  padding: "30px",
  background: "#f0fdf4", 
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  border: "2px dashed #bbf7d0", 
};

const titleStyle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#166534",
  margin: "0 0 10px 0",
};

const timerText = {
  fontSize: "64px",
  fontWeight: "800",
  color: "#166534",
  letterSpacing: "-2px",
  fontFamily: "'Inter', sans-serif",
  margin: "0 0 10px 0",
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#15803d",
  textAlign: "center",
  margin: "0 0 30px 0",
  maxWidth: "80%",
};

const tipsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
  width: "100%",
};

const tipCard = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
};

const iconCircle = (bg) => ({
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  background: bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
});

const iconStyle = (color) => ({
  fontSize: "24px",
  color: color,
});

const tipText = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#166534",
};

export default BreakScreen;
