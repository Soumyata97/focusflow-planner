import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaTimes } from "react-icons/fa";
import CustomDropdown from "./CustomDropdown";

const BLOCK_COLORS = ["#6c5ce7", "#00b894", "#e17055", "#0984e3", "#fdcb6e", "#a29bfe", "#55efc4"];

const AddTimelineModal = ({ isOpen, onClose, date, refreshData, preselectedTask = null, editEntry = null, scheduledIds = new Set() }) => {
  const [form, setForm] = useState({ taskId: "", title: "", startTime: "09:00", endTime: "10:00", color: BLOCK_COLORS[0] });
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role") || "student";

  useEffect(() => {
    if (!isOpen) return;
    fetchTasks();
    if (editEntry) {
      setForm({
        taskId: editEntry.taskId || "",
        title: editEntry.title || "",
        startTime: editEntry.startTime,
        endTime: editEntry.endTime,
        color: editEntry.color || BLOCK_COLORS[0],
      });
    } else if (preselectedTask) {
      setForm(f => ({ ...f, taskId: preselectedTask._id, title: preselectedTask.title, startTime: "09:00", endTime: "10:00" }));
    } else {
      setForm({ taskId: "", title: "", startTime: "09:00", endTime: "10:00", color: BLOCK_COLORS[0] });
    }
  }, [isOpen, preselectedTask, editEntry]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data.filter(t => t.status !== "completed"));
    } catch (err) { console.error(err); }
  };

  const handleTaskSelect = (e) => {
    const id = e.target.value;
    const found = tasks.find(t => t._id === id);
    setForm(f => ({ ...f, taskId: id, title: found ? found.title : "" }));
  };

  const handleSubmit = async () => {
    const resolvedTitle = form.taskId ? (tasks.find(t => t._id === form.taskId)?.title || form.title) : form.title;
    if (!resolvedTitle.trim()) return toast.error("Please provide a title or select a task.");

    const payload = {
      title: resolvedTitle,
      date,
      startTime: form.startTime,
      endTime: form.endTime,
      type: userRole,
      color: form.color,
    };
    if (form.taskId) payload.taskId = form.taskId;

    try {
      if (editEntry) {
        await axios.put(`http://localhost:5000/api/timeline/${editEntry._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Schedule updated!");
      } else {
        await axios.post("http://localhost:5000/api/timeline", payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Block scheduled!");
      }
      refreshData();
      onClose();
      setForm({ taskId: "", title: "", startTime: "09:00", endTime: "10:00", color: BLOCK_COLORS[0] });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save schedule.";
      toast.error(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>{editEntry ? "Edit Schedule Block" : "Schedule Block"}</h3>
          <button style={styles.closeBtn} onClick={onClose}><FaTimes size={14}/></button>
        </div>

        <div style={{ zIndex: 10, position: "relative" }}>
          <label style={styles.label}>Link to Task (optional)</label>
          <CustomDropdown 
            value={form.taskId}
            onChange={(val) => {
              const tempEvent = { target: { value: val } };
              handleTaskSelect(tempEvent);
            }}
            options={[
              { label: "-- No linked task --", value: "" },
              ...tasks.filter(t => {
                const isScheduled = scheduledIds.has(String(t._id));
                const isCurrentEditTask = editEntry && String(editEntry.taskId) === String(t._id);
                return !(isScheduled && !isCurrentEditTask);
              }).map(t => ({ label: t.title, value: t._id }))
            ]}
            containerStyle={{...styles.input}}
            width="100%"
          />
        </div>

        {!form.taskId && (
          <>
            <label style={styles.label}>Block Title</label>
            <input style={styles.input} placeholder="e.g. Deep Work Session" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </>
        )}

        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Start Time</label>
            <input type="time" style={styles.input} value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>End Time</label>
            <input type="time" style={styles.input} value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </div>
        </div>

        <label style={styles.label}>Block Color</label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {BLOCK_COLORS.map(c => (
            <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
              style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: form.color === c ? "3px solid #0f172a" : "3px solid transparent" }} />
          ))}
        </div>

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.submitBtn} onClick={handleSubmit}>{editEntry ? "Update Block" : "Schedule Block"}</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position: "fixed", 
    inset: 0, 
    background: "rgba(15, 23, 42, 0.4)", 
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
    transition: "border-color 0.2s ease",
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
    fontSize: "14px" 
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
    boxShadow: "0 4px 12px rgba(108, 92, 231, 0.2)"
  },
};

export default AddTimelineModal;
