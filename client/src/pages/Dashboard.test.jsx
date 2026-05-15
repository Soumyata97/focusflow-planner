import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

// Mock child components
jest.mock("../components/StatsCards", () => () => (
  <div>Stats Cards Section</div>
));

jest.mock("../components/analytics/WeeklyFocusChart", () => () => (
  <div>Weekly Focus Chart</div>
));

jest.mock("../components/DashboardPlannerCards", () => () => (
  <div>Dashboard Planner Cards</div>
));

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("JEST_07 - Dashboard Component Rendering", () => {
  test("Dashboard cards, analytics section, and graphs should display correctly", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        fullName: "Test User",
      })
    );

    localStorage.setItem("role", "student");
    localStorage.setItem("token", "mock-token");

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Greeting
    expect(screen.getByText(/good morning/i)).toBeInTheDocument();

    // Dashboard cards
    expect(screen.getByText(/stats cards section/i)).toBeInTheDocument();

    // Planner cards
    expect(screen.getByText(/dashboard planner cards/i)).toBeInTheDocument();

    // Graph section
    expect(screen.getByText(/weekly focus chart/i)).toBeInTheDocument();

    // Quick actions
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });
});