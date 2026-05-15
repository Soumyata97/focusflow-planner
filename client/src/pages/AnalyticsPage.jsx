import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import axios from "axios";
import { 
  FaClock, 
  FaCheckCircle, 
  FaBolt, 
  FaCalendarAlt,
  FaChevronDown,
  FaDownload
} from "react-icons/fa";
import { toast } from "react-toastify";

import AnalyticsCard from "../components/analytics/AnalyticsCard";
import WeeklyFocusChart from "../components/analytics/WeeklyFocusChart";
import ProductivityTrendChart from "../components/analytics/ProductivityTrendChart";
import SubjectAllocationCard from "../components/analytics/SubjectAllocationCard";
import TaskStatusChart from "../components/analytics/TaskStatusChart";
import CustomDropdown from "../components/CustomDropdown";

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");
  const dashboardRef = useRef(null);

  
  const role = localStorage.getItem("role") || "student";
  const token = localStorage.getItem("token");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/analytics/overview?days=${days}&type=${role}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("FAILED TO FETCH ANALYTICS:", error);
      toast.error("Failed to load analytics data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
  
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleTag);
    
    return () => {
      document.head.removeChild(styleTag);
    }
  }, [days, role]);

  const dateOptions = [
    { label: "Last 7 Days", value: "7" },
    { label: "Last 30 Days", value: "30" },
    { label: "Last 90 Days", value: "90" },
    { label: "All Time", value: "all" }
  ];

  const formatFocusTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const exportPDF = async () => {
    const element = dashboardRef.current;
    if (!element) return;
    try {
      const toastId = toast.loading("Generating PDF...");
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("focusflow-analytics.pdf");
      toast.update(toastId, { render: "PDF Exported Successfully!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF");
    }
  };

  if (loading || !data) {
    return (
      <div style={loaderContainer}>
        <div style={spinner} />
        <p style={{ color: "#94a3b8", fontWeight: "600" }}>Analyzing your productivity...</p>
      </div>
    );
  }

  return (
    <div style={pageContainer} ref={dashboardRef}>
      {/* HEADER */}
      <div style={header}>
        
        <div style={filterContainer}>
          <button style={exportBtn} onClick={exportPDF}>
            <FaDownload size={14} />
            <span>Export PDF</span>
          </button>
          
          <CustomDropdown 
            value={days}
            onChange={setDays}
            options={dateOptions}
            icon={<FaCalendarAlt size={14} color="#64748b" />}
          />
        </div>
      </div>

      {/* KPI TOP ROW */}
      <div style={kpiGrid}>
        <AnalyticsCard 
          title="Total Focus Time"
          value={formatFocusTime(data.totalFocusTime.value)}
          trend={data.totalFocusTime.trend}
          subtext={`vs. previous ${days === "all" ? "period" : days + " days"}`}
          icon={<FaClock />}
          color="#6c5ce7"
        />
        <AnalyticsCard 
          title="Tasks Completed"
          value={data.tasksCompleted.value}
          trend={data.tasksCompleted.trend}
          subtext="Based on your task status"
          icon={<FaCheckCircle />}
          color="#6c5ce7"
        />
        <AnalyticsCard 
          title="Efficiency Score"
          value={`${data.efficiencyScore.value}/5`}
          trend={data.efficiencyScore.trend}
          subtext="Based on pomodoro stats"
          icon={<FaBolt />}
          color="#6c5ce7"
        />
      </div>

      {/* CHARTS MIDDLE ROW */}
      <div style={chartRow}>
        <WeeklyFocusChart data={data.weeklyFocusActivity} />
        <ProductivityTrendChart data={data.productivityTrend} />
      </div>

      {/* BOTTOM ROW */}
      <div style={chartRow}>
        <SubjectAllocationCard 
          data={data.subjectAllocation} 
          titleSuffix={role === "student" ? "Subject" : "Project"}
        />
        <TaskStatusChart 
          data={data.taskStatus} 
          total={data.totalTaskStatus} 
        />
      </div>
    </div>
  );
};

/* STYLES */

const pageContainer = {
  flex: 1,
  padding: "32px 40px",
  display: "flex",
  flexDirection: "column",
  gap: "32px",
  background: "#f7f5ff",
};

const header = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
};

const title = {
  fontSize: "26px",
  fontWeight: "900",
  color: "#1e293b",
  margin: 0,
};

const filterContainer = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const exportBtn = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 16px",
  background: "#6c5ce7",
  color: "#fff",
  borderRadius: "14px",
  border: "none",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(108,92,231,0.2)",
};

const selectStyle = {
  // Keeping this for reference, though unused now.
};

const kpiGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "24px",
};

const chartRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: "24px",
};

const loaderContainer = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  background: "#f7f5ff",
};

const spinner = {
  width: "48px",
  height: "48px",
  border: "5px solid #6c5ce7",
  borderTop: "5px solid transparent",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

export default AnalyticsPage;
