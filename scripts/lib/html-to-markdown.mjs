/**
 * Convert HTML to Markdown
 * 
 * Optimized converter for job descriptions from Lever, Greenhouse, Ashby APIs.
 * Handles the "div soup" pattern common in ATS systems.
 * 
 * Key features:
 * - Handles Lever's <div>- item</div> pattern (converts to proper lists)
 * - Handles Greenhouse's double-escaped HTML (&lt;p&gt;)
 * - Zero dependencies (pure regex, runs anywhere)
 * - Supports relative link resolution via baseUrl option
 * 
 * @see https://github.com/remotejobsbr - RemoteJobsBR Project
 */

/**
 * Convert HTML to Markdown
 * 
 * @param {string} html - HTML string from ATS API
 * @param {object} options - Configuration options
 * @param {string} options.baseUrl - Base URL for resolving relative links (e.g., 'https://jobs.lever.co')
 * @returns {string} Clean Markdown string
 */
export function htmlToMarkdown(html, options = {}) {
  if (!html) return '';

  const { baseUrl } = options;
  let md = html;

  // ============================================================================
  // PHASE 1: Decode escaped HTML tags (Greenhouse sends &lt;p&gt; instead of <p>)
  // Only decode when it looks like an actual HTML tag pattern
  // This preserves math expressions like "salary < 50k" or "value > 100"
  // ============================================================================
  // Match: &lt;tagname or &lt;/tagname or &lt;!-- (HTML comment)
  md = md.replace(/&lt;(\/?)([a-zA-Z][a-zA-Z0-9]*)([\s>]|&gt;)/g, '<$1$2$3');
  md = md.replace(/&lt;(!--)/g, '<$1'); // HTML comments
  // Match: ...&gt; after tag content
  md = md.replace(/([a-zA-Z0-9"'=\s])&gt;/g, '$1>');

  // Normalize line breaks
  md = md.replace(/\r\n/g, '\n');

  // ============================================================================
  // PHASE 2: Convert semantic HTML to Markdown (ORDER MATTERS!)
  // Process from most specific to least specific
  // ============================================================================

  // 2.1 Headers (h1-h4)
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');

  // 2.2 Links (BEFORE removing other tags, resolve relative URLs)
  if (baseUrl) {
    // Convert relative links to absolute: href="/jobs/123" → href="https://lever.co/jobs/123"
    md = md.replace(/<a[^>]*href="(\/[^"]*)"[^>]*>(.*?)<\/a>/gi, (match, path, text) => {
      return `[${text}](${baseUrl}${path})`;
    });
  }
  // Convert remaining links (absolute URLs)
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // 2.3 Bold - standalone bold in div = section header (Lever pattern)
  md = md.replace(/<div>\s*<b>(.*?)<\/b>\s*<\/div>/gi, '\n## $1\n');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');

  // 2.4 Italic
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');

  // 2.5 Lists (proper HTML lists)
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

  // ============================================================================
  // PHASE 3: Handle "div soup" pattern (Lever/Greenhouse specialty)
  // Lever sends: <div><b>Header:</b></div><div><br></div><div>Item 1</div><div>Item 2</div>
  // We need to detect items after headers and convert them to lists
  // ============================================================================
  
  // 3.1 Handle explicit bullets: <div>- Item</div> or <div>• Item</div>
  md = md.replace(/<div>\s*[-•]\s*(.*?)<\/div>/gi, '- $1\n');
  md = md.replace(/<div>\s*(\d+\.?\s*)(.*?)<\/div>/gi, '$1$2\n'); // Numbered lists
  
  // 3.2 Lever pattern: Detect sections and convert content to lists
  // Strategy: Use markers to split content, then process each section
  
  // Remove empty divs with just <br>
  md = md.replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '\n');
  
  // Mark section headers: <div><b>Title:</b></div> → \n## Title\n
  // This creates clear section boundaries
  md = md.replace(/<div>\s*<b>([^<]+?):?\s*<\/b>\s*<\/div>/gi, '\n## $1\n');
  
  // Now process remaining divs based on context
  // Content divs after ## headers should become list items
  // Content divs at the start (before any ##) stay as paragraphs
  
  // First pass: convert explicit bullet divs
  md = md.replace(/<div>\s*[-•]\s*([^<]+)<\/div>/gi, '- $1\n');
  
  // Second pass: Use a function to process based on position
  // Split by ## headers, process each section
  const parts = md.split(/(## [^\n]+\n)/);
  let output = '';
  let inSection = false;
  
  for (const part of parts) {
    if (part.startsWith('## ')) {
      output += part;
      inSection = true;
    } else if (inSection) {
      // After a header: convert divs to list items
      const processed = part
        .replace(/<div>([^<]{10,})<\/div>/gi, '- $1\n')
        .replace(/<div>([^<]*)<\/div>/gi, '$1\n');
      output += processed;
    } else {
      // Before first header: keep as paragraphs
      const processed = part.replace(/<div>([^<]*)<\/div>/gi, '$1\n');
      output += processed;
    }
  }
  
  md = output;

  // ============================================================================
  // PHASE 4: Convert structural tags to line breaks
  // ============================================================================
  
  // Line breaks
  md = md.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n'); // Double br = paragraph
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Divs (after list handling)
  md = md.replace(/<div[^>]*><br\s*\/?><\/div>/gi, '\n');
  md = md.replace(/<div[^>]*>/gi, '\n');
  md = md.replace(/<\/div>/gi, '');

  // Paragraphs
  md = md.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  md = md.replace(/<p[^>]*>/gi, '\n');
  md = md.replace(/<\/p>/gi, '\n');

  // Spans (inline, just remove)
  md = md.replace(/<span[^>]*>/gi, '');
  md = md.replace(/<\/span>/gi, '');

  // ============================================================================
  // PHASE 5: Clean up remaining HTML tags (MUST BE LAST)
  // This catches any tags we didn't explicitly handle
  // ============================================================================
  md = md.replace(/<[^>]+>/g, '');

  // ============================================================================
  // PHASE 6: Decode remaining HTML entities (AFTER tag removal)
  // Safe to decode all entities now that HTML structure is gone
  // ============================================================================
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');  // Any remaining (actual < symbols in text)
  md = md.replace(/&gt;/g, '>');  // Any remaining (actual > symbols in text)
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#0?39;/g, "'");
  md = md.replace(/&#x27;/g, "'");
  md = md.replace(/&#8217;/g, "'"); // Right single quote
  md = md.replace(/&#8216;/g, "'"); // Left single quote
  md = md.replace(/&#8220;/g, '"'); // Left double quote
  md = md.replace(/&#8221;/g, '"'); // Right double quote
  md = md.replace(/&mdash;/g, '—');
  md = md.replace(/&ndash;/g, '–');
  md = md.replace(/&hellip;/g, '...');
  md = md.replace(/&bull;/g, '•');

  // ============================================================================
  // PHASE 7: Final cleanup
  // ============================================================================
  md = md.replace(/\n{3,}/g, '\n\n');        // Max 2 consecutive newlines
  md = md.replace(/^\s+/gm, '');              // Remove leading whitespace
  md = md.replace(/\s+$/gm, '');              // Remove trailing whitespace
  md = md.replace(/^(\s*\n)+/, '');           // Remove leading empty lines

  return md.trim();
}

/**
 * Convert plain text with line breaks to Markdown
 * 
 * Useful for APIs that only provide plain text (descriptionPlain).
 * Attempts to detect section headers based on text patterns.
 * 
 * @param {string} text - Plain text with \n line breaks
 * @returns {string} Markdown string with detected headers
 */
export function plainTextToMarkdown(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = lines[i + 1]?.trim() || '';

    // Detect section headers:
    // - Short line (< 50 chars)
    // - Doesn't end with period or colon
    // - Doesn't start with dash (not a list item)
    // - Followed by list items or empty line
    const looksLikeHeader = 
      line.length > 0 &&
      line.length < 50 &&
      !line.endsWith('.') &&
      !line.endsWith(':') &&
      !line.startsWith('-') &&
      !line.startsWith('•') &&
      (nextLine.startsWith('-') || nextLine.startsWith('•') || nextLine === '');

    if (looksLikeHeader) {
      result.push(`\n## ${line}\n`);
    } else {
      result.push(line);
    }
  }

  let md = result.join('\n');
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

// ============================================================================
// CLI TEST
// ============================================================================
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== TEST 1: Lever "div soup" pattern ===');
  const leverHtml = `
    <div>We're hiring a creator.</div>
    <div><br></div>
    <div><b>Responsabilities</b></div>
    <div>- Script and shoot content</div>
    <div>- Edit mobile-first videos</div>
    <div><br></div>
    <div><b>Requirements</b></div>
    <div>- Experience in motion design</div>
  `;
  console.log(htmlToMarkdown(leverHtml));
  
  console.log('\n=== TEST 2: Greenhouse escaped HTML ===');
  const greenhouseHtml = '&lt;p&gt;Job description&lt;/p&gt;&lt;p&gt;&lt;strong&gt;Requirements&lt;/strong&gt;&lt;/p&gt;';
  console.log(htmlToMarkdown(greenhouseHtml));
  
  console.log('\n=== TEST 3: Math expression preserved ===');
  const mathText = '<div>Salary range: &lt; 50k or &gt; 100k</div>';
  console.log(htmlToMarkdown(mathText));
  
  console.log('\n=== TEST 4: Relative link resolution ===');
  const linkHtml = '<a href="/jobs/123">Apply here</a>';
  console.log(htmlToMarkdown(linkHtml, { baseUrl: 'https://jobs.lever.co' }));
}
