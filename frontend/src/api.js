import axios from 'axios';

// Dynamically use the hostname/IP of the machine serving the site (e.g., 192.168.x.x or 127.0.0.1)
const currentHost = window.location.hostname;
const API_BASE = process.env.REACT_APP_API_URL || `http://${currentHost}:5000/api`;

export const queryWeatherData = async (location, date, variables, thresholds, useNASA = true) => {
  const response = await axios.post(`${API_BASE}/query`, {
    lat: location.lat,
    lon: location.lon,
    date: date,
    variables: variables,
    thresholds: thresholds
  });
  return response.data;
};

export const checkHealth = async () => {
  const response = await axios.get(`${API_BASE}/health`);
  return response.data;
};
