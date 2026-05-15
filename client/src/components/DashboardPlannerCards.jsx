import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaRegCircle, FaCheckCircle, FaTrash, FaPlus, FaSave } from "react-icons/fa";

const DashboardPlannerCards = () => {
  const [topPriorities, setTopPriorities] = useState(["", "", ""]);
  const [reminders, setReminders] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const fetchPlannerData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.planner) {
        const lastUpdatedDate = data.planner.lastUpdated ? new Date(data.planner.lastUpdated).toDateString() : null;
        const todayDate = new Date().toDateString();

        if (lastUpdatedDate === todayDate) {
          setTopPriorities(data.planner.topPriorities && data.planner.topPriorities.length > 0 ? data.planner.topPriorities : ["", "", ""]);
          setReminders(data.planner.reminders || "");
          setTodoList(data.planner.todoList || []);
        } else {
          // Different day -> refresh data
          setTopPriorities(["", "", ""]);
          setReminders("");
          setTodoList([]);
        }
      }
    } catch (error) {
      console.error("Fetch Planner Error:", error);
    }
  };

  const savePlannerData = async (message, updatedPriorities = null, updatedReminders = null, updatedTodo = null) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      
      const payload = {
        planner: {
          topPriorities: updatedPriorities || topPriorities,
          reminders: updatedReminders !== null ? updatedReminders : reminders,
          todoList: updatedTodo || todoList
        }
      };

      const res = await fetch("http://localhost:5000/api/users/update-planner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.message || "Failed to save");
      }
      
      if (message) {
        toast.success(message);
      }
    } catch (error) {
      console.error("Save Planner Error:", error);
      toast.error(error.message || "Failed to save data.");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePriority = (index, value) => {
    const newPriorities = [...topPriorities];
    newPriorities[index] = value;
    setTopPriorities(newPriorities);
  };

  const deletePriority = (index) => {
    const newPriorities = [...topPriorities];
    newPriorities[index] = "";
    setTopPriorities(newPriorities);
    savePlannerData("Priority cleared!", newPriorities); 
  };

  const updateReminders = (value) => {
    setReminders(value);
  };

  const clearReminders = () => {
    setReminders("");
    savePlannerData("Reminders cleared!", null, ""); 
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const newId = Date.now().toString();
    const newTodoList = [...todoList, { todoId: newId, text: newTodo, completed: false }];
    setTodoList(newTodoList);
    setNewTodo("");
    savePlannerData(null, null, null, newTodoList); 
  };

  const toggleTodo = (todoId) => {
    const newTodoList = todoList.map(t => t.todoId === todoId ? { ...t, completed: !t.completed } : t);
    setTodoList(newTodoList);
    savePlannerData(null, null, null, newTodoList); 
  };

  const deleteTodo = (todoId) => {
    const newTodoList = todoList.filter(t => t.todoId !== todoId);
    setTodoList(newTodoList);
    savePlannerData(null, null, null, newTodoList); 
  };

  const handleTodoKeyPress = (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div style={gridContainer}>
      
      {/* 1. TOP 3 PRIORITIES */}
      <div style={plannerCard}>
        <div style={cardHeaderBg}>
          <h4 style={cardTitle}>TOP 3 PRIORITIES</h4>
        </div>
        <div style={prioritiesContainer}>
          {[0, 1, 2].map((idx) => (
            <div key={idx} style={priorityRow}>
              <span style={simpleNumber}>{idx + 1}.</span>
              <input
                type="text"
                value={topPriorities[idx] || ""}
                onChange={(e) => updatePriority(idx, e.target.value)}
                style={priorityInput}
                placeholder={`Priority ${idx + 1}`}
              />
              <button 
                onClick={() => deletePriority(idx)} 
                title="Clear Priority"
                style={{ ...deleteBtnStyle, opacity: topPriorities[idx] ? 1 : 0.3 }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <div style={cardFooter}>
          <button style={actionBtn} onClick={() => savePlannerData("Priorities saved!")}>
            Save
          </button>
        </div>
      </div>

      {/* 2. REMINDERS */}
      <div style={plannerCard}>
        <div style={cardHeaderBg}>
          <h4 style={cardTitle}>REMINDERS</h4>
        </div>
        <textarea
          value={reminders}
          onChange={(e) => updateReminders(e.target.value)}
          style={reminderTextarea}
          placeholder="Jot down your reminders here..."
        />
        <div style={{...cardFooter, justifyContent: "space-between"}}>
           <button style={actionBtnOutlined} onClick={clearReminders}>
            Clear
          </button>
          <button style={actionBtn} onClick={() => savePlannerData("Reminders saved!")}>
            Save
          </button>
        </div>
      </div>

      {/* 3. TO-DO LIST */}
      <div style={plannerCard}>
        <div style={cardHeaderBg}>
          <h4 style={cardTitle}>TO-DO LIST</h4>
        </div>
        
        <div style={todoScrollContainer}>
          {todoList.length === 0 && <p style={emptyText}>No items added.</p>}
          {todoList.map((todo) => (
            <div key={todo.todoId} style={todoItemStyle}>
              <div 
                style={todoCheckbox} 
                onClick={() => toggleTodo(todo.todoId)}
              >
                {todo.completed ? <FaCheckCircle color="#6c5ce7" /> : <FaRegCircle color="#dcd6ff" />}
              </div>
              <span style={{ 
                ...todoText, 
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#a0a0a0" : "#4a4a4a"
              }}>
                {todo.text}
              </span>
              <button style={deleteBtnStyle} onClick={() => deleteTodo(todo.todoId)}>
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        
        <div style={addTodoContainer}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleTodoKeyPress}
            style={addTodoInput}
            placeholder="Add new to-do..."
          />
          <button style={addTodoBtn} onClick={addTodo}>
            <FaPlus />
          </button>
        </div>
      </div>

    </div>
  );
};

/* ===== STYLES ===== */

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
  marginBottom: "30px"
};

const plannerCard = {
  background: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #f0ecff",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  height: "320px", 
  overflow: "hidden"
};

const cardHeaderBg = {
  background: "#f0ecff",
  padding: "10px 15px",
  textAlign: "center",
  borderBottom: "1px solid #e5deff",
  margin: "15px 20px 10px 20px",
  borderRadius: "8px"
};

const cardTitle = {
  margin: 0,
  fontSize: "13px",
  color: "#6c5ce7",
  fontWeight: "800",
  letterSpacing: "1px",
  textTransform: "uppercase"
};

/* Priorities */
const prioritiesContainer = {
  padding: "15px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  flex: 1
};

const priorityRow = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  paddingBottom: "4px"
};

const simpleNumber = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#6c5ce7",
  width: "20px"
};

const priorityInput = {
  flex: 1,
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: "15px",
  color: "#4a4a4a",
  fontWeight: "500",
  fontFamily: "inherit"
};

const cardFooter = {
  padding: "10px 20px",
  borderTop: "1px solid #f5f3ff",
  display: "flex",
  justifyContent: "flex-end",
  background: "#fbfaff",
  gap: "10px"
};

const actionBtn = {
  background: "linear-gradient(90deg, #6c5ce7, #8e7cfb)",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "6px 14px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  transition: "all 0.2s"
};

const actionBtnOutlined = {
  background: "transparent",
  color: "#6c5ce7",
  border: "1px solid #dcd6ff",
  borderRadius: "6px",
  padding: "6px 14px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  transition: "all 0.2s"
};

/* Reminders */
const reminderTextarea = {
  flex: 1,
  margin: "0 20px 20px 20px",
  border: "none",
  background: "transparent",
  resize: "none",
  outline: "none",
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#4a4a4a",
  fontFamily: "inherit"
};

/* To-Do List */
const emptyText = {
  textAlign: "center",
  color: "#a0a0a0",
  fontSize: "14px",
  marginTop: "10px",
  fontStyle: "italic"
};

const todoScrollContainer = {
  flex: 1,
  overflowY: "auto",
  padding: "10px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const todoItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  position: "relative"
};

const todoCheckbox = {
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const todoText = {
  flex: 1,
  fontSize: "15px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontFamily: "inherit"
};

const deleteBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#a0a0a0",
  cursor: "pointer",
  fontSize: "14px",
  padding: 0
};

const addTodoContainer = {
  display: "flex",
  margin: "10px 20px 20px 20px",
  borderTop: "1px solid #f5f3ff",
  paddingTop: "15px",
  gap: "10px"
};

const addTodoInput = {
  flex: 1,
  border: "1px solid #dcd6ff",
  background: "#fbfaff",
  padding: "8px 12px",
  borderRadius: "6px",
  outline: "none",
  fontSize: "14px",
  fontFamily: "inherit",
  color: "#4a4a4a"
};

const addTodoBtn = {
  background: "#6c5ce7",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "0 12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

export default DashboardPlannerCards;
