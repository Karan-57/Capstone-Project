import { useEffect } from 'react';

/**
 * SEO helper component
 * Dynamically updates document title and description meta tag per page
 */
export const SEO = ({ title, description }) => {
  useEffect(() => {
    try {
      const fullTitle = title ? `${title} | Collabo - Creator & Editor Platform` : 'Collabo | Video Creator & Editor Platform';
      document.title = fullTitle;

      if (description && typeof document !== 'undefined') {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = description;
      }
    } catch (err) {
      // Non-blocking fallback
    }
  }, [title, description]);

  return null;
};

export default SEO;
