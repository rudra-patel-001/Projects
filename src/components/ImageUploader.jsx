// ImageUploader.js

import React from 'react';

const ImageUploader = ({ image, setImage }) => {
  // Handle file input change
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setImage(selectedFile);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      {/* File Input */}
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {/* Show image preview and file size if an image is available */}
      {image && (
        <div style={{ marginTop: '10px' }}>
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            style={{ maxWidth: '200px', border: '1px solid #ccc', padding: '5px' }}
          />
          <p>
            File Size: {(image.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
