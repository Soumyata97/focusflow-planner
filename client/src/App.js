import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WelcomeOnboard from "./pages/WelcomeOnboard";
import PortalSelection from "./pages/PortalSelection";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import Settings from "./pages/Settings";
import SubjectsProjects from "./pages/SubjectsProjects";
import TimelinePlanner from "./pages/TimelinePlanner";
import Pomodoro from "./pages/Pomodoro";
import RoutinesPage from "./pages/RoutinesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";

import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const googleClientId = "668606206888-gemlqll23ht9fkscmra4n76q75q0pk9d.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
      <Router>
      <Routes>

        {/* AUTH ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/welcome" element={<WelcomeOnboard />} />
        <Route path="/portal-selection" element={<PortalSelection />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        
        {/* STUDENT ROUTES */}

        <Route
          path="/student/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/student/tasks"
          element={
            <Layout>
              <TasksPage />
            </Layout>
          }
        />

        <Route
          path="/student/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />

        <Route
          path="/student/projects"
          element={
            <Layout>
              <SubjectsProjects />
            </Layout>
          }
        />

        <Route
          path="/student/timeline"
          element={
            <Layout>
              <TimelinePlanner />
            </Layout>
          }
        />

        <Route
          path="/student/pomodoro"
          element={
            <Layout>
              <Pomodoro />
            </Layout>
          }
        />

        <Route
          path="/student/routines"
          element={
            <Layout>
              <RoutinesPage />
            </Layout>
          }
        />

        <Route
          path="/student/analytics"
          element={
            <Layout>
              <AnalyticsPage />
            </Layout>
          }
        />



        {/* PROFESSIONAL ROUTES */}
     
        <Route
          path="/professional/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/professional/tasks"
          element={
            <Layout>
              <TasksPage />
            </Layout>
          }
        />

        <Route
          path="/professional/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />

        <Route
          path="/professional/projects"
          element={
            <Layout>
              <SubjectsProjects />
            </Layout>
          }
        />

        <Route
          path="/professional/timeline"
          element={
            <Layout>
              <TimelinePlanner />
            </Layout>
          }
        />

        <Route
          path="/professional/pomodoro"
          element={
            <Layout>
              <Pomodoro />
            </Layout>
          }
        />

        <Route
          path="/professional/routines"
          element={
            <Layout>
              <RoutinesPage />
            </Layout>
          }
        />

        <Route
          path="/professional/analytics"
          element={
            <Layout>
              <AnalyticsPage />
            </Layout>
          }
        />


        {/* ADMIN ROUTE */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

      </Routes>

      <ToastContainer position="top-right" autoClose={2000} icon={false} />
      </Router>
    </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;