import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StatsCards from "../components/StatsCards";
import WeeklyFocusChart from "../components/analytics/WeeklyFocusChart";
import DashboardPlannerCards from "../components/DashboardPlannerCards";
import { FaPlay, FaPlus, FaCalendar } from "react-icons/fa";

const Dashboard = () => {

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const navigate = useNavigate();

  // GET USER DATA From LocalStorage (Init)
  const user = JSON.parse(localStorage.getItem("user"));
  const firstName = user?.fullName?.split(" ")[0] || "User";
  const userRole = localStorage.getItem("role") || "student";

  // MANTRA STATE
  const [mantra, setMantra] = useState("");
  const [isEditingMantra, setIsEditingMantra] = useState(true);
  const [tempMantra, setTempMantra] = useState("");

  // CREATE TASK
  const createTask = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "New Task",
          description: "Sample task",
          dueDate: new Date()
        })
      });

      await res.json();
      fetchTasks();

    } catch (error) {
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
     
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error("Expected array for tasks, got:", data);
        setTasks([]);
      }
    } catch (error) {
      console.error(error);
      setTasks([]);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/stats/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Fetch Stats Error:", error);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/analytics/overview?days=7&type=${userRole}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.weeklyFocusActivity) setWeeklyData(data.weeklyFocusActivity);
    } catch (error) {
      console.error("Failed to fetch weekly chart data:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data && data.dailyMantra) {
        const mantraDate = data.dailyMantra.date ? new Date(data.dailyMantra.date).toDateString() : null;
        const today = new Date().toDateString();
        
        if (mantraDate === today && data.dailyMantra.text) {
          setMantra(data.dailyMantra.text);
          setIsEditingMantra(false);
          setTempMantra(data.dailyMantra.text);
        } else {
          setMantra("");
          setIsEditingMantra(true);
          setTempMantra("");
        }
      } else {
        setIsEditingMantra(true);
      }
    } catch (error) {
      console.error("Fetch User Error:", error);
    }
  };

  const saveMantra = async () => {
    if (!tempMantra.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/update-mantra", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mantra: tempMantra })
      });
      
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save mantra");
        return;
      }

      setMantra(data.dailyMantra.text);
      setIsEditingMantra(false);
      toast.success("Mantra saved!");
      
      // Update local storage user data too if needed
      const updatedUser = { ...user, dailyMantra: data.dailyMantra };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Save Mantra Error:", error);
      toast.error("Error connecting to server. Please try again.");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
    fetchWeeklyData();
    fetchUser();
  }, []);

  return (
    <div style={{ padding: "8px 30px 50px", flex: 1 }}>
      {/* HEADER */}
      <div style={{ marginBottom: "15px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Good Morning, {firstName}!</h2>
      </div>

      <div style={mantraCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "13px", color: "#6c5ce7", textTransform: "uppercase", letterSpacing: "1.2px", fontWeight: "700" }}>Today's Mantra</h4>
        </div>

        {isEditingMantra ? (
          <div style={{ display: "flex", gap: "12px" }}>
            <input 
              type="text" 
              placeholder="Enter your motivation for today..."
              value={tempMantra}
              onChange={(e) => setTempMantra(e.target.value)}
              style={mantraInputStyle}
              onKeyPress={(e) => e.key === 'Enter' && saveMantra()}
            />
            <button onClick={saveMantra} style={mantraSaveBtn}>Save Mantra</button>
          </div>
        ) : (
          <p style={mantraTextStyle}>
            "{mantra}"
          </p>
        )}
      </div>

      {/* PLANNER CARDS: Priorities, Reminders, To-Do */}
      <DashboardPlannerCards />

<StatsCards stats={stats} />

      {/* MAIN GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2.2fr 1fr",
        gap: "20px",
        marginTop: "20px"
      }}>
        {/* WEEKLY FOCUS CHART */}
        <WeeklyFocusChart data={weeklyData} />

        {/* RIGHT SIDE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* QUICK ACTIONS */}
          <div style={cardStyle}>
            <h3 style={{ marginBottom: "20px" }}>Quick Actions</h3>
            <button style={btnPrimary} onClick={() => navigate(`/${userRole}/pomodoro`)}><FaPlay /> Start Pomodoro</button>
            <div style={secondaryRow}>
              <button style={btnSecondary} onClick={() => navigate(`/${userRole}/tasks`)}>
                <FaPlus /> Tasks
              </button>
              <button style={btnSecondary} onClick={() => navigate(`/${userRole}/projects`)}>
                <FaCalendar /> {userRole === "student" ? "Subjects" : "Projects"}
              </button>
            </div>
          </div>

          {/* UP NEXT */}
          <div style={cardStyle}>
            <h3>Up Next</h3>
            {tasks.filter(t => t.status !== "completed").length === 0 && <p>No pending tasks</p>}
            {tasks.filter(t => t.status !== "completed").slice(0, 3).map(task => (
              <div key={task._id} style={taskItem}>
                <p>{task.title}</p>
                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;

/*  STYLES  */

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
};

const chartBox = {
  height: "300px",
  marginTop: "20px",
  background: "#f5f3ff",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#aaa"
};

const btnPrimary = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #6c5ce7, #8e7cfb)",
  color: "#fff",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px"
};

const secondaryRow = {
  display: "flex",
  gap: "10px",
  marginTop: "10px"
};

const btnSecondary = {
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "1.5px solid #dcd6ff",
  background: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px"
};

const taskItem = {
  background: "#f8f7fc",
  padding: "12px",
  borderRadius: "10px",
  marginTop: "10px",
  display: "flex",
  justifyContent: "space-between",
  fontSize: "13px"
};

const mantraCardStyle = {
  background: "linear-gradient(135deg, #fbfaff 0%, #f5f3ff 100%)",
  padding: "24px",
  borderRadius: "20px",
  marginBottom: "25px",
  border: "1px solid #e9e5ff",
  boxShadow: "0 10px 30px rgba(108, 92, 231, 0.04)",
  position: "relative",
  overflow: "hidden"
};

const mantraInputStyle = {
  flex: 1,
  padding: "14px 18px",
  borderRadius: "14px",
  border: "2px solid #ddd6fe",
  outline: "none",
  fontSize: "15px",
  background: "#fff",
  color: "#2d3436",
  transition: "all 0.3s ease"
};

const mantraSaveBtn = {
  padding: "0 25px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #6c5ce7, #8e7cfb)",
  color: "#fff",
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(108, 92, 231, 0.2)"
};

const mantraTextStyle = {
  fontFamily: "'Great Vibes', cursive",
  fontSize: "34px",
  fontWeight: "700",
  color: "#5f27cd",
  margin: "5px 0",
  lineHeight: "1.2",
  textAlign: "center",
  letterSpacing: "0.5px"
};