import { useState, useEffect, useRef } from "react";
import { searchSongs } from "../api";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── Debounced autocomplete ── */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchSongs(query);
        setSuggestions(data.results || []);
        setShowDropdown(true);
        setHighlighted(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  /* ── Keyboard navigation ── */
  function handleKeyDown(e) {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      if (highlighted >= 0 && suggestions[highlighted]) {
        selectSuggestion(suggestions[highlighted]);
      } else if (query.trim()) {
        submit(query);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  function selectSuggestion(item) {
    const name = item.track_name;
    setQuery(name);
    setShowDropdown(false);
    setSuggestions([]);
    onSearch(name);
  }

  function submit(value) {
    if (!value.trim()) return;
    setShowDropdown(false);
    onSearch(value.trim());
  }

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="search-input-row">
        <span className="search-icon">🎵</span>
        <input
          id="search-input"
          className="search-input"
          type="text"
          placeholder="Search a song ( Paris, All we know..)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label="Search songs"
        />
        {loading && <span className="spinner" />}
        <button
          id="search-btn"
          className="search-btn"
          onClick={() => submit(query)}
          aria-label="Get Recommendations"
        >
          Discover
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="dropdown" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={`${s.track_name}-${s.artist_name}-${i}`}
              className={`dropdown-item ${i === highlighted ? "active" : ""}`}
              onMouseDown={() => selectSuggestion(s)}
              role="option"
              aria-selected={i === highlighted}
            >
              {s.artwork_url ? (
                <img
                  src={s.artwork_url}
                  alt={s.track_name}
                  className="dropdown-thumb"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <span className="dropdown-thumb placeholder-thumb">🎵</span>
              )}
              <div className="dropdown-info">
                <span className="dropdown-track">{s.track_name}</span>
                <span className="dropdown-artist">{s.artist_name}</span>
              </div>
              {s.year && <span className="dropdown-year">{s.year}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
