import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  icon, 
  placeholder = "Select Option",
  containerStyle = {},
  width = "auto",
  isSearchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      style={{ ...dateBtn, ...containerStyle, width }}
      onClick={() => setIsOpen(!isOpen)}
      ref={dropdownRef}
      tabIndex={0}
    >
      {icon}
      <span style={textStyle}>
        {options.find(o => o.value === value)?.label || placeholder}
      </span>
      <FaChevronDown style={{ ...iconStyle, transform: isOpen ? "rotate(180deg)" : "none" }} />

      {isOpen && (
        <div style={{ ...dropdownMenu, width: width === "auto" ? "100%" : width }} onClick={(e) => e.stopPropagation()}>
          {isSearchable && (
            <div style={searchContainer}>
              <FaSearch style={searchIcon} />
              <input 
                type="text" 
                placeholder="Search Options..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInput}
                autoFocus
              />
            </div>
          )}
          
          <div style={optionsList}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value}
                  style={{
                    ...dropdownMenuItem,
                    background: value === opt.value ? "#f8faff" : "transparent",
                    color: value === opt.value ? "#6c5ce7" : "#334155"
                  }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onChange(opt.value); 
                    setIsOpen(false); 
                    setSearchTerm("");
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div style={noResults}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const dateBtn = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 18px",
  background: "#fff",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
  border: "1px solid #eef2f6",
  color: "#475569",
  cursor: "pointer",
  position: "relative",
  minWidth: "160px",
  justifyContent: "space-between",
  transition: "all 0.2s ease",
  outline: "none"
};

const textStyle = {
  fontSize: "14px", 
  fontWeight: "600", 
  color: "#1e293b",
  flex: 1,
  textAlign: "left"
};

const iconStyle = {
  fontSize: "10px",
  color: "#94a3b8",
  transition: "transform 0.2s ease"
};

const dropdownMenu = {
  position: "absolute",
  top: "calc(100% + 10px)",
  left: "0",
  right: "0",
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  border: "1px solid #f1f5f9",
  padding: "8px",
  minWidth: "200px",
  zIndex: 10000,
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  maxHeight: "350px",
  overflowY: "auto",
};

const dropdownMenuItem = {
  padding: "12px 16px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const searchContainer = {
  display: "flex",
  alignItems: "center",
  padding: "10px 14px",
  borderBottom: "1px solid #f1f5f9",
  background: "#fdfdfd",
  position: "sticky",
  top: 0,
  zIndex: 2,
};

const searchIcon = {
  color: "#94a3b8",
  fontSize: "12px",
  marginRight: "10px",
};

const searchInput = {
  border: "none",
  outline: "none",
  width: "100%",
  fontSize: "13px",
  color: "#334155",
  background: "transparent",
};

const optionsList = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  maxHeight: "250px",
  overflowY: "auto",
  padding: "6px",
};

const noResults = {
  padding: "14px",
  color: "#94a3b8",
  fontSize: "13px",
  textAlign: "center",
  fontWeight: "500"
};

export default CustomDropdown;
