import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModeSelector from "../components/pomodoro/ModeSelector";
import TimerDisplay from "../components/pomodoro/TimerDisplay";
import TimerControls from "../components/pomodoro/TimerControls";
import TaskSelector from "../components/pomodoro/TaskSelector";
import SessionList from "../components/pomodoro/SessionList";
import { FaCheckCircle, FaHourglassHalf, FaCoffee, FaChartLine, FaVolumeUp, FaBell, FaBullseye, FaStar, FaRocket, FaCloudSun } from "react-icons/fa";

const Pomodoro = () => {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  // Synchronous Load
  const getInitialSettings = () => {
    try {
      const s = localStorage.getItem("pomodoroSettings");
      if (s) return JSON.parse(s);
    } catch {}
    return { focusMode: "beginner", soundEnabled: true, desktopEnabled: false };
  };

  const initSettings = getInitialSettings();
  const [focusMode, setFocusMode] = useState(initSettings.focusMode || "beginner");
  const [soundEnabled, setSoundEnabled] = useState(initSettings.soundEnabled ?? true);
  const [desktopEnabled, setDesktopEnabled] = useState(initSettings.desktopEnabled ?? false);

  const getInitialState = () => {
    try {
      const s = localStorage.getItem("pomodoroState");
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.isActive && parsed.expectedEndTime) {
          const now = Math.floor(Date.now() / 1000);
          const remaining = parsed.expectedEndTime - now;
          return { ...parsed, timeLeft: remaining > 0 ? remaining : 0 };
        }
        return parsed;
      }
    } catch {}
    return null;
  };

  const initState = getInitialState();

  const [mode, setMode] = useState(initState?.mode || "work");
  const [timeLeft, setTimeLeft] = useState(() => {
    if (initState && initState.timeLeft !== undefined) return initState.timeLeft;
    return initSettings.focusMode === "deep" ? 50 * 60 : 25 * 60;
  });
  const [totalDuration, setTotalDuration] = useState(() => {
    if (initState && initState.totalDuration !== undefined) return initState.totalDuration;
    return initSettings.focusMode === "deep" ? 50 * 60 : 25 * 60;
  });
  const [isActive, setIsActive] = useState(initState?.isActive || false);
  const [currentSessionId, setCurrentSessionId] = useState(initState?.currentSessionId || null);
  const [selectedTask, setSelectedTask] = useState(initState?.selectedTask || "");

  const [stats, setStats] = useState({ rounds: 0, focusTime: 0, breakTime: 0 });
  const timerRef = useRef(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";

  const getDurations = useCallback(() => {
    if (focusMode === "deep") return { focus: 50 * 60, break: 10 * 60 };
    return { focus: 25 * 60, break: 5 * 60 }; // beginner
  }, [focusMode]);

  const prevFocusModeRef = useRef(focusMode);
  const prevModeRef = useRef(mode);

  const getTargetDuration = useCallback((md = mode) => {
    const d = getDurations();
    if (md === "work") return d.focus;
    if (md === "shortBreak") return d.break;
    // Long break is  15 mins for beginner, or 30 mins for deep work
    return Math.max(15 * 60, d.break * 3); 
  }, [mode, getDurations]);

  // Handle preset mode change when user explicitly changes focusMode or phase
  useEffect(() => {
    const isFocusModeChange = prevFocusModeRef.current !== focusMode;
    const isPhaseChange = prevModeRef.current !== mode;

    if (!isActive && (isFocusModeChange || isPhaseChange)) {
      const newDuration = getTargetDuration(mode);
      setTimeLeft(newDuration);
      setTotalDuration(newDuration);
    }
    
    prevFocusModeRef.current = focusMode;
    prevModeRef.current = mode;

  }, [focusMode, mode, getTargetDuration, isActive]);



  const fetchTasksAndSessions = useCallback(async () => {
    try {
      // Fetch User settings first to get sound preference
      const userRes = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.data?.pomodoroSettings) {
        setSoundEnabled(userRes.data.pomodoroSettings.soundEnabled);
        setDesktopEnabled(userRes.data.pomodoroSettings.desktopEnabled || false);
      }

      const taskRes = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const taskData = Array.isArray(taskRes.data) ? taskRes.data : (taskRes.data.tasks || []);
      const pendingTasks = taskData.filter((t) => t.status === "pending");
      
      // Filter for today's tasks
      const todayDateObj = new Date();
      const localToday = `${todayDateObj.getFullYear()}-${String(todayDateObj.getMonth() + 1).padStart(2, '0')}-${String(todayDateObj.getDate()).padStart(2, '0')}`;
      
      const todaysPendingTasks = pendingTasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate).toDateString() === todayDateObj.toDateString();
      });
      
      setTasks(todaysPendingTasks);

      const today = new Date().toISOString().split("T")[0];
      const sessionRes = await axios.get(
        `http://localhost:5000/api/pomodoro?type=${role}&date=${today}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions(sessionRes.data);
      
      let rounds = 0;
      let focusMins = 0;
      sessionRes.data.forEach(s => {
        if (s.status === "completed") {
          rounds++;
          focusMins += s.duration;
        } else if (s.status === "interrupted" && s.startTime && s.endTime) {
          const diffMins = Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000);
          focusMins += diffMins;
        }
      });
      setStats(prev => ({ ...prev, rounds, focusTime: focusMins }));

    } catch (err) {
      console.error(err);
      toast.error("Error loading data");
    }
  }, [token, role]);

  useEffect(() => {
    fetchTasksAndSessions();
  }, [fetchTasksAndSessions]);

  const targetEndTimeRef = useRef(null);
  const handleTimerEndRef = useRef(null);


  useEffect(() => {
    handleTimerEndRef.current = handleTimerEnd;
  });


  useEffect(() => {
    const stateObj = {
      isActive,
      mode,
      timeLeft,
      totalDuration,
      selectedTask,
      currentSessionId,
      expectedEndTime: isActive && targetEndTimeRef.current 
        ? targetEndTimeRef.current 
        : (isActive ? Math.floor(Date.now() / 1000) + timeLeft : null),
    };
    localStorage.setItem("pomodoroState", JSON.stringify(stateObj));
  }, [isActive, mode, timeLeft, totalDuration, selectedTask, currentSessionId]);

  useEffect(() => {
    const setObj = { focusMode, soundEnabled, desktopEnabled };
    localStorage.setItem("pomodoroSettings", JSON.stringify(setObj));
  }, [focusMode, soundEnabled, desktopEnabled]);

  // Timer Tick Logic (Absolute Time to fix background JS throttling)
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Math.floor(Date.now() / 1000) + timeLeft;
      }
      
      timerRef.current = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = targetEndTimeRef.current - now;
        
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setTimeLeft(0);
          setIsActive(false);
          targetEndTimeRef.current = null;
          handleTimerEndRef.current();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    } else if (isActive && timeLeft <= 0) {
      setIsActive(false);
      targetEndTimeRef.current = null;
      handleTimerEnd();
    } else {
      targetEndTimeRef.current = null;
    }
    
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  // Initial check for notifications permission
  useEffect(() => {
    if (desktopEnabled && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [desktopEnabled]);

  const playSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // Droplet effect
      const playDrop = (freq, startAt, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startAt);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, startAt + duration);
        gain.gain.setValueAtTime(0, startAt);
        gain.gain.linearRampToValueAtTime(0.18, startAt + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startAt);
        osc.stop(startAt + duration + 0.05);
      };
      playDrop(900, audioCtx.currentTime, 0.35);
      playDrop(700, audioCtx.currentTime + 0.18, 0.35);
      playDrop(550, audioCtx.currentTime + 0.38, 0.4);
    } catch(e) { console.error("Audio block", e); }
  };

  const showNotification = (title, body) => {
    if (!desktopEnabled) return;
    if ("Notification" in window && Notification.permission === "granted") {
      // Create notification
      try {
        const notif = new Notification(title, { 
          body, 
          tag: "pomodoro-alert", // Overwrite existing alerts of the same type
          requireInteraction: true // Make it stay until clicked/timed out on OS level
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.error("Notification failed", err);
      }
    }
  };



  const updatePomodoroSetting = async (key, value) => {
    // Update local state first
    if (key === "soundEnabled") setSoundEnabled(value);
    if (key === "desktopEnabled") {
      setDesktopEnabled(value);
      // Explicit permission request when toggled ON
      if (value && "Notification" in window) {
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            toast.success("Notifications enabled! Sending test alert...");
            new Notification("FocusFlow", { body: "Desktop alerts are now active!", requireInteraction: false });
          } else {
            toast.warn("Notifications were blocked. Please enable them in browser settings.");
          }
        } else if (Notification.permission === "denied") {
          toast.error("Notifications are blocked by your browser. Click the lock icon in the URL bar to enable them.");
        } else if (Notification.permission === "granted") {
          // Send a quick test to confirm
          new Notification("FocusFlow", { body: "Desktop alerts are active!", requireInteraction: false });
        }
      }
    }

    try {
      await axios.put(
        "http://localhost:5000/api/users/pomodoro-settings",
        { 
          soundEnabled: key === "soundEnabled" ? value : soundEnabled,
          desktopEnabled: key === "desktopEnabled" ? value : desktopEnabled,
          soundType: "droplet" 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error saving setting:", err);
    }
  };

  const handleStart = async () => {
    if (mode === "work" && !selectedTask) {
      toast.warn("Please select a task first!");
      return;
    }

    if (mode === "work" && !currentSessionId) {
      try {
        const d = getDurations();
        const taskInfo = tasks.find(t => t._id === selectedTask);
        const res = await axios.post(
          "http://localhost:5000/api/pomodoro/start",
          {
            taskId: selectedTask,
            subjectProjectId: taskInfo?.subjectProjectId || taskInfo?._id,
            type: role,
            duration: totalDuration / 60, 
            focusMode: focusMode,
            breakDuration: d.break / 60
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentSessionId(res.data._id);
        toast.success("Focus session started!");
      } catch (err) {
        console.error(err);
        toast.error("Error starting session");
        return;
      }
    }
    
    setIsActive(true);
  };

  const handlePause = () => setIsActive(false);

  const handleInterrupt = async () => {
    setIsActive(false);
    if (mode === "work" && currentSessionId) {
      try {
        await axios.put(
          `http://localhost:5000/api/pomodoro/end/${currentSessionId}`,
          { status: "interrupted" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.info("Focus session interrupted (Skipped)");
      } catch (err) {
        console.error(err);
      }
    }
    setCurrentSessionId(null);
    fetchTasksAndSessions();
  };

  const handleModeClick = (newMode) => {
    if (isActive && mode === "work") {
      handleInterrupt();
    }
    setMode(newMode);
    const d = getTargetDuration(newMode);
    setTimeLeft(d);
    setTotalDuration(d);
    setIsActive(false);
  };

  const handleSkip = () => {
    setIsActive(false);
    if (mode === "work") {
      handleInterrupt();
      setMode("shortBreak");
      const d = getTargetDuration("shortBreak");
      setTimeLeft(d);
      setTotalDuration(d);
      setIsActive(false);
    } else if (mode === "shortBreak") {
      setMode("longBreak");
      const d = getTargetDuration("longBreak");
      setTimeLeft(d);
      setTotalDuration(d);
      setIsActive(false);
    } else {
      setMode("work");
      const d = getTargetDuration("work");
      setTimeLeft(d);
      setTotalDuration(d);
      setIsActive(false);
    }
  };

  const handleTimerEnd = async (savedState = null) => {
    const currentMode = savedState ? savedState.mode : mode;
    const sessId = savedState ? savedState.currentSessionId : currentSessionId;
    
    if (currentMode === "work" && sessId) {
      try {
        await axios.put(
          `http://localhost:5000/api/pomodoro/end/${sessId}`,
          { status: "completed" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Focus session completed!");
        playSound();
        showNotification("Focus Complete", "Great job! Time for a break.");
        fetchTasksAndSessions();
        // Notify Navbar to refresh notifications
        window.dispatchEvent(new CustomEvent("notificationsUpdate"));
      } catch (err) {
        console.error(err);
      }
    } else if(currentMode !== "work") {
        const isLong = currentMode === "longBreak";
        playSound();
        toast.success(isLong ? "Long break complete! A new session awaits." : "Short break's over! Back to it.");
        showNotification(
          isLong ? "Long Break Complete" : "Short Break Over",
          isLong ? "Feeling refreshed? A new session awaits." : "Back to it — stay sharp!"
        );
    }

    if (currentMode === "work") {
       const newRounds = stats.rounds + 1;
       let nextMode = "shortBreak";
       if (newRounds % 4 === 0) {
         nextMode = "longBreak";
       }
       setMode(nextMode);
       const target = getTargetDuration(nextMode);
       setTimeLeft(target);
       setTotalDuration(target);
       setIsActive(true);
    } else {
       const breakMins = currentMode === "shortBreak" ? getDurations().break / 60 : Math.max(15, (getDurations().break * 3) / 60);
       setStats(prev => ({ ...prev, breakTime: prev.breakTime + breakMins }));
       
       setMode("work");
       const target = getTargetDuration("work");
       setTimeLeft(target);
       setTotalDuration(target);
       setIsActive(false);
    }
    
    setCurrentSessionId(null);
  };

  return (
    <div style={pageContainer}>

      <div style={gridContainer}>
        {/* LEFT COLUMN: TIMER */}
        <div style={timerColumn}>
          <div style={timerCard}>
            {/* Mode selector: only show when idle in work mode */}
            {!isActive && mode === "work" && (
              <div style={{ marginBottom: "10px", alignSelf: "center" }}>
                <ModeSelector focusMode={focusMode} onModeChange={setFocusMode} />
              </div>
            )}

            <div style={modeTabsContainer}>
              <div 
                style={mode === "work" ? activeModeItem : modeItem}
                onClick={() => handleModeClick("work")}
              >
                Focus
              </div>
              <div 
                style={mode === "shortBreak" ? activeModeItem : modeItem}
                onClick={() => handleModeClick("shortBreak")}
              >
                Short Break
              </div>
              <div 
                style={mode === "longBreak" ? activeModeItem : modeItem}
                onClick={() => handleModeClick("longBreak")}
              >
                Long Break
              </div>
            </div>

            {mode === "work" && (
              <TaskSelector
                tasks={tasks}
                selectedTaskId={selectedTask}
                onSelectTask={setSelectedTask}
              />
            )}
            
            <TimerDisplay 
              timeLeft={timeLeft} 
              totalDuration={totalDuration} 
              mode={mode} 
            />

            <TimerControls
              isActive={isActive}
              onStart={handleStart}
              onPause={handlePause}
              onSkip={handleSkip}
            />
          </div>

          {/* LOWER LEFT: MINI STATS — 4 cards matching wireframe */}
          <div style={miniStatsGrid}>
            <div style={miniStatCard}>
              <div style={miniIconCircle}><FaCheckCircle style={mIc} /></div>
              <h4 style={msTitle}>{stats.rounds}/4</h4>
              <p style={msSubtitle}>Rounds</p>
            </div>
            <div style={miniStatCard}>
              <div style={miniIconCircle}><FaHourglassHalf style={mIc} /></div>
              <h4 style={msTitle}>{stats.focusTime}m</h4>
              <p style={msSubtitle}>Focus Time</p>
            </div>
            <div style={miniStatCard}>
              <div style={miniIconCircle}><FaCoffee style={mIc} /></div>
              <h4 style={msTitle}>{stats.breakTime}m</h4>
              <p style={msSubtitle}>Break Time</p>
            </div>
            <div style={miniStatCard}>
              <div style={miniIconCircle}><FaChartLine style={mIc} /></div>
              <h4 style={msTitle}>{Math.min(100, Math.round((stats.focusTime / 120) * 100))}%</h4>
              <p style={msSubtitle}>Daily Goal</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT SESSIONS & SETTINGS */}
        <div style={listColumn}>
          <div style={{...quickSettingsCard, marginBottom: "20px"}}>
            <SessionList sessions={sessions} />
          </div>

          <div style={quickSettingsCard}>
            <h4 style={qsTitle}>QUICK SETTINGS</h4>
            
            <div style={qsRow}>
              <div style={qsLabelWrap}>
                <FaVolumeUp style={qsIcon} />
                <span style={qsLabel}>Sound</span>
              </div>
              <label className="qs-toggle-wrap">
                <input type="checkbox" checked={soundEnabled} onChange={(e) => updatePomodoroSetting("soundEnabled", e.target.checked)} />
                <span className="qs-slider"></span>
              </label>
            </div>
            
            <div style={qsRow}>
              <div style={qsLabelWrap}>
                <FaBell style={qsIcon} />
                <span style={qsLabel}>Desktop Alert</span>
              </div>
              <label className="qs-toggle-wrap">
                <input type="checkbox" checked={desktopEnabled} onChange={(e) => updatePomodoroSetting("desktopEnabled", e.target.checked)} />
                <span className="qs-slider"></span>
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* STYLES */

const pageContainer = {
  padding: "30px",
  width: "100%",
  boxSizing: "border-box",
};

const headerSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};

const pageTitle = {
  margin: "0",
  fontSize: "22px",
  fontWeight: "600",
  color: "#2d3436",
};

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "1fr 350px",
  gap: "30px",
};

const timerColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const timerCard = {
  background: "#ffffff",
  padding: "40px 30px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  border: "1px solid #f9f9f9",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const listColumn = {}; 

const miniStatsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "15px",
};

const miniStatCard = {
  background: "#ffffff",
  padding: "24px 16px",
  borderRadius: "15px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
  border: "1px solid #f9f9f9",
  textAlign: "center",
};

const miniIconCircle = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  background: "#ece9ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mIc = {
  color: "#6c5ce7",
  fontSize: "18px",
};

const msTitle = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "700",
  color: "#222",
};

const msSubtitle = {
  margin: 0,
  fontSize: "13px",
  color: "#888",
};

const quickSettingsCard = {
  background: "#ffffff",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  border: "1px solid #f9f9f9",
};

const qsTitle = {
  margin: "0 0 20px 0",
  fontSize: "13px",
  fontWeight: "700",
  color: "#333",
  letterSpacing: "1px",
};

const qsRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
};

const qsLabelWrap = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const qsIcon = {
  color: "#888",
  fontSize: "16px",
};

const qsLabel = {
  fontSize: "14px",
  color: "#555",
  fontWeight: "500",
};


const modeTabsContainer = {
  display: "flex",
  gap: "20px",
  marginBottom: "30px",
  borderBottom: "1px solid #eee",
  paddingBottom: "10px",
  width: "80%",
  justifyContent: "space-around",
};

const modeItem = {
  fontSize: "14px",
  color: "#888",
  fontWeight: "500",
  paddingBottom: "10px",
  cursor: "pointer",
};

const activeModeItem = {
  ...modeItem,
  color: "#6c5ce7",
  borderBottom: "3px solid #6c5ce7",
  marginBottom: "-11px", 
};

export default Pomodoro;
