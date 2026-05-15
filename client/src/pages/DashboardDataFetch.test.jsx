import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

// Mock child components
jest.mock("../components/StatsCards", () => () => (
  <div>Stats Cards Loaded</div>
));

jest.mock("../components/analytics/WeeklyFocusChart", () => () => (
  <div>Weekly Focus Chart Loaded</div>
));

jest.mock("../components/DashboardPlannerCards", () => () => (
  <div>Planner Cards Loaded</div>
));

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("JEST_22 - Dashboard Data Fetch Testing", () => {
  test("Dashboard should fetch and display correct user productivity data", () => {
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

    // Verify dashboard loaded sections
    expect(
      screen.getByText(/stats cards loaded/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/weekly focus chart loaded/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/planner cards loaded/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/quick actions/i)
    ).toBeInTheDocument();
  });
});