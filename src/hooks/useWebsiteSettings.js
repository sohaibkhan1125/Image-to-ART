import { useState, useEffect } from 'react';

const useWebsiteSettings = () => {
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const savedTitle = localStorage.getItem('website_title');
        if (savedTitle) setWebsiteTitle(savedTitle);
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    };

    const loadSettings = async () => {
      try {
        // Try to load from localStorage first (safer)
        loadFromLocalStorage();
        
        // Try Firebase if available (optional)
        try {
          const { db } = await import('../firebase');
          const { doc, getDoc, onSnapshot } = await import('firebase/firestore');
          
          if (db) {
            // Use new settings/general document structure
            const settingsDoc = doc(db, 'settings', 'general');
            const docSnap = await getDoc(settingsDoc);
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              setWebsiteTitle(data.website_title || '');
            }
            
            // Set up real-time listener
            const unsubscribe = onSnapshot(settingsDoc, (doc) => {
              if (doc.exists()) {
                const data = doc.data();
                setWebsiteTitle(data.website_title || '');
              }
            });
            
            return unsubscribe;
          }
        } catch (firebaseError) {
          console.warn('Firebase not available, using localStorage only:', firebaseError);
        }
      } catch (error) {
        console.error('Error loading website settings:', error);
      } finally {
        setLoading(false);
      }
    };

    let unsubscribe = null;
    loadSettings().then((unsub) => {
      unsubscribe = unsub;
    });

    // Listen for custom events (for localStorage fallback)
    const handleTitleChange = (event) => {
      if (event.detail.websiteTitle) {
        setWebsiteTitle(event.detail.websiteTitle);
      }
    };

    window.addEventListener('websiteTitleChanged', handleTitleChange);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('websiteTitleChanged', handleTitleChange);
    };
  }, []);

  return {
    websiteTitle,
    loading
  };
};

export default useWebsiteSettings;
