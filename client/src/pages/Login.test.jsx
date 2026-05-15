import React from "react";
import { render, screen } from "@testing-library/react";
import Login from "./Login";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";





// Mock Google Login
jest.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <div>Google Login Button</div>,
}));

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("JEST_01 - Login Component Rendering", () => {
  test("Login form with email, password fields, and login button should render correctly", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Email input
    const emailInput = screen.getByPlaceholderText(/name@gmail.com/i);
    expect(emailInput).toBeInTheDocument();

    // Password input
    const passwordInput = screen.getByPlaceholderText(/\*{5,}/i);
    expect(passwordInput).toBeInTheDocument();

    // Login button
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });
});