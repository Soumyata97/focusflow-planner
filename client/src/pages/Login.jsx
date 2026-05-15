import React, { useState, useEffect as useAutofillFix } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // REDIRECT IF ALREADY LOGGED IN
  useAutofillFix(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      if (!role || role === "null") {
        navigate("/welcome", { replace: true });
      } else {
        navigate(`/${role}/dashboard`, { replace: true });
      }
    }
  }, [navigate]);


  useAutofillFix(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("login_email");
      if (el && el.value && !el.value.includes("@")) {
        setEmail("");
      }
    }, 800); // wait for browser autofill to settle
    return () => clearTimeout(timer);
  }, []); 

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Google login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("roleType", data.user.roleType || "user");

      toast.success("Login successful!!");

      const roleType = data.user.roleType || "user";
      if (roleType === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (!data.user.role) {
        navigate("/welcome", { replace: true });
      } else if (data.user.role === "student") {
        navigate("/student/dashboard", { replace: true });
      } else {
        navigate("/professional/dashboard", { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        toast.error(data.message || "Login failed");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      //save user data
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("roleType", data.user.roleType || "user");

      // GET ROLE FROM BACKEND
      const role = data.user.role;
      const roleType = data.user.roleType || "user";

      //SAVE ROLE
      localStorage.setItem("role", role);

      toast.success("Login successful!!");

      // REDIRECT BASED ON ROLE TYPE
      if (roleType === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (!role) {
        navigate("/welcome", { replace: true }); // onboarding start
      } else if (role === "student") {
        navigate("/student/dashboard", { replace: true });
      } else {
        navigate("/professional/dashboard", { replace: true });
      }
    } catch (error) {
      setMessage("Server error");
    }
  };

  const iconStyle = { color: "#6c5ce7", fontSize: "16px" };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Logo + App Name */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 className="auth-app-name">FocusFlow Planner</h2>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            Plan better. Focus deeper.
          </p>
        </div>

        <h2 className="auth-title">Welcome back </h2>

        <form onSubmit={handleSubmit} autoComplete="on">



          {/* Email Input with Icon */}
          <label className="auth-label">Email</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <FaEnvelope style={iconStyle} />
            </span>

            <input
              className="auth-input"
              type="email"
              name="email"
              id="login_email"
              autoComplete="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <label className="auth-label">Password</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <FaLock style={iconStyle} />
            </span>

            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              autoComplete="current-password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              onInvalid={(e) => e.target.setCustomValidity("please input the password")}
              onInput={(e) => e.target.setCustomValidity("")}
            />
            
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#9ca3af" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Forgot Password Link */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            <span 
              onClick={() => {
                if (!email.includes("@")) {
                  toast.error("Please enter a valid Gmail address first.");
                  return;
                }
                navigate("/forgot-password", { state: { email } });
              }} 
              style={{ color: "#6c5ce7", cursor: "pointer", textDecoration: "none", fontWeight: "600" }}
            >
              Forgot password?
            </span>
          </div>

          <button className="auth-button" type="submit">
            Login
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "12px", textAlign: "center" }}>
            {message}
          </p>
        )}

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "20px 0",
            fontSize: "13px",
            color: "#9ca3af",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ margin: "0 10px" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        {/* Google Login Button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google Login Failed")}
            useOneTap
            width="100%"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <div className="auth-link">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;

