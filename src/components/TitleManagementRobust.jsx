// TitleManagementRobust.jsx - AbortError-resistant title management component
import React, { useState, useEffect, useRef, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const SETTINGS_DOC = doc(db, "settings", "general");

export default function TitleManagementRobust() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // isMounted ref to prevent setState after unmount
  const isMountedRef = useRef(true);
  const unsubscribeRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Debounced save function to prevent duplicate calls
  const debouncedSave = useCallback(
    (() => {
      let timeoutId;
      return (titleValue) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (isMountedRef.current) {
            handleSaveInternal(titleValue);
          }
        }, 500); // 500ms debounce
      };
    })(),
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    
    // Real-time listener with proper cleanup
    const setupRealtimeListener = () => {
      try {
        unsubscribeRef.current = onSnapshot(
          SETTINGS_DOC,
          (snapshot) => {
            if (!isMountedRef.current) return;
            
            if (snapshot.exists()) {
              const data = snapshot.data();
              const websiteTitle = data.website_title || "";
              setTitle(websiteTitle);
            } else {
              // Document doesn't exist, create it with default values
              if (isMountedRef.current) {
                setTitle("PixelArt Converter");
                createDefaultDocument();
              }
            }
            
            if (isMountedRef.current) {
              setLoading(false);
            }
          },
          (error) => {
            if (!isMountedRef.current) return;
            
            // Handle AbortError gracefully
            if (error.name === 'AbortError') {
              console.log('Firestore listener was aborted');
              return;
            }
            
            console.error("Error in Firestore listener:", error);
            if (isMountedRef.current) {
              setTitle("PixelArt Converter");
              setError("Failed to load settings. You can still edit the title.");
              setLoading(false);
            }
          }
        );
      } catch (err) {
        if (!isMountedRef.current) return;
        
        if (err.name === 'AbortError') {
          console.log('Firestore listener setup was aborted');
          return;
        }
        
        console.error("Error setting up Firestore listener:", err);
        if (isMountedRef.current) {
          setTitle("PixelArt Converter");
          setError("Failed to load settings. You can still edit the title.");
          setLoading(false);
        }
      }
    };

    setupRealtimeListener();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Clear any pending timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Unsubscribe from Firestore listener
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error("Error unsubscribing from Firestore:", err);
          }
        }
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Create default document if it doesn't exist
  const createDefaultDocument = async () => {
    try {
      await setDoc(SETTINGS_DOC, {
        website_title: "PixelArt Converter",
        created_at: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Document creation was aborted');
        return;
      }
      console.warn("Could not create document:", err);
    }
  };

  // Internal save function with AbortError handling
  const handleSaveInternal = async (titleValue) => {
    if (!isMountedRef.current || saving) return;
    
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Use setDoc with merge to create or update the document
      await setDoc(SETTINGS_DOC, {
        website_title: titleValue || "PixelArt Converter",
        updated_at: new Date().toISOString()
      }, { merge: true });

      if (!isMountedRef.current) return;

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('websiteTitleChanged', {
        detail: { websiteTitle: titleValue }
      }));

      setSuccess("✅ Website title updated successfully!");
      showToast("Website title updated successfully!", 'success');
    } catch (err) {
      if (!isMountedRef.current) return;
      
      // Handle AbortError gracefully
      if (err.name === 'AbortError') {
        console.log('Save operation was aborted');
        return;
      }
      
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
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  // Public save function with debouncing
  const handleSave = useCallback(() => {
    if (saving) return;
    debouncedSave(title);
  }, [title, saving, debouncedSave]);

  // Handle input changes with debouncing
  const handleInputChange = useCallback((e) => {
    if (!isMountedRef.current) return;
    
    const newValue = e.target.value;
    setTitle(newValue);
    
    // Auto-save after user stops typing (debounced)
    debouncedSave(newValue);
  }, [debouncedSave]);

  const showToast = (message, type = 'success') => {
    if (!isMountedRef.current) return;
    
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
            This title will appear in the browser tab and website header. Changes are saved automatically.
          </p>
        </div>

        {/* Current Settings Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Settings</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Title:</span> {title || 'Not set'}
            </div>
            <div>
              <span className="font-medium">Loading:</span> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Saving:</span> {saving ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Manual Save Button (optional) */}
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
          <li>• Changes are saved automatically as you type</li>
          <li>• The title will be visible in the browser tab and website header</li>
          <li>• Real-time updates ensure changes appear immediately</li>
          <li>• If you encounter errors, check Firebase rules and authentication</li>
        </ul>
      </div>
    </div>
  );
}
