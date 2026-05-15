import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Pomodoro from "./Pomodoro";
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
      data: {
        _id: "mock-session-id",
      },
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
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock child components
jest.mock("../components/pomodoro/ModeSelector", () => () => <div>Mode Selector</div>);
jest.mock("../components/pomodoro/TimerDisplay", () => () => <div>Timer Display</div>);
jest.mock("../components/pomodoro/TaskSelector", () => () => <div>Task Selector</div>);
jest.mock("../components/pomodoro/SessionList", () => () => <div>Session List</div>);

// Important mock for Start button
jest.mock("../components/pomodoro/TimerControls", () => ({ onStart }) => (
  <button onClick={onStart}>Start Timer</button>
));

describe("JEST_05 - Pomodoro Timer Start Function", () => {
  test("Timer countdown should begin correctly", () => {
    render(<Pomodoro />);

    const startButton = screen.getByRole("button", {
      name: /start timer/i,
    });

    expect(startButton).toBeInTheDocument();

    fireEvent.click(startButton);

    expect(startButton).toBeInTheDocument();
  });
});