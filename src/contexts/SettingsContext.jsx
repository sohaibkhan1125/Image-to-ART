// SettingsContext.jsx - Context for managing Supabase settings
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadContent, saveContent } from '../supabaseService';

const SettingsContext = createContext();

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

  // Fetch settings from Supabase
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all settings from Supabase
      const [maintenanceData, titleData, footerLinksData] = await Promise.all([
        loadContent('maintenance_mode', true),
        loadContent('website_title'),
        loadContent('footer_links', true)
      ]);

      const newSettings = {
        maintenance: maintenanceData?.enabled || false,
        title: titleData || 'PixelArt Converter',
        footerLinks: Array.isArray(footerLinksData) ? footerLinksData : []
      };

      setSettings(newSettings);

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: newSettings
      }));

    } catch (err) {
      console.error('Error loading settings from Supabase:', err);
      setError('Failed to load settings. Please try again.');

      // Use default settings on error
      const defaultSettings = {
        maintenance: false,
        title: 'PixelArt Converter',
        footerLinks: []
      };
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // Update settings in Supabase
  const updateSettings = async (newSettings) => {
    try {
      setError(null);

      // Save individual settings to Supabase
      const promises = [];

      if (newSettings.maintenance !== undefined) {
        promises.push(
          saveContent('maintenance_mode', { enabled: newSettings.maintenance })
        );
      }

      if (newSettings.title !== undefined) {
        promises.push(
          saveContent('website_title', newSettings.title)
        );
      }

      if (newSettings.footerLinks !== undefined) {
        promises.push(
          saveContent('footer_links', newSettings.footerLinks)
        );
      }

      const results = await Promise.all(promises);

      // Check if all saves were successful
      const allSuccess = results.every(result => result.success);

      if (!allSuccess) {
        throw new Error('Failed to save some settings');
      }

      // Update local state
      setSettings(newSettings);

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: newSettings
      }));

      return {
        message: 'Settings updated successfully',
        data: newSettings
      };

    } catch (err) {
      console.error('Error saving settings to Supabase:', err);
      setError('Failed to save settings. Please try again.');
      throw err;
    }
  };

  // Update maintenance mode
  const updateMaintenanceMode = async (maintenance) => {
    try {
      const result = await saveContent('maintenance_mode', {
        enabled: Boolean(maintenance)
      });

      if (result.success) {
        const newSettings = {
          ...settings,
          maintenance: Boolean(maintenance)
        };
        setSettings(newSettings);

        window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: newSettings
        }));
      } else {
        throw new Error(result.error?.message || 'Failed to update maintenance mode');
      }
    } catch (err) {
      console.error('Error updating maintenance mode:', err);
      throw err;
    }
  };

  // Update website title
  const updateTitle = async (title) => {
    try {
      const titleValue = String(title).trim() || 'PixelArt Converter';
      const result = await saveContent('website_title', titleValue);

      if (result.success) {
        const newSettings = {
          ...settings,
          title: titleValue
        };
        setSettings(newSettings);

        window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: newSettings
        }));
      } else {
        throw new Error(result.error?.message || 'Failed to update title');
      }
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

      const result = await saveContent('footer_links', updatedLinks);

      if (result.success) {
        const newSettings = {
          ...settings,
          footerLinks: updatedLinks
        };
        setSettings(newSettings);

        window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: newSettings
        }));
      } else {
        throw new Error(result.error?.message || 'Failed to add footer link');
      }
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

      const result = await saveContent('footer_links', updatedLinks);

      if (result.success) {
        const newSettings = {
          ...settings,
          footerLinks: updatedLinks
        };
        setSettings(newSettings);

        window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: newSettings
        }));
      } else {
        throw new Error(result.error?.message || 'Failed to update footer link');
      }
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

      const result = await saveContent('footer_links', updatedLinks);

      if (result.success) {
        const newSettings = {
          ...settings,
          footerLinks: updatedLinks
        };
        setSettings(newSettings);

        window.dispatchEvent(new CustomEvent('settingsUpdated', {
          detail: newSettings
        }));
      } else {
        throw new Error(result.error?.message || 'Failed to delete footer link');
      }
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
