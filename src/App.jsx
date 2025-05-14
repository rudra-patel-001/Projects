// App.jsx

import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import CompressionSettings from './components/CompressionSettings';
import ImageCompressor from './components/ImageCompressor';
import DownloadButton from './components/DownloadButton';
import ComparisonChart from './components/ComparisonChart';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [options, setOptions] = useState({
    maxSizeMB: 1,            // Target maximum file size in MB
    maxWidthOrHeight: 1024,   // Maximum width or height during resizing
    quality: 0.7,            // Compression quality (0 to 1)
    useWebWorker: true,      // Enable web workers for performance
  });
  const [compressedImage, setCompressedImage] = useState(null);

  // Helper function to convert size from bytes to megabytes (rounded to 2 decimals)
  const convertSize = (size) => (size / 1024 / 1024).toFixed(2);

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Image Size Reducer</h1>
      
      {/* ImageUploader: Lets the user choose an image */}
      <ImageUploader image={selectedImage} setImage={setSelectedImage} />

      {/* Show CompressionSettings & ImageCompressor once an image is selected */}
      {selectedImage && (
        <>
          <CompressionSettings options={options} setOptions={setOptions} />
          <ImageCompressor 
            file={selectedImage} 
            options={options} 
            setCompressedImage={setCompressedImage} 
          />
        </>
      )}

      {/* Once image is compressed, display the download button and comparison chart */}
      {compressedImage && (
        <>
          <DownloadButton file={compressedImage} />
          <ComparisonChart 
            originalSize={convertSize(selectedImage.size)} 
            compressedSize={convertSize(compressedImage.size)} 
          />
        </>
      )}
    </div>
  );
}

export default App;
