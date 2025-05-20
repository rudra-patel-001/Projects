import React, { useState } from 'react';

const DownloadButton = ({ file }) => {
  const [format, setFormat] = useState('jpg'); // Default format is JPG

  const handleDownload = () => {
    if (!file) {
      console.error("No file provided for download.");
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const mimeType = `image/${format}`;
      const dataUrl = canvas.toDataURL(mimeType);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `processed_image.${format}`;
      link.click();

      URL.revokeObjectURL(img.src);
    };
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <label htmlFor="format-select" style={{ marginRight: '10px' }}>
        Format:
      </label>
      <select
        id="format-select"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        style={{ marginRight: '10px', padding: '5px' }}
      >
        <option value="jpg">JPG</option>
        <option value="png">PNG</option>
        <option value="gif">GIF</option>
        <option value="bmp">BMP</option>
      </select>
      <button onClick={handleDownload}>
        Download Image
      </button>
    </div>
  );
};

export default DownloadButton;