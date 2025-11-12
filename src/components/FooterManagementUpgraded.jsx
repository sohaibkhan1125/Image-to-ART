// FooterManagementUpgraded.jsx - Footer management with React Icons dropdown
import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaLinkedin,
  FaPinterest,
  FaTiktok,
  FaGithub,
  FaDiscord,
  FaReddit,
} from "react-icons/fa";

const FooterManagementUpgraded = () => {
  const { settings, loading, error, addFooterLink, updateFooterLink, deleteFooterLink } = useSettings();
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingPlatform, setEditingPlatform] = useState('');
  const [editingUrl, setEditingUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  // Available platforms with their React Icons
  const availableIcons = {
    Facebook: FaFacebookF,
    Instagram: FaInstagram,
    YouTube: FaYoutube,
    Twitter: FaTwitter,
    LinkedIn: FaLinkedin,
    Pinterest: FaPinterest,
    TikTok: FaTiktok,
    GitHub: FaGithub,
    Discord: FaDiscord,
    Reddit: FaReddit,
  };

  const platformOptions = Object.keys(availableIcons);

  const handleAddIcon = async (e) => {
    e.preventDefault();
    if (saving || !selectedPlatform || !url.trim()) return;

    setSaving(true);
    setSuccess(null);

    try {
      const newLink = {
        platform: selectedPlatform,
        icon: selectedPlatform, // Save platform name as icon identifier
        url: url.trim()
      };

      await addFooterLink(newLink);
      setSelectedPlatform('');
      setUrl('');
      setSuccess('Footer link added successfully!');
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Footer link added successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (err) {
      console.error('Error adding footer link:', err);
      alert('Failed to add footer link. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditIcon = (link) => {
    setEditingId(link.id);
    setEditingPlatform(link.platform);
    setEditingUrl(link.url);
  };

  const handleUpdateIcon = async (e) => {
    e.preventDefault();
    if (saving || !editingPlatform || !editingUrl.trim()) return;

    setSaving(true);
    setSuccess(null);

    try {
      const updatedLink = {
        platform: editingPlatform,
        icon: editingPlatform,
        url: editingUrl.trim()
      };

      await updateFooterLink(editingId, updatedLink);
      setEditingId(null);
      setEditingPlatform('');
      setEditingUrl('');
      setSuccess('Footer link updated successfully!');
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Footer link updated successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (err) {
      console.error('Error updating footer link:', err);
      alert('Failed to update footer link. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIcon = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this footer link?')) {
      return;
    }

    setSaving(true);
    setSuccess(null);

    try {
      await deleteFooterLink(linkId);
      setSuccess('Footer link deleted successfully!');
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Footer link deleted successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (err) {
      console.error('Error deleting footer link:', err);
      alert('Failed to delete footer link. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingPlatform('');
    setEditingUrl('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading footer settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Footer Management</h2>
      
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

      {/* Current Footer Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Footer Links</h3>
        
        {settings.footerLinks && Array.isArray(settings.footerLinks) && settings.footerLinks.length > 0 ? (
          <div className="space-y-4">
            {settings.footerLinks.map((link) => {
              const IconComponent = availableIcons[link.platform];
              return (
                <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {IconComponent && <IconComponent className="text-blue-600 text-xl" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{link.platform}</div>
                      <div className="text-sm text-gray-500">{link.url}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditIcon(link)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteIcon(link.id)}
                      disabled={saving}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition duration-200 disabled:opacity-50"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-link text-4xl mb-4"></i>
            <p>No footer links added yet.</p>
            <p className="text-sm">Add your first social media link below.</p>
          </div>
        )}
      </div>

      {/* Add New Link Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Footer Link' : 'Add New Footer Link'}
        </h3>
        
        <form onSubmit={editingId ? handleUpdateIcon : handleAddIcon} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="platform-select" className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                id="platform-select"
                value={editingId ? editingPlatform : selectedPlatform}
                onChange={(e) => {
                  if (editingId) {
                    setEditingPlatform(e.target.value);
                  } else {
                    setSelectedPlatform(e.target.value);
                  }
                }}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-black"
                required
              >
                <option value="">Select a platform</option>
                {platformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="link-url" className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                id="link-url"
                type="url"
                value={editingId ? editingUrl : url}
                onChange={(e) => {
                  if (editingId) {
                    setEditingUrl(e.target.value);
                  } else {
                    setUrl(e.target.value);
                  }
                }}
                placeholder="https://facebook.com/yourpage"
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-black"
                required
              />
            </div>
          </div>

          {/* Icon Preview */}
          {(editingId ? editingPlatform : selectedPlatform) && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Preview:</span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {(() => {
                  const platform = editingId ? editingPlatform : selectedPlatform;
                  const IconComponent = availableIcons[platform];
                  return IconComponent ? <IconComponent className="text-blue-600" /> : null;
                })()}
              </div>
              <span className="text-sm text-gray-700">
                {editingId ? editingPlatform : selectedPlatform}
              </span>
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving || !(editingId ? editingPlatform : selectedPlatform) || !(editingId ? editingUrl : url)}
              className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
                saving || !(editingId ? editingPlatform : selectedPlatform) || !(editingId ? editingUrl : url)
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
              } text-white`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingId ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                editingId ? 'Update Link' : 'Add Link'
              )}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Select from 10 popular social media platforms</li>
          <li>• URLs should start with https:// for security</li>
          <li>• Changes will appear on the website footer immediately</li>
          <li>• Icons are displayed using React Icons for better performance</li>
        </ul>
      </div>
    </div>
  );
};

export default FooterManagementUpgraded;
