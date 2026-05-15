import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import CustomDropdown from "./CustomDropdown";

const AddTaskModal = ({ isOpen, onClose, refreshTasks, editTask }) => {
  const [subjectProjects, setSubjectProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    subjectProjectId: "",
    priority: "Medium",
    dueDate: "",
  });

  const userRole = localStorage.getItem("role") || "student";
  const entityName = userRole === "student" ? "Subject" : "Project";

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || "",
        subjectProjectId: editTask.subjectProjectId || "",
        priority: editTask.priority || "Medium",
        dueDate: editTask.dueDate ? editTask.dueDate.substring(0, 10) : "",
      });
    } else {
      setForm({
        title: "",
        subjectProjectId: "",
        priority: "Medium",
        dueDate: "",
      });
    }
  }, [editTask, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchSP = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/subject-projects", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          const filtered = res.data.filter(item => item.type === userRole);
          setSubjectProjects(filtered);
        } catch(err) {
          console.error("Failed to fetch subjects/projects for dropdown", err);
        }
      };
      fetchSP();
    }
  }, [isOpen, userRole]);

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error("Please enter a task title");

    const selectedProject = subjectProjects.find(p => p._id === form.subjectProjectId);
    const subjectName = selectedProject ? selectedProject.name : "General";
    
    const payload = { ...form, subject: subjectName };

    try {
      if (editTask) {
        await axios.put(`http://localhost:5000/api/tasks/${editTask._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Task updated!");
      } else {
        await axios.post("http://localhost:5000/api/tasks", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Task created!");
      }
      refreshTasks();
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      toast.error("Failed to save task.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>{editTask ? "Edit Task" : "Add Task"}</h3>
          <button style={styles.closeBtn} onClick={onClose}><FaTimes size={14}/></button>
        </div>

        <div>
          <label style={styles.label}>Task Title</label>
          <input
            name="title"
            placeholder="e.g. Complete math assignment"
            value={form.title}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={{ zIndex: 10 }}>
          <label style={styles.label}>Link to {entityName}</label>
          <CustomDropdown 
            value={form.subjectProjectId}
            onChange={(val) => setForm({ ...form, subjectProjectId: val })}
            options={[
              { label: `-- Select ${entityName} --`, value: "" },
              ...subjectProjects.map(sp => ({ label: sp.name, value: sp._id }))
            ]}
            containerStyle={{...styles.input}}
            width="100%"
          />
        </div>

        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ flex: 1, zIndex: 5 }}>
            <label style={styles.label}>Priority</label>
            <CustomDropdown 
              value={form.priority}
              onChange={(val) => setForm({ ...form, priority: val })}
              options={[
                { label: "Low", value: "Low" },
                { label: "Medium", value: "Medium" },
                { label: "High", value: "High" }
              ]}
              containerStyle={{...styles.input}}
              width="100%"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Due Date</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.submitBtn} onClick={handleSubmit}>
            {editTask ? "Update Task" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position: "fixed", 
    inset: 0, 
    background: "rgba(10, 10, 30, 0.4)", // Softer dark backdrop
    backdropFilter: "blur(4px)", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 1000 
  },
  modal: { 
    background: "#fff", 
    padding: "24px", 
    borderRadius: "20px", 
    width: "420px", 
    display: "flex", 
    flexDirection: "column", 
    gap: "18px", 
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    border: "1px solid #f1f5f9"
  },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "4px" 
  },
  title: { 
    margin: 0, 
    fontSize: "18px", 
    fontWeight: "700", 
    color: "#1e293b" 
  },
  closeBtn: { 
    background: "#f8fafc", 
    border: "none", 
    cursor: "pointer", 
    color: "#64748b", 
    padding: "8px",
    borderRadius: "10px",
    transition: "all 0.2s ease"
  },
  label: { 
    fontSize: "13px", 
    fontWeight: "600", 
    color: "#64748b", 
    marginBottom: "6px",
    display: "block"
  },
  input: { 
    padding: "12px 16px", 
    borderRadius: "12px", 
    border: "1px solid #e2e8f0", 
    fontSize: "14px", 
    width: "100%", 
    boxSizing: "border-box", 
    background: "#fcfdff",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    outline: "none"
  },
  actions: { 
    display: "flex", 
    gap: "12px", 
    justifyContent: "flex-end", 
    marginTop: "10px" 
  },
  cancelBtn: { 
    padding: "10px 20px", 
    borderRadius: "12px", 
    border: "1px solid #e2e8f0", 
    background: "#fff", 
    cursor: "pointer", 
    fontWeight: "600", 
    color: "#64748b", 
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  submitBtn: { 
    padding: "10px 24px", 
    borderRadius: "12px", 
    border: "none", 
    background: "#6c5ce7", 
    color: "#fff", 
    cursor: "pointer", 
    fontWeight: "600", 
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(108, 92, 231, 0.25)",
    transition: "all 0.2s ease"
  },
};

export default AddTaskModal;