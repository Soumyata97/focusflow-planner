import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import CustomDropdown from "../components/CustomDropdown";
import { useTheme } from "../components/ThemeProvider";
import { FaMoon, FaPalette } from "react-icons/fa";

const Settings = () => {
  const { isDarkMode, setIsDarkMode, pageColor, setPageColor } = useTheme();

  const [activeTab, setActiveTab] = useState("general");

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const role = localStorage.getItem("role");

  const firstName = user?.fullName?.split(" ")[0] || "";
  const lastName = user?.fullName?.split(" ")[1] || "";

  const [profile, setProfile] = useState({
    gender: "",
    contact: "",
    location: "",
    nickname: ""
    });
    useEffect(() => {
        if (user) {
            setProfile({
            gender: user.gender || "",
            contact: user.contact || "",
            location: user.location || "",
            nickname: user.nickname || ""
            });
        }
        }, []);

    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [showFullImage, setShowFullImage] = useState(false);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImageToCrop(reader.result);
                setShowCropper(true);
            };
        }
    };

    const handleCropConfirm = async () => {
        try {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const croppedUrl = URL.createObjectURL(croppedBlob);
            
            setAvatarPreview(croppedUrl);
            setSelectedFile(new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" }));
            setShowCropper(false);
        } catch (e) {
            toast.error("Failed to crop image");
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("avatar", selectedFile);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/users/update-avatar", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");

            const updatedUser = await res.json();
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            window.dispatchEvent(new Event("profileUpdate"));
            
            // Clear previews so we see the saved version from the server
            setAvatarPreview(null);
            setSelectedFile(null);
            setImageToCrop(null);
            
            toast.success("Profile picture updated!!");
        } catch (error) {
            toast.error("Failed to upload image");
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
        };

    const handleSave = async () => {

        // VALIDATION
        if (profile.contact && profile.contact.length !== 10) {
            toast.error("Contact must be exactly 10 digits");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:5000/api/users/update-profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(profile)
            });

            const data = await res.json();

            localStorage.setItem("user", JSON.stringify(data));
            setUser(data);
            window.dispatchEvent(new Event("profileUpdate"));

            toast.success("Profile updated successfully!!");

        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

  return (
    <div style={container}>
      <p style={subtitle}>
        Manage your personal information, preferences and workspace settings.
      </p>

      {/*  TABS */}
      <div style={tabs}>
        {["general", "account", "appearance"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...tabBtn,
              borderBottom:
                activeTab === tab ? "2px solid #6c5ce7" : "2px solid transparent",
              color: activeTab === tab ? "#6c5ce7" : "#888"
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/*  GENERAL TAB  */}
      {activeTab === "general" && (
        <div style={card}>

            {/* PROFILE HEADER */}
            <div style={profileHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    
                    <img
                    src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}`.replace(/([^:]\/)\/+/g, "$1") : "https://i.pravatar.cc/60"}
                    alt="avatar"
                    style={{ ...avatar, cursor: "pointer", transition: "transform 0.2s" }}
                    onClick={() => setShowFullImage(true)}
                    onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                    onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                    onError={(e) => { e.target.src = "https://i.pravatar.cc/60"; }}
                    />

                    <div>
                    <h3 style={name}>{user?.fullName}</h3>
                    <p style={roleText}>
                        {role === "student" ? "Student Account" : "Professional Account"}
                    </p>
                    </div>

                </div>
            </div>

                {/* INFO GRID */}
                <div style={infoGrid}>

                    <div>
                        <label style={label}>FIRST NAME</label>
                        <p style={value}>{firstName}</p>
                    </div>

                    <div>
                        <label style={label}>LAST NAME</label>
                        <p style={value}>{lastName}</p>
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                        <label style={label}>EMAIL ADDRESS</label>
                        <p style={value}>{user?.email}</p>
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                        <label style={label}>ROLE</label>
                        <p style={value}>
                        {role === "student" ? "Student" : "Professional"}
                        </p>
                    </div>

                    {/* EXTRA PROFILE INFO */}

                    {profile.gender && (
                    <div>
                        <label style={label}>GENDER</label>
                        <p style={value}>{profile.gender}</p>
                    </div>
                    )}

                    {profile.contact && (
                    <div>
                        <label style={label}>CONTACT</label>
                        <p style={value}>{profile.contact}</p>
                    </div>
                    )}

                    {profile.location && (
                    <div>
                        <label style={label}>LOCATION</label>
                        <p style={value}>{profile.location}</p>
                    </div>
                    )}

                    {profile.nickname && (
                    <div>
                        <label style={label}>NICKNAME</label>
                        <p style={value}>{profile.nickname}</p>
                    </div>
                    )}

                </div>

        </div>
        )}

      {/*  ACCOUNT TAB  */}
      {activeTab === "account" && (
        <div style={card}>

            <h3 style={{ marginBottom: "20px" }}>Edit Account Information</h3>

            {/* AVATAR UPLOAD SECTION */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", padding: "15px", background: "#f8f9fa", borderRadius: "12px" }}>
                <div style={{ position: "relative", cursor: "pointer" }} onClick={handleAvatarClick}>
                    <img 
                        src={avatarPreview || (user?.profilePicture ? `http://localhost:5000${user.profilePicture}`.replace(/([^:]\/)\/+/g, "$1") : "https://i.pravatar.cc/60")} 
                        alt="Preview" 
                        style={{ ...avatar, width: "80px", height: "80px", border: "3px solid #6c5ce7", objectFit: "cover" }} 
                        onError={(e) => { e.target.src = "https://i.pravatar.cc/60"; }}
                    />
                    <div style={{ position: "absolute", bottom: 0, right: 0, background: "#6c5ce7", color: "white", borderRadius: "50%", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "12px" }}>✎</span>
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    style={{ display: "none" }} 
                />
                <div>
                    <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600" }}>Profile Picture</p>
                    <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#666" }}>Upload your profile picture</p>
                    {selectedFile && (
                        <button 
                            onClick={handleAvatarUpload}
                            style={{ ...saveBtn, padding: "8px 16px", fontSize: "12px" }}
                        >
                            Upload New Picture
                        </button>
                    )}
                </div>
            </div>

            <div style={form}>

                {/* READ ONLY */}
                <div>
                    <label style={label}>FIRST NAME</label>
                    <input value={firstName} readOnly style={input} />
                </div>

                <div>
                    <label style={label}>LAST NAME</label>
                    <input value={lastName} readOnly style={input} />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                    <label style={label}>EMAIL ADDRESS</label>
                    <input value={user?.email} readOnly style={input} />
                </div>

                {/* EDITABLE */}
                <div style={{ zIndex: 10 }}>
                    <label style={label}>GENDER</label>
                    <CustomDropdown
                        value={profile.gender}
                        onChange={(val) => setProfile({...profile, gender: val})}
                        options={[
                            { label: "Male", value: "Male" },
                            { label: "Female", value: "Female" },
                            { label: "Other", value: "Other" }
                        ]}
                        placeholder="Select Gender"
                        containerStyle={{...input}}
                        width="100%"
                    />
                </div>

                <div>
                    <label style={label}>CONTACT</label>
                    <input
                        name="contact"
                        value={profile.contact || ""}
                        onChange={(e) => {
                            const value = e.target.value;

                            if (/^\d*$/.test(value)) { //allow only numbers
                            setProfile({
                                ...profile,
                                contact: value
                            });
                            }
                        }}
                        maxLength={10}
                        style={input}
                    />
                </div>

                <div>
                    <label style={label}>LOCATION</label>
                    <input
                    name="location"
                    value={profile.location || ""}
                    onChange={handleChange}
                    style={input}
                    />
                </div>

                <div>
                    <label style={label}>NICKNAME</label>
                    <input
                    name="nickname"
                    value={profile.nickname || ""}
                    inputMode="numeric"
                    onChange={handleChange}
                    style={input}
                    />
                </div>

            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "25px" }}>
                <button style={saveBtn} onClick={handleSave}>
                    Save Changes
                </button>
            </div>

        </div>
        )}

      {/*  APPEARANCE TAB  */}
      {activeTab === "appearance" && (
        <div style={card}>
          <h3 style={{ marginBottom: "10px", marginTop: "0" }}>Appearance</h3>
          <p style={{ color: "#888", marginBottom: "30px", fontSize: "14px" }}>Customize your entire workspace UI.</p>

          <div style={settingRow}>
            <div>
              <span style={settingLabel}><FaMoon style={{ marginRight: '8px', color: '#6c5ce7', verticalAlign: 'middle' }}/>Dark Mode</span>
            </div>
            <div className="qs-toggle-wrap">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={(e) => setIsDarkMode(e.target.checked)}
              />
              <div className="qs-slider"></div>
            </div>
          </div>

          <div style={{ marginTop: "40px" }}>
            <span style={settingLabel}><FaPalette style={{ marginRight: '8px', color: '#6c5ce7', verticalAlign: 'middle' }}/>Pastel Page Theme</span>
            
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "16px" }}>
              {[
                { id: "purple", color: "#f3f0ff" },      // Default subtle purple
                { id: "green", color: "#f0fdf4" },       // Mint green
                { id: "blue", color: "#f0f9ff" },        // Sky blue
                { id: "pink", color: "#fdf2f8" },        // Soft pink
                { id: "yellow", color: "#fffbeb" },      // Pale yellow
                { id: "brown", color: "#faf5eb" },       // Soft sand/brown
                { id: "sage", color: "#eef3ed" },        // Earthy sage green
                { id: "teal", color: "#f0fbfa" },        // Soft teal/ocean
                { id: "slate", color: "#f1f5f9" },       // Slate/dusty blue
                { id: "peach", color: "#fdf2ed" }        // Earthy peach/terracotta
              ].map(theme => (
                <div 
                  key={theme.id}
                  onClick={() => setPageColor(theme.color)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: theme.color,
                    cursor: "pointer",
                    border: pageColor === theme.color ? "3px solid #6c5ce7" : "1px solid #e2e8f0",
                    transition: "transform 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/*  CROPPER MODAL  */}
      {showCropper && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ margin: "0 0 10px 0" }}>Adjust Profile Picture</h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#666" }}>Drag and zoom to perfectly fit the circle</p>
            
            <div style={cropperContainer}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div style={controls}>
              <div style={sliderContainer}>
                <span style={{ fontSize: "12px", color: "#666" }}>Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={slider}
                />
              </div>
              <div style={modalActions}>
                <button style={cancelBtn} onClick={() => setShowCropper(false)}>Cancel</button>
                <button style={saveBtn} onClick={handleCropConfirm}>Confirm Crop</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/*  FULL SCREEN IMAGE VIEWER  */}
      {showFullImage && (
        <div style={viewerOverlay} onClick={() => setShowFullImage(false)}>
          <div style={viewerContent} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setShowFullImage(false)}>×</button>
            <img 
              src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}`.replace(/([^:]\/)\/+/g, "$1") : "https://i.pravatar.cc/60"}
              alt="Full View"
              style={fullImg}
              onError={(e) => { e.target.src = "https://i.pravatar.cc/60"; }}
            />
            <div style={viewerFooter}>
                <p style={{ margin: 0, fontWeight: "600" }}>{user?.fullName}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Profile Picture</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


/*  STYLES  */

const container = {
  padding: "30px",
  background: "transparent",
  minHeight: "100vh"
};

const subtitle = {
  color: "#6b7280",
  fontSize: "14px",
  marginBottom: "20px",
  marginTop: 0
};

/*  TABS  */

const tabs = {
  display: "flex",
  gap: "25px",
  marginBottom: "25px",
  borderBottom: "1px solid #e5e7eb"
};

const tabBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  paddingBottom: "10px",
  fontWeight: "500"
};

/*  CARD  */

const card = {
  background: "#ffffff",
  padding: "30px",
  borderRadius: "18px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.04)"
};


/*  PROFILE HEADER  */

const profileHeader = {
  borderBottom: "1px solid #f0f0f0",
  paddingBottom: "15px",
  marginBottom: "20px"
};

const avatar = {
  width: "55px",
  height: "55px",
  borderRadius: "50%"
};

const name = {
  margin: 0,
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827"
};

const roleText = {
  margin: 0,
  fontSize: "12px",
  color: "#9ca3af"
};

/*  INFO GRID  */

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "25px"
};

const label = {
  fontSize: "12px",
  color: "#64748b",
  letterSpacing: "0.6px",
  marginBottom: "8px",
  display: "block",
  fontWeight: "600",
  textTransform: "uppercase"
};

const value = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#111827"
};

/*  FORM (FOR ACCOUNT TAB LATER)  */

const form = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px"
};

const saveBtn = {
  padding: "12px 22px",
  background: "linear-gradient(135deg, #6c5ce7, #7f6df2)",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
  boxShadow: "0 4px 12px rgba(108,92,231,0.3)"
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  marginTop: "6px",
  background: "#f9fafb",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
  transition: "all 0.2s ease"
};

/*  APPEARANCE  */

const settingRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  background: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #f1f5f9"
};

const settingLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1e293b",
};

/*  MODAL & CROPPER STYLES  */

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 3000,
  backdropFilter: "blur(10px)"
};

const modalContent = {
  background: "#fff",
  padding: "32px",
  borderRadius: "32px",
  width: "90%",
  maxWidth: "460px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.45)",
  animation: "modalFadeIn 0.3s ease-out"
};

const cropperContainer = {
  position: "relative",
  width: "100%",
  height: "340px",
  background: "#000",
  borderRadius: "20px",
  overflow: "hidden",
  marginBottom: "24px"
};

const controls = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const sliderContainer = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  padding: "0 8px"
};

const slider = {
  flex: 1,
  height: "6px",
  background: "#6c5ce7",
  borderRadius: "10px",
  cursor: "pointer",
  outline: "none"
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "16px",
  marginTop: "8px"
};

const cancelBtn = {
  padding: "14px 28px",
  background: "#f1f5f9",
  color: "#64748b",
  border: "none",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "background 0.2s"
};
/*  IMAGE VIEWER STYLES  */

const viewerOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4000,
    backdropFilter: "blur(10px)",
    animation: "fadeIn 0.3s ease"
};

const viewerContent = {
    position: "relative",
    background: "#fff",
    borderRadius: "24px",
    padding: "20px",
    maxWidth: "500px",
    width: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    animation: "zoomIn 0.3s ease"
};

const fullImg = {
    width: "100%",
    aspectRatio: "1/1",
    objectFit: "cover",
    borderRadius: "16px",
    marginBottom: "15px"
};

const viewerFooter = {
    textAlign: "center",
    width: "100%"
};

const closeBtn = {
    position: "absolute",
    top: "-45px",
    right: "-10px",
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "32px",
    cursor: "pointer",
    padding: "5px",
    lineHeight: 1
};

export default Settings;
