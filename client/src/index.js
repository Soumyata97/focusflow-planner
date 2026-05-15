import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

// Global axios interceptor to handle expired tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      // Redirect to login page
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
   <React.StrictMode>
    <App />
  </React.StrictMode>
);
