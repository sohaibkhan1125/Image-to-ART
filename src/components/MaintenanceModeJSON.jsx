// MaintenanceModeJSON.jsx - Maintenance mode component using JSON backend
import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const MaintenanceModeJSON = () => {
  const { settings, loading, error, updateMaintenanceMode } = useSettings();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleToggleMaintenance = async () => {
    if (saving) return;
    
    setSaving(true);
    setSuccess(null);
    
    try {
      await updateMaintenanceMode(!settings.maintenance);
      setSuccess(`Maintenance mode ${!settings.maintenance ? 'enabled' : 'disabled'} successfully!`);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Maintenance mode ${!settings.maintenance ? 'enabled' : 'disabled'} successfully!`;
      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (err) {
      console.error('Error updating maintenance mode:', err);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Failed to update maintenance mode. Please try again.';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading maintenance settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Maintenance Mode</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Status</h3>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
            <p className="text-sm text-gray-500 mt-1">
              {settings.maintenance 
                ? 'Website is currently in maintenance mode' 
                : 'Website is currently live and accessible'
              }
            </p>
          </div>
          
          <button
            onClick={handleToggleMaintenance}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.maintenance ? 'bg-red-600' : 'bg-gray-200'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.maintenance ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${settings.maintenance ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className="text-sm text-gray-600">
              {settings.maintenance ? 'Maintenance Mode: ON' : 'Maintenance Mode: OFF'}
            </span>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 How it works</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• When ON: Visitors see a maintenance message</li>
            <li>• When OFF: Normal website content is displayed</li>
            <li>• Changes take effect immediately</li>
            <li>• Settings are saved to JSON backend</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModeJSON;
