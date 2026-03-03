import React, { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import QuillEditor from './QuillEditor';
import { FaPlus, FaTrash, FaEdit, FaEye, FaTimes, FaSave, FaCheck, FaNewspaper } from 'react-icons/fa';

const BlogManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: 'Admin',
        category: 'General',
        featuredImage: '',
        published: true
    });
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch blogs from Firestore
    useEffect(() => {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const blogList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBlogs(blogList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newData = { ...prev, [name]: val };
            // Auto-generate slug from title
            if (name === 'title' && !editingBlog) {
                newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
            return newData;
        });
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingBlog) {
                const blogRef = doc(db, 'blogs', editingBlog.id);
                await updateDoc(blogRef, {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'blogs'), {
                    ...formData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }

            resetForm();
            triggerSuccess();
        } catch (error) {
            console.error('Error saving blog:', error);
            alert('Failed to save blog post.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt || '',
            content: blog.content,
            author: blog.author || 'Admin',
            category: blog.category || 'General',
            featuredImage: blog.featuredImage || '',
            published: blog.published ?? true
        });
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            try {
                await deleteDoc(doc(db, 'blogs', id));
                triggerSuccess();
            } catch (error) {
                console.error('Error deleting blog:', error);
                alert('Failed to delete blog post.');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            author: 'Admin',
            category: 'General',
            featuredImage: '',
            published: true
        });
        setEditingBlog(null);
        setIsAdding(false);
    };

    const triggerSuccess = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    if (loading && blogs.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    <FaNewspaper className="mr-3 text-blue-600" />
                    Blog Management
                </h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-200"
                    >
                        <FaPlus className="mr-2" /> Add New Post
                    </button>
                )}
            </div>

            {showSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center">
                    <FaCheck className="mr-2" />
                    Action completed successfully!
                </div>
            )}

            {isAdding ? (
                <div className="bg-white border rounded-lg shadow-sm p-6 overflow-visible">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                            {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-500 hover:text-red-500">
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter blog title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none"
                                    placeholder="url-friendly-slug"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg outline-none"
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="published"
                                        checked={formData.published}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.published ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                        <div className={`absolute w-3 h-3 bg-white rounded-full top-1 transition-transform ${formData.published ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-700">Published</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL (optional)</label>
                            <input
                                type="text"
                                name="featuredImage"
                                value={formData.featuredImage}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg outline-none"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (meta description)</label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleInputChange}
                                rows="2"
                                className="w-full px-4 py-2 border rounded-lg outline-none"
                                placeholder="Short summary for SEO and listing..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                            <div className="border rounded-lg overflow-hidden">
                                <QuillEditor
                                    value={formData.content}
                                    onChange={handleContentChange}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium flex items-center disabled:bg-blue-400"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : <FaSave className="mr-2" />}
                                {editingBlog ? 'Update Post' : 'Publish Post'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Title</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Slug</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Category</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {blogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No blog posts found. Click "Add New Post" to create one.
                                    </td>
                                </tr>
                            ) : (
                                blogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{blog.title}</div>
                                            <div className="text-xs text-gray-500">By {blog.author}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{blog.slug}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                                {blog.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {blog.published ? (
                                                <span className="text-green-600 flex items-center text-sm">
                                                    <FaCheck className="mr-1" size={10} /> Published
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Draft</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleEdit(blog)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <a
                                                    href={`/blog/${blog.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-600 hover:text-gray-800"
                                                    title="View"
                                                >
                                                    <FaEye />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BlogManagement;
