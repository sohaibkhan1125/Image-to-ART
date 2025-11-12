// TitleManagementJSON.jsx - Title management component using JSON backend
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const TitleManagementJSON = () => {
  const { settings, loading, error, updateTitle } = useSettings();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  // Update local title when settings change
  useEffect(() => {
    if (settings.title) {
      setTitle(settings.title);
    }
  }, [settings.title]);

  const handleSave = async () => {
    if (saving || !title.trim()) return;
    
    setSaving(true);
    setSuccess(null);
    
    try {
      await updateTitle(title.trim());
      setSuccess('Website title updated successfully!');
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Website title updated successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (err) {
      console.error('Error updating title:', err);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Failed to update title. Please try again.';
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

  const handleInputChange = (e) => {
    setTitle(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading title settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Website Title Management</h2>
      
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Title</h3>
        
        <div className="mb-6">
          <label htmlFor="website-title" className="block text-sm font-medium text-gray-700 mb-2">
            Website Title
          </label>
          <input
            id="website-title"
            type="text"
            value={title}
            onChange={handleInputChange}
            placeholder="Enter website title (e.g., PixelArt Converter)"
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-black"
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1">
            This title will appear in the browser tab and website header
          </p>
        </div>

        {/* Current Settings Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Settings</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Title:</span> {settings.title || 'Not set'}
            </div>
            <div>
              <span className="font-medium">Loading:</span> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Saving:</span> {saving ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className={`px-8 py-3 rounded-lg font-medium transition duration-200 transform ${
            saving || !title.trim()
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          } text-white`}
        >
          {saving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            'Save Title'
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Changes will appear on the main website immediately</li>
          <li>• The title will be visible in the browser tab and website header</li>
          <li>• Settings are saved to JSON backend for persistence</li>
          <li>• No Firebase database required for this feature</li>
        </ul>
      </div>
    </div>
  );
};

export default TitleManagementJSON;
