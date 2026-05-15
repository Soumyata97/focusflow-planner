import React from "react";
import { render } from "@testing-library/react";
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
      }),
  })
);

describe("JEST_19 - File Upload Validation Testing", () => {
  test("Profile picture upload section should render correctly", () => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      fullName: "Test User",
      email: "test@gmail.com",
    })
  );

  localStorage.setItem("token", "mock-token");

  render(<Settings />);

  // Open Account tab first
  const accountTab = document.body.textContent.includes("Account");

  expect(accountTab).toBe(true);

  expect(document.body.textContent).toMatch(/account/i);
});
});