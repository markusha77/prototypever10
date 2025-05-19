import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options',
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedValues.includes(option)
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleSelect = (option: string) => {
    onChange([...selectedValues, option]);
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemove = (option: string) => {
    onChange(selectedValues.filter(value => value !== option));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex flex-wrap min-h-[38px] items-center p-1 border rounded-md cursor-text ${
          error
            ? 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500'
            : 'border-gray-300 focus-within:ring-indigo-500 focus-within:border-indigo-500'
        } focus-within:ring-1 focus-within:outline-none`}
        onClick={() => setIsOpen(true)}
      >
        {selectedValues.length === 0 && !isOpen && (
          <div className="px-2 py-1 text-gray-500">{placeholder}</div>
        )}
        
        {selectedValues.map(value => (
          <div
            key={value}
            className="flex items-center m-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm"
          >
            <span>{value}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(value);
              }}
              className="ml-1 focus:outline-none"
              aria-label={`Remove ${value}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {isOpen && (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow px-2 py-1 outline-none text-sm"
            placeholder="Type to search..."
          />
        )}
        
        <div className="ml-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown();
            }}
            className="p-1 focus:outline-none"
            aria-label="Toggle dropdown"
          >
            <ChevronDown size={18} className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {searchTerm ? 'No options found' : 'No options available'}
            </div>
          ) : (
            filteredOptions.map(option => (
              <div
                key={option}
                className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))
          )}
        </div>
      )}
      
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default MultiSelect;
