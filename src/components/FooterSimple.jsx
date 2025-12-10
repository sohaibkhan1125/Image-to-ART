import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaLinkedin, FaHeart } from 'react-icons/fa';
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter as FaTwitterIcon,
  FaLinkedin as FaLinkedinIcon,
  FaPinterest,
  FaTiktok,
  FaGithub as FaGithubIcon,
  FaDiscord,
  FaReddit,
} from 'react-icons/fa';
import useTitleJSON from '../hooks/useTitleJSON';

const FooterSimple = () => {
  const currentYear = new Date().getFullYear();
  const { title: websiteTitle, loading } = useTitleJSON();
  const isMountedRef = useRef(true);
  const [footerLinks, setFooterLinks] = useState([]);

  useEffect(() => {
    isMountedRef.current = true;

    // Load footer links from Supabase
    const loadFooterLinks = async () => {
      try {
        const { loadContent } = await import('../supabaseService');
        const data = await loadContent('footer_links', true);
        setFooterLinks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading footer links:', error);
        setFooterLinks([]);
      }
    };

    loadFooterLinks();

    // Listen for settings updates
    const handleSettingsUpdate = (event) => {
      if (event.detail && event.detail.footerLinks) {
        setFooterLinks(event.detail.footerLinks);
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  // Title is now managed by useTitleManager hook with AbortError handling

  const socialLinks = [
    { icon: FaGithub, href: '#', label: 'GitHub' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  ];

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-white text-2xl font-bold">
                {loading ? 'Loading...' : websiteTitle}
              </span>
            </div>

            <p className="text-gray-300 mb-6 max-w-md">
              Transform your images into stunning pixel art instantly.
              Free, secure, and works directly in your browser.
            </p>

            <div className="flex items-center space-x-4">
              {footerLinks.length > 0 ? (
                footerLinks.map((link) => {
                  // Direct icon rendering based on platform
                  let IconComponent = null;
                  if (link.platform === 'Facebook') {
                    IconComponent = FaFacebookF;
                  } else if (link.platform === 'YouTube') {
                    IconComponent = FaYoutube;
                  } else if (link.platform === 'Instagram') {
                    IconComponent = FaInstagram;
                  } else if (link.platform === 'Twitter') {
                    IconComponent = FaTwitterIcon;
                  } else if (link.platform === 'LinkedIn') {
                    IconComponent = FaLinkedinIcon;
                  } else if (link.platform === 'Pinterest') {
                    IconComponent = FaPinterest;
                  } else if (link.platform === 'TikTok') {
                    IconComponent = FaTiktok;
                  } else if (link.platform === 'GitHub') {
                    IconComponent = FaGithubIcon;
                  } else if (link.platform === 'Discord') {
                    IconComponent = FaDiscord;
                  } else if (link.platform === 'Reddit') {
                    IconComponent = FaReddit;
                  }

                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/20 transition-all duration-300"
                      aria-label={link.platform}
                    >
                      {IconComponent ? <IconComponent size={20} /> : <span className="text-xs">{link.platform.charAt(0)}</span>}
                    </motion.a>
                  );
                })
              ) : (
                socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/20 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </motion.a>
                ))
              )}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-8 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} {websiteTitle}. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Made with</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-red-500"
              >
                <FaHeart size={14} />
              </motion.span>
              <span>for creators</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterSimple;
