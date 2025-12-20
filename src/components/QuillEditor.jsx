import React, { useEffect, useRef, useState } from 'react';
import './QuillEditor.css';

const QuillEditor = ({ value, onChange, onSave }) => {
    const editorRef = useRef(null);
    const quillInstance = useRef(null);
    const [stats, setStats] = useState({ words: 0, chars: 0 });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [codeOutput, setCodeOutput] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Initialize Quill
    useEffect(() => {
        const initEditor = () => {
            if (!window.Quill) {
                console.error('Quill is not loaded');
                return;
            }

            // prevent double initialization
            if (quillInstance.current) return;

            const toolbarOptions = [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean']
            ];

            const quill = new window.Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: toolbarOptions,
                        handlers: {
                            image: imageHandler
                        }
                    },
                    history: {
                        delay: 1000,
                        maxStack: 50,
                        userOnly: true
                    }
                },
                placeholder: 'Start writing your document here...'
            });

            quillInstance.current = quill;

            // Set initial value
            if (value) {
                quill.clipboard.dangerouslyPasteHTML(value);
                updateStats();
            }

            // Sync changes
            quill.on('text-change', () => {
                const html = quill.root.innerHTML;
                if (onChange) {
                    onChange(html);
                }
                updateStats();
            });
        };

        const checkQuill = setInterval(() => {
            if (window.Quill) {
                clearInterval(checkQuill);
                initEditor();
            }
        }, 100);

        return () => clearInterval(checkQuill);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update value from props if changed externally (optional, handle with care to avoid loops)
    // For now, simpler to not force update from props after init unless key changes

    // Stats logic
    const updateStats = () => {
        if (!quillInstance.current) return;
        const text = quillInstance.current.getText();
        const wordCount = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
        const charCount = text.length > 1 ? text.length - 1 : 0;
        setStats({ words: wordCount, chars: charCount });
    };

    // Image Handler
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            if (/^image\//.test(file.type)) {
                saveToServer(file);
            } else {
                showToast('Please select a valid image file', 'error');
            }
        };
    };

    const saveToServer = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const quill = quillInstance.current;
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', reader.result);
            quill.setSelection(range.index + 1);
            showToast('Image inserted successfully');
        };
    };

    // Actions
    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear the editor? This cannot be undone.')) {
            quillInstance.current.setContents([]);
            showToast('Editor cleared');
        }
    };

    const handleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        // Toggle body scroll
        document.body.style.overflow = !isFullscreen ? 'hidden' : '';
    };

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
        // We need to apply this class to the wrapper, or handle distinct styles
    };

    const handleConvertToCode = () => {
        if (!quillInstance.current) return;
        const html = quillInstance.current.root.innerHTML;
        const formatted = formatHTML(html);
        setCodeOutput(formatted);
        setShowCodeModal(true);

        // Highlight after render
        setTimeout(() => {
            if (window.Prism) {
                const el = document.getElementById('codeOutputCode');
                if (el) window.Prism.highlightElement(el);
            }
        }, 100);
    };

    const formatHTML = (html) => {
        let formatted = '';
        let indent = '';
        const tab = '    ';

        // Simple formatter
        html.split(/>\s*</).forEach(function (element) {
            if (element.match(/^\/\w/)) {
                indent = indent.substring(tab.length);
            }
            formatted += indent + '<' + element + '>\r\n';
            if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith("input") && !element.startsWith("img") && !element.startsWith("br")) {
                indent += tab;
            }
        });
        return formatted.substring(1, formatted.length - 3);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(codeOutput).then(() => {
            showToast('HTML code copied to clipboard');
        });
    };

    const downloadHtml = () => {
        const blob = new Blob([codeOutput], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const showToast = (msg, type = 'success') => {
        setToast({ show: true, message: msg, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    return (
        <div className={`professional-editor-wrapper ${isDarkMode ? 'dark-mode' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
            {/* Header */}
            <div className="editor-header">
                <div className="editor-logo">
                    <i className="fas fa-pen-nib"></i>
                    Professional Editor
                </div>
                <div className="header-controls">
                    <button className="btn-editor btn-editor-primary" onClick={handleConvertToCode}>
                        <i className="fas fa-code"></i> Convert Text to Code
                    </button>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 5px' }}></div>
                    <button className="btn-editor btn-editor-icon" onClick={handleThemeToggle} title="Toggle Dark Mode">
                        <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>
                    <button className="btn-editor btn-editor-icon" onClick={handleFullscreen} title="Fullscreen">
                        <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                    </button>
                    <button className="btn-editor btn-editor-icon" onClick={handleClear} title="Clear All">
                        <i className="fas fa-trash-alt"></i>
                    </button>
                    {onSave && (
                        <button className="btn-editor" onClick={() => { onSave(); showToast('Saving...'); }} title="Save Content">
                            <i className="fas fa-save"></i> Save
                        </button>
                    )}
                </div>
            </div>

            {/* Main Editor */}
            <div className="editor-main-container">
                <div ref={editorRef} style={{ height: '500px' }}></div>
            </div>

            {/* Status Bar */}
            <div className="stats-bar">
                <div className="stats-group">
                    <span>{stats.words} words</span>
                    <span>{stats.chars} characters</span>
                </div>
                <div className="stats-group">
                    {/* Add last saved info if needed */}
                </div>
            </div>

            {/* Toast */}
            <div className={`editor-toast ${toast.show ? 'show' : ''}`} style={{ borderLeftColor: toast.type === 'error' ? 'var(--error-color)' : 'var(--primary-color)' }}>
                <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
                <span>{toast.message}</span>
            </div>

            {/* Code Modal */}
            <div className={`editor-modal ${showCodeModal ? 'active' : ''}`}>
                <div className="modal-content-wrapper">
                    <div className="modal-header-editor">
                        <h3><i className="fas fa-file-code"></i> Generated HTML Code</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-editor" onClick={copyCode}>
                                <i className="fas fa-copy"></i> Copy HTML
                            </button>
                            <button className="btn-editor" onClick={downloadHtml}>
                                <i className="fas fa-download"></i> Download .html
                            </button>
                            <button className="btn-editor btn-editor-icon" onClick={() => setShowCodeModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div className="modal-body-editor">
                        <pre className="code-output-field">
                            <code id="codeOutputCode" className="language-html">{codeOutput}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuillEditor;
