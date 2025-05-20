import { useState, useRef, useEffect } from 'react';
import { Save, Upload, Download } from 'lucide-react';

function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processedImage, setProcessedImage] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState('jpeg');
  const [targetSize, setTargetSize] = useState(1048576); // Default 1MB (in bytes)
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState(null);
  
  const fileInputRef = useRef(null);

  // Min size: 100 bytes, Max size: 100MB (in bytes)
  const MIN_SIZE = 100;
  const MAX_SIZE = 104857600;

  const fileTypes = [
    { id: 'jpeg', name: 'JPEG (.jpg)', mime: 'image/jpeg' },
    { id: 'png', name: 'PNG (.png)', mime: 'image/png' },
    { id: 'webp', name: 'WebP (.webp)', mime: 'image/webp' },
    { id: 'gif', name: 'GIF (.gif)', mime: 'image/gif' },
    { id: 'bmp', name: 'BMP (.bmp)', mime: 'image/bmp' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setProcessedImage(null);
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({
          width: img.width,
          height: img.height
        });
      };
      img.src = objectUrl;
    }
  };

  // Convert bytes to human-readable size with unit
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const compressImage = async () => {
    if (!file || !originalDimensions) return;
    
    setIsProcessing(true);
    
    // COMPLETELY NEW APPROACH USING FILE EXPANSION/COMPRESSION TO MEET TARGET SIZE
    
    try {
      // 1. First create a data URL from the original image to work with
      const fileDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      
      // 2. Load the image to get its dimensions
      const img = await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = fileDataUrl;
      });
      
      // 3. Target-based approach
      let finalBlob;
      let finalQuality = 0;
      let finalWidth = img.width;
      let finalHeight = img.height;
      
      // If the target size is larger than the original, we'll use padding data
      if (targetSize > file.size) {
        // Use max quality for the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Convert to blob with max quality
        const imageBlob = await new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), `image/${selectedFileType}`, 1.0);
        });
        
        // Calculate how much padding we need to add to reach target size
        const paddingNeeded = targetSize - imageBlob.size;
        
        if (paddingNeeded > 0) {
          // Create a new blob with padding
          const originalArray = await imageBlob.arrayBuffer();
          
          // Create padding data
          const padding = new Uint8Array(paddingNeeded);
          
          // Combine the original image data with padding
          const combinedArray = new Uint8Array(originalArray.byteLength + padding.byteLength);
          combinedArray.set(new Uint8Array(originalArray), 0);
          combinedArray.set(padding, originalArray.byteLength);
          
          // Convert combined data to blob with correct mime type
          finalBlob = new Blob([combinedArray], { type: `image/${selectedFileType}` });
          finalQuality = 100;
        } else {
          finalBlob = imageBlob;
          finalQuality = 100;
        }
      } else {
        // If target is smaller than original, use iterative approach
        
        // START - ITERATIVE BINARY SEARCH APPROACH FOR QUALITY AND SIZE
        let minQuality = 0.01; // 1%
        let maxQuality = 1.0;  // 100%
        let bestQuality = 0.7; // Start with 70%
        let bestDiff = Infinity;
        let bestBlob = null;
        
        // If the target size is significantly smaller, adjust dimensions first
        const sizeFactor = targetSize / file.size;
        if (sizeFactor < 0.3) { // If target is less than 30% of original
          const scaleFactor = Math.max(0.1, Math.sqrt(sizeFactor)); // Don't go below 10%
          finalWidth = Math.floor(img.width * scaleFactor);
          finalHeight = Math.floor(img.height * scaleFactor);
        }
        
        // Create canvas with potentially adjusted dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        
        // Binary search for optimal quality
        for (let i = 0; i < 12; i++) { // 12 iterations should be enough for precision
          const testQuality = (minQuality + maxQuality) / 2;
          
          // Try this quality
          const blob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b), `image/${selectedFileType}`, testQuality);
          });
          
          const diff = Math.abs(blob.size - targetSize);
          
          // Update best result if this is closer to target
          if (diff < bestDiff) {
            bestDiff = diff;
            bestQuality = testQuality;
            bestBlob = blob;
            
            // If we're within 5% of target, that's good enough
            if (diff < targetSize * 0.05) {
              break;
            }
          }
          
          // Adjust search range
          if (blob.size > targetSize) {
            maxQuality = testQuality;
          } else {
            minQuality = testQuality;
          }
        }
        
        // For exact target size match, we may need to add padding
        if (bestBlob.size < targetSize) {
          const paddingNeeded = targetSize - bestBlob.size;
          const originalArray = await bestBlob.arrayBuffer();
          const padding = new Uint8Array(paddingNeeded);
          
          // Combine original with padding
          const combined = new Uint8Array(originalArray.byteLength + padding.byteLength);
          combined.set(new Uint8Array(originalArray), 0);
          combined.set(padding, originalArray.byteLength);
          
          finalBlob = new Blob([combined], { type: `image/${selectedFileType}` });
        } else {
          finalBlob = bestBlob;
        }
        
        finalQuality = Math.round(bestQuality * 100);
      }
      
      // 4. Create result
      const processedUrl = URL.createObjectURL(finalBlob);
      
      setProcessedImage({
        url: processedUrl,
        blob: finalBlob,
        originalSize: file.size,
        newSize: finalBlob.size,
        name: file.name.split('.')[0],
        width: finalWidth,
        height: finalHeight,
        quality: finalQuality
      });
    } catch (error) {
      console.error("Error during compression:", error);
      alert("Error during compression: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const filename = `${processedImage.name}_compressed.${selectedFileType}`;
    
    const a = document.createElement('a');
    a.href = processedImage.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Convert bytes value to log scale for slider
  const bytesToSliderValue = (bytes) => {
    const min = Math.log(MIN_SIZE);
    const max = Math.log(MAX_SIZE);
    
    return Math.round(((Math.log(bytes) - min) / (max - min)) * 100);
  };
  
  // Convert slider value to bytes
  const sliderValueToBytes = (value) => {
    const min = Math.log(MIN_SIZE);
    const max = Math.log(MAX_SIZE);
    
    const logValue = min + (value / 100) * (max - min);
    return Math.round(Math.exp(logValue));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
      <h2 className="text-xl font-bold mb-6 text-center">Image Compressor/Enhancer</h2>
      
      {/* File upload area */}
      <div className="mb-8">
        <div 
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all"
          onClick={() => fileInputRef.current.click()}
        >
          {previewUrl ? (
            <div className="flex flex-col items-center">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-64 max-w-full mb-4 rounded-lg shadow-md" 
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {file.name} ({formatBytes(file.size)})
              </p>
              <button 
                className="mt-4 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
              >
                Change Image
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload size={48} className="text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Drop your image here or click to browse</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Supports JPG, PNG, WebP, GIF, BMP</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*"
            className="hidden" 
          />
        </div>
      </div>
      
      {/* Process controls */}
      <div className="mb-8">
        <div className="w-full mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Size: {formatBytes(targetSize)}
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={bytesToSliderValue(targetSize)} 
            onChange={(e) => setTargetSize(sliderValueToBytes(parseInt(e.target.value)))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>100 Bytes</span>
            <span>100 MB</span>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Output Format
          </label>
          <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-400 dark:focus:border-blue-400"
          >
            {fileTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={compressImage}
          disabled={!file || isProcessing}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
            !file || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              <Save className="mr-2" size={20} />
              Compress-Enhance Image
            </>
          )}
        </button>
      </div>
      
      {/* Results */}
      {processedImage && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Compression Results</h3>
          
          {/* Before and After Image Comparison */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 border dark:border-gray-600 rounded-lg p-3">
              <p className="text-center font-medium mb-2">Original Image</p>
              <img 
                src={previewUrl} 
                alt="Original" 
                className="max-h-48 mx-auto rounded-lg" 
              />
            </div>
            <div className="flex-1 border dark:border-gray-600 rounded-lg p-3">
              <p className="text-center font-medium mb-2">Processed Image</p>
              <img 
                src={processedImage.url} 
                alt="Processed" 
                className="max-h-48 mx-auto rounded-lg" 
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Size</p>
              <p className="text-xl font-bold">{formatBytes(processedImage.originalSize)}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Processed Size</p>
              <p className="text-xl font-bold">{formatBytes(processedImage.newSize)}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size Change</p>
              <p className={`text-xl font-bold ${processedImage.newSize < processedImage.originalSize ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {processedImage.newSize < processedImage.originalSize ? 
                  `-${Math.round((1 - processedImage.newSize / processedImage.originalSize) * 100)}%` : 
                  `+${Math.round((processedImage.newSize / processedImage.originalSize - 1) * 100)}%`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Dimensions</p>
              <p className="text-lg font-medium">
                {originalDimensions ? `${originalDimensions.width}x${originalDimensions.height}` : "Loading..."}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Dimensions</p>
              <p className="text-lg font-medium">{`${processedImage.width}x${processedImage.height}`}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quality Used</p>
              <p className="text-lg font-medium">{processedImage.quality}%</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={downloadImage}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg flex items-center dark:bg-green-500 dark:hover:bg-green-600"
            >
              <Download className="mr-2" size={20} />
              Download {selectedFileType.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageCompressor;