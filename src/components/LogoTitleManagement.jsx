import React, { useState, useEffect, useRef } from 'react';
import { storage, firestore } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LogoTitleManagement = () => {
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [defaultLogoUrl, setDefaultLogoUrl] = useState('/logo192.png'); // Default logo path
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Check if Firebase services are available
      if (!firestore || !storage) {
        console.warn('Firebase services not available, using localStorage fallback');
        loadFromLocalStorage();
        return;
      }

      const settingsDoc = doc(firestore, 'general_settings', 'website');
      const docSnap = await getDoc(settingsDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWebsiteTitle(data.website_title || '');
        setLogoUrl(data.website_logo_url || '');
        setDefaultLogoUrl(data.default_logo_url || '/logo192.png');
        
        // Set preview to current logo or default
        setLogoPreview(data.website_logo_url || data.default_logo_url || '/logo192.png');
      } else {
        // Load from localStorage as fallback
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      console.log('Falling back to localStorage');
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedTitle = localStorage.getItem('website_title');
      const savedLogoUrl = localStorage.getItem('website_logo_url');
      
      if (savedTitle) setWebsiteTitle(savedTitle);
      if (savedLogoUrl) {
        setLogoUrl(savedLogoUrl);
        setLogoPreview(savedLogoUrl);
      } else {
        setLogoPreview('/logo192.png');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Please select a valid image file (PNG, JPG, JPEG, SVG)', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (file) => {
    try {
      setUploading(true);
      
      // Check if Firebase Storage is available
      if (!storage) {
        console.warn('Firebase Storage not available, using localStorage fallback');
        return await uploadToLocalStorage(file);
      }
      
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `website_logo_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `website_assets/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading logo:', error);
      console.log('Falling back to localStorage');
      return await uploadToLocalStorage(file);
    } finally {
      setUploading(false);
    }
  };

  const uploadToLocalStorage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        localStorage.setItem('website_logo_url', dataUrl);
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const deleteCurrentLogo = async () => {
    if (logoUrl && logoUrl.includes('firebasestorage.googleapis.com')) {
      try {
        // Delete from Firebase Storage
        const logoRef = ref(storage, logoUrl);
        await deleteObject(logoRef);
      } catch (error) {
        console.error('Error deleting logo from storage:', error);
        // Continue even if deletion fails
      }
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const file = fileInputRef.current?.files[0];
      let newLogoUrl = logoUrl;

      // If a new file is selected, upload it
      if (file) {
        // Delete old logo if it exists
        await deleteCurrentLogo();
        
        // Upload new logo
        newLogoUrl = await uploadLogo(file);
        setLogoUrl(newLogoUrl);
      }

      // Save to Firebase or localStorage
      if (firestore) {
        try {
          const settingsDoc = doc(firestore, 'general_settings', 'website');
          await setDoc(settingsDoc, {
            website_title: websiteTitle,
            website_logo_url: newLogoUrl,
            default_logo_url: defaultLogoUrl,
            updated_at: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error('Error saving to Firestore:', error);
          throw error;
        }
      } else {
        // Fallback to localStorage
        localStorage.setItem('website_title', websiteTitle);
        localStorage.setItem('website_logo_url', newLogoUrl);
        localStorage.setItem('default_logo_url', defaultLogoUrl);
      }

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('websiteSettingsChanged', {
        detail: { websiteTitle, logoUrl: newLogoUrl }
      }));

      showToast('✅ Logo and Title updated successfully!', 'success');
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      setSaving(true);
      
      // Delete current logo from storage
      await deleteCurrentLogo();
      
      // Update Firebase or localStorage
      if (firestore) {
        try {
          const settingsDoc = doc(firestore, 'general_settings', 'website');
          await setDoc(settingsDoc, {
            website_title: websiteTitle,
            website_logo_url: defaultLogoUrl,
            default_logo_url: defaultLogoUrl,
            updated_at: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error('Error saving to Firestore:', error);
          // Fallback to localStorage
          localStorage.setItem('website_logo_url', defaultLogoUrl);
        }
      } else {
        // Fallback to localStorage
        localStorage.setItem('website_logo_url', defaultLogoUrl);
      }

      // Update local state
      setLogoUrl(defaultLogoUrl);
      setLogoPreview(defaultLogoUrl);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('websiteSettingsChanged', {
        detail: { websiteTitle, logoUrl: defaultLogoUrl }
      }));

      showToast('Logo deleted successfully! Using default logo.', 'success');
    } catch (error) {
      console.error('Error deleting logo:', error);
      showToast('Failed to delete logo. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Logo and Title Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logo Upload Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Logo</h3>
          
          {/* Logo Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Preview
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-h-32 mx-auto object-contain"
                />
              ) : (
                <div className="text-gray-400">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p>No logo selected</p>
                </div>
              )}
            </div>
          </div>

          {/* File Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Logo File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpg,image/jpeg,image/svg+xml"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PNG, JPG, JPEG, SVG. Max size: 5MB
            </p>
          </div>

          {/* Delete Logo Button */}
          {logoUrl && logoUrl !== defaultLogoUrl && (
            <button
              onClick={handleDeleteLogo}
              disabled={saving || uploading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition duration-200 disabled:cursor-not-allowed"
            >
              Delete Logo
            </button>
          )}
        </div>

        {/* Website Title Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Title</h3>
          
          <div className="mb-6">
            <label htmlFor="website-title" className="block text-sm font-medium text-gray-700 mb-2">
              Website Title
            </label>
            <input
              id="website-title"
              type="text"
              value={websiteTitle}
              onChange={(e) => setWebsiteTitle(e.target.value)}
              placeholder="Enter website title (e.g., Pixelify – AI Image Converter)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This title will appear in the browser tab and website header
            </p>
          </div>

          {/* Current Settings Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Settings</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Title:</span> {websiteTitle || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Logo:</span> {logoUrl ? 'Custom logo' : 'Default logo'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <button
          onClick={handleSaveSettings}
          disabled={saving || uploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
        >
          {saving || uploading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {uploading ? 'Uploading...' : 'Saving...'}
            </div>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
};

export default LogoTitleManagement;
