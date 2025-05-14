import React from 'react';

const DownloadButton = ({ file }) => {
  const handleDownload = () => {
    // Debugging: Check if the file prop is received
    console.log("File prop received in DownloadButton:", file);

    if (!file) {
      console.error("No file provided for download.");
      return;
    }

    try {
      // Create a temporary URL for the file
      const url = URL.createObjectURL(file);
      console.log("Generated URL for download:", url);

      // Create an anchor element and set its attributes
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed_${file.name || 'image'}`; // Fallback to 'image' if file.name is undefined

      // Trigger the download by simulating a click
      link.click();

      // Revoke the object URL after a short delay to free up resources
      setTimeout(() => {
        URL.revokeObjectURL(url);
        console.log("Revoked URL:", url);
      }, 1000);
    } catch (error) {
      console.error("Error during file download:", error);
    }
  };

  return (
    <div style={{ margin: '20px', textAlign: 'center' }}>
      <button onClick={handleDownload}>
        Download Compressed Image
      </button>
    </div>
  );
};

export default DownloadButton;