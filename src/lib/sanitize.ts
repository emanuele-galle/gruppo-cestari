import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify with a restrictive configuration
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li',
      // Links & Media
      'a', 'img',
      // Blocks
      'blockquote', 'pre', 'code', 'hr', 'span', 'div',
      // Tables
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // Video support (NEW)
      'iframe', 'video', 'source'
    ],
    ALLOWED_ATTR: [
      // Standard attributes
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel', 'width', 'height', 'style',
      // Video iframe attributes (NEW)
      'frameborder', 'allow', 'allowfullscreen', 'data-video-type',
      // Video tag attributes (NEW)
      'controls', 'poster', 'preload', 'autoplay', 'muted', 'loop'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    ADD_TAGS: [],
    // Whitelist iframe domains (only YouTube, Vimeo)
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))|^(?:https?:)?\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)/i,
    FORCE_BODY: false,
  });
}

/**
 * Sanitize HTML and add security attributes to links
 */
export function sanitizeHtmlWithSecureLinks(html: string): string {
  const sanitized = sanitizeHtml(html);

  // Add rel="noopener noreferrer" to all links
  return sanitized.replace(
    /<a\s+([^>]*href=[^>]*)>/gi,
    '<a $1 rel="noopener noreferrer" target="_blank">'
  );
}

/**
 * Strip all HTML tags, returning only text content
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}
