import React from 'react';

const ResultsDisplay = ({ results }) => {
  if (!results) return null;

  const { probabilities } = results;

  // Calculate highest risk score for summary banner
  const probValues = Object.values(probabilities).map(d => d.probability || 0);
  const maxProbability = probValues.length > 0 ? Math.max(...probValues) : 0;

  let bannerConfig = {
    bg: 'bg-green-50 border-green-200 text-green-800',
    badge: 'bg-green-500',
    title: 'Low Risk of Adverse Weather',
    description: 'Based on 10 years of NASA satellite history, weather conditions are very likely to stay within your comfort levels on this date.'
  };

  if (maxProbability > 60) {
    bannerConfig = {
      bg: 'bg-red-50 border-red-200 text-red-800',
      badge: 'bg-red-500',
      title: 'High Risk of Bad Weather',
      description: 'Historical trends indicate a high chance that weather conditions will exceed your set comfort levels on this date.'
    };
  } else if (maxProbability > 30) {
    bannerConfig = {
      bg: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      badge: 'bg-yellow-500',
      title: 'Moderate Risk',
      description: 'There is a noticeable chance that weather conditions could exceed your comfort levels on this date. Keep a backup plan in mind.'
    };
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Dataset Verification and Cache Status Header */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-b pb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
            ✓ Verified NASA POWER Satellite Dataset
          </span>
          {/* {is_cached && (
            <span className="font-small text-blue-700 px-2 py-1 flex items-center gap-1">
              Loaded from Cache
            </span>
          )} */}
        </div>
        <span>10-Year Climatology (2014–2024)</span>
      </div>

      {/* Summary Banner */}
      <div className={`border rounded-lg p-4 ${bannerConfig.bg}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-3 h-3 rounded-full ${bannerConfig.badge}`}></span>
          <h3 className="font-bold text-lg">{bannerConfig.title}</h3>
        </div>
        <p className="text-sm opacity-90">{bannerConfig.description}</p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Detailed Breakdown</h2>

      {Object.entries(probabilities).map(([varType, data]) => (
        <div key={varType} className="mb-6 last:mb-0">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-semibold capitalize text-gray-800">
              {varType.replace('_', ' ')}
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Your Comfort Level: <strong className="text-gray-700">{data.threshold}{data.unit}</strong>
            </span>
          </div>

          {/* Risk Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-gray-600">Chance of Exceeding Comfort Level</span>
              <span className="text-gray-900 font-bold">{data.probability}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  data.probability > 60 ? 'bg-red-500' :
                  data.probability > 30 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.max(data.probability, 3)}%` }}
              ></div>
            </div>
          </div>

          {/* Context Metrics in Plain English */}
          <div className="grid grid-cols-2 gap-4 text-sm mt-3 bg-gray-50 p-3 rounded-md">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">10-Year Average</p>
              <p className="font-bold text-gray-800 text-base">{data.historicalMean}{data.unit}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Normal Conditions</p>
              <p className="font-bold text-gray-800 text-base">
                {data.historicalRange[0]} – {data.historicalRange[1]}{data.unit}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsDisplay;
