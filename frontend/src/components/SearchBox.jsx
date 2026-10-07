import React, { useState, useEffect, useRef } from 'react';

const SearchBox = ({ onSelectLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef(null);
  const geocodeCache = useRef({});

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search with caching and cancellation
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const cacheKey = query.toLowerCase();
    if (geocodeCache.current[cacheKey]) {
      setSuggestions(geocodeCache.current[cacheKey]);
      setShowDropdown(true);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          { signal: controller.signal }
        );
        const data = await response.json();
        
        geocodeCache.current[cacheKey] = data || [];
        setSuggestions(data || []);
        setShowDropdown(true);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Geocoding error:', err);
          setSuggestions([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSelect = (place) => {
    const parsedLat = parseFloat(place.lat);
    const parsedLon = parseFloat(place.lon);

    if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
      onSelectLocation({ lat: parsedLat, lon: parsedLon });
      setSearchQuery(place.display_name);
      setShowDropdown(false);
    }
  };

  // Handle Enter submit via form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select the top match if suggestions exist
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  return (
    <div ref={searchRef} className="relative mb-4">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            placeholder="Type city, address, or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 3 && setShowDropdown(true)}
            className="w-full p-2.5 pl-9 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {/* Search Icon */}
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Loading Spinner */}
          {isSearching && (
            <div className="absolute right-3 top-3">
              <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelect(item)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer border-b last:border-none border-gray-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{item.display_name}</span>
              </div>
            ))
          ) : (
            !isSearching && (
              <div className="px-4 py-3 text-xs text-gray-500 text-center">
                No matching locations found
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;

