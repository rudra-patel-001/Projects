import React, { useState } from 'react';
import './App.css';
import ImageCompressor from './components/ImageCompressor';
import DownloadButton from './components/DownloadButton';

function App() {
  // Separate states for each section
  const [reductionImage, setReductionImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);

  // const [enhancementImage, setEnhancementImage] = useState(null);
  // const [enhancedImage, setEnhancedImage] = useState(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>PixBoost 0.2</h1>
      </header>

      <main className="app-main">
        {/* Left Section: Image Reduction */}
        <section className="image-reduction">
          
          {/* <ImageUploader image={reductionImage} setImage={setReductionImage} /> */}
          <ImageCompressor image={reductionImage} setImage={setReductionImage}/>
          {reductionImage && (
            <>
              <ImageCompressor
                file={ImageCompressor}
                setCompressedImage={setCompressedImage}
              />
              {compressedImage && (
                <DownloadButton file={compressedImage} />
              )}
            </>
          )}
        </section>

        
        
      </main>

      <footer className="app-footer">
        <p>{new Date().getFullYear()}@ Image Processing Dashboard</p>
      </footer>
    </div>
  );
}

export default App;