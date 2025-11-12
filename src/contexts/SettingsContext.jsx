// SettingsContext.jsx - Context for managing JSON backend settings
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

// API base URL - use environment variable or fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    maintenance: false,
    title: 'PixelArt Converter',
    footerLinks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settings from JSON backend or localStorage fallback
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first
      if (!isDevelopment || process.env.REACT_APP_API_URL) {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // Ensure footerLinks is always an array
        if (!Array.isArray(data.footerLinks)) {
          data.footerLinks = [];
        }
        setSettings(data);
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: data
        }));
        
        return;
      }
      
      // Fallback to localStorage in development
      throw new Error('API not available, using localStorage fallback');
      
    } catch (err) {
      console.warn('API not available, using localStorage fallback:', err.message);
      
      // Use localStorage as fallback
      try {
        const savedSettings = localStorage.getItem('admin_settings');
        if (savedSettings) {
          const data = JSON.parse(savedSettings);
          // Ensure footerLinks is always an array
          if (!Array.isArray(data.footerLinks)) {
            data.footerLinks = [];
          }
          setSettings(data);
          
          // Dispatch custom event for real-time updates
          window.dispatchEvent(new CustomEvent('settingsUpdated', {
            detail: data
          }));
        } else {
          // Use default settings if no localStorage data
          const defaultSettings = {
            maintenance: false,
            title: 'PixelArt Converter',
            footerLinks: []
          };
          setSettings(defaultSettings);
        }
      } catch (localStorageErr) {
        console.error('Error loading from localStorage:', localStorageErr);
        
        // Use default settings on error
        const defaultSettings = {
          maintenance: false,
          title: 'PixelArt Converter',
          footerLinks: []
        };
        setSettings(defaultSettings);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update settings in JSON backend or localStorage fallback
  const updateSettings = async (newSettings) => {
    try {
      setError(null);
      
      // Try to update via API first
      if (!isDevelopment || process.env.REACT_APP_API_URL) {
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSettings),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setSettings(result.data);
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: result.data
        }));
        
        return result;
      }
      
      // Fallback to localStorage in development
      throw new Error('API not available, using localStorage fallback');
      
    } catch (err) {
      console.warn('API not available, using localStorage fallback:', err.message);
      
      // Use localStorage as fallback
      try {
        // Save to localStorage
        localStorage.setItem('admin_settings', JSON.stringify(newSettings));
        
        // Update local state
        setSettings(newSettings);
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: newSettings
        }));
        
        // Return success result
        return {
          message: 'Settings updated successfully (localStorage)',
          data: newSettings
        };
      } catch (localStorageErr) {
        console.error('Error saving to localStorage:', localStorageErr);
        setError('Failed to save settings. Please try again.');
        throw localStorageErr;
      }
    }
  };

  // Update maintenance mode
  const updateMaintenanceMode = async (maintenance) => {
    try {
      await updateSettings({
        ...settings,
        maintenance: Boolean(maintenance)
      });
    } catch (err) {
      console.error('Error updating maintenance mode:', err);
      throw err;
    }
  };

  // Update website title
  const updateTitle = async (title) => {
    try {
      await updateSettings({
        ...settings,
        title: String(title).trim() || 'PixelArt Converter'
      });
    } catch (err) {
      console.error('Error updating title:', err);
      throw err;
    }
  };

  // Add footer link
  const addFooterLink = async (newLink) => {
    try {
      const currentLinks = settings.footerLinks || [];
      const newId = currentLinks.length > 0 ? Math.max(...currentLinks.map(link => link.id), 0) + 1 : 1;
      const updatedLinks = [...currentLinks, { ...newLink, id: newId }];
      
      await updateSettings({
        ...settings,
        footerLinks: updatedLinks
      });
    } catch (err) {
      console.error('Error adding footer link:', err);
      throw err;
    }
  };

  // Update footer link
  const updateFooterLink = async (linkId, updatedLink) => {
    try {
      const currentLinks = settings.footerLinks || [];
      const updatedLinks = currentLinks.map(link => 
        link.id === linkId ? { ...link, ...updatedLink } : link
      );
      
      await updateSettings({
        ...settings,
        footerLinks: updatedLinks
      });
    } catch (err) {
      console.error('Error updating footer link:', err);
      throw err;
    }
  };

  // Delete footer link
  const deleteFooterLink = async (linkId) => {
    try {
      const currentLinks = settings.footerLinks || [];
      const updatedLinks = currentLinks.filter(link => link.id !== linkId);
      
      await updateSettings({
        ...settings,
        footerLinks: updatedLinks
      });
    } catch (err) {
      console.error('Error deleting footer link:', err);
      throw err;
    }
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Listen for settings updates from other components
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      if (event.detail) {
        setSettings(event.detail);
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const value = {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateMaintenanceMode,
    updateTitle,
    addFooterLink,
    updateFooterLink,
    deleteFooterLink,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
