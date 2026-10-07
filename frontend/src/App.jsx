import React, { useState, useEffect } from 'react';
import SearchBox from './components/SearchBox';
import Map from './components/Map';
import DateSelector from './components/DateSelector';
import VariableSelector from './components/VariableSelector';
import ResultsDisplay from './components/ResultsDisplay';
import ExportButton from './components/ExportButton';
import { queryWeatherData, checkHealth } from './api';

// Helper for local date string YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const [location, setLocation] = useState({ lat: 51.5, lon: -0.1 });
  const [date, setDate] = useState(getTodayString());
  
  // Default to analyzing all core weather variables
  const [variables, setVariables] = useState([
    'humidity',
    'precipitation',
    'temperature',
    'wind_speed'
  ]);

  // Updated Human-Centered Impact Baseline Defaults
  const [thresholds, setThresholds] = useState({
    humidity: 75,        // 75%: Muggy, sticky air that inhibits cooling
    precipitation: 5,   // 5 mm/day: Steady rain that ruins outdoor plans
    temperature: 32,   // 32°C: Uncomfortable heat / Heat exhaustion risk
    wind_speed: 8      // 8 m/s: Winds that blow away umbrellas & light setups
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const check = async () => {
      try {
        await checkHealth();
        setApiStatus('connected');
      } catch (err) {
        console.error("Backend health check failed:", err);
        setApiStatus('error');
      }
    };
    check();
  }, []);

  const handleQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await queryWeatherData(location, date, variables, thresholds);
      setResults(data);
    } catch (error) {
      console.error('Query failed:', error);
      setError(
        error.response?.data?.error ||
        'Unable to retrieve data from NASA POWER API. NASA services may be temporarily unavailable or there may be a network connection issue.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">SkyChance</h1>
          <p className="text-blue-200 mt-2">Find out the chance of weather conditions exceeding your comfort levels before planning outdoor events.</p>
          
          <div className="mt-3 flex items-center gap-2">
            {/* I can't decide on which pill style i like better... I'll use Option 2 for now */}
            {/* Option 1 */}
            {/* <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              apiStatus === 'connected' 
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40' 
                : apiStatus === 'error' 
                ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40' 
                : 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-emerald-400' : apiStatus === 'error' ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'
              }`} />
              {apiStatus === 'connected' ? 'System Online' : apiStatus === 'error' ? 'Connection Error' : 'Connecting...'}
            </div> */}
            {/* Option 2 */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              apiStatus === 'connected' ? 'bg-green-500/80' : apiStatus === 'error' ? 'bg-red-500/80' : 'bg-yellow-500/80 animate-pulse'
            }`}>
              {apiStatus === 'connected' ? '✓ System Online' : apiStatus === 'error' ? '✗ Connection Error' : 'Connecting...'}
            </div>
            <span className="bg-blue-950/60 text-blue-200 text-xs px-2.5 py-1.5 rounded-full border border-blue-800 font-medium">
              Powered by NASA
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h2 className="text-base font-bold text-gray-800 mb-3">How it works:</h2>
              
              {/* User Action Steps */}
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">•</span>
                  <span>Select the location for your outdoor event.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">•</span>
                  <span>Select the date you plan to have your outdoor event.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">•</span>
                  <span>Set the levels you consider comfortable for rain, heat, wind, or humidity.</span>
                </li>
              </ul>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  The app will calculate the chance that your comfort levels will be exceeded on your event date in your selected location.
                </p>
              </div>
            </div>


            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3 text-gray-800">Location</h2>
              <SearchBox onSelectLocation={setLocation} />
              <Map onLocationChange={setLocation} location={location} />
              <div className="mt-2 text-sm text-gray-600 flex justify-between items-center">
                <span>Selected: <strong>{location.lat.toFixed(3)}°</strong>, <strong>{location.lon.toFixed(3)}°</strong></span>
                <span className="text-xs text-gray-400">Click map to adjust pin</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <DateSelector date={date} onChange={setDate} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <VariableSelector
                variables={variables}
                thresholds={thresholds}
                onVariablesChange={setVariables}
                onThresholdsChange={setThresholds}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={handleQuery}
                disabled={loading || variables.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analysing NASA weather data...
                  </span>
                ) : 'Get Weather Results'}
              </button>

              {error && (
                <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-bold text-sm">Service Unavailable</p>
                      <p className="text-xs mt-1 text-amber-800">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleQuery}
                    className="ml-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-1.5 px-3 rounded transition flex-shrink-0"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div>
            {results ? (
              <div>
                <ResultsDisplay results={results} />
                <ExportButton results={results} location={location} date={date} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center text-gray-500 min-h-[300px]">
                <p className="text-center">Select location and variables, then click <strong>Analyze Weather Risk</strong> to see results.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-5 bg-blue-900 text-white p-6 shadow-lg">
        <div className="container flex flex-col items-end mx-auto">
          <h4 className="font-bold">Will It Rain On My Parade?</h4>
          <p className="text-blue-200 mt-2">NASA Space Apps Challenge</p>
          
        </div>
      </footer>
    </div>
  );
}

export default App;

