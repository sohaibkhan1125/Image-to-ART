// MaintenanceModeDisplay.jsx - Display maintenance mode on main website
import React, { useState, useEffect } from 'react';

const MaintenanceModeDisplay = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        // Try to fetch from API first
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (!isDevelopment || process.env.REACT_APP_API_URL) {
          const response = await fetch(`${API_BASE_URL}/api/settings`);
          
          if (response.ok) {
            const data = await response.json();
            setIsMaintenanceMode(data.maintenance || false);
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
            setIsMaintenanceMode(data.maintenance || false);
          } else {
            setIsMaintenanceMode(false);
          }
        } catch (localStorageErr) {
          console.error('Error loading from localStorage:', localStorageErr);
          setIsMaintenanceMode(false);
        } finally {
          setLoading(false);
        }
      }
    };

    checkMaintenanceMode();

    // Listen for settings updates
    const handleSettingsUpdate = (event) => {
      if (event.detail && typeof event.detail.maintenance === 'boolean') {
        setIsMaintenanceMode(event.detail.maintenance);
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!isMaintenanceMode) {
    return null; // Don't show maintenance mode if it's off
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl">
        <div className="text-6xl mb-4">🛠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Website Under Maintenance
        </h1>
        <p className="text-gray-600 mb-6">
          We're currently performing some updates to improve your experience. 
          Please check back later.
        </p>
        <div className="animate-pulse">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Thank you for your patience!
        </p>
      </div>
    </div>
  );
};

export default MaintenanceModeDisplay;
