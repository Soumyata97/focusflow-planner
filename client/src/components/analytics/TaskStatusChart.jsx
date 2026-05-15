import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { FaFilter } from "react-icons/fa";

const COLORS = ["#6c5ce7", "#a29bfe", "#dfe6e9"];

const TaskStatusChart = ({ data, total }) => {
  return (
    <div style={container}>
      <div style={header}>
        <h3 style={title}>Task Status</h3>
      </div>

      <div style={content}>
        <div style={{ height: "240px", width: "100%", position: "relative" }}>
          <div style={centerText}>
            <span style={centerVal}>{total}</span>
            <span style={centerLabel}>TOTAL</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "none", 
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  padding: "10px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={legendList}>
          {data.map((entry, index) => (
            <div key={index} style={legendItem}>
              <div style={legendLeft}>
                <div style={{ ...dot, background: COLORS[index % COLORS.length] }} />
                <span style={legendName}>{entry.name}</span>
              </div>
              <span style={legendPerc}>{entry.percentage}%</span>
            </div>
          ))}
        </div>
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
  flex: 1,
  minWidth: "300px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const title = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0,
};

const content = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const centerText = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
};

const centerVal = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#1e293b",
};

const centerLabel = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#94a3b8",
  letterSpacing: "1px",
};

const legendList = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "16px",
};

const legendItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const legendLeft = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const dot = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
};

const legendName = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#334155",
};

const legendPerc = {
  fontSize: "13px",
  fontWeight: "800",
  color: "#1e293b",
};

export default TaskStatusChart;
