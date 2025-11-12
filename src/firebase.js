// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyACBr9jiKX8MLMUcOkeNZElYhlm6n9UhwE",
  authDomain: "image-to-art-30258.firebaseapp.com",
  projectId: "image-to-art-30258",
  storageBucket: "image-to-art-30258.firebasestorage.app",
  messagingSenderId: "65507259149",
  appId: "1:65507259149:web:4ac53e3e0be7a6165bf644",
  measurementId: "G-H18W1ZJDQ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with error handling
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production, with error handling)
export const analytics = (() => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    return null;
  }
  try {
    return getAnalytics(app);
  } catch (e) {
    console.warn('Analytics initialization failed:', e);
    return null;
  }
})();

// Configure Firestore settings to prevent connection issues and AbortError
try {
  // Set offline persistence and force long polling for restrictive networks
  db.settings({
    cacheSizeBytes: 1048576, // 1MB cache
    ignoreUndefinedProperties: true,
    experimentalForceLongPolling: true // Fix for webchannel issues in restrictive networks
  });
} catch (error) {
  console.warn('Firestore settings configuration failed:', error);
}

// Global unhandledrejection handler to gracefully ignore AbortError logs
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.name === 'AbortError') {
      // Silently ignore AbortError to prevent console spam
      event.preventDefault();
      return;
    }
    
    // Log other unhandled rejections for debugging
    if (event.reason && event.reason.name !== 'AbortError') {
      console.error('Unhandled promise rejection:', event.reason);
    }
  });
}

// Export for backward compatibility
export const firestore = db;
