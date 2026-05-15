import React from "react";

const SUPPORTED_MODES = [
  { id: "beginner", label: "Beginner" },
  { id: "deep", label: "Deep Work" },
];

const ModeSelector = ({ focusMode, onModeChange }) => {
  return (
    <div style={containerStyle}>
      {SUPPORTED_MODES.map((mode) => {
        const isActive = focusMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            style={{
              ...btnStyle,
              background: isActive ? "#6c5ce7" : "transparent",
              color: isActive ? "#fff" : "#666",
              fontWeight: isActive ? "600" : "500",
            }}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};

/* STYLES */
const containerStyle = {
  display: "inline-flex",
  background: "#f0f0f5",
  borderRadius: "30px",
  padding: "5px",
  marginBottom: "20px",
};

const btnStyle = {
  border: "none",
  padding: "10px 20px",
  borderRadius: "25px",
  cursor: "pointer",
  fontSize: "14px",
  transition: "all 0.2s ease",
  outline: "none",
};

export default ModeSelector;
