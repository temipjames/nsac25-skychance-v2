import React from 'react';

// Helper functions mapping scientific values to human-centered impact descriptions
const getTemperatureContext = (val) => {
  if (val < 25) return 'Comfortable (Mild outdoor conditions)';
  if (val < 30) return 'Warm (Sweating during moderate activity)';
  if (val < 35) return 'Uncomfortable heat (Heat exhaustion risk)';
  return 'Extreme heat (Hazardous outdoor conditions)';
};

const getPrecipitationContext = (val) => {
  if (val < 2) return 'Light drizzle (Usually fine)';
  if (val < 5) return 'Noticeable rain (Umbrella needed)';
  if (val < 10) return 'Steady rain (Ruins outdoor events)';
  return 'Heavy downpour (Risk of localized flooding)';
};

const getWindSpeedContext = (val) => {
  if (val < 5) return 'Gentle breeze (Leaves rustle)';
  if (val < 10) return 'Brisk wind (Knocks over light items/umbrellas)';
  if (val < 15) return 'Strong wind (Tents & decorations blow over)';
  return 'Near gale (Hazardous for temporary structures)';
};

const getHumidityContext = (val) => {
  if (val < 50) return 'Dry (Comfortable air)';
  if (val < 70) return 'Slightly humid';
  if (val < 85) return 'Muggy & sticky air (Sweat cannot evaporate)';
  return 'Oppressive (Tropical humidity)';
};

const VARIABLE_CONFIGS = {
  humidity: {
    name: 'Humidity',
    unit: '%',
    min: 20,
    max: 100,
    step: 5,
    getContext: getHumidityContext
  },
  precipitation: {
    name: 'Precipitation',
    unit: 'mm/day',
    min: 0.5,
    max: 25,
    step: 0.5,
    getContext: getPrecipitationContext
  },
  temperature: {
    name: 'Temperature',
    unit: '°C',
    min: 15,
    max: 45,
    step: 1,
    getContext: getTemperatureContext
  },
  wind_speed: {
    name: 'Wind Speed',
    unit: 'm/s',
    min: 1,
    max: 25,
    step: 0.5,
    getContext: getWindSpeedContext
  }
};

const VariableSelector = ({
  variables,
  thresholds,
  onVariablesChange,
  onThresholdsChange
}) => {
  const handleVariableToggle = (varId) => {
    if (variables.includes(varId)) {
      onVariablesChange(variables.filter((v) => v !== varId));
    } else {
      onVariablesChange([...variables, varId]);
    }
  };

  const handleThresholdChange = (varId, value) => {
    onThresholdsChange({
      ...thresholds,
      [varId]: parseFloat(value) || 0
    });
  };

  return (
    <div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Your Comfort Levels
        </label>
        <p className="text-xs text-gray-500">
          Set your acceptable limits. The app calculates the probability of exceeding these numbers.
        </p>
      </div>

      <div className="space-y-3 mt-3">
        {Object.entries(VARIABLE_CONFIGS).map(([varId, config]) => {
          const isSelected = variables.includes(varId);
          const currentThreshold = thresholds[varId] ?? config.min;
          const contextLabel = config.getContext(currentThreshold);

          return (
            <div
              key={varId}
              className={`p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              {/* Checkbox Header */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleVariableToggle(varId)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="font-semibold text-sm text-gray-800">
                    {config.name}
                  </span>
                </label>

                {isSelected && (
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    &gt; {currentThreshold} {config.unit}
                  </span>
                )}
              </div>

              {/* Slider & Number Input (Visible when selected) */}
              {isSelected && (
                <div className="mt-3 pl-6 space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      value={currentThreshold}
                      onChange={(e) => handleThresholdChange(varId, e.target.value)}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        value={currentThreshold}
                        onChange={(e) => handleThresholdChange(varId, e.target.value)}
                        className="w-16 p-1 text-center text-xs border border-gray-300 rounded font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-gray-800"
                      />
                      <span className="text-xs text-gray-500 font-medium">
                        {config.unit}
                      </span>
                    </div>
                  </div>
                  
                  {/* Dynamic impact badges */}
                  <div>
                    <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <span className="text-gray-300">•</span>
                        <span>{contextLabel.label || contextLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VariableSelector;

