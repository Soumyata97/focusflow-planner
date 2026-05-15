import React from "react";

const CustomModeInputs = ({
  customFocus,
  setCustomFocus,
  customBreak,
  setCustomBreak,
}) => {
  return (
    <div style={containerStyle}>
      <div style={inputGroup}>
        <label style={labelStyle}>Focus (min)</label>
        <input
          type="number"
          min="1"
          max="120"
          value={customFocus}
          onChange={(e) => setCustomFocus(Number(e.target.value) || "")}
          style={inputStyle}
        />
      </div>
      <div style={inputGroup}>
        <label style={labelStyle}>Break (min)</label>
        <input
          type="number"
          min="1"
          max="60"
          value={customBreak}
          onChange={(e) => setCustomBreak(Number(e.target.value) || "")}
          style={inputStyle}
        />
      </div>
    </div>
  );
};

/* STYLES */
const containerStyle = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
  background: "#fdfdfd",
  padding: "15px 25px",
  borderRadius: "15px",
  border: "1px solid #eee",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "5px",
};

const labelStyle = {
  fontSize: "12px",
  color: "#777",
  fontWeight: "600",
  textTransform: "uppercase",
};

const inputStyle = {
  width: "60px",
  padding: "8px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  textAlign: "center",
  fontSize: "16px",
  fontWeight: "bold",
  outline: "none",
  color: "#333",
};

export default CustomModeInputs;
