import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload } from 'react-icons/fa';

const Hero = ({ onUploadClick }) => {
  const [heroTitle, setHeroTitle] = useState('Transform Your Photos into Stunning Pixel Paintings 🎨');
  const [heroSubtitle, setHeroSubtitle] = useState(
    'Create vintage art from any image instantly using smart pixel rendering. Advanced color quantization and block averaging create authentic pixel paintings with clean color blocks and visible pixel grids. No registration required!'
  );

  useEffect(() => {
    // Load initial from localStorage
    try {
      const saved = localStorage.getItem('hero_settings');
      if (saved) {
        const data = JSON.parse(saved);
        if (data?.title) setHeroTitle(data.title);
        if (data?.subtitle) setHeroSubtitle(data.subtitle);
      }
    } catch (e) {
      // ignore
    }

    // Listen for live updates from admin panel
    const handler = (e) => {
      if (e?.detail) {
        if (typeof e.detail.title === 'string') setHeroTitle(e.detail.title);
        if (typeof e.detail.subtitle === 'string') setHeroSubtitle(e.detail.subtitle);
      }
    };
    window.addEventListener('heroSettingsUpdated', handler);
    return () => window.removeEventListener('heroSettingsUpdated', handler);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight"
          >
          {heroTitle}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
          {heroSubtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUploadClick}
              className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FaUpload />
              <span>Upload Image</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white hover:bg-white hover:text-dark px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              Learn More
            </motion.button>
          </motion.div>

        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, 60, 0],
            y: [0, -30, 0],
            rotate: [0, 90, 180]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-40 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-xl"
        />
      </div>
    </section>
  );
};

export default Hero;
