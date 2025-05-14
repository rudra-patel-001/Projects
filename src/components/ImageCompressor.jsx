// ImageCompressor.js

import React, { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';

const ImageCompressor = ({ file, options, setCompressedImage }) => {
  // Track whether the image is being compressed
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    // If no file is provided, do nothing.
    if (!file) return;

    const compressImage = async () => {
      setCompressing(true);
      try {
        // Compress the image with the given options
        const compressedFile = await imageCompression(file, options);
        // Update parent state with the compressed image
        setCompressedImage(compressedFile);
      } catch (error) {
        console.error("Error during compression:", error);
      } finally {
        setCompressing(false);
      }
    };

    compressImage();
  }, [file, options, setCompressedImage]);

  return (
    <div style={{ margin: '20px', textAlign: 'center' }}>
      {compressing ? (
        <p>Compressing image... Please wait.</p>
      ) : (
        <p>{file ? "Compression completed!" : "No image to compress."}</p>
      )}
    </div>
  );
};

export default ImageCompressor;
