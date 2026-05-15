import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { FaTasks } from "react-icons/fa";
import CustomDropdown from "../components/CustomDropdown";

const SubjectsProjects = () => {
  const [items, setItems] = useState([]);
  const [allTasks, setAllTasks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState("All"); // "All", "<50", ">=50"
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Custom Confirm Modal State
  const [confirmState, setConfirmState] = useState({ isOpen: false, message: "", onConfirm: null });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Tasks Modal
  const [taskModalProjectId, setTaskModalProjectId] = useState(null);

  const userRole = localStorage.getItem("role") || "student";
  const token = localStorage.getItem("token");
  
  const isStudent = userRole === "student";
  const entityName = isStudent ? "Subject" : "Project";
  const entityPlural = isStudent ? "Subjects" : "Projects";

  const fetchItems = async () => {
    setLoading(true);
    try {
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      const [projRes, taskRes] = await Promise.all([
        axios.get("http://localhost:5000/api/subject-projects", authHeaders),
        axios.get("http://localhost:5000/api/tasks", authHeaders)
      ]);
      
      const filtered = projRes.data.filter(item => item.type === userRole);
      setItems(filtered);
      setAllTasks(taskRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error(`Failed to load ${entityPlural.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [userRole]);

  const confirmAction = (message, onConfirm) => {
    setConfirmState({ isOpen: true, message, onConfirm });
  };

  const handleDelete = (id) => {
    confirmAction(`Are you sure you want to delete this ${entityName}?`, async () => {
      try {
        await axios.delete(`http://localhost:5000/api/subject-projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`${entityName} deleted`);
        fetchItems();
      } catch (err) {
        toast.error("Failed to delete");
      }
    });
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  // Filtering & Stats Calculations
  const calculatedItems = items.map(item => {
    const projectTasks = allTasks.filter(t => t.subjectProjectId === item._id);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === "completed").length;
    const tasksLeft = totalTasks - completedTasks;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      ...item,
      tasks: projectTasks,
      totalTasks,
      tasksLeft,
      progress
    };
  });

  const filteredItems = calculatedItems.filter(item => {
    if (activeTab === "Active" && item.status !== "active") return false;
    if (activeTab === "Completed" && item.status !== "completed") return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (progressFilter === "<50" && item.progress >= 50) return false;
    if (progressFilter === ">=50" && item.progress < 50) return false;
    return true;
  });

  const activeTaskProject = calculatedItems.find(i => i._id === taskModalProjectId);

  return (
    <div className="subjects-projects-container" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerControls}>
          <div style={styles.searchWrapper}>
            <FiSearch style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder={`Search ${entityPlural.toLowerCase()}...`} 
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ position: "relative" }}>
            <button 
              style={{...styles.filterBtn, background: progressFilter !== "All" ? "#e0e7ff" : "white"}} 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <FiFilter /> {progressFilter === "All" ? "Filter Progress" : progressFilter === "<50" ? "< 50% Progress" : ">= 50% Progress"}
            </button>
            {showFilterMenu && (
              <div style={styles.filterMenu}>
                <div style={styles.filterMenuItem} onClick={() => { setProgressFilter("All"); setShowFilterMenu(false); }}>All Progress</div>
                <div style={styles.filterMenuItem} onClick={() => { setProgressFilter("<50"); setShowFilterMenu(false); }}>Less than 50%</div>
                <div style={styles.filterMenuItem} onClick={() => { setProgressFilter(">=50"); setShowFilterMenu(false); }}>More than 50%</div>
              </div>
            )}
          </div>
          <button style={styles.newBtn} onClick={() => handleOpenModal()}>
            <FiPlus /> New {entityName}
          </button>
        </div>
      </div>

      <div style={styles.tabsWrapper}>
        {["All", "Active", "Completed"].map(tab => (
          <button 
            key={tab}
            style={activeTab === tab ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "All" && `${tab} ${entityPlural}`}
            {tab !== "All" && tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loader}>Loading...</div>
      ) : (
        <div style={styles.grid}>
          {filteredItems.map(item => (
            <div key={item._id} style={styles.card} onClick={() => setTaskModalProjectId(item._id)}>
              <div style={{...styles.cardHeaderBanner, backgroundColor: item.color || "#6366f1"}}></div>
              <div style={styles.cardContent}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{item.name}</h3>
                  <div style={styles.actionsDropdown}>
                    <button style={styles.iconBtn} onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}><FiEdit2 size={14}/></button>
                    <button style={styles.iconBtn} onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}><FiTrash2 size={14} color="#ef4444"/></button>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div style={styles.tagsContainer}>
                    {item.tags.map((tag, idx) => (
                      <span key={idx} style={styles.tagBadge}>{tag}</span>
                    ))}
                  </div>
                )}

                <p style={styles.cardDesc}>{item.description || "No description provided."}</p>
                
                <div style={styles.progressContainer}>
                  <div style={styles.progressHeader}>
                    <span style={styles.progressLabel}>Progress</span>
                    <span style={styles.progressPercent}>{item.progress || 0}%</span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={{...styles.progressBarFill, width: `${item.progress || 0}%`}}></div>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={styles.statusBadge(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </div>
                    <div style={styles.tasksLeft}>
                      <span style={{ marginRight: "6px", color: "#6c5ce7", display: "flex", alignItems: "center" }}>
                        <FaTasks size={14} />
                      </span> 
                      {item.tasksLeft || 0} Left
                    </div>
                  </div>
                  {item.dueDate && (
                    <div style={styles.dueDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Create New Card Placeholder */}
          <div style={styles.createCard} onClick={() => handleOpenModal()}>
            <div style={styles.createIconWrapper}>
              <FiPlus size={24} color="#6366f1" />
            </div>
            <h4 style={styles.createTitle}>New {entityName}</h4>
            <p style={styles.createDesc}>Create a new {entityName.toLowerCase()} to organize tasks</p>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        refresh={fetchItems} 
        editItem={editingItem}
        userType={userRole}
        entityName={entityName}
      />

      {/* Quick Task Modal */}
      <ProjectTasksModal 
        project={activeTaskProject}
        isOpen={!!taskModalProjectId}
        onClose={() => setTaskModalProjectId(null)}
        refresh={fetchItems}
        token={token}
        confirmAction={confirmAction}
      />

      {/* Global Confirm Modal */}
      {confirmState.isOpen && (
        <div style={{...styles.overlay, zIndex: 2000}}>
          <div style={{...styles.modal, maxWidth: "350px", textAlign: "center"}}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "12px", marginTop: 0 }}>Confirm Action</h3>
            <p style={{ fontSize: "0.95rem", color: "#4b5563", marginBottom: "24px" }}>{confirmState.message}</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button 
                style={{ padding: "8px 16px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }} 
                onClick={() => setConfirmState({ ...confirmState, isOpen: false })}
              >
                Cancel
              </button>
              <button 
                style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }} 
                onClick={() => { confirmState.onConfirm(); setConfirmState({ ...confirmState, isOpen: false }); }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Component
const AddModal = ({ isOpen, onClose, refresh, editItem, userType, entityName }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#6366f1", 
    status: "active",
    dueDate: ""
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name || "",
        description: editItem.description || "",
        color: editItem.color || "#6366f1",
        status: editItem.status || "active",
        dueDate: editItem.dueDate ? editItem.dueDate.substring(0, 10) : "",
        tags: editItem.tags ? editItem.tags.join(", ") : ""
      });
    } else {
      setForm({
        name: "",
        description: "",
        color: "#6366f1",
        status: "active",
        dueDate: "",
        tags: ""
      });
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");

    try {
      const payload = { 
        ...form, 
        type: userType,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      if (editItem) {
        await axios.put(`http://localhost:5000/api/subject-projects/${editItem._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`${entityName} updated!`);
      } else {
        await axios.post("http://localhost:5000/api/subject-projects", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`${entityName} created!`);
      }
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || `Failed to save ${entityName.toLowerCase()}`);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={{ marginBottom: "20px", fontSize: "1.25rem", fontWeight: "600" }}>
          {editItem ? `Edit ${entityName}` : `New ${entityName}`}
        </h2>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input name="name" style={styles.input} value={form.name} onChange={handleChange} placeholder="e.g. Website Redesign" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Tags (comma separated)</label>
          <input name="tags" style={styles.input} value={form.tags} onChange={handleChange} placeholder="e.g. Design, Urgent" />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea name="description" style={styles.input} value={form.description} onChange={handleChange} placeholder="Brief description..." rows="3"></textarea>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{...styles.formGroup, flex: 1}}>
            <label style={styles.label}>Due Date</label>
            <input type="date" name="dueDate" style={styles.input} value={form.dueDate} onChange={handleChange} />
          </div>
          <div style={{...styles.formGroup, flex: 1}}>
            <label style={styles.label}>Type/Color</label>
            <input type="color" name="color" style={{...styles.input, padding: "2px", height: "42px"}} value={form.color} onChange={handleChange} />
          </div>
        </div>

        {editItem && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Status</label>
            <CustomDropdown 
              value={form.status}
              onChange={(val) => setForm({ ...form, status: val })}
              options={[
                { label: "Active", value: "active" },
                { label: "Completed", value: "completed" }
              ]}
              containerStyle={styles.input}
            />
          </div>
        )}

        <div style={styles.modalActions}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSubmit}>{editItem ? "Save Changes" : "Create"}</button>
        </div>
      </div>
    </div>
  );
};

// Project Tasks Modal
const ProjectTasksModal = ({ isOpen, onClose, project, refresh, token, confirmAction }) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");

  if (!isOpen || !project) return null;

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refresh();
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = (taskId) => {
    confirmAction("Delete this task from the project?", async () => {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        refresh();
      } catch (err) {
        toast.error("Failed to delete task");
      }
    });
  };

  const handleSaveEdit = async (taskId) => {
    if (!editTaskTitle.trim()) return setEditingTaskId(null);
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { title: editTaskTitle }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingTaskId(null);
      refresh();
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleQuickAddTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        await axios.post("http://localhost:5000/api/tasks", { 
          title: newTaskTitle, 
          subjectProjectId: project._id, 
          priority: "Medium",
          subject: project.name
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNewTaskTitle("");
        refresh();
      } catch (err) {
        toast.error("Failed to add task");
      }
    }
  };

  return (
    <div style={{...styles.overlay, zIndex: 1100}}>
       <div style={{...styles.modal, maxWidth: "480px", padding: "28px"}} onClick={(e) => e.stopPropagation()}>
         <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0, color: "#111827" }}>{project.name} Tasks</h2>
            <button onClick={onClose} style={{background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#9ca3af"}}>&times;</button>
         </div>
         
         <div style={{ marginBottom: "20px", maxHeight: "350px", overflowY: "auto", paddingRight: "5px" }}>
            {project.tasks && project.tasks.length > 0 ? (
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {project.tasks.map(task => (
                  <li key={task._id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
                      <div style={{ marginTop: "2px" }}>
                        <input 
                          type="checkbox" 
                          checked={task.status === "completed"} 
                          onChange={() => handleToggleTask(task._id, task.status)}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#4f46e5" }}
                        />
                      </div>
                      
                      {editingTaskId === task._id ? (
                        <div style={{ display: "flex", flex: 1, gap: "8px" }}>
                          <input 
                            type="text" 
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(task._id) }}
                            autoFocus
                            style={{ flex: 1, padding: "4px 8px", border: "1px solid #4f46e5", borderRadius: "4px", fontSize: "0.95rem", outline: "none" }}
                          />
                          <button onClick={() => handleSaveEdit(task._id)} style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>Save</button>
                        </div>
                      ) : (
                        <span style={{ 
                          fontSize: "0.95rem", 
                          color: task.status === "completed" ? "#9ca3af" : "#111827",
                          textDecoration: task.status === "completed" ? "line-through" : "none",
                          lineHeight: "1.4",
                          flex: 1
                        }}>{task.title}</span>
                      )}
                    </div>
                    
                    {editingTaskId !== task._id && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                        <button style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: "0" }} onClick={() => { setEditingTaskId(task._id); setEditTaskTitle(task.title); }}>
                          <FiEdit2 size={14}/>
                        </button>
                        <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0" }} onClick={() => handleDeleteTask(task._id)}>
                          <FiTrash2 size={14}/>
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#6b7280", fontSize: "0.9rem", textAlign: "center", padding: "30px 0", background: "#f9fafb", borderRadius: "8px", border: "1px dashed #e5e7eb" }}>
                No tasks yet. Add one below!
              </p>
            )}
         </div>

         <div style={{ display: "flex", gap: "8px" }}>
           <input 
             type="text" 
             placeholder="What needs to be done?" 
             style={{ flex: 1, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", outline: "none", fontSize: "0.9rem" }}
             value={newTaskTitle}
             onChange={(e) => setNewTaskTitle(e.target.value)}
             onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAddTask() }}
           />
           <button 
             onClick={handleQuickAddTask}
             style={{ padding: "10px 16px", background: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
           >
             Add Task
           </button>
         </div>
       </div>
    </div>
  );
};

//  STYLES 
const styles = {
  container: {
    padding: "30px",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#111827"
  },
  headerControls: {
    display: "flex",
    gap: "12px",
    alignItems: "center"
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    color: "#94a3b8"
  },
  searchInput: {
    padding: "10px 16px 10px 40px",
    borderRadius: "12px",
    border: "1px solid #eef2f6",
    fontSize: "0.875rem",
    outline: "none",
    width: "250px",
    background: "#fff",
    transition: "all 0.2s ease"
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "white",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    color: "#374151"
  },
  newBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "#6366f1",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    color: "white",
    fontWeight: "500"
  },
  filterMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: "8px",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    zIndex: 100,
    width: "160px",
    overflow: "hidden"
  },
  filterMenuItem: {
    padding: "10px 16px",
    fontSize: "0.875rem",
    color: "#374151",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
    background: "white"
  },
  tabsWrapper: {
    display: "flex",
    gap: "10px",
    marginBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "8px"
  },
  tab: {
    background: "transparent",
    border: "none",
    padding: "8px 16px",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#6b7280",
    cursor: "pointer",
    borderRadius: "6px"
  },
  activeTab: {
    background: "white",
    color: "#111827",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px"
  },
  card: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  cardHeaderBanner: {
    height: "100px",
    width: "100%",
  },
  cardContent: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px"
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#111827"
  },
  actionsDropdown: {
    display: "flex",
    gap: "8px"
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px"
  },
  cardDesc: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "20px",
    lineHeight: "1.5"
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
    marginTop: "auto"
  },
  statusBadge: (status) => ({
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "500",
    background: status === "active" ? "#dbeafe" : "#d1fae5",
    color: status === "active" ? "#1e40af" : "#065f46"
  }),
  tasksLeft: {
    fontSize: "0.75rem",
    color: "#475569",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
  },
  dueDate: {
    fontSize: "0.75rem",
    color: "#6b7280"
  },
  tagsContainer: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "12px"
  },
  tagBadge: {
    padding: "2px 8px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "0.7rem",
    borderRadius: "4px",
    fontWeight: "600",
    letterSpacing: "0.025em"
  },
  progressContainer: {
    marginBottom: "16px",
    marginTop: "auto"
  },
  miniTaskList: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  miniTaskTitle: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: "2px",
    marginTop: 0
  },
  miniTaskItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  miniTaskCheckbox: {
    accentColor: "#4f46e5",
    cursor: "pointer",
    width: "14px",
    height: "14px"
  },
  miniTaskText: {
    fontSize: "0.875rem",
  },
  quickAddInput: {
    marginTop: "4px",
    fontSize: "0.8rem",
    padding: "6px 8px",
    border: "1px dashed #cbd5e1",
    borderRadius: "6px",
    outline: "none",
    background: "transparent",
    color: "#475569"
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px"
  },
  progressLabel: {
    fontSize: "0.75rem",
    color: "#6b7280",
    fontWeight: "500"
  },
  progressPercent: {
    fontSize: "0.75rem",
    color: "#4f46e5",
    fontWeight: "600"
  },
  progressBarBg: {
    height: "6px",
    width: "100%",
    background: "#e0e7ff",
    borderRadius: "3px",
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    background: "#4f46e5",
    borderRadius: "3px",
    transition: "width 0.3s ease"
  },
  createCard: {
    background: "transparent",
    borderRadius: "12px",
    border: "2px dashed #cbd5e1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "250px",
    cursor: "pointer",
    padding: "20px",
    textAlign: "center",
    transition: "border-color 0.2s, background-color 0.2s"
  },
  createIconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#e0e7ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "16px"
  },
  createTitle: {
    margin: "0 0 8px 0",
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#111827"
  },
  createDesc: {
    margin: 0,
    fontSize: "0.875rem",
    color: "#6b7280"
  },
  loader: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280"
  },
  
  // Modal styles 
  overlay: {
    position: "fixed",
    top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modal: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  },
  formGroup: {
    marginBottom: "16px"
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px"
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    boxSizing: "border-box" 
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px"
  },
  cancelBtn: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    color: "#374151"
  },
  saveBtn: {
    padding: "8px 16px",
    background: "#6366f1",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    color: "white"
  }
};

export default SubjectsProjects;
