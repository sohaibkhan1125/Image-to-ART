import React, { useEffect, useState } from 'react';

const DEFAULT_TITLE = 'Transform Your Photos into Stunning Pixel Paintings 🎨';
const DEFAULT_SUBTITLE = 'Create vintage art from any image instantly using smart pixel rendering. Advanced color quantization and block averaging create authentic pixel paintings with clean color blocks and visible pixel grids. No registration required!';

const HeroManagement = () => {
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hero_settings');
      if (saved) {
        const data = JSON.parse(saved);
        if (data?.title) setTitle(data.title);
        if (data?.subtitle) setSubtitle(data.subtitle);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const resetToStored = () => {
    try {
      const saved = localStorage.getItem('hero_settings');
      if (saved) {
        const data = JSON.parse(saved);
        setTitle(data?.title || DEFAULT_TITLE);
        setSubtitle(data?.subtitle || DEFAULT_SUBTITLE);
      } else {
        setTitle(DEFAULT_TITLE);
        setSubtitle(DEFAULT_SUBTITLE);
      }
      setSuccess('Reset to last saved values.');
      setError(null);
    } catch (e) {
      setError('Failed to reset.');
      setSuccess(null);
    }
  };

  const save = () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const payload = { title, subtitle };
      localStorage.setItem('hero_settings', JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('heroSettingsUpdated', { detail: payload }));
      setSuccess('Hero content saved!');
    } catch (e) {
      setError('Failed to save hero content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hero Management</h2>
        <p className="text-gray-600">Update the hero section heading and subtitle on your website.</p>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={DEFAULT_TITLE}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28 bg-white text-gray-900 placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={DEFAULT_SUBTITLE}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={resetToStored}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Hero Content'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroManagement;

