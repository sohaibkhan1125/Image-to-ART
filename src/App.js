import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HeaderSimple from './components/HeaderSimple';
import Hero from './components/Hero';
import MainTool from './components/MainTool';
import HowItWorks from './components/HowItWorks';
import About from './components/About';
import FAQ from './components/FAQ';
import ContentDisplay from './components/ContentDisplay';
import Footer from './components/Footer';
import FooterSimple from './components/FooterSimple';
import MaintenanceModeDisplay from './components/MaintenanceModeDisplay';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminPanelJSON from './pages/AdminPanelJSON';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [pixelatedImage, setPixelatedImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [shadow, setShadow] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const mainToolRef = useRef(null);

  const scrollToMainTool = () => {
    mainToolRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ensure pixelated image is generated when component mounts with uploaded image
  useEffect(() => {
    if (uploadedImage && !pixelatedImage) {
      console.log('Regenerating pixelated image on mount');
      generatePixelatedImage(uploadedImage, pixelSize, brightness, contrast, shadow);
    }
  }, [uploadedImage]);

  const handleImageUpload = (image) => {
    console.log('Image uploaded:', image);
    console.log('Image src:', image.src);
    console.log('Image dimensions:', image.width, 'x', image.height);
    
    setUploadedImage(image);
    
    // Show original image immediately as fallback
    setPixelatedImage(image.src);
    
    // Generate pixelated version
    generatePixelatedImage(image, pixelSize, brightness, contrast, shadow);
  };

  const generatePixelatedImage = (image, pixelSize, brightness = 1, contrast = 1, shadow = 0) => {
    console.log('Generating image with effects:', { pixelSize, brightness, contrast, shadow });
    
    // Set loading state
    setIsGenerating(true);
    
    // Check if image is already loaded
    if (!image.complete || image.naturalWidth === 0) {
      console.log('Image not loaded yet, waiting...');
      image.onload = () => {
        generatePixelatedImage(image, pixelSize, brightness, contrast, shadow);
      };
      return;
    }
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply canvas filters for real-time effects
      ctx.filter = `
        brightness(${brightness})
        contrast(${contrast})
        drop-shadow(0 0 ${shadow}px rgba(0, 0, 0, 0.6))
      `;
      
      // When pixel size is 0, show original image
      if (pixelSize <= 0) {
        console.log('Showing original image (no pixelation)');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      } else {
        console.log('Applying pixelation with size:', pixelSize);
        
        // Disable image smoothing for crisp pixel art
        ctx.imageSmoothingEnabled = false;
        
        // Calculate dimensions for pixelation
        const w = Math.ceil(canvas.width / pixelSize);
        const h = Math.ceil(canvas.height / pixelSize);
        
        console.log('Pixelation dimensions:', w, 'x', h);
        
        // Create temporary canvas for downscaling
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = w;
        tempCanvas.height = h;
        
        // Disable smoothing on temp canvas too
        tempCtx.imageSmoothingEnabled = false;
        
        // Draw image scaled down to get average colors
        tempCtx.drawImage(image, 0, 0, w, h);
        
        // Scale the small image back up to create pixelation effect
        ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
      }
      
      console.log('Image processing complete with filters');
      
      // Convert to dataURL and set state
      const dataURL = canvas.toDataURL('image/png');
      setPixelatedImage(dataURL);
      setIsGenerating(false);
      
    } catch (error) {
      console.error('Error in image processing:', error);
      setIsGenerating(false);
    }
  };

  const handlePixelSizeChange = (newSize) => {
    setPixelSize(newSize);
    if (uploadedImage) {
      generatePixelatedImage(uploadedImage, newSize, brightness, contrast, shadow);
    }
  };

  const handleBrightnessChange = (newBrightness) => {
    setBrightness(newBrightness);
    if (uploadedImage) {
      generatePixelatedImage(uploadedImage, pixelSize, newBrightness, contrast, shadow);
    }
  };

  const handleContrastChange = (newContrast) => {
    setContrast(newContrast);
    if (uploadedImage) {
      generatePixelatedImage(uploadedImage, pixelSize, brightness, newContrast, shadow);
    }
  };

  const handleShadowChange = (newShadow) => {
    setShadow(newShadow);
    if (uploadedImage) {
      generatePixelatedImage(uploadedImage, pixelSize, brightness, contrast, newShadow);
    }
  };


  const downloadPixelatedImage = () => {
    if (pixelatedImage) {
      const link = document.createElement('a');
      link.href = pixelatedImage;
      link.download = 'pixelated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/signup" element={<Signup />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/panel" 
          element={
            <PrivateRoute>
              <AdminPanelJSON />
            </PrivateRoute>
          } 
        />
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark">
            <MaintenanceModeDisplay />
            <ErrorBoundary>
              <HeaderSimple />
            </ErrorBoundary>
            <Hero onUploadClick={scrollToMainTool} />
            <div ref={mainToolRef}>
              <MainTool 
                onImageUpload={handleImageUpload}
                uploadedImage={uploadedImage}
                pixelatedImage={pixelatedImage}
                pixelSize={pixelSize}
                onPixelSizeChange={handlePixelSizeChange}
                brightness={brightness}
                onBrightnessChange={handleBrightnessChange}
                contrast={contrast}
                onContrastChange={handleContrastChange}
                shadow={shadow}
                onShadowChange={handleShadowChange}
                isGenerating={isGenerating}
                onDownload={downloadPixelatedImage}
              />
            </div>
            <HowItWorks />
            <About />
            <ErrorBoundary>
              <ContentDisplay />
            </ErrorBoundary>
            <FAQ />
            <ErrorBoundary>
              <FooterSimple />
            </ErrorBoundary>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
