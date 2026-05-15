import React from "react";
import { FaPlay, FaPause, FaStepForward } from "react-icons/fa";

const TimerControls = ({ isActive, onStart, onPause, onSkip }) => {
  return (
    <div style={containerStyle}>
      {isActive ? (
        <button style={pauseBtn} onClick={onPause}>
          <FaPause style={iconStyle} /> Pause Time
        </button>
      ) : (
        <button style={startBtn} onClick={onStart}>
          <FaPlay style={iconStyle} /> Start Focus
        </button>
      )}

      <div style={secondaryControls}>
        <button style={iconBtn} onClick={onSkip} title="Skip Phase">
          <FaStepForward />
        </button>
      </div>
    </div>
  );
};

/* STYLES */
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  marginTop: "20px",
};

const startBtn = {
  backgroundColor: "#6c5ce7",
  color: "white",
  border: "none",
  borderRadius: "15px",
  padding: "18px 40px",
  fontSize: "18px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 20px rgba(108, 92, 231, 0.3)",
  transition: "all 0.2s ease",
  width: "250px",
  letterSpacing: "0.5px",
};

const pauseBtn = {
  ...startBtn,
  backgroundColor: "#fdcb6e", // soft yellow/orange
  boxShadow: "0 8px 20px rgba(253, 203, 110, 0.3)",
};

const iconStyle = {
  marginRight: "10px",
};

const secondaryControls = {
  display: "flex",
  gap: "20px",
  marginTop: "25px",
};

const iconBtn = {
  background: "#f8f9fa",
  border: "1px solid #eee",
  borderRadius: "50%",
  width: "45px",
  height: "45px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#a0a0a0",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

export default TimerControls;
