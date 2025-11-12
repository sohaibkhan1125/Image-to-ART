// LogoTitleSettings.jsx
import React, { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";

/*
  Requirements this component meets:
  - Controlled title input
  - File input preview via object URL
  - uploadBytesResumable with on('state_changed') progress & robust error handling
  - Save to Firestore only after successful upload (await)
  - Delete logo logic (delete from storage then set default URL in Firestore)
  - Disable Save button during operations to avoid accidental aborts
  - Simple retry mechanism on transient errors
*/

const SETTINGS_DOC = doc(db, "settings", "general"); // single doc

export default function LogoTitleSettings({ defaultLogoUrl = "/logo192.png" }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [currentLogoUrl, setCurrentLogoUrl] = useState(defaultLogoUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const uploadTaskRef = useRef(null); // keep current upload task to cancel/cleanup if needed

  useEffect(() => {
    let unsub = false;
    async function loadSettings() {
      try {
        const snap = await getDoc(SETTINGS_DOC);
        if (!unsub && snap.exists()) {
          const data = snap.data();
          setTitle(data.website_title || "");
          setCurrentLogoUrl(data.website_logo_url || defaultLogoUrl);
        } else if (!unsub) {
          // initialize doc with defaults if missing
          await setDoc(SETTINGS_DOC, {
            website_title: "My Pixel App",
            website_logo_url: defaultLogoUrl,
            default_logo_url: defaultLogoUrl,
            maintenance_mode: false
          });
          setCurrentLogoUrl(defaultLogoUrl);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Failed to load settings. Check console for details.");
      } finally {
        if (!unsub) setLoading(false);
      }
    }
    loadSettings();

    return () => { unsub = true; /* cleanup */ };
  }, [defaultLogoUrl]);

  // Clean up object URL when selectedFile changes/unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      // cancel upload if component unmounts
      if (uploadTaskRef.current && uploadTaskRef.current.cancel) {
        try { uploadTaskRef.current.cancel(); } catch (e) { /* ignore */ }
      }
    };
  }, [previewUrl]);

  const onFileChange = (e) => {
    setError(null);
    setSuccess(null);
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    // optional: enforce size limit (e.g., 5MB)
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB}MB allowed.`);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please select PNG, JPG, JPEG, or SVG.');
      return;
    }

    setSelectedFile(file);
    // create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Retry helper for transient errors
  async function retryWithBackoff(fn, retries = 3, initialDelay = 500) {
    let attempt = 0;
    let delay = initialDelay;
    while (attempt <= retries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt > retries) throw err;
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, err);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }
  }

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
    setError(null);
    setSuccess(null);
    setSaving(true);
    setProgress(0);

    try {
      let logoUrlToSave = currentLogoUrl;
      let storagePath = null;

      // If a new file is selected, upload it first
      if (selectedFile) {
        const timestamp = Date.now();
        const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `website_assets/logo_${timestamp}_${sanitizedName}`;
        const ref = storageRef(storage, path);
        const task = uploadBytesResumable(ref, selectedFile);
        uploadTaskRef.current = task; // store so it can be cancelled

        // Wrap state_changed listener in a promise to await completion
        await new Promise((resolve, reject) => {
          task.on(
            "state_changed",
            (snapshot) => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setProgress(pct);
            },
            (uploadError) => {
              console.error("Upload error:", uploadError);
              // treat storage/canceled as user cancel, show message
              reject(uploadError);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(task.snapshot.ref);
                logoUrlToSave = downloadURL;
                storagePath = path; // store path for potential deletion
                resolve(downloadURL);
              } catch (e) {
                reject(e);
              }
            }
          );
        });
      }

      // After upload finished (or no file selected), update Firestore
      const updateFn = async () => {
        const updateData = {
          website_title: title || "",
          website_logo_url: logoUrlToSave,
        };
        
        // If we have a storage path, store it for future deletion
        if (storagePath) {
          updateData.logo_storage_path = storagePath;
        }
        
        await updateDoc(SETTINGS_DOC, updateData);
      };

      // Use retry wrapper for Firestore update (transient network issues)
      await retryWithBackoff(updateFn, 2, 500);

      // Update local state after success
      setCurrentLogoUrl(logoUrlToSave);
      setSelectedFile(null);
      if (previewUrl) { 
        URL.revokeObjectURL(previewUrl); 
        setPreviewUrl(null); 
      }

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('websiteSettingsChanged', {
        detail: { websiteTitle: title, logoUrl: logoUrlToSave }
      }));

      setSuccess("✅ Settings saved successfully!");
      showToast("Settings saved successfully!", 'success');
    } catch (err) {
      console.error("Save failed:", err);
      // handle specific firebase errors
      const code = err?.code || err?.message || "";
      if (code.includes("auth") || code.includes("permission")) {
        setError("You are not authorized to update settings. Check Firebase rules.");
      } else if (code === "storage/canceled" || code === "User aborted a request") {
        setError("Upload cancelled. Try again.");
      } else if (code.includes("network") || code.includes("timeout")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to save settings. Check console for details.");
      }
      showToast("Failed to save settings. Please try again.", 'error');
    } finally {
      setSaving(false);
      setProgress(0);
      uploadTaskRef.current = null;
    }
  };

  const handleDeleteLogo = async () => {
    setError(null);
    setSuccess(null);
    const confirmDelete = window.confirm("Delete current logo and revert to default?");
    if (!confirmDelete) return;

    setSaving(true);
    try {
      // Get current settings to find storage path
      const snap = await getDoc(SETTINGS_DOC);
      const data = snap.data();
      
      // If current logo is in Firebase Storage, delete it
      if (data?.logo_storage_path && currentLogoUrl.includes("firebasestorage.googleapis.com")) {
        try {
          const oldRef = storageRef(storage, data.logo_storage_path);
          await deleteObject(oldRef);
          console.log("Old logo deleted from storage");
        } catch (deleteErr) {
          console.warn("Could not delete old logo from storage:", deleteErr);
          // Continue anyway - not critical
        }
      }

      // Update Firestore to default URL
      await updateDoc(SETTINGS_DOC, {
        website_logo_url: defaultLogoUrl,
        logo_storage_path: null // clear storage path
      });
      
      setCurrentLogoUrl(defaultLogoUrl);
      setSelectedFile(null);
      if (previewUrl) { 
        URL.revokeObjectURL(previewUrl); 
        setPreviewUrl(null); 
      }

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('websiteSettingsChanged', {
        detail: { websiteTitle: title, logoUrl: defaultLogoUrl }
      }));

      setSuccess("Logo reverted to default.");
      showToast("Logo deleted successfully!", 'success');
    } catch (err) {
      console.error("Delete logo error:", err);
      setError("Failed to delete logo. Check console for details.");
      showToast("Failed to delete logo. Please try again.", 'error');
    } finally {
      setSaving(false);
    }
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
              <img
                src={previewUrl || currentLogoUrl}
                alt="Logo preview"
                className="max-h-32 mx-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div 
                className="text-gray-400"
                style={{ display: 'none' }}
              >
                <div className="text-4xl mb-2">🖼️</div>
                <p>No logo selected</p>
              </div>
            </div>
          </div>

          {/* File Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Logo File
            </label>
            <input
              type="file"
              accept="image/png,image/jpg,image/jpeg,image/svg+xml"
              onChange={onFileChange}
              disabled={saving}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PNG, JPG, JPEG, SVG. Max size: 5MB
            </p>
          </div>

          {/* Delete Logo Button */}
          {currentLogoUrl && currentLogoUrl !== defaultLogoUrl && (
            <button
              onClick={handleDeleteLogo}
              disabled={saving}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter website title (e.g., Pixelify – AI Image Converter)"
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="font-medium">Title:</span> {title || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Logo:</span> {currentLogoUrl ? 'Custom logo' : 'Default logo'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8">
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
              {progress > 0 ? `Uploading... ${progress}%` : 'Saving...'}
            </div>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• If uploads fail, check Firebase Storage & Firestore rules</li>
          <li>• Ensure you are authenticated as an admin</li>
          <li>• Large files may take longer to upload</li>
          <li>• Changes will appear on the main website immediately</li>
        </ul>
      </div>
    </div>
  );
}
