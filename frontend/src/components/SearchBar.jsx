import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import '../styles/components.css';

export default function SearchBar({ value, onChange, onSearch, placeholder }) {
  const [localValue, setLocalValue] = useState(value || '');
  const isTypingRef = useRef(false);
  const debounceRef = useRef(null);

  // Sync external value changes without triggering debounce
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(value || '');
    }
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    isTypingRef.current = true;
    setLocalValue(val);

    if (onChange) {
      onChange(val);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      isTypingRef.current = false;
      if (onSearch) {
        onSearch(val);
      }
    }, 350);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      isTypingRef.current = false;
      if (onSearch) {
        onSearch(localValue);
      }
    }
  };

  const handleClear = () => {
    isTypingRef.current = false;
    setLocalValue('');
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (onChange) {
      onChange('');
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="search-bar">
      <Search size={18} className="search-bar-icon" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Search...'}
        className="search-bar-input"
      />
      {localValue && (
        <button
          className="search-bar-clear"
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
