import React from "react";
import { FaTasks, FaClock, FaCheckCircle, FaFire } from "react-icons/fa";

const StatsCards = ({ stats }) => {
  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div style={container}>
      {/* Card 1: Today's Tasks */}
      <div style={card}>
        <div style={topRow}>
          <div style={iconBox}><FaTasks /></div>
        </div>
        <p style={title}>Today's Tasks</p>
        <h2 style={value}>{stats?.todayTasksRemaining ?? 0}</h2>
      </div>

      {/* Card 2: Focus Time */}
      <div style={card}>
        <div style={topRow}>
          <div style={iconBox}><FaClock /></div>
        </div>
        <p style={title}>Focus Time</p>
        <h2 style={value}>{formatTime(stats?.focusTimeToday ?? 0)}</h2>
      </div>

      {/* Card 3: Completed */}
      <div style={card}>
        <div style={topRow}>
          <div style={iconBox}><FaCheckCircle /></div>
        </div>
        <p style={title}>Completed</p>
        <h2 style={value}>{stats?.completedToday ?? 0}</h2>
      </div>

      {/* Card 4: Streak */}
      <div style={card}>
        <div style={topRow}>
          <div style={iconBox}><FaFire /></div>
        </div>
        <p style={title}>Current Streak</p>
        <h2 style={value}>{stats?.currentStreak ?? 0} Days</h2>
      </div>
    </div>
  );
};

/* STYLES  */

const container = {
   display: "flex",
  gap: "20px",
  marginTop: "15px",
  flexWrap: "wrap" 
};

const card = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "16px",
  minHeight: "150px",
  flex: "1 1 240px",  
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const iconBox = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#efe7ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6c5ce7",
  fontSize: "18px"
};

const title = {
  color: "#888",
  fontSize: "13px",
  marginTop: "10px"
};

const value = {
  margin: "6px 0",
  fontSize: "22px",
  fontWeight: "600",
  color: "#2d2d2d"
};

export default StatsCards;