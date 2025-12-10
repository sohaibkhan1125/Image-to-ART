import React, { useState, useEffect } from 'react';

const ContentDisplay = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    try {
      console.log('[ContentDisplay] Fetching content from Supabase...');
      setLoading(true);

      const { loadContent } = await import('../supabaseService');
      const data = await loadContent('pixelart_homepage_content', false, '');

      console.log('[ContentDisplay] Received data:', data);
      console.log('[ContentDisplay] Data type:', typeof data);
      console.log('[ContentDisplay] Data length:', data?.length || 0);

      setContent(data || '');
      setError(null);
    } catch (err) {
      console.error('[ContentDisplay] Error fetching content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();

    // Listen for content updates from admin panel
    const handleContentUpdate = (event) => {
      console.log('[ContentDisplay] Content update event received:', event.detail);
      if (event.detail && event.detail.slug === 'pixelart_homepage_content') {
        setContent(event.detail.content || '');
      }
    };

    window.addEventListener('contentUpdated', handleContentUpdate);

    return () => {
      window.removeEventListener('contentUpdated', handleContentUpdate);
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="py-16 bg-red-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-red-400 p-4 border border-red-500 rounded">
            <strong>Error loading content:</strong> {error}
          </div>
        </div>
      </section>
    );
  }

  // Don't render anything if no content
  if (!content || content.trim() === '') {
    console.log('[ContentDisplay] No content to display');
    return null;
  }

  console.log('[ContentDisplay] Rendering content with', content.length, 'characters');

  // Render content
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
