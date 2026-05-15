import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaChevronLeft, FaChevronRight, FaCalendarDay,
  FaClock, FaPlus, FaCheck, FaTrash, FaExpand
} from "react-icons/fa";
import AddTimelineModal from "../components/AddTimelineModal";
import AddTaskModal from "../components/AddTaskModal";
import ConfirmModal from "../components/ConfirmModal";
import FullCalendarModal from "../components/FullCalendarModal";

/*  helpers  */
const pad = (n) => String(n).padStart(2, "0");

const getLocalDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const toMins = (t = "00:00") => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minsToTimeStr = (totalMins) => {
  const h = Math.floor(totalMins / 60) % 24;
  const m = Math.round(totalMins % 60);
  return `${pad(h)}:${pad(m)}`;
};

/*  constants  */
const PX_PER_MIN = 1.2;
const GRID_START = 0;   // 12 AM
const GRID_END   = 24;  // 12 AM next day
const SLOT_MINS  = 60;
const GRID_HEIGHT = (GRID_END - GRID_START) * SLOT_MINS * PX_PER_MIN;
const LEFT_GUTTER = 68;

const HOURS = Array.from({ length: GRID_END - GRID_START }, (_, i) => {
  const h = i;
  const display = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
  return { val: h, label: display };
});

const BLOCK_COLORS = ["#6c5ce7", "#00b894", "#e17055", "#0984e3", "#fdcb6e", "#a29bfe", "#e84393", "#55efc4"];

