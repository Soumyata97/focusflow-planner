import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "./ThemeProvider";

const Layout = ({ children }) => {
  const { pageColor } = useTheme();

  return (
    <div style={shell(pageColor)}>
      <div style={sidebarCol}>
        <Sidebar />
      </div>

      {/* Right-side content column */}
      <div style={contentCol}>
        {/* Global top navbar — always at top, always shows right page title */}
        <Navbar />

        
        <div style={pageArea}>
          {children}
        </div>
      </div>
    </div>
  );
};

const shell = (pageColor) => ({
  display: "flex",
  width: "100%",
  height: "100vh",
  boxSizing: "border-box",
  overflow: "hidden",
  background: pageColor,
});

const sidebarCol = {
  width: "240px",
  flexShrink: 0,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  overflow: "hidden",
  zIndex: 10,
  background: "#f7f5ff",
  borderRight: "1px solid #eee",
};

const contentCol = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  boxSizing: "border-box",
  overflow: "hidden",
  minWidth: 0,
  maxWidth: "calc(100% - 240px)",
};

// scrolls independently
const pageArea = {
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  width: "100%",
  boxSizing: "border-box",
};

export default Layout;