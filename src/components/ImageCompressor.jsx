import { useState, useRef } from 'react';
import { Save, Upload, Download } from 'lucide-react';

function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processedImage, setProcessedImage] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState('jpeg');
  const [compressionLevel, setCompressionLevel] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef(null);

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
    }
  };

  const compressImage = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Simulate processing with timeout
    setTimeout(() => {
      // This is a mock compression - in a real app, you'd use a library like browser-image-compression
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get processed image data
        canvas.toBlob((blob) => {
          const processedUrl = URL.createObjectURL(blob);
          setProcessedImage({
            url: processedUrl,
            blob: blob,
            originalSize: file.size,
            newSize: blob.size,
            name: file.name.split('.')[0] // Get filename without extension
          });
          setIsProcessing(false);
        }, `image/${selectedFileType}`, compressionLevel / 100);
      };
      
      img.src = previewUrl;
    }, 1000);
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const selectedType = fileTypes.find(type => type.id === selectedFileType);
    const filename = `${processedImage.name}_compressed.${selectedFileType}`;
    
    const a = document.createElement('a');
    a.href = processedImage.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
            Compression Level: {compressionLevel}%
          </label>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={compressionLevel} 
            onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>High Compression</span>
            <span>High Enhance</span>
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
          
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Size</p>
              <p className="text-xl font-bold">{formatBytes(processedImage.originalSize)}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compressed Size</p>
              <p className="text-xl font-bold">{formatBytes(processedImage.newSize)}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saved</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {Math.round((1 - processedImage.newSize / processedImage.originalSize) * 100)}%
              </p>
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