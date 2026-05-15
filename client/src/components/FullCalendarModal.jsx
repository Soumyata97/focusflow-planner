import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

const pad = (n) => String(n).padStart(2, "0");
const getLocalDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const FullCalendarModal = ({ isOpen, onClose, selectedDate, onSelectDate, role, token }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate || new Date()));
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setViewDate(new Date(selectedDate || new Date()));
      fetchAllEntries();
    }
  }, [isOpen, selectedDate]);

  const fetchAllEntries = async () => {
    setLoading(true);
    try {
      // Omitting the date query parameter fetches all timeline blocks
      const res = await axios.get(`http://localhost:5000/api/timeline?type=${role}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = getLocalDateStr(new Date());

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Group entries by date
  const groupedEntries = allEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  return (
    <div style={overlay}>
      <div style={modalContainer}>
        {/* Header */}
        <div style={header}>
          <div style={{ width: "32px", height: "32px" }}></div> {/* Spacer for perfect centering */}
          
          <div style={navGroup}>
            <button style={navBtn} onClick={prevMonth}><FaChevronLeft size={12} /></button>
            <div 
              style={{ padding: "0 20px", fontSize: "15px", fontWeight: "700", color: "#1e293b", cursor: "pointer", display: "flex", alignItems: "center" }}
              onClick={goToday}
              title="Return to Today"
            >
              {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <button style={navBtn} onClick={nextMonth}><FaChevronRight size={12} /></button>
          </div>

          <button style={closeBtn} onClick={onClose}><FaTimes size={16} /></button>
        </div>

        {/* Calendar Body */}
        <div style={calendarBody}>
          <div style={daysRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
              <div key={i} style={dayLabel}>{d}</div>
            ))}
          </div>

          {loading ? (
            <div style={loadingContainer}>
               <span style={{ color: "#6c5ce7", fontWeight: "600" }}>Loading calendar...</span>
            </div>
          ) : (
            <div style={grid}>
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} style={emptyCell} />;
                
                const dObj = new Date(year, month, day);
                const dStr = getLocalDateStr(dObj);
                const isToday = dStr === todayStr;
                const cellEntries = groupedEntries[dStr] || [];

                return (
                  <div 
                    key={dStr} 
                    style={isToday ? { ...cell, ...todayCell } : cell}
                    onClick={() => {
                      onSelectDate(dObj);
                      onClose();
                    }}
                  >
                    <div style={cellHeader}>
                      <span style={isToday ? todayNumber : number}>{day}</span>
                    </div>
                    <div style={cellContent}>
                      {cellEntries.map(entry => {
                         const color = entry.color || "#6c5ce7";
                         const done = entry.status === "completed";
                         return (
                           <div key={entry._id} style={{ ...pill, background: done ? "#f8fafc" : `${color}1a`, borderLeft: `3px solid ${done ? "#cbd5e1" : color}`, opacity: done ? 0.6 : 1 }}>
                             <span style={{...pillText, textDecoration: done ? "line-through" : "none" }}>{entry.title}</span>
                           </div>
                         );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --- STYLES --- */
const overlay = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(15, 23, 42, 0.4)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px"
};

const modalContainer = {
  background: "#fff",
  width: "100%",
  maxWidth: "1000px",
  height: "85vh",
  borderRadius: "16px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden"
};

const header = {
  padding: "20px 24px",
  borderBottom: "1px solid #f1f5f9",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const titleText = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "700",
  color: "#1e293b"
};

const navGroup = {
  display: "flex",
  alignItems: "center",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  overflow: "hidden"
};

const navBtn = {
  background: "transparent",
  border: "none",
  color: "#64748b",
  padding: "8px 12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s"
};

const closeBtn = {
  background: "#f1f5f9",
  border: "none",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  cursor: "pointer"
};

const calendarBody = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  background: "#f8fafc",
  padding: "16px",
  overflow: "hidden"
};

const daysRow = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "8px",
  marginBottom: "8px"
};

const dayLabel = {
  textAlign: "center",
  fontSize: "13px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase"
};

const loadingContainer = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const grid = {
  flex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gridAutoRows: "1fr",
  gap: "8px",
  overflowY: "auto",
  paddingRight: "4px"
};

const emptyCell = {
  background: "transparent",
  borderRadius: "8px"
};

const cell = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const todayCell = {
  border: "2px solid #6c5ce7",
  boxShadow: "0 0 0 2px rgba(108, 92, 231, 0.1)"
};

const cellHeader = {
  padding: "6px 10px",
  display: "flex",
  justifyContent: "flex-end"
};

const number = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#475569"
};

const todayNumber = {
  background: "#6c5ce7",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "700",
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const cellContent = {
  flex: 1,
  padding: "0 6px 6px 6px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  overflowY: "auto"
};

const pill = {
  padding: "3px 6px",
  borderRadius: "4px",
  fontSize: "11px",
  fontWeight: "600",
  color: "#334155",
  display: "flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const pillText = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

export default FullCalendarModal;
