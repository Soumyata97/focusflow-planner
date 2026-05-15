import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./Navbar";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          _id: "1",
          message: "Task deadline reminder",
          isRead: false,
          type: "task",
          createdAt: "2025-01-01T10:00:00Z",
        },
      ],
    })
  ),
  put: jest.fn(() =>
    Promise.resolve({
      data: {},
    })
  ),
}));

describe("JEST_08 - Notification Popup Rendering", () => {
  test("Notification popup should appear correctly", async () => {
    localStorage.setItem("role", "student");
    localStorage.setItem("token", "mock-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        fullName: "Test User",
      })
    );

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Click notification bell
    const bellIcon = document.querySelector(
  '[style*="background: rgb(243, 240, 255)"]'
);

fireEvent.click(bellIcon);

    // Notification popup title should appear
    const popupElement = await screen.findByText(/mark all as read/i);

    expect(popupElement).toBeInTheDocument();
  });
});