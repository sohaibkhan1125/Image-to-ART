import React, { useState, useEffect } from 'react';
import FroalaEditorComponent from 'react-froala-wysiwyg';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/js/plugins.pkgd.min.js';
import 'font-awesome/css/font-awesome.css';
import 'froala-editor/js/third_party/font_awesome.min.js';
import './ContentEditor.css';

const froalaConfig = {
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

	useEffect(() => {
		loadContent();
	}, []);

	const loadContent = async () => {
		try {
			const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
			const isDevelopment = process.env.NODE_ENV === 'development';
			
			if (!isDevelopment || process.env.REACT_APP_API_URL) {
				const response = await fetch(`${API_BASE_URL}/api/settings`);
				if (response.ok) {
					const data = await response.json();
					setContent(data.content || '');
					return;
				}
			}
			
			// Fallback to localStorage
			const savedSettings = localStorage.getItem('admin_settings');
			if (savedSettings) {
				const data = JSON.parse(savedSettings);
				setContent(data.content || '');
			}
		} catch (error) {
			console.warn('Error loading content:', error);
		}
	};

	const saveContent = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
			const isDevelopment = process.env.NODE_ENV === 'development';
			
			const settingsData = {
				maintenance: false,
				title: "PixelArt Converter",
				content: content
			};

			if (!isDevelopment || process.env.REACT_APP_API_URL) {
				const response = await fetch(`${API_BASE_URL}/api/settings`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(settingsData),
				});

				if (response.ok) {
					setSuccess('Content saved successfully!');
					// Update localStorage as backup
					localStorage.setItem('admin_settings', JSON.stringify(settingsData));
					// Dispatch event to update other components
					window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settingsData }));
				} else {
					throw new Error('Failed to save content');
				}
			} else {
				// Save to localStorage in development
				localStorage.setItem('admin_settings', JSON.stringify(settingsData));
				setSuccess('Content saved to localStorage!');
				window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settingsData }));
			}
		} catch (error) {
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

			<div className="main-container">
				<FroalaEditorComponent
					tag='textarea'
					model={content}
					onModelChange={setContent}
					config={froalaConfig}
				/>
			</div>

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
