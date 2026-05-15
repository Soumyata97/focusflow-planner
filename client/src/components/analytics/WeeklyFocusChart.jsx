import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const WeeklyFocusChart = ({ data }) => {
  const handleDownloadReport = () => {
    if (!data || data.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Day,Hours Focused\n"
      + data.map(e => `${e.day},${e.hours}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "weekly_focus_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={container}>
      <div style={header}>
        <div style={textArea}>
          <h3 style={title}>Weekly Focus Activity</h3>
          <p style={sub}>Hours focused per day</p>
        </div>
        <button style={btn} onClick={handleDownloadReport}>View Report</button>
      </div>

      <div style={{ height: "300px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              unit="h"
            />
            <Tooltip 
              cursor={{ fill: "#f8faff" }}
              contentStyle={{ 
                borderRadius: "12px", 
                border: "none", 
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                padding: "10px"
              }}
            />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.hours > 0 ? "#6c5ce7" : "#e2e8f0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
  flex: 2,
  minWidth: "400px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "32px",
};

const textArea = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const title = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0,
};

const sub = {
  fontSize: "14px",
  color: "#94a3b8",
  margin: 0,
};

const btn = {
  padding: "10px 20px",
  borderRadius: "12px",
  background: "#6c5ce7",
  color: "#fff",
  border: "none",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

export default WeeklyFocusChart;
