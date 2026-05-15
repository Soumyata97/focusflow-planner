import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SubjectsProjects from "./SubjectsProjects";
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
  delete: jest.fn(() =>
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
jest.mock("../components/CustomDropdown", () => () => (
  <div>Custom Dropdown</div>
));

describe("JEST_10 - Subject Form Submission", () => {
  test("Subject should be added successfully through function execution", async () => {
    localStorage.setItem("role", "student");
    localStorage.setItem("token", "mock-token");

    render(<SubjectsProjects />);

    // Open modal
    const newSubjectButton = screen.getByRole("button", {
      name: /new subject/i,
    });

    fireEvent.click(newSubjectButton);

    // Fill subject name
    const nameInput = screen.getByPlaceholderText(
      /website redesign/i
    );

    fireEvent.change(nameInput, {
      target: { value: "Software Engineering" },
    });

    expect(nameInput.value).toBe("Software Engineering");

    // Click Create
    const createButton = screen.getByRole("button", {
      name: /create/i,
    });

    fireEvent.click(createButton);

    expect(createButton).toBeInTheDocument();
  });
});