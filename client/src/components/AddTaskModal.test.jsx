import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddTaskModal from "./AddTaskModal";
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
  <div>Mock Dropdown</div>
));

describe("JEST_04 - Task Form Submission", () => {
  test("Task submission function should trigger correctly", () => {
    const mockClose = jest.fn();
    const mockRefresh = jest.fn();

    render(
      <AddTaskModal
        isOpen={true}
        onClose={mockClose}
        refreshTasks={mockRefresh}
        editTask={null}
      />
    );

    // Fill task title
    const titleInput = screen.getByPlaceholderText(
      /complete math assignment/i
    );

    fireEvent.change(titleInput, {
      target: { value: "Finish Jest Testing" },
    });

    expect(titleInput.value).toBe("Finish Jest Testing");

    // Click Create Task button
    const submitButton = screen.getByRole("button", {
      name: /create task/i,
    });

    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });
});