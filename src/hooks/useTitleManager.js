// useTitleManager.js - AbortError-resistant centralized title management hook
import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Global title state to prevent multiple listeners
let globalTitle = 'PixelArt Converter';
let globalListeners = new Set();
let globalUnsubscribe = null;
let isInitialized = false;

// Initialize global Firestore listener with AbortError handling
const initializeGlobalListener = () => {
  if (isInitialized || globalUnsubscribe) return;
  
  try {
    const settingsDoc = doc(db, 'settings', 'general');
    globalUnsubscribe = onSnapshot(
      settingsDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          globalTitle = data.website_title || 'PixelArt Converter';
        } else {
          globalTitle = 'PixelArt Converter';
        }
        
        // Notify all listeners
        globalListeners.forEach(callback => {
          try {
            callback(globalTitle);
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Error in title listener:', error);
            }
          }
        });
      },
      (error) => {
        // Handle AbortError gracefully
        if (error.name === 'AbortError') {
          console.log('Global Firestore listener was aborted');
          return;
        }
        
        console.error('Error in global Firestore listener:', error);
        globalTitle = 'PixelArt Converter';
        
        // Notify listeners of fallback value
        globalListeners.forEach(callback => {
          try {
            callback(globalTitle);
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.error('Error in title listener callback:', err);
            }
          }
        });
      }
    );
    isInitialized = true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Global listener setup was aborted');
      return;
    }
    
    console.error('Error initializing global Firestore listener:', error);
    globalTitle = 'PixelArt Converter';
    isInitialized = true;
  }
};

export const useTitleManager = () => {
  const [title, setTitle] = useState(globalTitle);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const listenerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Initialize global listener if not already done
    initializeGlobalListener();

    // Create listener callback with isMounted check
    const updateTitle = (newTitle) => {
      if (!isMountedRef.current) return;
      setTitle(newTitle);
      setLoading(false);
    };

    listenerRef.current = updateTitle;
    globalListeners.add(updateTitle);

    // Set initial title
    if (isMountedRef.current) {
      setTitle(globalTitle);
      setLoading(false);
    }

    // Listen for custom events (fallback)
    const handleTitleChange = (event) => {
      if (!isMountedRef.current) return;
      
      if (event.detail.websiteTitle) {
        setTitle(event.detail.websiteTitle);
        globalTitle = event.detail.websiteTitle;
      }
    };

    window.addEventListener('websiteTitleChanged', handleTitleChange);

    return () => {
      isMountedRef.current = false;
      
      if (listenerRef.current) {
        globalListeners.delete(listenerRef.current);
      }
      window.removeEventListener('websiteTitleChanged', handleTitleChange);
    };
  }, []);

  return { title, loading };
};

// Cleanup function for when app unmounts
export const cleanupTitleManager = () => {
  globalListeners.clear();
  
  if (globalUnsubscribe) {
    try {
      globalUnsubscribe();
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error cleaning up global listener:', error);
      }
    }
    globalUnsubscribe = null;
  }
  
  isInitialized = false;
};
