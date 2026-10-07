import React from 'react';
import axios from 'axios';

const currentHost = window.location.hostname;
const API_BASE = process.env.REACT_APP_API_URL || `http://${currentHost}:5000/api`;

const ExportButton = ({ results, location, date }) => {
  const handleExport = async (format) => {
    if (!results) return;

    try {
      const response = await axios.post(`${API_BASE}/export`, {
        results: results,
        format: format
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weather_analysis_${location.lat}_${location.lon}_${date}.${format === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (!results) return null;

  return (
    <div className="flex space-x-2 mt-4">
      <button
        onClick={() => handleExport('json')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export JSON
      </button>
      <button
        onClick={() => handleExport('csv')}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Export CSV
      </button>
    </div>
  );
};

export default ExportButton;
