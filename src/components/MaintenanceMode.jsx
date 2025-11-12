import React, { useState, useEffect } from 'react';

const MaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load maintenance mode from localStorage
    const checkMaintenanceMode = () => {
      const savedMaintenanceMode = localStorage.getItem('maintenance_mode');
      if (savedMaintenanceMode !== null) {
        setIsMaintenanceMode(JSON.parse(savedMaintenanceMode));
      }
      setLoading(false);
    };

    // Check immediately
    checkMaintenanceMode();

    // Listen for changes via custom event
    const handleMaintenanceModeChange = (event) => {
      setIsMaintenanceMode(event.detail.maintenanceMode);
    };

    window.addEventListener('maintenanceModeChanged', handleMaintenanceModeChange);

    return () => {
      window.removeEventListener('maintenanceModeChanged', handleMaintenanceModeChange);
    };
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!isMaintenanceMode) {
    return null; // Don't show maintenance mode if it's disabled
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
      <div className="text-center text-white max-w-md mx-auto px-6">
        <div className="mb-8">
          <div className="text-8xl mb-4">🚧</div>
          <h1 className="text-4xl font-bold mb-4">Under Maintenance</h1>
          <p className="text-xl text-gray-300 mb-8">
            The website is currently under maintenance. Please check back later.
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">What's happening?</h2>
          <p className="text-gray-300 text-sm">
            We're working hard to improve your experience. 
            The website will be back online shortly.
          </p>
        </div>
        
        <div className="mt-8">
          <div className="animate-pulse">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
          </div>
          <p className="text-sm text-gray-400 mt-4">Please wait...</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
