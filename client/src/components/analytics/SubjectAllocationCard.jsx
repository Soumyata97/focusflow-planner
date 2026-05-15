import React from "react";
import { FaEllipsisH } from "react-icons/fa";

const SubjectAllocationCard = ({ data, titleSuffix }) => {
  return (
    <div style={container}>
      <div style={header}>
        <h3 style={title}>{titleSuffix} Allocation</h3>
      </div>

      <div style={list}>
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} style={itemRow}>
              <div style={itemHeader}>
                <span style={itemName}>{item.name}</span>
                <span style={itemHours}>{item.hours}</span>
              </div>
              <div style={progressBg}>
                <div 
                  style={{ 
                    ...progressFill, 
                    width: `${item.percentage}%`,
                    background: item.color || "#6c5ce7" 
                  }} 
                />
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>No data available</p>
        )}
      </div>
    </div>
  );
};

/* STYLES */

const container = {
  background: "#fff",
  padding: "32px",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(108,92,231,0.06)",
  border: "1px solid #f1f1f1",
  flex: 1.5,
  minWidth: "350px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px",
};

const title = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0,
};

const list = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const itemRow = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const itemHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const itemName = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#334155",
};

const itemHours = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#64748b",
};

const progressBg = {
  width: "100%",
  height: "8px",
  background: "#f1f5f9",
  borderRadius: "4px",
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  borderRadius: "4px",
  transition: "width 0.5s ease",
};

export default SubjectAllocationCard;
