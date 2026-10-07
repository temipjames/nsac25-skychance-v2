import React from 'react';

// Get today's date formatted as YYYY-MM-DD for local timezone
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format ordinal suffixes (1st, 2nd, 3rd, 7th, etc.)
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:  return 'st';
    case 2:  return 'nd';
    case 3:  return 'rd';
    default: return 'th';
  }
};

// Formatter function: "Wednesday, 7th October 2026"
const formatDateReadable = (dateString) => {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const daySuffix = getOrdinalSuffix(day);

  return `${weekday}, ${day}${daySuffix} ${monthName} ${year}`;
};

// Relative indicator helper ("Today", "Tomorrow", "In 5 days")
const getRelativeTag = (dateString) => {
  if (!dateString) return null;

  const [year, month, day] = dateString.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = selectedDate - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  return null;
};

const DateSelector = ({ date, onChange }) => {
  const todayStr = getTodayString();
  const formattedText = formatDateReadable(date);
  const relativeTag = getRelativeTag(date);

  const handleDateChange = (e) => {
    const selectedVal = e.target.value;
    // Prevent manual entry of dates before today
    if (selectedVal && selectedVal < todayStr) {
      onChange(todayStr);
    } else {
      onChange(selectedVal);
    }
  };

  return (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Target Date
        </label>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Native Date Input with Min Constraint */}
        <input
          type="date"
          value={date || todayStr}
          min={todayStr}
          onChange={handleDateChange}
          className="p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800"
        />

        {/* Formatted Readable Date Display */}
        {formattedText && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
            <svg
              className="w-4 h-4 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-900">
              {formattedText}
            </span>
            {relativeTag && (
              <span className="ml-1 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                {relativeTag}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateSelector;

