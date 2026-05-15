import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaLock, FaSyncAlt, FaEye, FaEyeSlash, FaShieldAlt, FaKey } from "react-icons/fa";
import "../styles/auth.css";

//  constants 
const API = "http://localhost:5000/api/auth";
const RESEND_COOLDOWN = 60; // seconds

function Signup() {
  //  form state 
  const [fullName, setFullName]             = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //  OTP step state 
  const [step, setStep]         = useState("form");   // "form" | "otp"
  const [otp, setOtp]           = useState("");
  const [sending, setSending]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const navigate = useNavigate();

  // redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (token) {
      if (!role || role === "null") navigate("/welcome", { replace: true });
      else navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [navigate]);

  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown]);

  //  helpers 
  const isValidGmail = (addr) =>
    /^[a-zA-Z0-9._%+\-]+@gmail\.com$/.test(addr.trim());

  //  send OTP 
  const handleSendOTP = async (e) => {
    e.preventDefault();

    // client-side validation
    if (!isValidGmail(email)) {
      toast.error("Only Gmail addresses (@gmail.com) are accepted for registration.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSending(true);
    try {
      const res  = await fetch(`${API}/send-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Could not send verification code.");
        return;
      }
      toast.success("Verification code sent! Check your Gmail inbox.");
      setStep("otp");
      setCooldown(RESEND_COOLDOWN);
    } catch {
      toast.error("Server error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  //   verify OTP + create account 
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }

    setSubmitting(true);
    try {
      const res  = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:  fullName.trim(),
          email:     email.trim().toLowerCase(),
          password,
          otp:       otp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Registration failed.");
        return;
      }
      toast.success("Account created! Redirecting to login…", {
        position: "top-center",
        autoClose: 2500,
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      toast.error("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  //  resend OTP 
  const handleResend = async () => {
    if (cooldown > 0) return;
    setSending(true);
    try {
      const res  = await fetch(`${API}/send-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Could not resend code."); return; }
      toast.success("New verification code sent!");
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
    } catch {
      toast.error("Server error.");
    } finally {
      setSending(false);
    }
  };

  //  Google signup 
  const handleGoogleSuccess = async (response) => {
    try {
      const res  = await fetch(`${API}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Google signup failed."); return; }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      localStorage.setItem("role",  data.user.role || "");

      toast.success("Account registered via Google!");
      if (!data.user.role) navigate("/welcome",                { replace: true });
      else if (data.user.role === "student") navigate("/student/dashboard",       { replace: true });
      else navigate("/professional/dashboard", { replace: true });
    } catch {
      toast.error("Server error.");
    }
  };

  //  styles 
  const iconStyle = { color: "#6c5ce7", fontSize: "16px" };

  //  render 
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header" style={{ marginBottom: "30px" }}>
          <h1 className="auth-app-name">FocusFlow Planner</h1>
          <p className="auth-tagline">Plan better. Focus deeper.</p>
        </div>

        {/*  Registration Form  */}
        {step === "form" && (
          <>
            <h2 className="auth-title">Create your account</h2>

            <form onSubmit={handleSendOTP} autoComplete="on">
              {/* Full Name */}
              <label className="auth-label">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaUser style={iconStyle} /></span>
                <input
                  className="auth-input"
                  type="text"
                  name="name"
                  id="signup_fullName"
                  autoComplete="name"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Email — Gmail only */}
              <label className="auth-label">Gmail Address</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaEnvelope style={iconStyle} /></span>
                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  id="signup_email"
                  autoComplete="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => {
                    if (email && !isValidGmail(email)) {
                      toast.error("Only @gmail.com addresses are accepted.");
                    }
                  }}
                  required
                />
              </div>
              {/* inline Gmail hint */}
              <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "-10px", marginBottom: "12px", paddingLeft: "2px" }}>
                Only Gmail addresses are accepted (@gmail.com)
              </p>

              {/* Password */}
              <label className="auth-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaLock style={iconStyle} /></span>
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  name="new-password"
                  id="signup_password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#9ca3af" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Confirm Password */}
              <label className="auth-label">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaSyncAlt style={iconStyle} /></span>
                <input
                  className="auth-input"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm-new-password"
                  id="signup_confirmPassword"
                  autoComplete="new-password"
                  placeholder="Repeat password"
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
              {/* inline mismatch feedback */}
              {confirmPassword && password !== confirmPassword && (
                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "-8px", marginBottom: "8px", paddingLeft: "2px" }}>
                  Passwords do not match
                </p>
              )}

              <button
                className="auth-button"
                type="submit"
                style={{ marginTop: "14px", opacity: (password && confirmPassword && password !== confirmPassword) ? 0.5 : 1 }}
                disabled={sending || (password && confirmPassword && password !== confirmPassword)}
              >
                {sending ? "Sending code…" : "Verify Gmail & Continue"}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", margin: "20px 0", fontSize: "13px", color: "#9ca3af" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ margin: "0 10px" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

            {/* Google Signup */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Signup Failed")}
                width="100%"
                text="signup_with"
                shape="rectangular"
              />
            </div>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#6c5ce7", fontWeight: "600" }}>Login</Link>
            </p>
          </>
        )}

        {/*  OTP Verification ── */}
        {step === "otp" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "linear-gradient(135deg,#6c5ce7,#a29bfe)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <FaShieldAlt style={{ color: "#fff", fontSize: 22 }} />
              </div>
              <h2 className="auth-title" style={{ marginBottom: 6 }}>Check your Gmail</h2>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                We sent a 6-digit verification code to<br />
                <strong style={{ color: "#374151" }}>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyAndRegister} autoComplete="off">
              <label className="auth-label">Verification Code</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaKey style={iconStyle} /></span>
                <input
                  className="auth-input"
                  type="text"
                  id="signup_otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  autoFocus
                  style={{ letterSpacing: "8px", fontWeight: "bold", textAlign: "center", paddingLeft: "14px" }}
                />
              </div>

              <button className="auth-button" type="submit" style={{ marginTop: "6px" }} disabled={submitting}>
                {submitting ? "Creating account…" : "Create Account"}
              </button>
            </form>

            {/* Resend + back */}
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#6b7280" }}>
              Didn't receive it?{" "}
              <span
                onClick={handleResend}
                style={{
                  color: cooldown > 0 ? "#9ca3af" : "#6c5ce7",
                  fontWeight: 600,
                  cursor: cooldown > 0 ? "default" : "pointer",
                }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </span>
            </div>
            <div style={{ marginTop: 8, textAlign: "center", fontSize: 13 }}>
              <span
                onClick={() => { setStep("form"); setOtp(""); }}
                style={{ color: "#6c5ce7", fontWeight: 600, cursor: "pointer" }}
              >
                Back to form
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;
