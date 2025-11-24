/**──────────────────────────────────────────────────────────────────────┐
│  🤖 VARIANT ROBOT - Simple Dropdown                                   │
│  /src/components/prebuilts/dropdown/simple/index.tsx                  │
│                                                                        │
│  Basic custom dropdown with text-only options.                        │
│  Replaces native <select> with better styling and control.            │
│                                                                        │
│  Usage:                                                                │
│  <Dropdown.simple                                                      │
│    options={[                                                          │
│      { value: 'draft', label: 'Draft' },                              │
│      { value: 'published', label: 'Published' },                      │
│    ]}                                                                  │
│    value="draft"                                                       │
│    onChange={(value) => handleChange(value)}                          │
│    placeholder="Select status"                                        │
│  />                                                                    │
└────────────────────────────────────────────────────────────────────────┘ */

'use client';

import { useState, useRef, useEffect } from 'react';

export interface SimpleDropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SimpleDropdownProps {
  options: SimpleDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Dropdown.simple - Basic text dropdown
 *
 * Features:
 * - Clean text-only options
 * - Keyboard accessible (Escape to close, Enter to select)
 * - Click outside to close
 * - Disabled state support
 * - Minimal, fast, clean
 *
 * TRUE VR: Most common dropdown use case
 */
export default function SimpleDropdown({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
}: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`vr-dropdown-simple ${disabled ? 'vr-dropdown-simple--disabled' : ''} ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Current selection button */}
      <button
        type="button"
        className="vr-dropdown-simple-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'vr-dropdown-simple-label' : 'vr-dropdown-simple-placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`vr-dropdown-simple-arrow ${isOpen ? 'vr-dropdown-simple-arrow--open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="vr-dropdown-simple-menu" role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                className={`vr-dropdown-simple-option ${isSelected ? 'vr-dropdown-simple-option--selected' : ''} ${option.disabled ? 'vr-dropdown-simple-option--disabled' : ''}`}
                onClick={() => !option.disabled && handleSelect(option.value)}
              >
                <span className="vr-dropdown-simple-option-label">{option.label}</span>
                {isSelected && (
                  <svg
                    className="vr-dropdown-simple-check"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M13.3333 4L6 11.3333L2.66667 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
