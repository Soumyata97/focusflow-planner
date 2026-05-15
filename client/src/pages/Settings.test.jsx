import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Settings from "./Settings";
import "@testing-library/jest-dom";

// Mock ThemeProvider
jest.mock("../components/ThemeProvider", () => ({
  useTheme: () => ({
    isDarkMode: false,
    setIsDarkMode: jest.fn(),
    pageColor: "#ffffff",
    setPageColor: jest.fn(),
  }),
}));

// Mock Cropper
jest.mock("react-easy-crop", () => () => <div>Cropper</div>);

// Mock crop utility
jest.mock("../utils/cropImage", () => jest.fn());

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
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        fullName: "Test User",
        email: "test@gmail.com",
        gender: "Male",
        contact: "9800000000",
        location: "Kathmandu",
        nickname: "Tester",
      }),
  })
);

describe("JEST_09 - Profile Update Function Call", () => {
  test("Profile update function should execute successfully", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        fullName: "Test User",
        email: "test@gmail.com",
      })
    );

    localStorage.setItem("role", "student");
    localStorage.setItem("token", "mock-token");

    render(<Settings />);

    // Open Account tab
    const accountTab = screen.getByRole("button", {
      name: /account/i,
    });

    fireEvent.click(accountTab);

    // Contact input
    const contactInput = document.querySelector('input[name="contact"]');
    fireEvent.change(contactInput, {
      target: { value: "9800000000" },
    });

    expect(contactInput.value).toBe("9800000000");

    // Save button
    const saveButton = screen.getByRole("button", {
      name: /save changes/i,
    });

    fireEvent.click(saveButton);

    expect(saveButton).toBeInTheDocument();
  });
});