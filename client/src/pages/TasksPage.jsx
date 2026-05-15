import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaClipboardList,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaPlus,
} from "react-icons/fa";

import AddTaskModal from "../components/AddTaskModal";
import TaskTable from "../components/TaskTable";
import CustomDropdown from "../components/CustomDropdown";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 12;

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [editTask, setEditTask] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
const isStudent = role === "student";

  //  FETCH TASKS 
  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Safe state update with array check
      if (Array.isArray(res.data)) {
        setTasks(res.data);
      } else if (res.data && Array.isArray(res.data.tasks)) {
        setTasks(res.data.tasks);
      } else {
        console.error("Expected array for tasks, got:", res.data);
        setTasks([]);
      }
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
      setTasks([]);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const today = new Date().toDateString();
  const tasksDueToday = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate).toDateString() === today
  );

  const dueToday = tasksDueToday.length;
  const pendingToday = tasksDueToday.filter((t) => t.status === "pending").length;
  const completedToday = tasksDueToday.filter((t) => t.status === "completed").length;

  const completionRate =
    dueToday === 0 ? 0 : Math.round((completedToday / dueToday) * 100);

  //  FILTER LOGIC + SORT
  const filteredTasks = tasks
  .filter((t) => {
    return (
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "All" || t.status === statusFilter) &&
      (priorityFilter === "All" ||
        (t.priority && t.priority === priorityFilter))
    );
  })
  .sort((a, b) => {
    // pending first
    if (a.status !== b.status) {
      return a.status === "pending" ? -1 : 1;
    }

    // then by due date
    return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
  });

  //pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;

  const currentTasks = filteredTasks.slice(
    indexOfFirstTask,
    indexOfLastTask
  );

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  return (
    <div style={container}>

      {/* STATS */}
      <div style={statsRow}>
        <div style={card}>
          <div style={cardTop}>
            <span>Pending Tasks</span>
            <FaClipboardList style={{ color: "#6c5ce7" }} />
          </div>
          <h2>{pendingToday}</h2>
        </div>

        <div style={card}>
          <div style={cardTop}>
            <span>Due Today</span>
            <FaExclamationTriangle style={{ color: "#f39c12" }} />
          </div>
          <h2>{dueToday}</h2>
        </div>

        <div style={card}>
          <div style={cardTop}>
            <span>Completed</span>
            <FaCheckCircle style={{ color: "#2ecc71" }} />
          </div>
          <h2>{completionRate}%</h2>
        </div>
      </div>

      {/* CONTROLS  */}
      <div style={controlsRow}>
        {/* SEARCH */}
        <div style={searchWrapper}>
          <span style={searchIcon}> <FaSearch></FaSearch></span>
          <input
            placeholder={isStudent ? "Search study tasks..." : "Search work tasks..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </div>

        <div style={rightControls}>
          {/* STATUS */}
          <CustomDropdown 
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Status: All", value: "All" },
              { label: "Pending", value: "pending" },
              { label: "Completed", value: "completed" }
            ]}
          />

          {/* PRIORITY */}
          <CustomDropdown 
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { label: "Priority: All", value: "All" },
              { label: "High", value: "High" },
              { label: "Medium", value: "Medium" },
              { label: "Low", value: "Low" }
            ]}
          />

          <button 
            style={addBtn}
            onClick={() => {
              setEditTask(null);   
              setOpenModal(true);
            }}
          > 
          <FaPlus size={12} />
            Add Task
          </button>
        </div>
      </div>

      {/*  TABLE  */}
      <TaskTable
        tasks={currentTasks}
        refreshTasks={fetchTasks}
        onEdit={(task) => {
          setEditTask(task);
          setOpenModal(true);
        }}
      />

      {/*  PAGINATION */}
      <div style={pagination}>
        <span>
          Showing {indexOfFirstTask + 1}–
          {Math.min(indexOfLastTask, filteredTasks.length)} of{" "}
          {filteredTasks.length} tasks
        </span>

        <div>
          <button
            style={pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          <button
            style={pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/*  MODAL */}
      <AddTaskModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditTask(null);
        }}
        refreshTasks={fetchTasks}
        editTask={editTask}
      />
    </div>
  );
};

export default TasksPage;

/* STYLES  */

const container = {
  padding: "30px",
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
};

const title = {
  marginBottom: "20px",
  fontSize: "22px",
  fontWeight: "600",
};

const statsRow = {
  display: "flex",
  gap: "20px",
  marginBottom: "25px",
};

const card = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "20px",
  flex: 1,
  boxShadow: "0 12px 30px rgba(108,92,231,0.08)",
  border: "1px solid #f1f1f1",
};

const cardTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "13px",
  color: "#999",
};

const controlsRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "10px",
};

const rightControls = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const searchWrapper = {
  position: "relative",
};

const searchIcon = {
  position: "absolute",
  left: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#aaa",
};

const searchInput = {
  padding: "10px 16px 10px 40px",
  width: "250px",
  borderRadius: "25px",
  border: "1px solid #f1f5f9",
  background: "#fff",
  fontSize: "13px",
  outline: "none",
  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
};

const dropdown = {
  padding: "8px 32px 8px 16px",
  borderRadius: "25px",
  border: "1px solid #f1f5f9",
  background: "#fff",
  fontSize: "13px",
  fontWeight: "500",
  color: "#64748b",
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  backgroundSize: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
  transition: "all 0.2s ease",
};

const addBtn = {
  background: "#6c5ce7",
  color: "#fff",
  border: "none",
  padding: "10px 22px",
  borderRadius: "25px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  boxShadow: "0 4px 12px rgba(108,92,231,0.25)",
  transition: "all 0.2s ease",
};

const pagination = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "20px",
  fontSize: "13px",
  color: "#94a3b8",
};

const pageBtn = {
  padding: "6px 14px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
  background: "#fff",
  cursor: "pointer",
  marginLeft: "6px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#64748b",
};