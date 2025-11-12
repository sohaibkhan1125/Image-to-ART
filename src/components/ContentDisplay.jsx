import React, { useState, useEffect } from 'react';

const ContentDisplay = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (!isDevelopment || process.env.REACT_APP_API_URL) {
          const response = await fetch(`${API_BASE_URL}/api/settings`);
          if (response.ok) {
            const data = await response.json();
            setContent(data.content || '');
            setLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('admin_settings');
        if (savedSettings) {
          const data = JSON.parse(savedSettings);
          setContent(data.content || '');
        }
        setLoading(false);
      } catch (error) {
        console.warn('Error loading content:', error);
        setLoading(false);
      }
    };

    loadContent();

    // Listen for content updates
    const handleContentUpdate = (event) => {
      if (event.detail && event.detail.content !== undefined) {
        setContent(event.detail.content);
      }
    };

    window.addEventListener('settingsUpdated', handleContentUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleContentUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-400 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-400 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!content || content.trim() === '') {
    return null;
  }

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="prose prose-lg max-w-none text-white [&>*]:text-white [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>h4]:text-white [&>h5]:text-white [&>h6]:text-white [&>p]:text-white [&>li]:text-white [&>span]:text-white [&>strong]:text-white [&>em]:text-white [&>a]:text-blue-300 [&>a:hover]:text-blue-200"
          style={{
            color: 'white',
            '--tw-prose-body': 'white',
            '--tw-prose-headings': 'white',
            '--tw-prose-lead': 'white',
            '--tw-prose-links': '#60a5fa',
            '--tw-prose-bold': 'white',
            '--tw-prose-counters': 'white',
            '--tw-prose-bullets': 'white',
            '--tw-prose-hr': 'white',
            '--tw-prose-quotes': 'white',
            '--tw-prose-quote-borders': 'white',
            '--tw-prose-captions': 'white',
            '--tw-prose-code': 'white',
            '--tw-prose-pre-code': 'white',
            '--tw-prose-pre-bg': 'rgba(0, 0, 0, 0.1)',
            '--tw-prose-th-borders': 'white',
            '--tw-prose-td-borders': 'white'
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
};

export default ContentDisplay;
