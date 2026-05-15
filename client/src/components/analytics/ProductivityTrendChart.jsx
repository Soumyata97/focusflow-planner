import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

const ProductivityTrendChart = ({ data }) => {
  return (
    <div style={container}>
      <div style={header}>
        <div style={textArea}>
          <h3 style={title}>Productivity Trend</h3>
          <p style={sub}>Consistency over time</p>
        </div>
      </div>

      <div style={{ height: "300px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
            <XAxis 
              dataKey="week" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              hide
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: "12px", 
                border: "none", 
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                padding: "10px"
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#6c5ce7" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVal)" 
              dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#6c5ce7" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#6c5ce7" }}
            />
          </AreaChart>
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
  flex: 1,
  minWidth: "300px",
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

export default ProductivityTrendChart;
