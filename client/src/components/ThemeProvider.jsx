import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [pageColor, setPageColor] = useState(() => {
    return localStorage.getItem('pageColor') || '#f3f0ff';
  });

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('pageColor', pageColor);
  }, [pageColor]);

  const value = {
    isDarkMode,
    setIsDarkMode,
    pageColor,
    setPageColor
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
