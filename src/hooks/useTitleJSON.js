// useTitleJSON.js - Hook for managing website title from JSON backend or localStorage
import { useState, useEffect } from 'react';

const useTitleJSON = () => {
  const [title, setTitle] = useState('PixelArt Converter');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTitle = async () => {
      try {
        // Try to fetch from API first
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (!isDevelopment || process.env.REACT_APP_API_URL) {
          const response = await fetch(`${API_BASE_URL}/api/settings`);
          
          if (response.ok) {
            const data = await response.json();
            setTitle(data.title || 'PixelArt Converter');
            setLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage
        throw new Error('API not available, using localStorage fallback');
        
      } catch (error) {
        console.warn('API not available, using localStorage fallback:', error.message);
        
        // Use localStorage as fallback
        try {
          const savedSettings = localStorage.getItem('admin_settings');
          if (savedSettings) {
            const data = JSON.parse(savedSettings);
            setTitle(data.title || 'PixelArt Converter');
          } else {
            setTitle('PixelArt Converter');
          }
        } catch (localStorageErr) {
          console.error('Error loading from localStorage:', localStorageErr);
          setTitle('PixelArt Converter');
        } finally {
          setLoading(false);
        }
      }
    };

    loadTitle();

    // Listen for settings updates
    const handleSettingsUpdate = (event) => {
      if (event.detail && event.detail.title) {
        setTitle(event.detail.title);
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  return { title, loading };
};

export default useTitleJSON;
