import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaBullhorn, FaBook, FaClock, FaCheck, FaRedo, FaCalendarAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// Derive a readable page title from the current route
const getTitleFromPath = (pathname) => {
  if (pathname.includes("dashboard")) return "Dashboard";
  if (pathname.includes("timeline")) return "Timeline Planner";
  if (pathname.includes("tasks")) return "Tasks";
  if (pathname.includes("routines")) return "Routines";
  if (pathname.includes("pomodoro")) return "Pomodoro";
  if (pathname.includes("projects")) return "Projects & Subjects";
  if (pathname.includes("analytics")) return "Analytics";
  if (pathname.includes("settings")) return "Settings";
  return "FocusFlow";
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const title = getTitleFromPath(location.pathname);
  const lastNotifIdRef = useRef(null);

  const fetchNotifications = async (checkForNew = false) => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      const newNotifs = res.data;
      
      // Always check for new unread notifications when asked
      if (checkForNew && newNotifs.length > 0) {
        const latest = newNotifs[0];
        // It's a brand-new notification if we haven't seen it before
        if (lastNotifIdRef.current && latest._id !== lastNotifIdRef.current && !latest.isRead) {
          triggerDesktopAlert(latest);
        }
      }
      
      if (newNotifs.length > 0) {
        lastNotifIdRef.current = newNotifs[0]._id;
      }
      
      setNotifications(newNotifs);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const triggerDesktopAlert = (notif) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notif.title || "FocusFlow Alert", {
        body: notif.message,
        icon: "/logo192.png" 
      });
    }
  };

  useEffect(() => {
    // Request notification permissions on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetchNotifications(false);

    // Poll every 30 seconds to catch routine/timeline alerts quickly
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    const handleProfileUpdate = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    };

    window.addEventListener("profileUpdate", handleProfileUpdate);
    // When other parts of the app fire notificationsUpdate, check for new alerts
    const handleNotifUpdate = () => fetchNotifications(true);
    window.addEventListener("notificationsUpdate", handleNotifUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("profileUpdate", handleProfileUpdate);
      window.removeEventListener("notificationsUpdate", handleNotifUpdate);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read", err);
    }
  };

  const getNotifIcon = (type) => {
    switch(type) {
      case "announcement": return <FaBullhorn style={{ color: "#6c5ce7" }} />;
      case "resource": return <FaBook style={{ color: "#00b894" }} />;
      case "focus": return <FaClock style={{ color: "#0984e3" }} />;
      case "task": return <FaCheck style={{ color: "#27ae60" }} />;
      case "deadline": return <FaBell style={{ color: "#e74c3c" }} />;
      case "planner": return <FaCalendarAlt style={{ color: "#6c5ce7" }} />;
      case "routine": return <FaRedo style={{ color: "#6c5ce7" }} />;
      default: return <FaBell style={{ color: "#636e72" }} />;
    }
  };

  const formatNotifDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div style={navbar}>
      {/* LEFT: page title */}
      <div>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>{title}</h2>
      </div>

      {/* RIGHT: bell + profile */}
      <div style={rightSection}>
        <div style={{ position: "relative" }}>
          <div style={bell} onClick={() => setShowNotifications(!showNotifications)}>
            <FaBell size={15} />
            {unreadCount > 0 && <span style={dot} />}
          </div>

          {/*  NOTIFICATIONS DROPDOWN  */}
          {showNotifications && (
            <div style={dropdownContainer}>
              <div style={dropdownHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "700", fontSize: "16px" }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={unreadBadge}>{unreadCount}</span>
                  )}
                </div>
                <button style={markAllBtn} onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}>
                  Mark all as read
                </button>
              </div>

              <div style={dropdownList}>
                {notifications.length === 0 ? (
                  <div style={emptyState}>No notifications yet today.</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      style={n.isRead ? notifItem : unreadNotifItem}
                      onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                    >
                      <div style={notifIconWrap}>{getNotifIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={notifTitle}>{n.message}</p>
                        <p style={notifTime}>{formatNotifDate(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <div style={unreadDot} />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={profile} onClick={() => navigate(`/${role}/settings`)}>
          <img 
            src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}`.replace(/([^:]\/)\/+/g, "$1") : "https://i.pravatar.cc/40"} 
            alt="avatar" 
            style={avatar} 
            onError={(e) => { e.target.src = "https://i.pravatar.cc/40"; }}
          />
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
              {user?.fullName || "User"}
            </p>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {role === "student" ? "Student" : "Professional"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const navbar = {
  height: "60px",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 24px",
  borderBottom: "1px solid #f1f5f9",
  flexShrink: 0,
};

const rightSection = { display: "flex", alignItems: "center", gap: "16px" };

const bell = {
  position: "relative",
  background: "#f3f0ff",
  padding: "9px",
  borderRadius: "9px",
  cursor: "pointer",
  color: "#6c5ce7",
  display: "flex",
  alignItems: "center",
};

const dot = {
  position: "absolute",
  top: 6,
  right: 6,
  width: 7,
  height: 7,
  background: "#ef4444",
  borderRadius: "50%",
};

const profile = { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" };

const avatar = { width: 36, height: 36, borderRadius: "50%" };


export default Navbar;

/*  NOTIFICATION DROPDOWN STYLES  */

const dropdownContainer = {
  position: "absolute",
  top: "50px",
  right: "0",
  width: "380px",
  background: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
  zIndex: 5000,
  border: "1px solid #f1f5f9",
  overflow: "hidden",
};

const dropdownHeader = {
  padding: "20px",
  borderBottom: "1px solid #f1f5f9",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const unreadBadge = {
  background: "#f3f0ff",
  color: "#6c5ce7",
  fontSize: "11px",
  fontWeight: "700",
  padding: "2px 8px",
  borderRadius: "12px",
  border: "1px solid #e0d4ff"
};

const markAllBtn = {
  background: "none",
  border: "none",
  color: "#6c5ce7",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  padding: "0"
};

const dropdownList = {
  maxHeight: "450px",
  overflowY: "auto",
};

const emptyState = {
  padding: "40px 20px",
  textAlign: "center",
  color: "#94a3b8",
  fontSize: "14px"
};

const notifItem = {
  display: "flex",
  gap: "15px",
  padding: "16px 20px",
  cursor: "pointer",
  transition: "background 0.2s",
  borderBottom: "1px solid #f8fafc",
  position: "relative",
  alignItems: "flex-start"
};

const unreadNotifItem = {
  ...notifItem,
  background: "#f8f7ff" 
};

const notifIconWrap = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
};

const notifTitle = {
  margin: 0,
  fontSize: "13px",
  fontWeight: "500",
  color: "#1e293b",
  lineHeight: "1.5"
};

const notifTime = {
  margin: "4px 0 0 0",
  fontSize: "11px",
  color: "#94a3b8"
};

const unreadDot = {
  width: "8px",
  height: "8px",
  background: "#6c5ce7",
  borderRadius: "50%",
  marginTop: "6px"
};
