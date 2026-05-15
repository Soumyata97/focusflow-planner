import React from "react";

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Confirm Action</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button style={styles.confirmBtn} onClick={() => { onConfirm(); onCancel(); }}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 2000
  },
  modal: {
    background: "white", borderRadius: "12px", padding: "24px",
    width: "100%", maxWidth: "350px", textAlign: "center",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
  },
  title: { fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "12px", marginTop: 0 },
  message: { fontSize: "0.95rem", color: "#4b5563", marginBottom: "24px", marginTop: 0 },
  actions: { display: "flex", gap: "12px", justifyContent: "center" },
  cancelBtn: { padding: "8px 16px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" },
  confirmBtn: { padding: "8px 16px", background: "#6c5ce7", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }
};

export default ConfirmModal;
