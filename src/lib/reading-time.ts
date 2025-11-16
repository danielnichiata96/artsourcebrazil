/**
 * Calculate reading time for blog content
 * Average reading speed: 200 words per minute (Portuguese)
 */

const WORDS_PER_MINUTE = 200;

/**
 * Calculate reading time from text content
 * @param text - The content to analyze (plain text or markdown)
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(text: string): number {
  // Remove markdown syntax and count words
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/[*_~[\]()]/g, '') // Remove markdown formatting
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .trim();

  // Count words (split by whitespace)
  const wordCount = cleanText.split(/\s+/).filter((word) => word.length > 0).length;

  // Calculate reading time (minimum 1 minute)
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return Math.max(1, minutes);
}

/**
 * Format reading time for display
 * @param minutes - Reading time in minutes
 * @param locale - Locale for formatting (default: 'pt-BR')
 * @returns Formatted string like "5 min de leitura"
 */
export function formatReadingTime(minutes: number, locale: string = 'pt-BR'): string {
  if (locale === 'pt-BR') {
    return `${minutes} min de leitura`;
  }
  return `${minutes} min read`;
}
