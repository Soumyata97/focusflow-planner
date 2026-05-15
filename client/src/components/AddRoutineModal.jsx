import React, { useState, useEffect } from "react";
import { FaTimes, FaCheck, FaTrash } from "react-icons/fa";
import * as Icons from "react-icons/fa";
import CustomDropdown from "./CustomDropdown";

const AddRoutineModal = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "06:00",
    frequency: ["Daily"],
    category: "morning",
    iconName: "FaRunning",
    color: "#6c5ce7",
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const iconList = [
    "FaRunning", 
    "FaPray", 
    "FaBook", 
    "FaBookOpen", 
    "FaUniversity", 
    "FaSchool",
    "FaGraduationCap",
    "FaLaptopCode", 
    "FaCoffee", 
    "FaUtensils", 
    "FaTint", 
    "FaBed", 
    "FaShower",
    "FaSun", 
    "FaMoon", 
    "FaMusic", 
    "FaGym", 
    "FaDumbbell",
    "FaWalking",
    "FaBiking",
    "FaShoppingCart",
    "FaTv"
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        frequency: initialData.frequency || ["Daily"],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        startTime: "06:00",
        frequency: ["Daily"],
        category: "morning",
        iconName: "FaRunning",
        color: "#6c5ce7",
      });
    }
  }, [initialData, isOpen]);

  const handleFrequencyToggle = (day) => {
    let newFreq = [...formData.frequency];
    if (day === "Daily") {
      newFreq = ["Daily"];
    } else {
      newFreq = newFreq.filter((f) => f !== "Daily");
      if (newFreq.includes(day)) {
        newFreq = newFreq.filter((f) => f !== day);
        if (newFreq.length === 0) newFreq = ["Daily"];
      } else {
        newFreq.push(day);
      }
    }
    setFormData({ ...formData, frequency: newFreq });
  };

  const determineCategory = (time) => {
    const hour = parseInt(time.split(":")[0]);
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 22) return "evening";
    return "night";
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setFormData({ 
      ...formData, 
      startTime: time,
      category: determineCategory(time)
    });
  };

  if (!isOpen) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={modalHeader}>
          <h2 style={modalTitle}>
            {initialData ? "Edit Routine" : "Add New Routine"}
          </h2>
          <button onClick={onClose} style={closeBtn}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} style={formStyle}>
          {/* Title */}
          <div style={formGroup}>
            <label style={labelStyle}>Routine Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Jog"
              style={inputStyle}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Time and Category */}
          <div style={rowStyle}>
            <div style={colStyle}>
              <label style={labelStyle}>Start Time</label>
              <input
                type="time"
                required
                style={inputStyle}
                value={formData.startTime}
                onChange={handleTimeChange}
              />
            </div>
            <div style={{...colStyle, zIndex: 10}}>
              <label style={labelStyle}>Category</label>
              <CustomDropdown 
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={[
                  { label: "Morning", value: "morning" },
                  { label: "Afternoon", value: "afternoon" },
                  { label: "Evening", value: "evening" },
                  { label: "Night", value: "night" }
                ]}
                containerStyle={{...inputStyle}}
                width="100%"
              />
            </div>
          </div>

          {/* Frequency */}
          <div style={formGroup}>
            <label style={labelStyle}>Frequency</label>
            <div style={badgeRow}>
              <button
                type="button"
                onClick={() => handleFrequencyToggle("Daily")}
                style={badgeStyle(formData.frequency.includes("Daily"))}
              >
                Daily
              </button>
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleFrequencyToggle(day)}
                  style={badgeStyle(formData.frequency.includes(day) && !formData.frequency.includes("Daily"))}
                >
                  {day[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div style={formGroup}>
            <label style={labelStyle}>Choose Icon</label>
            <div style={iconGrid}>
              {iconList.map((iconKey) => {
                const Icon = Icons[iconKey] || Icons.FaRegCircle;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setFormData({ ...formData, iconName: iconKey })}
                    style={iconSelectStyle(formData.iconName === iconKey)}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={actionRow}>
            {initialData && (
              <button
                type="button"
                onClick={() => onDelete(initialData._id)}
                style={deleteBtn}
              >
                <FaTrash size={12} /> Delete
              </button>
            )}
            <button
              type="submit"
              style={saveBtn}
            >
              <FaCheck size={12} /> {initialData ? "Save Changes" : "Create Routine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* STYLES */

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(15, 23, 42, 0.4)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

const modal = {
  background: "#fff",
  borderRadius: "28px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  overflow: "hidden",
  animation: "slideIn 0.3s ease-out",
};

const modalHeader = {
  padding: "24px 28px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #f1f5f9",
};

const modalTitle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0,
};

const closeBtn = {
  background: "none",
  border: "none",
  color: "#94a3b8",
  fontSize: "18px",
  cursor: "pointer",
  padding: "4px",
};

const formStyle = {
  padding: "24px 28px 28px 28px",
  display: "flex",
  flexDirection: "column",
  gap: "22px",
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#64748b",
  marginLeft: "4px",
  marginBottom: "4px",
  display: "block"
};

const inputStyle = {
  padding: "12px 18px",
  borderRadius: "14px",
  border: "1px solid #eef2f6",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  background: "#fcfdff",
  transition: "all 0.2s ease",
};

const selectStyle = {
  ...inputStyle,
  appearance: "none",
  backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  backgroundSize: "14px",
};

const rowStyle = {
  display: "flex",
  gap: "16px",
};

const colStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const badgeRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const badgeStyle = (active) => ({
  padding: "6px 14px",
  borderRadius: "10px",
  fontSize: "12px",
  fontWeight: "700",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
  background: active ? "#6c5ce7" : "#f1f5f9",
  color: active ? "#fff" : "#64748b",
});

const iconGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "12px",
};

const iconSelectStyle = (active) => ({
  width: "100%",
  aspectRatio: "1/1",
  borderRadius: "12px",
  border: active ? "2px solid #6c5ce7" : "1px solid #f1f5f9",
  background: active ? "#f0efff" : "#fff",
  color: active ? "#6c5ce7" : "#94a3b8",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
});

const actionRow = {
  display: "flex",
  gap: "12px",
  marginTop: "12px",
};

const saveBtn = {
  flex: 2,
  padding: "14px",
  borderRadius: "14px",
  background: "#6c5ce7",
  color: "#fff",
  border: "none",
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 8px 20px rgba(108,92,231,0.2)",
};

const deleteBtn = {
  flex: 1,
  padding: "14px",
  borderRadius: "14px",
  background: "#fff",
  color: "#ff7675",
  border: "1px solid #ff7675",
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};

export default AddRoutineModal;

