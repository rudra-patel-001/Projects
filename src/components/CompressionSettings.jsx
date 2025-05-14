// CompressionSettings.js

import React from 'react';

const CompressionSettings = ({ options, setOptions }) => {
  // Update compression quality (between 0 and 1)
  const handleQualityChange = (e) => {
    setOptions({
      ...options,
      quality: parseFloat(e.target.value),
    });
  };

  // Update maximum size in MB
  const handleMaxSizeChange = (e) => {
    setOptions({
      ...options,
      maxSizeMB: parseFloat(e.target.value),
    });
    
  };

  return (
    <div style={{ margin: '20px' }}>
      <h3>Compression Settings</h3>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="quality-input">Quality (0 to 1): </label>
        <input
          id="quality-input"
          type="number"
          step="0.1"
          min="0"
          max="1"
          value={options.quality}
          onChange={handleQualityChange}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="max-size-input">Max Size (MB): </label>
        <input
          id="max-size-input"
          type="number"
          step="0.1"
          value={options.maxSizeMB}
          onChange={handleMaxSizeChange}
          
        />
      </div>
    </div>
  );
};

export default CompressionSettings;