/*  MiniCalendar  */
const MiniCalendar = ({ selectedDate, onSelect, onExpand }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const todayStr = getLocalDateStr(new Date());
  const selectedStr = getLocalDateStr(selectedDate);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ padding: "12px", borderTop: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <button onClick={prevMonth} style={calNavBtn}><FaChevronLeft size={10} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }} onClick={onExpand} title="Open Full Month View">
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
            {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <FaExpand size={10} color="#94a3b8" />
        </div>
        <button onClick={nextMonth} style={calNavBtn}><FaChevronRight size={10} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center" }}>
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", padding: "2px 0" }}>{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} />;
          const dateObj = new Date(year, month, day);
          const dStr = getLocalDateStr(dateObj);
          const isToday = dStr === todayStr;
          const isSelected = dStr === selectedStr;
          return (
            <div key={dStr} onClick={() => onSelect(new Date(year, month, day))}
              style={{
                fontSize: "11px", fontWeight: isSelected || isToday ? "700" : "400",
                padding: "4px 2px", borderRadius: "4px", cursor: "pointer",
                background: isSelected ? "#6c5ce7" : isToday ? "#ede9fe" : "transparent",
                color: isSelected ? "#fff" : isToday ? "#6c5ce7" : "#334155",
              }}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/*  main component  */
const TimelinePlanner = () => {
  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);
  const [preselectedTask, setPreselectedTask] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [confirmState, setConfirmState] = useState({ isOpen: false, entryId: null });

  // Drag state
  const dragTaskRef = useRef(null);
  const gridRef = useRef(null);
  const [, setDragOver] = useState(false);
  const [dropPreview, setDropPreview] = useState(null); // { top, timeStr }

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";
  const dateStr = getLocalDateStr(date);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tlRes, taskRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/timeline?date=${dateStr}&type=${role}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      //  Safe state updates with array checks
      const timelineEntries = Array.isArray(tlRes.data) ? tlRes.data : [];
      const taskData = Array.isArray(taskRes.data) ? taskRes.data : [];

      setEntries(timelineEntries);
      setTasks(taskData.filter(t => t.status !== "completed"));
    } catch (err) {
      console.error("Fetch All Error:", err);
      setEntries([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [dateStr, role, token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const scheduledIds = new Set(entries.map(e => String(e.taskId)).filter(Boolean));
  const unscheduledTasks = tasks.filter(t => {
  
    const isScheduledToday = scheduledIds.has(String(t._id));
    if (isScheduledToday) return false;

   
    if (!t.dueDate) return true;
    const taskDueDateStr = getLocalDateStr(new Date(t.dueDate));
    return taskDueDateStr === dateStr;
  });

  /* status toggle */
  const toggleStatus = async (entry) => {
    const next = entry.status === "completed" ? "scheduled" : "completed";
    try {
      await axios.put(`http://localhost:5000/api/timeline/${entry._id}`,
        { status: next },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAll();
    } catch { toast.error("Failed to update status."); }
  };

  /* delete */
  const doDelete = async () => {
    if (!confirmState.entryId) return;
    try {
      await axios.delete(`http://localhost:5000/api/timeline/${confirmState.entryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.info("Block removed.");
      fetchAll();
    } catch { toast.error("Delete failed."); }
    setConfirmState({ isOpen: false, entryId: null });
  };

  /*  DRAG & DROP handlers  */
  const handleDragStart = (task) => {
    dragTaskRef.current = task;
  };

  const getDropTime = (e) => {
    const grid = gridRef.current;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const relY = e.clientY - rect.top + grid.scrollTop;
    const totalMins = GRID_START * 60 + relY / PX_PER_MIN;
    // snap to 15-min slots
    const snapped = Math.round(totalMins / 15) * 15;
    return Math.max(0, Math.min(snapped, (GRID_END * 60) - 60));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const startMins = getDropTime(e);
    if (startMins === null) return;
    setDragOver(true);
    setDropPreview({ top: (startMins - GRID_START * 60) * PX_PER_MIN, timeStr: minsToTimeStr(startMins) });
  };

  const handleDragLeave = () => {
    setDragOver(false);
    setDropPreview(null);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    setDropPreview(null);
    const task = dragTaskRef.current;
    if (!task) return;
    dragTaskRef.current = null;

    const startMins = getDropTime(e);
    if (startMins === null) return;
    const endMins = startMins + 60; // default 1 hour block

    const payload = {
      title: task.title,
      date: dateStr,
      startTime: minsToTimeStr(startMins),
      endTime: minsToTimeStr(endMins),
      type: role,
      color: BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)],
      taskId: task._id,
    };

    try {
      await axios.post("http://localhost:5000/api/timeline", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`"${task.title}" scheduled at ${minsToTimeStr(startMins)}`);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to schedule.";
      toast.error(msg);
    }
  };

  /* block positioning */
  const blockTop = (startTime) => (toMins(startTime) - GRID_START * 60) * PX_PER_MIN;
  const blockHeight = (dur) => Math.max(dur * PX_PER_MIN, 28);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "14px 18px", gap: "14px", background: "#f3f0ff" }}>

      {/*  MAIN GRID  */}
        <div style={{ flex: 1, background: "#fff", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* TOPBAR */}
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", flexShrink: 0, position: "relative" }}>

            {/* CENTER: Date navigator — absolutely centered */}
            <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "5px 10px" }}>
              <button style={navBtn} onClick={() => setDate(d => { const n = new Date(d); n.setDate(n.getDate()-1); return n; })}>
                <FaChevronLeft size={10} />
              </button>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155", minWidth: "130px", textAlign: "center" }}>
                <FaCalendarDay style={{ marginRight: 5, color: "#6c5ce7", verticalAlign: "middle" }} />
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <button style={navBtn} onClick={() => setDate(d => { const n = new Date(d); n.setDate(n.getDate()+1); return n; })}>
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>

          {/* SCROLLABLE TIME GRID */}
          <div
            ref={gridRef}
            style={{ flex: 1, overflowY: "auto", position: "relative" }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {loading && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.8)", zIndex: 10 }}>
                <span style={{ color: "#6c5ce7", fontWeight: "600", fontSize: "14px" }}>Loading…</span>
              </div>
            )}

            <div style={{ position: "relative", height: `${GRID_HEIGHT}px`, minHeight: "100%", paddingTop: "10px" }}>
              {/* HOUR ROWS */}
              {HOURS.map(h => (
                <div key={h.val} style={{
                  position: "absolute",
                  top: `${(h.val - GRID_START) * 60 * PX_PER_MIN}px`,
                  width: "100%",
                  borderBottom: "1px solid #f1f5f9",
                  height: `${60 * PX_PER_MIN}px`,
                  pointerEvents: "none",
                }}>
                  <span style={{
                    position: "absolute", top: 4, left: 10,
                    fontSize: "10px", fontWeight: "600", color: "#94a3b8",
                    background: "#fff", padding: "0 4px",
                  }}>
                    {h.label}
                  </span>
                </div>
              ))}

              {/* DROP PREVIEW LINE */}
              {dropPreview && (
                <div style={{
                  position: "absolute",
                  top: `${dropPreview.top}px`,
                  left: LEFT_GUTTER,
                  right: 12,
                  height: 2,
                  background: "#6c5ce7",
                  borderRadius: 2,
                  pointerEvents: "none",
                  zIndex: 20,
                }}>
                  <span style={{
                    position: "absolute", left: 0, top: -18,
                    background: "#6c5ce7", color: "#fff",
                    fontSize: "10px", fontWeight: "700",
                    padding: "2px 6px", borderRadius: "4px",
                  }}>
                    {dropPreview.timeStr}
                  </span>
                </div>
              )}

              {/* TIMELINE BLOCKS */}
              {entries.map(entry => {
                const done = entry.status === "completed";
                const color = entry.color || "#6c5ce7";
                return (
                  <div key={entry._id}
                    onClick={() => { setEditEntry(entry); setShowBlockModal(true); }}
                    style={{
                    position: "absolute",
                    top: `${blockTop(entry.startTime)}px`,
                    height: `${blockHeight(entry.duration)}px`,
                    left: LEFT_GUTTER,
                    right: 12,
                    background: done ? "#f8fafc" : `${color}1a`,
                    borderLeft: `4px solid ${done ? "#cbd5e1" : color}`,
                    borderRadius: "6px",
                    padding: "6px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    overflow: "hidden",
                    opacity: done ? 0.6 : 1,
                    zIndex: 5,
                    cursor: "pointer",
                  }}>
                    <div style={{ overflow: "hidden" }}>
                      <p style={{ margin: "0 0 3px", fontSize: "12px", fontWeight: "600", color: done ? "#94a3b8" : "#1e293b", textDecoration: done ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {entry.title}
                      </p>
                      <p style={{ margin: 0, fontSize: "10px", color: "#64748b", display: "flex", alignItems: "center", gap: 3 }}>
                        <FaClock size={8} style={{ color: "#94a3b8" }} />
                        {entry.startTime} – {entry.endTime} ({entry.duration}m)
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={(e) => { e.stopPropagation(); toggleStatus(entry); }} style={{ ...actionBtn, color: done ? "#22c55e" : "#cbd5e1" }}>
                        <FaCheck size={10} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmState({ isOpen: true, entryId: entry._id }); }} style={{ ...actionBtn, color: "#f87171" }}>
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAB */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            <button onClick={() => { setPreselectedTask(null); setEditEntry(null); setShowBlockModal(true); }} style={fab} title="Add Schedule Block">
              <FaPlus size={15} />
            </button>
          </div>
        </div>

        {/*  RIGHT SIDEBAR  */}
        <div style={{ width: "290px", background: "#fff", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Sidebar header */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Unscheduled Tasks</p>
              <p style={{ margin: "1px 0 0", fontSize: "11px", color: "#94a3b8" }}>Drag to timeline</p>
            </div>
            <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px" }}>
              {unscheduledTasks.length}
            </span>
          </div>

          {/* Task cards */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {unscheduledTasks.length === 0 ? (
              <p style={{ textAlign: "center", color: "#cbd5e1", paddingTop: "20px", fontSize: "12px" }}>All tasks scheduled!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {unscheduledTasks.map(task => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => { setPreselectedTask(task); setShowBlockModal(true); }}
                    style={sideCard}
                    title="Drag to timeline or click to schedule"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#6c5ce7", background: "#ede9fe", padding: "1px 6px", borderRadius: "4px" }}>
                        {task.subject || "General"}
                      </span>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>{task.priority}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "#334155", lineHeight: "1.4" }}>{task.title}</p>
                    <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#94a3b8" }}>Drag or click to schedule</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mini calendar */}
          <MiniCalendar selectedDate={date} onSelect={setDate} onExpand={() => setShowMonthCalendar(true)} />
        </div>
      {/* Modals */}
      <AddTimelineModal
        isOpen={showBlockModal}
        onClose={() => { setShowBlockModal(false); setPreselectedTask(null); setEditEntry(null); }}
        date={dateStr}
        refreshData={fetchAll}
        preselectedTask={preselectedTask}
        editEntry={editEntry}
        scheduledIds={scheduledIds}
      />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        message="Remove this block? The task will return to unscheduled."
        onConfirm={doDelete}
        onCancel={() => setConfirmState({ isOpen: false, entryId: null })}
      />
      <FullCalendarModal 
        isOpen={showMonthCalendar}
        onClose={() => setShowMonthCalendar(false)}
        selectedDate={date}
        onSelectDate={setDate}
        role={role}
        token={token}
      />
    </div>
  );
};

/*  styles  */
const navBtn    = { background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", padding: "2px" };
const primBtn   = { padding: "6px 13px", borderRadius: "7px", border: "none", background: "#6c5ce7", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: 5 };
const actionBtn = { background: "transparent", border: "none", cursor: "pointer", padding: "3px", borderRadius: "4px", display: "flex", alignItems: "center" };
const fab       = { width: "42px", height: "42px", borderRadius: "50%", background: "#6c5ce7", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(108,92,231,0.4)" };
const sideCard  = { border: "1px solid #f1f5f9", borderRadius: "9px", padding: "10px", cursor: "grab", background: "#fafafa", userSelect: "none" };
const calNavBtn = { background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", padding: "3px" };

export default TimelinePlanner;
