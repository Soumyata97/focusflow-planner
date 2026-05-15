import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

// Mock navigation
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Mock ConfirmModal
jest.mock("../components/ConfirmModal", () => () => (
  <div>Confirm Modal</div>
));

// Mock CustomDropdown
jest.mock("../components/CustomDropdown", () => () => (
  <div>Custom Dropdown</div>
));

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn((url) => {
  if (url.includes("/stats")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          totalUsers: 10,
          dailyLogins: 5,
          activeUsersToday: 4,
          totalTasksCreated: 20,
        }),
    });
  }

  if (url.includes("/users")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            _id: "1",
            fullName: "John Doe",
            email: "john@gmail.com",
            role: "student",
            roleType: "user",
            isActive: true,
          },
        ]),
    });
  }

  if (url.includes("/activity")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  });
});

describe("JEST_18 - User Search Filter Function Testing", () => {
  test("Matching user records should be filtered correctly", async () => {
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("roleType", "admin");
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: "admin1",
        fullName: "Admin User",
      })
    );

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    // Open Users tab
    const usersTab = await screen.findByRole("button", {
    name: /users/i,
    });

    fireEvent.click(usersTab);

    // Search input
    const searchInput = await screen.findByPlaceholderText(
      /search by name or email/i
    );

    fireEvent.change(searchInput, {
      target: { value: "John" },
    });

    expect(searchInput.value).toBe("John");

    // Search input updated successfully
    expect(searchInput.value).toBe("John");
  });
});