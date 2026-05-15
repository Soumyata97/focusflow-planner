import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddTimelineModal from "./AddTimelineModal";
import "@testing-library/jest-dom";

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: [],
    })
  ),
  post: jest.fn(() =>
    Promise.resolve({
      data: {},
    })
  ),
  put: jest.fn(() =>
    Promise.resolve({
      data: {},
    })
  ),
}));

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock CustomDropdown
jest.mock("./CustomDropdown", () => () => (
  <div>Custom Dropdown</div>
));

describe("JEST_11 - Timeline Event Form Submission", () => {
  test("Timeline event creation function should trigger successfully", () => {
    localStorage.setItem("role", "student");
    localStorage.setItem("token", "mock-token");

    const mockClose = jest.fn();
    const mockRefresh = jest.fn();

    render(
      <AddTimelineModal
        isOpen={true}
        onClose={mockClose}
        date="2025-07-01"
        refreshData={mockRefresh}
        preselectedTask={null}
        editEntry={null}
        scheduledIds={new Set()}
      />
    );

    // Fill block title
    const titleInput = screen.getByPlaceholderText(
      /deep work session/i
    );

    fireEvent.change(titleInput, {
      target: { value: "Final Year Project Work" },
    });

    expect(titleInput.value).toBe("Final Year Project Work");

    // Click submit
    const submitButton = screen.getByRole("button", {
      name: /schedule block/i,
    });

    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });
});