import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaBell, FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";
import RoutineStatsCards from "../components/RoutineStatsCards";
import RoutineSection from "../components/RoutineSection";
import AddRoutineModal from "../components/AddRoutineModal";
import ConfirmModal from "../components/ConfirmModal";

const RoutinesPage = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  
  // Custom Confirm Modal State
  const [confirmState, setConfirmState] = useState({ isOpen: false, message: "", onConfirm: null });

  const confirmAction = (message, onConfirm) => {
    setConfirmState({ isOpen: true, message, onConfirm });
  };

  // Get role and token from localStorage
  const role = localStorage.getItem("role") || "student";
  const token = localStorage.getItem("token");

  const fetchRoutines = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/routines?type=${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutines(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching routines:", error);
      toast.error("Failed to load routines");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [role]);

  const handleSaveRoutine = async (formData) => {
    try {
      if (selectedRoutine) {
        await axios.put(`http://localhost:5000/api/routines/${selectedRoutine._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Routine updated!");
      } else {
        await axios.post("http://localhost:5000/api/routines", { ...formData, type: role }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Routine created!");
      }
      setIsModalOpen(false);
      fetchRoutines();
    } catch (error) {
      console.error("Error saving routine:", error);
      toast.error("Error saving routine");
    }
  };

  const handleDeleteRoutine = (id) => {
    confirmAction("Are you sure you want to delete this routine?", async () => {
      try {
        await axios.delete(`http://localhost:5000/api/routines/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Routine deleted");
        setIsModalOpen(false);
        fetchRoutines();
      } catch (error) {
        toast.error("Error deleting routine");
      }
    });
  };

  const handleComplete = async (id) => {
    try {
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const res = await axios.patch(`http://localhost:5000/api/routines/${id}/complete`, { date: localDate }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.completedDays.includes(localDate)) {
        toast.success("Routine completed!");
      } else {
        toast.info("Routine marked as incomplete");
      }
      fetchRoutines();
    } catch (error) {
      toast.error("Error updating completion status");
    }
  };

  // KPI Calculations
  const now = new Date();
  const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const totalRoutines = routines.length;
  const totalCompletedToday = routines.filter(r => r.completedDays?.includes(localDateStr)).length;
  const streak = totalRoutines > 0 ? Math.max(...routines.map(r => r.streakCount || 0)) : 0;

  // Grouping
  const groupedRoutines = {
    morning: routines.filter(r => r.category === "morning"),
    afternoon: routines.filter(r => r.category === "afternoon"),
    evening: routines.filter(r => r.category === "evening"),
    night: routines.filter(r => r.category === "night"),
  };

  if (loading) {
    return (
      <div style={loadingCenter}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      {/* Top Header - Only keeping the New Routine button as others are in Navbar */}
      <div style={header}>
        <div style={{ flex: 1 }} />
        <button 
          onClick={() => { setSelectedRoutine(null); setIsModalOpen(true); }}
          style={newBtn}
        >
          <FaPlus size={12} /> New Routine
        </button>
      </div>

      {/* KPI Cards */}
      <RoutineStatsCards 
        streak={streak} 
        totalActive={totalCompletedToday} 
        totalRoutines={totalRoutines} 
      />

      {/* Routine Sections */}
      <div style={sectionsWrapper}>
        <RoutineSection 
          title="Morning" 
          timeRange="06:00 - 12:00" 
          routines={groupedRoutines.morning}
          onToggleActive={handleComplete}
          onComplete={handleComplete}
          onEdit={(r) => { setSelectedRoutine(r); setIsModalOpen(true); }}
        />
        <RoutineSection 
          title="Afternoon" 
          timeRange="12:00 - 17:00" 
          routines={groupedRoutines.afternoon}
          onToggleActive={handleComplete}
          onComplete={handleComplete}
          onEdit={(r) => { setSelectedRoutine(r); setIsModalOpen(true); }}
        />
        <RoutineSection 
          title="Evening" 
          timeRange="17:00 - 22:00" 
          routines={groupedRoutines.evening}
          onToggleActive={handleComplete}
          onComplete={handleComplete}
          onEdit={(r) => { setSelectedRoutine(r); setIsModalOpen(true); }}
        />
        <RoutineSection 
          title="Night" 
          timeRange="22:00 - 06:00" 
          routines={groupedRoutines.night}
          onToggleActive={handleComplete}
          onComplete={handleComplete}
          onEdit={(r) => { setSelectedRoutine(r); setIsModalOpen(true); }}
        />

        {routines.length === 0 && (
          <div style={emptyState}>
            <div style={emptyIcon}>
              <FaPlus style={{ fontSize: "24px", color: "#6c5ce7" }} />
            </div>
            <h3 style={emptyTitle}>No routines yet</h3>
            <p style={emptySub}>Start your journey by creating your first daily routine!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              style={emptyBtn}
            >
              Create Routine +
            </button>
          </div>
        )}
      </div>

      <AddRoutineModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoutine}
        onDelete={handleDeleteRoutine}
        initialData={selectedRoutine}
      />

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
      />
    </div>
  );
};

/* STYLES */

const pageContainer = {
  flex: 1,
  background: "#f7f5ff",
  padding: "32px 40px",
  boxSizing: "border-box",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px",
};

const title = {
  fontSize: "24px",
  fontWeight: "900",
  color: "#1e293b",
  margin: 0,
};

const headerRight = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
};

const newBtn = {
  background: "#6c5ce7",
  color: "#fff",
  padding: "10px 24px",
  borderRadius: "12px",
  border: "none",
  fontWeight: "700",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(108,92,231,0.25)",
  transition: "all 0.2s ease",
};

const divider = {
  width: "1px",
  height: "32px",
  background: "#e2e8f0",
};

const iconActionGroup = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
};

const iconBtn = {
  background: "none",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
  position: "relative",
  padding: "4px",
};

const notificationBadge = {
  position: "absolute",
  top: "0",
  right: "0",
  width: "8px",
  height: "8px",
  background: "#ff7675",
  borderRadius: "50%",
  border: "2px solid #f7f5ff",
};

const profileGroup = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
};

const avatar = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "#fff",
  border: "1px solid #e2e8f0",
  overflow: "hidden",
};

const sectionsWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const loadingCenter = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f7f5ff",
};

const emptyState = {
  background: "#fff",
  borderRadius: "24px",
  padding: "60px 40px",
  textAlign: "center",
  border: "2px dashed #e2e8f0",
  marginTop: "20px",
};

const emptyIcon = {
  width: "64px",
  height: "64px",
  background: "#f0efff",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
};

const emptyTitle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#334155",
  margin: "0 0 8px",
};

const emptySub = {
  fontSize: "14px",
  color: "#94a3b8",
  margin: "0 0 24px",
};

const emptyBtn = {
  color: "#6c5ce7",
  fontWeight: "700",
  fontSize: "14px",
  background: "none",
  border: "none",
  cursor: "pointer",
};

export default RoutinesPage;

