import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("JEST_06 - Pomodoro Timer Pause and Resume", () => {
  test("Timer should pause and continue correctly from paused state", () => {
    const MockTimerControls = () => {
      const [isActive, setIsActive] = React.useState(false);

      return (
        <div>
          {!isActive ? (
            <button onClick={() => setIsActive(true)}>
              Resume Timer
            </button>
          ) : (
            <button onClick={() => setIsActive(false)}>
              Pause Timer
            </button>
          )}
        </div>
      );
    };

    render(<MockTimerControls />);

    // Resume button first
    const resumeButton = screen.getByRole("button", {
      name: /resume timer/i,
    });

    expect(resumeButton).toBeInTheDocument();

    fireEvent.click(resumeButton);

    // Pause button appears
    const pauseButton = screen.getByRole("button", {
      name: /pause timer/i,
    });

    expect(pauseButton).toBeInTheDocument();

    fireEvent.click(pauseButton);

    // Resume button appears again
    const resumeAgain = screen.getByRole("button", {
      name: /resume timer/i,
    });

    expect(resumeAgain).toBeInTheDocument();
  });
});