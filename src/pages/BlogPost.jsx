import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import HeaderSimple from '../components/HeaderSimple';
import FooterSimple from '../components/FooterSimple';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUser, FaChevronLeft, FaTag, FaShare } from 'react-icons/fa';

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'blogs'),
                    where('slug', '==', slug),
                    where('published', '==', true),
                    limit(1)
                );
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    navigate('/blog');
                    return;
                }

                setBlog({
                    id: querySnapshot.docs[0].id,
                    ...querySnapshot.docs[0].data()
                });
            } catch (error) {
                console.error('Error fetching blog post:', error);
                navigate('/blog');
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!blog) return null;

    const formattedDate = blog.createdAt?.toDate().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }) || 'Recent';

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog.title,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <SEO
                title={`${blog.title} - Blog`}
                description={blog.excerpt || "Read our latest blog post."}
            />
            <HeaderSimple />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <Link
                    to="/blog"
                    className="inline-flex items-center text-gray-400 hover:text-primary mb-8 transition-colors group"
                >
                    <FaChevronLeft className="mr-2 text-xs group-hover:-translate-x-1 duration-300" />
                    Back to Blog
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Header Info */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {blog.category}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            {blog.title}
                        </h1>
                        <div className="flex flex-wrap items-center text-gray-400 text-sm gap-6 border-y border-gray-800 py-4">
                            <span className="flex items-center">
                                <FaUser className="mr-2 text-primary" />
                                {blog.author}
                            </span>
                            <span className="flex items-center">
                                <FaCalendarAlt className="mr-2 text-primary" />
                                {formattedDate}
                            </span>
                            <button
                                onClick={handleShare}
                                className="flex items-center hover:text-primary transition-colors ml-auto"
                            >
                                <FaShare className="mr-2" /> Share
                            </button>
                        </div>
                    </div>

                    {/* Featured Image */}
                    {blog.featuredImage && (
                        <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                            <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-auto max-h-[500px] object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-primary prose-strong:text-white prose-img:rounded-2xl">
                        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                    </div>

                    {/* Footer / Tags */}
                    <div className="mt-16 pt-8 border-t border-gray-800">
                        <div className="flex items-center text-gray-400">
                            <FaTag className="mr-3" />
                            <span className="text-sm font-medium mr-2">Category:</span>
                            <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-lg">
                                {blog.category}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </main>

            <FooterSimple />
        </div>
    );
};

export default BlogPost;
