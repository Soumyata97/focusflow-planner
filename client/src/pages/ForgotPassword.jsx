import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import "../styles/auth.css";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we came from the Login page with an email, pre-fill it!
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent to your Gmail!! ");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP Verified!!");
        setStep(3);
      } else {
        toast.error(data.message || "Invalid or expired OTP");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Congratulations! Password reset successful!!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = { color: "#6c5ce7", fontSize: "16px" };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "32px", color: "#6c5ce7", marginBottom: "8px" }}>
            <FaShieldAlt />
          </div>
          <h3 style={{ margin: "6px 0 0 0" }}>FocusFlow Security</h3>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            Securely recover your account
          </p>
        </div>

        <Link to="/login" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6c5ce7", textDecoration: "none", fontSize: "13px", marginBottom: "20px", fontWeight: "500" }}>
          <FaArrowLeft size={12} /> Back to Login
        </Link>

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <>
            <h2 className="auth-title">Verify your Email</h2>
            <p className="auth-subtitle">
              {email && email.includes("@") ? (
                <>We will send a 6-digit recovery code to your Gmail: <br/> <b>{email}</b></>
              ) : (
                "Please enter your registered Gmail address below to receive a security code."
              )}
            </p>
            <form onSubmit={handleSendOTP}>
              {(!email || !email.includes("@")) && (
                <>
                  <label className="auth-label">Gmail Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><FaEnvelope style={iconStyle} /></span>
                    <input 
                      className="auth-input" 
                      type="email" 
                      name="email"
                      id="forgot_email"
                      autoComplete="email"
                      placeholder="name@gmail.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </>
              )}
              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <>
            <h2 className="auth-title">Check your Email</h2>
            <p className="auth-subtitle">We sent a 6-digit code to <b>{email}</b>. Please enter it below.</p>
            <form onSubmit={handleVerifyOTP}>
              <label className="auth-label">Recovery Code</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaKey style={iconStyle} /></span>
                <input 
                  className="auth-input" 
                  type="text" 
                  maxLength="6"
                  placeholder="000000" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                  style={{ letterSpacing: "8px", fontWeight: "bold", textAlign: "center", paddingLeft: "14px" }}
                />
              </div>
              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <p style={{ textAlign: "center", fontSize: "12px", marginTop: "15px", color: "#9ca3af" }}>
                Didn't get a code? <span style={{ color: "#6c5ce7", cursor: "pointer" }} onClick={handleSendOTP}>Resend</span>
              </p>
            </form>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <h2 className="auth-title">Set New Password</h2>
            <p className="auth-subtitle">Your recovery was successful. Please choose a strong new password.</p>
            <form onSubmit={handleResetPassword}>
              <label className="auth-label">New Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaLock style={iconStyle} /></span>
                <input 
                  className="auth-input" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#9ca3af" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <label className="auth-label">Confirm New Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaCheckCircle style={iconStyle} /></span>
                <input 
                  className="auth-input" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
                <span 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#9ca3af" }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
