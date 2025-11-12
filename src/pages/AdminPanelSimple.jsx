import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import TitleManagementRobust from '../components/TitleManagementRobust';
import ErrorBoundary from '../components/ErrorBoundary';

const AdminPanelSimple = () => {
  const navigate = useNavigate();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [showSubMenu, setShowSubMenu] = useState(false);

  useEffect(() => {
    // Load maintenance mode from localStorage
    const savedMaintenanceMode = localStorage.getItem('maintenance_mode');
    if (savedMaintenanceMode !== null) {
      setMaintenanceMode(JSON.parse(savedMaintenanceMode));
    }
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
      // Save to localStorage for now
      localStorage.setItem('maintenance_mode', JSON.stringify(maintenanceMode));
      
      // Also dispatch a custom event to notify other components
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
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenanceMode = () => {
    setMaintenanceMode(!maintenanceMode);
  };

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
              <div>
                <button
                  onClick={() => {
                    setActiveSection('general');
                    setShowSubMenu(!showSubMenu);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                    activeSection === 'general'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>General Settings</span>
                    <span className={`transform transition-transform ${showSubMenu ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                  </div>
                </button>
                
                {/* Sub-menu */}
                {showSubMenu && (
                  <div className="ml-4 mt-2 space-y-1">
                    <button
                      onClick={() => setActiveSection('maintenance')}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition duration-200 ${
                        activeSection === 'maintenance'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Maintenance Mode
                    </button>
                    <button
                      onClick={() => setActiveSection('title-management')}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition duration-200 ${
                        activeSection === 'title-management'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Website Title Management
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* Right Section - 80% width */}
        <div className="w-4/5 bg-white p-8">
          {activeSection === 'maintenance' && (
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Maintenance Mode</h2>
              
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
                      className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ${
                        maintenanceMode ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                          maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </label>
                  </div>
                </div>

                {/* Status Display */}
                <div className={`p-4 rounded-lg mb-6 ${
                  maintenanceMode 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      maintenanceMode ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <span className={`font-medium ${
                      maintenanceMode ? 'text-red-800' : 'text-green-800'
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

              {/* Status Notice */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Maintenance Mode Status</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Maintenance mode is now working with localStorage. Changes will be saved and applied immediately.
                </p>
                <div className="text-blue-700 text-sm">
                  <strong>Current Status:</strong> {maintenanceMode ? 'ON - Website shows maintenance message' : 'OFF - Website functions normally'}
                </div>
                <div className="text-blue-700 text-sm mt-2">
                  <strong>Storage:</strong> Settings are saved in browser localStorage
                </div>
              </div>
            </div>
          )}

            {activeSection === 'title-management' && (
              <ErrorBoundary>
                <TitleManagementRobust />
              </ErrorBoundary>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelSimple;
