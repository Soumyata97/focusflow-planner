import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { FaExclamationTriangle, FaCheck, FaCheckCircle, FaEllipsisV } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";

const TaskTable = ({ tasks = [], refreshTasks, onEdit }) => {
  const [openMenuId, setOpenMenuId] = React.useState(null); //dropdown component for update delete
  const [confirmState, setConfirmState] = useState({ isOpen: false, taskId: null });
  const token = localStorage.getItem("token");
  

  const toggleStatus = async (task) => {
    await axios.put(
      `http://localhost:5000/api/tasks/${task._id}`,
      {
        status: task.status === "completed" ? "pending" : "completed",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    refreshTasks();
  };

  const executeDelete = async () => {
    if (!confirmState.taskId) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${confirmState.taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Task is deleted!!!");   
      refreshTasks();                   
    } catch (err) {
      console.error(err);
      toast.error("Delete is failed!!!");    
    }
  };

  const priorityColor = {
    High: "#ff6b6b",
    Medium: "#f39c12",
    Low: "#95a5a6",
  };

  const subjectColors = {
    Math: "#a29bfe",
    History: "#fab1a0",
    Physics: "#74b9ff",
    Lit: "#55efc4",
    General: "#dfe6e9",
  };

  return (
    <div style={container}>
      <table style={table}>
        <thead>
          <tr style={headerRow}>
            <th></th>
            <th>Task</th>
            <th>Subject</th>
            <th>Deadline</th>
            <th>Priority</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan="7" style={emptyState}>
                No tasks found
              </td>
            </tr>
          ) : (
            tasks.map((task) => {
              const subject = task.subject || "General";

              const isOverdue =
                task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== "completed";

                const isToday =
                  task.dueDate &&
                  new Date(task.dueDate).toDateString() ===
                    new Date().toDateString();

              return (
                <tr
                  key={task._id}
                  style={{
                    ...row,
                    opacity: task.status === "completed" ? 0.5 : 1,
                    background:
                      isOverdue
                        ? "#fff5f5"
                        : isToday
                        ? "#f3f0ff"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isOverdue && !isToday) {
                      e.currentTarget.style.background = "#fafafa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isOverdue) {
                      e.currentTarget.style.background = "#fff5f5";
                    } else if (isToday) {
                      e.currentTarget.style.background = "#f3f0ff";
                    } else {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {/* Checkbox */}
                  <td>
                    <div
                      onClick={() => toggleStatus(task)}
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: "2px solid #6c5ce7",
                        background:
                          task.status === "completed" ? "#6c5ce7" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      {task.status === "completed" && (
                        <FaCheck size={10} color="#fff" />
                      )}
                    </div>
                  </td>

                  {/* Task - line through after completion of task */}
                  <td
                    style={{
                      ...taskTitle,
                      textDecoration:
                        task.status === "completed" ? "line-through" : "none",
                      color: task.status === "completed" ? "#aaa" : "#333",
                    }}
                  >
                    {task.title}
                  </td>

                  {/* Subject */}
                  <td>
                    <span
                      style={{
                        ...subjectBadge,
                        background: subjectColors[subject] || "#dfe6e9",
                      }}
                    >
                      {subject}
                    </span>
                  </td>

                  {/* Deadline with warniing if overdue completion of task */}
                  <td
                    style={{
                      ...dateText,
                      color: isOverdue ? "#e74c3c" : "#888",
                      fontWeight: isOverdue ? "600" : "normal",
                    }}
                  >
                    {isOverdue && (
                      <FaExclamationTriangle
                        style={{ color: "#e74c3c", marginRight: "5px" }}
                      />
                    )}

                    {isToday && !isOverdue && (
                      <span style={{ color: "#6c5ce7", marginRight: "5px" }}>
                        Today
                      </span>
                    )}

                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Priority */}
                  <td>
                    <span
                      style={{
                        ...priorityBadge,
                        background: priorityColor[task.priority],
                      }}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td
                    onClick={() => toggleStatus(task)}
                    style={{ cursor: "pointer" }}
                  >
                    {task.status === "completed" ? (
                      <span style={{ color: "#2ecc71", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FaCheckCircle size={14} /> Done
                      </span>
                    ) : (
                      <span style={{ color: "#999", fontSize: "13px" }}>
                        ● Pending
                      </span>
                    )}
                  </td>

                  {/* openmenu update delete */}
                  <td>
                    <div style={{ position: "relative" }}>
                      <button
                        style={deleteBtn}
                        onClick={() =>
                          setOpenMenuId(openMenuId === task._id ? null : task._id)
                        }
                      >
                        <FaEllipsisV />
                      </button>

                      {openMenuId === task._id && (
                        <div style={dropdownMenu}>
                          <div
                            style={menuItem}
                            onClick={() => {
                              onEdit(task);
                              setOpenMenuId(null);
                            }}
                          >
                             Edit
                          </div>

                          <div
                            style={menuItem}
                            onClick={() => {
                              setConfirmState({ isOpen: true, taskId: task._id });
                              setOpenMenuId(null);
                            }}
                          >
                             Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        message="Are you sure you want to delete this task?"
        onConfirm={executeDelete}
        onCancel={() => setConfirmState({ isOpen: false, taskId: null })}
      />
    </div>
  );
};

export default TaskTable;

/*  STYLES  */

const container = {
  background: "#fff",
  borderRadius: "22px",
  padding: "20px",
  marginTop: "10px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  overflowX: "auto",
};

const table = {
  width: "100%",
  minWidth: "700px",
};

const headerRow = {
  textAlign: "left",
  color: "#bbb",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const row = {
  borderTop: "1px solid #f5f5f5",
  height: "70px",
  transition: "0.2s",
};

const taskTitle = {
  fontWeight: "500",
};

const subjectBadge = {
  padding: "5px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "500",
  color: "#555",
};

const dateText = {
  color: "#888",
  fontSize: "13px",
};

const priorityBadge = {
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#fff",
  fontWeight: "500",
};

const deleteBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
};

const emptyState = {
  textAlign: "center",
  padding: "20px",
  color: "#888",
};

const dropdownMenu = {
  position: "absolute",
  right: 0,
  top: "25px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  overflow: "hidden",
  zIndex: 10,
};

const menuItem = {
  padding: "10px 15px",
  cursor: "pointer",
  fontSize: "14px",
  borderBottom: "1px solid #f1f1f1",
};