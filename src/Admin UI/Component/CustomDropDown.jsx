// CustomDropdown.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Comp Css/CustomDropDown.css';

const CustomDropdown = ({ options, selectedValue, setSelectedValue, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div className="dropdown-container">
      <button
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="selected-label">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label: placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className="dropdown-option"
              onClick={() => {
                setSelectedValue(option.value);
                setIsOpen(false);
              }}
            >
              {option.icon}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
