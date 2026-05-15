import React from "react";

const TimerDisplay = ({ timeLeft, totalDuration, mode }) => {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const radius = 140;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const safeTotal = totalDuration || 1;
  const fillLength = (timeLeft / safeTotal) * circumference;
  const strokeDasharray = `${fillLength} ${circumference}`;

  return (
    <div style={containerStyle}>
      <div style={svgContainer}>
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#f0f0f5"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#6c5ce7"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={strokeDasharray}
            style={{
              transition: "stroke-dasharray 1s linear",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div style={timeOverlay}>
          <div style={timeDisplay}>{formatTime(timeLeft)}</div>
          <div style={statusLabel}>
             {mode === "work" ? "READY TO FOCUS" : "TIME FOR A BREAK"}
          </div>
        </div>
      </div>
    </div>
  );
};

/* STYLES */
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "10px",
  width: "100%",
};

const svgContainer = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const timeOverlay = {
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const timeDisplay = {
  fontSize: "72px",
  fontWeight: "700",
  color: "#2d3436",
  lineHeight: "1",
  letterSpacing: "-2px",
  fontFamily: "'Inter', sans-serif",
  marginBottom: "10px",
};

const statusLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#6c5ce7",
  backgroundColor: "#ece9ff",
  padding: "6px 16px",
  borderRadius: "20px",
  letterSpacing: "1px",
};

export default TimerDisplay;
