import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import '../styles/components.css';

export default function CustomSelect({
  label,
  icon: Icon,
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  searchable = false,
  searchPlaceholder,
  isActive = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to safe primitive strings and numbers
  // Prevents objects (e.g. TCGdex set cardCount: { official, total }) from crashing React render!
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      const rawCount = opt.count ?? opt.cardCount;
      let countNum = undefined;
      if (typeof rawCount === 'number') {
        countNum = rawCount;
      } else if (typeof rawCount === 'object' && rawCount !== null) {
        countNum = rawCount.total ?? rawCount.official;
      }

      return {
        value: String(opt.value ?? opt.id ?? ''),
        label: String(opt.label ?? opt.name ?? ''),
        count: typeof countNum === 'number' ? countNum : undefined,
      };
    }
    return { value: String(opt), label: String(opt), count: undefined };
  });

  // Find currently selected option object
  const currentOption = normalizedOptions.find((o) => String(o.value) === String(value));
  const displayLabel = currentOption ? currentOption.label : placeholder;

  // Filter options if searchable
  const filteredOptions = searchable && searchFilter.trim()
    ? normalizedOptions.filter((o) =>
        String(o.label || '').toLowerCase().includes(searchFilter.toLowerCase().trim())
      )
    : normalizedOptions;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchFilter('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchFilter('');
    }
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchFilter('');
  };

  return (
    <div
      className={`custom-select-container ${isActive ? 'is-active' : ''} ${isOpen ? 'is-open' : ''}`}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button / Card */}
      <div
        className="custom-select-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="custom-select-header-row">
          <div className="custom-select-label">
            {Icon && <Icon size={14} className="custom-select-icon" />}
            <span>{label}</span>
          </div>
          {isActive && <span className="custom-select-active-dot" />}
        </div>

        <div className="custom-select-value-row">
          <span className="custom-select-value-text" title={displayLabel}>
            {displayLabel}
          </span>
          <ChevronDown
            size={16}
            className={`custom-select-chevron ${isOpen ? 'rotate' : ''}`}
          />
        </div>
      </div>

      {/* Floating Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div
          className="custom-select-popover"
          role="listbox"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {searchable && (
            <div className="custom-select-search-capsule-wrapper">
              <div className="custom-select-search-capsule">
                <Search size={14} className="search-capsule-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={searchPlaceholder || `Search ${label.toLowerCase()}...`}
                  className="custom-select-search-input"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchFilter && (
                  <button
                    type="button"
                    className="search-capsule-clear"
                    onClick={() => setSearchFilter('')}
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              {filteredOptions.length > 0 && (
                <div className="custom-select-match-count">
                  {filteredOptions.length} available
                </div>
              )}
            </div>
          )}

          <div className="custom-select-options-list">
            {filteredOptions.length === 0 ? (
              <div className="custom-select-no-results">No matches found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={String(opt.value)}
                    className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(opt.value);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="option-label">{opt.label}</span>
                    {typeof opt.count === 'number' && (
                      <span className="option-count">{opt.count} cards</span>
                    )}
                    {isSelected && (
                      <Check size={14} className="option-check-icon" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
