import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaSignInAlt,
  FaUserCheck,
  FaTasks,
  FaSearch,
  FaSignOutAlt,
  FaShieldAlt,
  FaUserGraduate,
  FaBriefcase,
  FaUserSlash,
  FaCalendarPlus,
  FaTimes,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";
import CustomDropdown from "../components/CustomDropdown";

const API = "http://localhost:5000/api/admin";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Logout Modal State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Profile Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    gender: "",
    location: "",
    contact: "",
    nickname: "",
  });

  const token = localStorage.getItem("token");
  const [adminUser, setAdminUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  //  redirect non-admins 
  useEffect(() => {
    const roleType = localStorage.getItem("roleType");
    if (!token || roleType !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [navigate, token]);

  //  Fetch all data 
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("stats");
      const data = await res.json();
      setStats(data);
    } catch {
      if (token) toast.error("Failed to load admin statistics.");
    }
  }, [token]);

  const fetchUsers = useCallback(async (q = "") => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/users?search=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("users");
      const data = await res.json();
      setUsers(data);
    } catch {
      if (token) toast.error("Failed to load users.");
    }
  }, [token]);

  const fetchActivity = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("activity");
      const data = await res.json();
      setActivity(data);
    } catch {
      if (token) toast.error("Failed to load activity.");
    }
  }, [token]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchActivity()]);
      setLoading(false);
    };
    load();
  }, [fetchStats, fetchUsers, fetchActivity]);

  //  Search debounce 
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setIsEditing(false);

    // If it's the admin, initialize the edit form
    if (user._id === adminUser._id) {
      setEditForm({
        gender: user.gender || "",
        location: user.location || "",
        contact: user.contact || "",
        nickname: user.nickname || "",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (editForm.contact && editForm.contact.length !== 10) {
      toast.error("Contact must be exactly 10 digits");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data));
      setAdminUser(data);
      setSelectedUser(data); // Refresh the modal view
      setIsEditing(false);
      window.dispatchEvent(new Event("profileUpdate"));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  //  User Modal Renderer 
  const renderUserModal = () => {
    if (!selectedUser) return null;

    const firstName = selectedUser.fullName?.split(" ")[0] || "";
    const lastName = selectedUser.fullName?.split(" ").slice(1).join(" ") || "";

    return (
      <div style={styles.modalOverlay} onClick={() => {
        if (!isEditing) setShowUserModal(false);
      }}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>
                    {selectedUser._id === adminUser._id ? "Your Profile" : "User Information"}
                </h3>
                {selectedUser._id === adminUser._id && !isEditing && (
                    <button 
                        style={styles.editIconBtn} 
                        onClick={() => setIsEditing(true)}
                        title="Edit Profile"
                    >
                        <FaEdit size={14} />
                    </button>
                )}
            </div>
            <button style={styles.closeBtn} onClick={() => setShowUserModal(false)}>
              <FaTimes />
            </button>
          </div>

          <div style={styles.modalBody}>
            {/* Profile Avatar Section */}
            <div style={styles.modalProfileHeader}>
              <div style={styles.modalAvatarContainer}>
                {selectedUser.profilePicture ? (
                  <img
                    src={`http://localhost:5000${selectedUser.profilePicture}`.replace(/([^:]\/)\/+/g, "$1")}
                    alt="Avatar"
                    style={styles.largeAvatar}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}
                {!selectedUser.profilePicture && (
                    <div style={styles.modalInitials}>
                        {selectedUser.fullName?.[0]?.toUpperCase() || "?"}
                    </div>
                )}
              </div>
              <div>
                <h4 style={styles.modalName}>{selectedUser.fullName}</h4>
                <p style={styles.modalEmail}>{selectedUser.email}</p>
                {selectedUser.roleType !== "admin" && (
                    <span style={{
                        ...styles.badge,
                        background: selectedUser.role === "student" ? "#f0ecff" : "#e8f4fd",
                        color: selectedUser.role === "student" ? "#6c5ce7" : "#0984e3",
                        marginTop: 8,
                        display: "inline-block"
                     }}>
                       {selectedUser.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) : "Unset"}
                    </span>
                )}
              </div>
            </div>

            {/* Information Grid  */}
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.modalLabel}>FIRST NAME</label>
                <div style={{ ...styles.modalValue, opacity: 0.7 }}>{firstName || "—"}</div>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.modalLabel}>LAST NAME</label>
                <div style={{ ...styles.modalValue, opacity: 0.7 }}>{lastName || "—"}</div>
              </div>
              <div style={{ ...styles.infoItem, gridColumn: "span 2" }}>
                <label style={styles.modalLabel}>EMAIL ADDRESS</label>
                <div style={{ ...styles.modalValue, opacity: 0.7 }}>{selectedUser.email}</div>
              </div>
              
              <div style={styles.infoItem}>
                <label style={styles.modalLabel}>GENDER</label>
                {isEditing ? (
                    <CustomDropdown
                        value={editForm.gender}
                        onChange={(val) => setEditForm({...editForm, gender: val})}
                        options={[
                            { label: "Male", value: "Male" },
                            { label: "Female", value: "Female" },
                            { label: "Other", value: "Other" }
                        ]}
                        placeholder="Select Gender"
                        containerStyle={styles.modalInput}
                        width="100%"
                    />
                ) : (
                    <div style={styles.modalValue}>{selectedUser.gender || "Not specified"}</div>
                )}
              </div>
              
              <div style={styles.infoItem}>
                <label style={styles.modalLabel}>CONTACT</label>
                {isEditing ? (
                    <input 
                        style={styles.modalInput}
                        value={editForm.contact}
                        onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                        placeholder="10-digit number"
                        maxLength={10}
                    />
                ) : (
                    <div style={styles.modalValue}>{selectedUser.contact || "Not provided"}</div>
                )}
              </div>

              <div style={styles.infoItem}>
                <label style={styles.modalLabel}>LOCATION</label>
                {isEditing ? (
                    <input 
                        style={styles.modalInput}
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="e.g. Kathmandu, Nepal"
                    />
                ) : (
                    <div style={styles.modalValue}>{selectedUser.location || "Not provided"}</div>
                )}
              </div>

              <div style={styles.infoItem}>
                <label style={styles.modalLabel}>NICKNAME</label>
                {isEditing ? (
                    <input 
                        style={styles.modalInput}
                        value={editForm.nickname}
                        onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                        placeholder="Enter nickname"
                    />
                ) : (
                    <div style={styles.modalValue}>{selectedUser.nickname || "—"}</div>
                )}
              </div>
            </div>

            {isEditing && (
                <div style={styles.modalActions}>
                    <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                    <button style={styles.saveBtn} onClick={handleSaveProfile}>
                        Save Changes
                    </button>
                </div>
            )}

            {/* Account Activity Section */}
            <div style={styles.modalDivider} />
            <h5 style={styles.subTitle}>Account Status</h5>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.modalLabel}>JOINED ON</label>
                <div style={styles.modalValue}>{formatDate(selectedUser.createdAt)}</div>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.modalLabel}>LAST LOGIN</label>
                <div style={styles.modalValue}>{formatDateTime(selectedUser.lastLogin)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // loader 
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.logo}>FocusFlow Planner</h1>
          <span style={{ color: "#888", fontSize: 14 }}>Loading admin data...</span>
        </div>
        <div style={styles.cardsRow}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ ...styles.card, height: 110, background: "#f3f3f7" }} />
          ))}
        </div>
      </div>
    );
  }

  //  STAT CARDS 
  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: <FaUsers size={22} color="#6c5ce7" />,
      sub: "All registered accounts",
    },
    {
      label: "Daily Logins",
      value: stats?.dailyLogins ?? 0,
      icon: <FaSignInAlt size={22} color="#6c5ce7" />,
      sub: "Logins today",
    },
    {
      label: "Active Today",
      value: stats?.activeUsersToday ?? 0,
      icon: <FaUserCheck size={22} color="#6c5ce7" />,
      sub: "Users active today",
    },
    {
      label: "Total Tasks",
      value: stats?.totalTasksCreated ?? 0,
      icon: <FaTasks size={22} color="#6c5ce7" />,
      sub: "Tasks created across all users",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.topSection}>
        {/*  HEADER  */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.logo}>FocusFlow Planner</h1>
            <span style={styles.adminBadge}><FaShieldAlt size={10} /> Admin Panel</span>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.adminInfo} onClick={() => handleUserClick(adminUser)}>
              <div style={styles.avatar}>
                {adminUser.profilePicture ? (
                  <img 
                    src={`http://localhost:5000${adminUser.profilePicture}`.replace(/([^:]\/)\/+/g, "$1")} 
                    alt="admin" 
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}
                {adminUser.fullName?.[0]?.toUpperCase() || "A"}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                {adminUser.fullName || "Admin"}
              </span>
            </div>
            <button style={styles.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>
              <FaSignOutAlt size={13} /> Logout
            </button>
          </div>
        </div>

        {/*  TAB NAV  */}
        <div style={styles.tabs}>
          {["dashboard", "users"].map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/*  SCROLLABLE CONTENT AREA  */}
      <div style={styles.contentArea}>
        {/*  DASHBOARD TAB  */}
        {activeTab === "dashboard" && (
          <>
            {/* Stat Cards */}
            <div style={styles.cardsRow}>
              {statCards.map((c) => (
                <div key={c.label} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={styles.cardIcon}>{c.icon}</div>
                    <div style={styles.cardValue}>{c.value}</div>
                  </div>
                  <div style={styles.cardLabel}>{c.label}</div>
                  <div style={styles.cardSub}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Middle Section */}
            <div style={styles.gridTwo}>
              {/* Recent Activity */}
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>Recent User Activity</h3>
                {activity.length === 0 ? (
                  <p style={styles.empty}>No recent activity found.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {["User", "Role", "Last Login", "Status"].map((h) => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((u) => (
                        <tr key={u._id} style={styles.tr}>
                          <td style={styles.td}>
                            <div 
                              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                              onClick={() => handleUserClick(u)}
                            >
                                <div style={styles.miniAvatar}>{u.fullName?.[0]?.toUpperCase() || "?"}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{u.fullName}</div>
                                    <div style={{ fontSize: 11, color: "#888" }}>{u.email}</div>
                                </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              background: u.role === "student" ? "#f0ecff" : "#e8f4fd",
                              color: u.role === "student" ? "#6c5ce7" : "#0984e3",
                            }}>
                              {u.roleType === "admin" ? "Admin" : (u.role || "Unset")}
                            </span>
                          </td>
                          <td style={styles.td}>{formatDateTime(u.lastLogin)}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              background: u.isActive ? "#e8faf5" : "#fff5f5",
                              color: u.isActive ? "#00b894" : "#ff4757",
                            }}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* User Overview */}
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>User Overview</h3>
                {[
                  { icon: <FaCalendarPlus size={16} color="#6c5ce7" />, label: "New Users This Week", value: stats?.newUsersThisWeek ?? 0, bg: "#f0ecff" },
                  { icon: <FaUserGraduate size={16} color="#6c5ce7" />, label: "Total Students", value: stats?.totalStudents ?? 0, bg: "#f0ecff" },
                  { icon: <FaBriefcase size={16} color="#6c5ce7" />, label: "Total Professionals", value: stats?.totalProfessionals ?? 0, bg: "#f0ecff" },
                  { icon: <FaUserSlash size={16} color="#6c5ce7" />, label: "Inactive Users", value: stats?.inactiveUsers ?? 0, bg: "#f0ecff" },
                ].map((item) => (
                  <div key={item.label} style={{ ...styles.overviewRow, background: item.bg }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {item.icon}
                      <span style={{ fontSize: 14, color: "#444" }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#222" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/*  USERS TAB  */}
        {activeTab === "users" && (
          <div style={styles.card}>
            <div style={styles.tableHeader}>
              <h3 style={styles.sectionTitle}>All Users</h3>
              <div style={styles.searchBar}>
                <FaSearch size={13} color="#aaa" />
                <input
                  style={styles.searchInput}
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {users.length === 0 ? (
              <p style={styles.empty}>No users found{search ? ` for "${search}"` : ""}.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...styles.table, width: "100%" }}>
                  <thead>
                    <tr>
                      {["Name", "Email", "Portal Role", "Account Type", "Joined", "Last Login", "Status"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={styles.tr}>
                        <td style={styles.td}>
                          <div 
                            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                            onClick={() => handleUserClick(u)}
                          >
                            <div style={styles.miniAvatar}>
                              {u.profilePicture ? (
                                <img 
                                  src={`http://localhost:5000${u.profilePicture}`.replace(/([^:]\/)\/+/g, "$1")} 
                                  alt="u" 
                                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : null}
                              {u.fullName?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{u.fullName}</span>
                          </div>
                        </td>
                        <td style={styles.td}><span style={{ fontSize: 13, color: "#555" }}>{u.email}</span></td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: u.role === "student" ? "#f0ecff" : u.role === "professional" ? "#e8f4fd" : "#f5f5f5",
                            color: u.role === "student" ? "#6c5ce7" : u.role === "professional" ? "#0984e3" : "#999",
                          }}>
                            {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "Unset"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: u.roleType === "admin" ? "#fff3cd" : "#f5f5f5",
                            color: u.roleType === "admin" ? "#856404" : "#666",
                          }}>
                            {u.roleType === "admin" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td style={styles.td}><span style={{ fontSize: 13, color: "#666" }}>{formatDate(u.createdAt)}</span></td>
                        <td style={styles.td}><span style={{ fontSize: 13, color: "#666" }}>{formatDateTime(u.lastLogin)}</span></td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: u.isActive ? "#e8faf5" : "#fff5f5",
                            color: u.isActive ? "#00b894" : "#ff4757",
                          }}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

    
      {showUserModal && renderUserModal()}

      {/* LOGOUT CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        message="Are you sure you want to logout from the admin panel?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

//  STYLES 
const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f4f5fb",
    fontFamily: "'Poppins', sans-serif",
    boxSizing: "border-box",
  },
  topSection: {
    padding: "30px 36px 0",
    background: "#f4f5fb",
    flexShrink: 0,
  },
  contentArea: {
    flex: 1,
    padding: "0 36px 30px",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    fontFamily: "'Agbalumo', system-ui",
    fontSize: 28,
    fontWeight: 400,
    color: "#1a1a1a",
    margin: 0,
  },
  adminBadge: {
    fontSize: 11,
    background: "#f0ecff",
    color: "#6c5ce7",
    padding: "2px 10px",
    borderRadius: 20,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  adminInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6c5ce7, #8e7cfb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    overflow: "hidden"
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#ece9ff",
    color: "#6c5ce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
    overflow: "hidden"
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "1.5px solid #ddd",
    color: "#666",
    padding: "7px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Poppins', sans-serif",
  },
  tabs: {
    display: "flex",
    gap: 8,
    margin: "18px 0 24px",
  },
  tab: {
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#888",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  tabActive: {
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: "#6c5ce7",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    marginBottom: 24,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#f0ecff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardValue: {
    fontSize: 34,
    fontWeight: 800,
    color: "#1a1a1a",
    lineHeight: 1,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: "#222",
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    color: "#999",
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1a1a1a",
    margin: "0 0 16px 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: "#888",
    padding: "8px 10px",
    borderBottom: "1px solid #f0f0f0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tr: {
    borderBottom: "1px solid #f8f8f8",
    transition: "background 0.2s",
  },
  td: {
    padding: "12px 10px",
    fontSize: 13,
    color: "#444",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  overviewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: 12,
    marginBottom: 10,
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f7f7fb",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: "8px 14px",
    minWidth: 260,
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 13,
    color: "#333",
    fontFamily: "'Poppins', sans-serif",
    width: "100%",
  },
  empty: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 14,
    padding: "30px 0",
  },

  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    width: "100%",
    maxWidth: "520px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "18px 24px",
    background: "#fbfaff",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#6c5ce7",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: "24px",
  },
  modalProfileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },
  modalAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    overflow: "hidden",
    background: "#f0ecff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalInitials: {
    fontSize: 32,
    fontWeight: 700,
    color: "#6c5ce7",
  },
  largeAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  modalName: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1a1a",
  },
  modalEmail: {
    margin: "2px 0 0 0",
    fontSize: 14,
    color: "#666",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginTop: "16px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.5px",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  modalValue: {
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    padding: "10px 14px",
    background: "#f8f9fa",
    borderRadius: "10px",
    border: "1px solid #eee",
    minHeight: "41px",
    display: "flex",
    alignItems: "center"
  },
  modalInput: {
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    padding: "10px 14px",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Poppins', sans-serif",
  },
  editIconBtn: {
    background: "#f0ecff",
    border: "none",
    color: "#6c5ce7",
    padding: "6px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  saveBtn: {
    background: "#6c5ce7",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#64748b",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  modalDivider: {
    height: "1px",
    background: "#f0f0f0",
    margin: "24px 0",
  },
  subTitle: {
    margin: "0 0 12px 0",
    fontSize: 14,
    fontWeight: 700,
    color: "#1a1a1a",
  },
};

export default AdminDashboard;
