import React from "react";
import { FaEdit } from "react-icons/fa";
import CustomDropdown from "../CustomDropdown";

const TaskSelector = ({ tasks, selectedTaskId, onSelectTask }) => {
  return (
    <div style={containerStyle}>
      <FaEdit style={iconStyle} />
      <CustomDropdown
        value={selectedTaskId || ""}
        onChange={onSelectTask}
        options={[
          { label: "What are you working on?", value: "" },
          ...tasks.map(task => ({ label: task.title, value: task._id }))
        ]}
        placeholder="What are you working on?"
        containerStyle={{...selectStyle, padding: "0"}}
        width="100%"
        isSearchable={true}
      />
    </div>
  );
};

/* STYLES */
const containerStyle = {
  display: "flex",
  alignItems: "center",
  background: "#fdfdfd",
  border: "1px solid #eee",
  borderRadius: "12px",
  padding: "10px 15px",
  marginBottom: "50px",
  width: "80%",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
};

const iconStyle = {
  color: "#999",
  marginRight: "10px",
  fontSize: "14px",
};

const selectStyle = {
  flex: 1,
  border: "none",
  background: "transparent",
  fontSize: "16px",
  color: "#333",
  outline: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

export default TaskSelector;
