import { useCallback, useRef, useState } from 'react';

function SearchBar({ onSearch, isSearching, wsConnected }) {
  const debounceRef = useRef(null);
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setValue(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(val);
      }, 300);
    },
    [onSearch]
  );

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="search-section" role="search" aria-label="Post search">
      <div className={`search-wrapper ${isSearching ? 'searching' : ''}`}>
        <span className="search-icon" aria-hidden="true">
          {isSearching ? (
            <span className="search-spinner" />
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </span>

        <input
          id="search-input"
          type="search"
          className="search-input"
          placeholder={wsConnected ? 'Search in real-time…' : 'Search posts…'}
          value={value}
          onChange={handleChange}
          autoComplete="off"
          spellCheck="false"
          aria-label="Search posts"
        />

        {value && (
          <button
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {wsConnected ? (
        <p className="search-hint">⚡ Real-time results via WebSocket</p>
      ) : (
        <p className="search-hint muted">🔄 WebSocket connecting — using local search</p>
      )}
    </div>
  );
}

export default SearchBar;
