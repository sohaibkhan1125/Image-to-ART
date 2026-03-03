import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import HeaderSimple from '../components/HeaderSimple';
import FooterSimple from '../components/FooterSimple';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUser, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'blogs'),
            where('published', '==', true),
            orderBy('createdAt', 'desc')
        );

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

    return (
        <div className="min-h-screen bg-gray-900">
            <SEO
                title="Blog - Image to Art"
                description="Latest articles, tips and tricks about AI image generation and pixel art."
            />
            <HeaderSimple />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Blog</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Discover insights, tutorials, and the latest updates in the world of AI-powered creative tools.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
                        <p className="text-gray-400 text-xl font-medium">No blog posts found yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog, index) => (
                            <motion.article
                                key={blog.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-primary/50 transition-all duration-300 group flex flex-col h-full"
                            >
                                <Link to={`/blog/${blog.slug}`} className="block relative h-52 overflow-hidden">
                                    {blog.featuredImage ? (
                                        <img
                                            src={blog.featuredImage}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center p-8">
                                            <span className="text-primary font-bold text-2xl opacity-20">{blog.title}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            {blog.category}
                                        </span>
                                    </div>
                                </Link>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                                        <span className="flex items-center">
                                            <FaCalendarAlt className="mr-1.5" />
                                            {blog.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || 'Recent'}
                                        </span>
                                        <span className="flex items-center">
                                            <FaUser className="mr-1.5" />
                                            {blog.author}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                                    </h2>

                                    <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                        {blog.excerpt || "Read more about this interesting topic..."}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-700/50">
                                        <Link
                                            to={`/blog/${blog.slug}`}
                                            className="text-primary hover:text-white flex items-center text-sm font-bold transition-colors group-hover:translate-x-1 duration-300 inline-flex"
                                        >
                                            Read More <FaChevronRight className="ml-2 text-xs" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </main>

            <FooterSimple />
        </div>
    );
};

export default Blog;
