import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, canonicalUrl, keywords, ogTitle, ogDescription, ogImage, ogUrl }) => {
    const siteTitle = 'Image to Pixel Art Converter';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const siteUrl = 'https://imagetopixel.com'; // TODO: Replace with your actual domain
    const currentUrl = canonicalUrl || siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || 'Convert your images to pixel art easily with our free online tool.'} />
            <meta name="keywords" content={keywords || 'pixel art, image converter, pixelate, 8-bit, retro art'} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={ogUrl || currentUrl} />
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || description || 'Convert your images to pixel art easily.'} />
            {ogImage && <meta property="og:image" content={ogImage} />}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={ogUrl || currentUrl} />
            <meta property="twitter:title" content={ogTitle || fullTitle} />
            <meta property="twitter:description" content={ogDescription || description || 'Convert your images to pixel art easily.'} />
            {ogImage && <meta property="twitter:image" content={ogImage} />}
        </Helmet>
    );
};

export default SEO;
