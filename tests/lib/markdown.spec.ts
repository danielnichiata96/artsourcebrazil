import { describe, expect, it } from 'vitest';
import { renderMarkdownToHtml, markdownToPlainText } from '../../src/lib/helpers/markdown';

describe('renderMarkdownToHtml', () => {
  it('renders headings, lists, and emphasis safely', () => {
    const markdown = `### Title\n\n- Item **one**\n- Item two`;
    const html = renderMarkdownToHtml(markdown);
    expect(html).toContain('<h3>Title</h3>');
    expect(html).toContain('<li>Item <strong>one</strong></li>');
  });

  it('returns empty string for empty input', () => {
    expect(renderMarkdownToHtml('')).toBe('');
  });

  it('strips disallowed tags to prevent XSS', () => {
    const html = renderMarkdownToHtml('<script>alert("xss")</script>Safe text');
    expect(html).not.toContain('<script>');
    expect(html).toContain('Safe text');
  });
});

describe('markdownToPlainText', () => {
  it('converts markdown to collapsed plain text', () => {
    const markdown = `# Heading\n\nParagraph with **bold** text.`;
    expect(markdownToPlainText(markdown)).toBe('Heading Paragraph with bold text.');
  });
});

