import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "./Signup";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

// Mock Google Login
jest.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <div>Google Signup Button</div>,
}));

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("JEST_02 - Registration Form Validation", () => {
  test("Validation errors should appear for required fields", async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole("button", {
      name: /verify gmail & continue/i,
    });

    // Click submit without filling fields
    await userEvent.click(submitButton);

    // Required fields should exist
    const fullNameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/yourname@gmail.com/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/repeat password/i);

    expect(fullNameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });
});