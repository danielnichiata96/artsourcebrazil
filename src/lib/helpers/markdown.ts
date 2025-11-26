import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

/**
 * Shared MarkdownIt instance to avoid re-registering plugins.
 * - Disables raw HTML input by default.
 * - Enables automatic link detection.
 */
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

/**
 * Render trusted Markdown content to sanitized HTML.
 * @param source - Markdown string authored internally (trusted input).
 * @returns Sanitized HTML string safe to inject via set:html.
 */
export function renderMarkdownToHtml(source: string): string {
  if (!source) return '';
  
  // Note: All job descriptions are now guaranteed to be in Markdown format
  // The enhanceDescription() function ensures HTML is converted to Markdown before saving
  // So we can safely render without additional HTML detection
  
  const rendered = markdown.render(source);
  // Reason: We still sanitize even though the content is curated to prevent accidental HTML.
  return sanitizeHtml(rendered, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
      'hr',
      'a',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
          target: attribs.href?.startsWith('#') ? undefined : '_blank',
        },
      }),
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto'],
    },
    allowProtocolRelative: false,
  });
}

/**
 * Convert Markdown into plain text for SEO/meta usage.
 * @param source - Markdown string authored internally.
 * @returns Plain text with collapsed whitespace.
 */
export function markdownToPlainText(source: string): string {
  const sanitized = sanitizeHtml(markdown.render(source || ''), {
    allowedTags: [],
    allowedAttributes: {},
  });
  return sanitized.replace(/\s+/g, ' ').trim();
}

