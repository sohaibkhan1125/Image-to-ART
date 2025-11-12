// TitleManagementSimple.jsx - Simplified title management component
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const SETTINGS_DOC = doc(db, "settings", "general");

export default function TitleManagementSimple() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(SETTINGS_DOC);
        
        if (snap.exists()) {
          const data = snap.data();
          const websiteTitle = data.website_title || "";
          setTitle(websiteTitle);
        } else {
          // Document doesn't exist, create it with default values
          setTitle("PixelArt Converter");
          try {
            await setDoc(SETTINGS_DOC, {
              website_title: "PixelArt Converter",
              created_at: new Date().toISOString()
            });
          } catch (createErr) {
            console.warn("Could not create document:", createErr);
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setTitle("PixelArt Converter");
        setError("Failed to load settings. You can still edit the title.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

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

  const handleSave = async () => {
    if (saving) return;
    
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Use setDoc with merge to create or update the document
      await setDoc(SETTINGS_DOC, {
        website_title: title || "PixelArt Converter",
        updated_at: new Date().toISOString()
      }, { merge: true });

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('websiteTitleChanged', {
        detail: { websiteTitle: title }
      }));

      setSuccess("✅ Website title updated successfully!");
      showToast("Website title updated successfully!", 'success');
    } catch (err) {
      console.error("Save failed:", err);
      const code = err?.code || err?.message || "";
      if (code.includes("auth") || code.includes("permission")) {
        setError("You are not authorized to update settings. Check Firebase rules.");
      } else if (code.includes("network") || code.includes("timeout")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to save title. Check console for details.");
      }
      showToast("Failed to save title. Please try again.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setTitle(newValue);
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
            placeholder="Enter website title (e.g., Pixelify – AI Image Converter)"
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1">
            This title will appear in the browser tab and website header
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>Title State: "{title}"</div>
            <div>Title Length: {title.length}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Saving: {saving ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-8 py-3 rounded-lg font-medium transition duration-200 transform ${
            saving 
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
          <li>• If you encounter errors, check Firebase rules and authentication</li>
        </ul>
      </div>
    </div>
  );
}
