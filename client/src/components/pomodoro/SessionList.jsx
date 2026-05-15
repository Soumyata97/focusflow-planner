import React from "react";
import { FaCheckCircle, FaCoffee } from "react-icons/fa";

const SessionList = ({ sessions }) => {


  const formatTimeRange = (start, end) => {
    if (!start || !end) return "";
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    const startTime = new Date(start).toLocaleTimeString("en-US", options);
    const endTime = new Date(end).toLocaleTimeString("en-US", options);
    
    return `${startTime} - ${endTime}`;
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Session History</h3>
      </div>

      <div style={listContainer}>
        {sessions.length === 0 ? (
          <p style={emptyList}>No sessions yet today.</p>
        ) : (
          sessions.map((session) => {
            let actualDuration = session.duration;
            if (session.status === "interrupted" && session.startTime && session.endTime) {
              actualDuration = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000);
            }
            
            return (
              <div key={session._id} style={sessionCard}>
                <div style={iconContainer(session.status)}>
                  {session.status === "completed" ? (
                    <FaCheckCircle style={iconColor(session.status)} />
                  ) : (
                    <FaCoffee style={iconColor(session.status)} /> 
                  )}
                </div>
                <div style={sessionInfo}>
                  <h4 style={sessionTaskTitle(session.status)}>
                    {session.taskId?.title || "Unknown Task"}
                    {session.status === "interrupted" && " (Skipped)"}
                  </h4>
                  <p style={sessionTime}>
                    {formatTimeRange(session.startTime, session.endTime)}
                  </p>
                </div>
                <div style={sessionDuration(session.status)}>
                  {actualDuration}
                  <span>m</span>
                </div>
              </div>
            );
          })
        )}
      </div>


    </div>
  );
};

/* STYLES */
const containerStyle = {
  background: "#fff",
  borderRadius: "20px",
  padding: "25px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  border: "1px solid #f9f9f9",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  maxHeight: "600px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const titleStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#333",
  margin: 0,
};

const listContainer = {
  flex: 1,
  overflowY: "auto",
  paddingRight: "5px",
  marginBottom: "15px",
};

const emptyList = {
  color: "#999",
  fontSize: "14px",
  textAlign: "center",
  marginTop: "40px",
};

const sessionCard = {
  display: "flex",
  alignItems: "center",
  padding: "15px",
  background: "#fdfdfd",
  border: "1px solid #f1f1f1",
  borderRadius: "15px",
  marginBottom: "12px",
  transition: "all 0.2s ease",
};

const iconContainer = (status) => ({
  width: "35px",
  height: "35px",
  borderRadius: "50%",
  background: status === "completed" ? "#ece9ff" : "#fff1f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "15px",
});

const iconColor = (status) => ({
  color: status === "completed" ? "#6c5ce7" : "#ff7675",
  fontSize: "14px",
});

const sessionInfo = {
  flex: 1,
};

const sessionTaskTitle = (status) => ({
  margin: "0 0 5px 0",
  fontSize: "14px",
  color: status === "completed" ? "#333" : "#777", // fade skipped text
  fontWeight: "500",
});

const sessionTime = {
  margin: 0,
  fontSize: "12px",
  color: "#aaa",
};

const sessionDuration = (status) => ({
  fontSize: "14px",
  fontWeight: "600",
  color: status === "completed" ? "#555" : "#aaa", // fade skipped duration
});



export default SessionList;
