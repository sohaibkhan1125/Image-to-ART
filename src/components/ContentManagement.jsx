import React, { useState, useEffect } from 'react';
import FroalaEditorComponent from 'react-froala-wysiwyg';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/js/plugins.pkgd.min.js';
import 'font-awesome/css/font-awesome.css';
import 'froala-editor/js/third_party/font_awesome.min.js';
import './ContentEditor.css';

const froalaConfig = {
	key: 'nQE2uG3B1F1nmnspC5qpH3B3C11A6D5F5F5G4A-8A-7A2cefE3B2F3C2G2ilva1EAJLQCVLUVBf1NXNRSSATEXA-62WVLGKF2G2H2G1I4B3B2B8D7F6==',
	placeholderText: 'Type or paste your content here!',
	toolbarButtons: [
		['undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikeThrough'],
		['paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent'],
		['insertLink', 'insertTable', 'quote', 'html']
	],
	charCounterCount: true
};

const ContentManagement = () => {
	const [content, setContent] = useState('');
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState(null);
	const [error, setError] = useState(null);
	const [debugMode, setDebugMode] = useState(false); // New debug toggle
	const [lastSaved, setLastSaved] = useState(null); // Track what we tried to save

	useEffect(() => {
		loadContent();
	}, []);

	const loadContent = async () => {
		try {
			const { loadContent: loadFromSupabase } = await import('../supabaseService');
			const data = await loadFromSupabase('pixelart_homepage_content');
			setContent(data || '');
		} catch (error) {
			console.error('Error loading content:', error);
			setError('Failed to load content. Please try again.');
		}
	};

	const saveContent = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);
		setLastSaved(content); // Capture what we are sending

		try {
			const { saveContent: saveToSupabase } = await import('../supabaseService');

			console.log('[ContentManagement] Saving content to Supabase:', content); // Debug log

			const result = await saveToSupabase('pixelart_homepage_content', content);

			if (result.success) {
				setSuccess('Content saved successfully!');
				// Dispatch event to update other components
				window.dispatchEvent(new CustomEvent('contentUpdated', {
					detail: { slug: 'pixelart_homepage_content', content }
				}));
			} else {
				throw new Error(result.error?.message || 'Failed to save content');
			}
		} catch (error) {
			console.error('Error saving content:', error);
			setError('Error saving content: ' + error.message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-lg p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">Content Management</h2>
				<p className="text-gray-600">Create and manage content that will be displayed above the FAQ section on your website.</p>
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

			<div className="flex justify-end mb-2">
				<button
					onClick={() => setDebugMode(!debugMode)}
					className="text-xs text-blue-600 underline"
				>
					{debugMode ? 'Switch to Rich Editor' : 'Switch to Debug/Raw Editor'}
				</button>
			</div>

			<div className="main-container">
				{debugMode ? (
					<div className="p-4 border-2 border-dashed border-blue-300 rounded bg-blue-50">
						<label className="block text-sm font-bold text-blue-800 mb-2">Raw Content Debug Mode</label>
						<textarea
							className="w-full h-64 p-4 border rounded font-mono text-sm"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Type raw HTML or text here..."
						/>
						<div className="mt-2 text-xs text-gray-500">
							Current Length: {content.length} characters
						</div>
					</div>
				) : (
					<FroalaEditorComponent
						tag='textarea'
						model={content}
						onModelChange={(model) => {
							console.log('Froala model validation:', model);
							setContent(model);
						}}
						config={froalaConfig}
					/>
				)}
			</div>

			{/* Debug Info Display */}
			{lastSaved !== null && (
				<div className="mt-4 p-3 bg-gray-100 border rounded text-xs font-mono overflow-auto max-h-32">
					<strong>Last Attempted Save Payload:</strong><br />
					Length: {lastSaved.length}<br />
					Content: {lastSaved.substring(0, 200)}...
				</div>
			)}

			<div className="mt-6 flex justify-end space-x-4">
				<button
					onClick={loadContent}
					className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
				>
					Reset
				</button>
				<button
					onClick={saveContent}
					disabled={saving}
					className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{saving ? 'Saving...' : 'Save Content'}
				</button>
			</div>
		</div>
	);
};

export default ContentManagement;
