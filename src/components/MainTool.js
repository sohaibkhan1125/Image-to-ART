import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaDownload, FaImage, FaMagic, FaCog } from 'react-icons/fa';

const MainTool = ({ 
  onImageUpload, 
  uploadedImage, 
  pixelatedImage, 
  pixelSize, 
  onPixelSizeChange,
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  shadow,
  onShadowChange,
  isGenerating,
  onDownload 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Debug logging
  console.log('MainTool props:', {
    uploadedImage: uploadedImage ? 'EXISTS' : 'NULL',
    pixelatedImage: pixelatedImage ? 'EXISTS' : 'NULL',
    pixelSize
  });

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          onImageUpload(img);
          setIsProcessing(false);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Create Your Pixel Art
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload an image and watch it transform into beautiful pixel art. 
            Adjust the pixel size to get the perfect retro look.
          </p>
        </motion.div>

        {!uploadedImage ? (
          /* Upload Section */
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-600 hover:border-primary/50'
              }`}
            >
              <FaUpload className="mx-auto text-6xl text-gray-400 mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                Drop your image here
              </h3>
              <p className="text-gray-400 mb-6">
                or click to browse files
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </motion.div>
        ) : (
          /* New Layout with Sticky Header and Responsive Design */
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Original Image Section - Scrolls normally */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 shadow-xl hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-white flex items-center">
                  <FaImage className="mr-3 text-primary" />
                  Original Image
                </h3>
                <button
                  onClick={() => window.location.reload()}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Upload New Image
                </button>
              </div>
                <div className="relative bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <img
                    src={uploadedImage.src}
                    alt="Original"
                  className="w-full h-auto max-h-64 object-contain rounded-lg shadow-lg transition-all duration-300"
                  />
                </div>
              </div>

            {/* Main Content: Result Preview + Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Result Preview - Takes 2/3 width on desktop */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-2xl font-semibold text-white flex items-center">
                  <FaMagic className="mr-3 text-primary" />
                  Pixel Art Result
                </h3>
                <div className="relative bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl hover-lift">
                  {pixelatedImage ? (
                    <div className="relative">
                      <motion.img
                        key={pixelSize}
                        src={pixelatedImage}
                        alt="Pixel Art Result"
                        className="w-full h-auto max-w-full object-contain rounded-lg shadow-lg transition-all duration-500 image-transition"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ 
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                        onLoad={() => {
                          console.log('Pixel art result loaded successfully');
                        }}
                        onError={(e) => {
                          console.error('Pixel art result failed to load:', e);
                        }}
                      />
                      
                      {/* Loading overlay */}
                      {isGenerating && (
                        <div className="absolute inset-0 bg-gray-800/80 rounded-lg flex items-center justify-center">
                          <div className="text-center text-white">
                            <FaMagic className="mx-auto text-4xl mb-2 animate-pulse" />
                            <p>Generating pixel art...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      <div className="text-center">
                        <FaMagic className="mx-auto text-4xl mb-2 animate-pulse" />
                        <p>Processing...</p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

              {/* Control Panel - Takes 1/3 width on desktop */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 shadow-xl control-panel">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <FaCog className="mr-3 text-primary" />
                    Pixel Art Controls
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Pixel Size Control - ONLY CONTROL */}
                    <div className="space-y-3">
                      <label className="block text-white font-semibold flex items-center">
                        <FaMagic className="mr-2 text-primary" />
                        Pixel Size: {pixelSize === 0 ? 'Original' : `${pixelSize}px`}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={pixelSize}
                        onChange={(e) => onPixelSizeChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-all duration-200 focus-ring"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Original (0)</span>
                        <span>Heavy Pixelation (50)</span>
                      </div>
                    </div>
                    
                    {/* Brightness Control */}
                    <div className="space-y-3">
                      <label className="block text-white font-semibold flex items-center">
                        <FaMagic className="mr-2 text-primary" />
                        Brightness: {brightness}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={brightness}
                        onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-all duration-200 focus-ring"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Dark (0.5x)</span>
                        <span>Bright (2x)</span>
                      </div>
                    </div>
                    
                    {/* Contrast Control */}
                    <div className="space-y-3">
                      <label className="block text-white font-semibold flex items-center">
                        <FaMagic className="mr-2 text-primary" />
                        Contrast: {contrast}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={contrast}
                        onChange={(e) => onContrastChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-all duration-200 focus-ring"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Low (0.5x)</span>
                        <span>High (2x)</span>
                      </div>
                    </div>
                    
                    {/* Shadow Control */}
                    <div className="space-y-3">
                      <label className="block text-white font-semibold flex items-center">
                        <FaMagic className="mr-2 text-primary" />
                        Shadow: {shadow}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={shadow}
                        onChange={(e) => onShadowChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-all duration-200 focus-ring"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>None (0px)</span>
                        <span>Heavy (30px)</span>
                      </div>
                    </div>
                    
                    {/* Download Button */}
                    <div className="pt-4">
                      <button
                        onClick={onDownload}
                        disabled={!pixelatedImage || isProcessing}
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <FaDownload className="text-xl" />
                        <span className="text-lg">{isProcessing ? 'Processing...' : 'Download Pixel Art'}</span>
                      </button>
                      
                      <div className="text-center text-sm text-gray-400 mt-3">
                        ✨ Pure pixel art conversion
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default MainTool;
