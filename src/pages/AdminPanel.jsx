import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    // Load maintenance mode from Supabase
    const loadMaintenanceMode = async () => {
      try {
        const { loadContent } = await import('../supabaseService');
        const data = await loadContent('maintenance_mode', true);
        if (data && data.enabled !== undefined) {
          setMaintenanceMode(data.enabled);
        }
      } catch (error) {
        console.error('Error loading maintenance mode from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaintenanceMode();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save to Supabase
      const { saveContent } = await import('../supabaseService');
      const result = await saveContent('maintenance_mode', { enabled: maintenanceMode });

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to save settings');
      }

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('maintenanceModeChanged', {
        detail: { maintenanceMode }
      }));

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Settings saved successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Failed to save settings. Please try again.';
      document.body.appendChild(errorMessage);

      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenanceMode = () => {
    setMaintenanceMode(!maintenanceMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Sidebar - 20% width */}
        <div className="w-1/5 bg-gray-800 text-white">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Admin Settings</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('general')}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${activeSection === 'general'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                General Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Right Section - 80% width */}
        <div className="w-4/5 bg-white p-8">
          {activeSection === 'general' && (
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">General Settings</h2>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Enable maintenance mode to show a maintenance message to visitors
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="maintenance-toggle"
                      checked={maintenanceMode}
                      onChange={toggleMaintenanceMode}
                      className="sr-only"
                    />
                    <label
                      htmlFor="maintenance-toggle"
                      className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ${maintenanceMode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </label>
                  </div>
                </div>

                {/* Status Display */}
                <div className={`p-4 rounded-lg mb-6 ${maintenanceMode
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                  }`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${maintenanceMode ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                    <span className={`font-medium ${maintenanceMode ? 'text-red-800' : 'text-green-800'
                      }`}>
                      {maintenanceMode
                        ? 'Maintenance mode is ON - Website is in maintenance'
                        : 'Maintenance mode is OFF - Website is running normally'
                      }
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
