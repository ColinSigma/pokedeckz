import '../styles/components.css';

export default function FilterDropdown({ label, options, value, onChange, loading }) {
  return (
    <div className="filter-dropdown">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="filter-dropdown-select"
      >
        <option value="">
          {loading ? 'Loading...' : `All ${label}`}
        </option>
        {!loading &&
          options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
    </div>
  );
}
