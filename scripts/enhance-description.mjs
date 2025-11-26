#!/usr/bin/env node
/**
 * Enhance job descriptions using AI APIs with fallback chain
 * 
 * Fallback Strategy:
 * 1. Try Gemini API (primary)
 * 2. If fails, try Groq API (FREE, GPU-accelerated) OR Gemini API (secondary key)
 * 3. If all fail, use HTML cleaning with basic formatting
 * 
 * This ensures we always have a clean description, regardless of API availability
 */

import { config } from 'dotenv';
config();
// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_KEY_2 = process.env.GEMINI_API_KEY_2; // Optional second key for fallback
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Google Gemini configuration
// Available models (verified):
// - gemini-2.0-flash (fast, recommended for most use cases)
// - gemini-2.5-flash (latest, faster)
// - gemini-2.5-pro (best quality, slower)
// - gemini-flash-latest (always latest flash model)
// - gemini-pro-latest (always latest pro model)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || 'v1beta';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent`;

// Groq API configuration (FREE tier: 30 req/min for 70b model)
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'; // Updated model
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Rate limiting (increased to preserve API quotas)
const RATE_LIMIT_DELAY = 500; // 500ms between requests (was 100ms)
const RETRY_DELAY = 2000; // 2s delay when hitting rate limits
const cache = new Map(); // In-memory cache by content hash

/**
 * Generate cache key from description content
 * @param {string} rawDescription - Raw job description
 * @param {string} jobTitle - Job title
 * @returns {string} - Cache key (simple hash)
 */
function getCacheKey(rawDescription, jobTitle) {
  // Simple hash based on content length + title for cache
  const contentHash = `${jobTitle}-${rawDescription.length}-${rawDescription.substring(0, 50)}`;
  return contentHash.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 100);
}

/**
 * Build enhancement prompt for AI
 */
function buildPrompt(rawDescription, jobTitle = '', companyName = '') {
  return `Você é um editor implacável de descrições de vagas. Sua missão é transformar "paredes de texto" em sumários concisos e diretos.

REGRAS CRÍTICAS DE ELIMINAÇÃO (O QUE REMOVER):
1. DELETE COMPLETAMENTE seções "Sobre a empresa", "Nossa História", "Cultura", "Por que trabalhar aqui", "Benefícios" (a menos que sejam únicos), "Processo de Entrevista", "Primeiros 3 meses".
2. DELETE histórias de fundadores, background da empresa ou filosofia (ex: "I started my career...", "Our engineering culture is motivated by...").
3. DELETE declarações legais, de diversidade ou igualdade (ex: "Equal Opportunity Employer").
4. DELETE introduções longas ou saudações (ex: "Hi 👋 I’m Abhik...").

ESTRUTURA OBRIGATÓRIA (Siga exatamente):

## Sobre a vaga
[Um único parágrafo curto (max 3 linhas) resumindo o objetivo principal da função. Sem fluff.]

## Responsabilidades
* [Bullet point direto e técnico]
* [Bullet point direto e técnico]
* [Max 5-7 bullets mais importantes]

## Requisitos
* [Bullet point direto e técnico]
* [Bullet point direto e técnico]
* [Max 5-7 bullets mais importantes]

DIRETRIZES FINAIS:
1. MÁXIMO 300 palavras no total.
2. Traduza para Português do Brasil (mantendo termos técnicos em inglês).
3. Se a descrição original for uma "parede de texto", extraia apenas o que importa (o que a pessoa vai fazer e o que ela precisa saber).
4. Seja frio e direto. Corte todo o "marketing" da vaga.

**Título da vaga:** ${jobTitle}
**Empresa:** ${companyName}

**Descrição original:**
${rawDescription.substring(0, 4000)}${rawDescription.length > 4000 ? '...' : ''}

**Descrição Otimizada (apenas o texto final, sem comentários):**`;
}


/**
 * Clean up AI-generated text - remove placeholders and empty sections
 * @param {string} text - Enhanced text from AI
 * @returns {string} - Cleaned text
 */
function cleanupEnhancedText(text) {
  if (!text) return text;

  return text
    // Remove placeholders like "[A empresa incluirá aqui...]"
    .replace(/\[.*?a empresa.*?aqui.*?\]/gi, '')
    .replace(/\[.*?empresa.*?incluir.*?\]/gi, '')
    .replace(/\[.*?empresa.*?listar.*?\]/gi, '')
    .replace(/\[.*?deve listar.*?\]/gi, '')
    .replace(/\[.*?informações.*?benefícios.*?\]/gi, '')
    .replace(/\[.*?informações.*?sobre.*?\]/gi, '')
    .replace(/\[.*?a empresa.*?deve.*?\]/gi, '')
    .replace(/\[.*?informações.*?\]/gi, '')
    // Remove generic equal opportunity statements (multiline)
    .replace(/Wildlife Studios is an equal opportunity employer[^.]*\./gi, '')
    .replace(/We are an equal opportunity employer[^.]*\./gi, '')
    .replace(/is an equal opportunity employer[^.]*\./gi, '')
    .replace(/equal opportunity employer[^.]*\./gi, '')
    .replace(/embraces diversity and inclusion[^.]*\./gi, '')
    .replace(/committed to diversity[^.]*\./gi, '')
    .replace(/proud to be an equal opportunity[^.]*\./gi, '')
    .replace(/do not discriminate[^.]*\./gi, '')
    // Remove empty benefit sections
    .replace(/##?\s*Benefícios\s*:?\s*\n\s*\[.*?\]/gi, '')
    .replace(/##?\s*Benefícios\s*:?\s*\n\s*[A empresa].*?\n/gi, '')
    // Remove sections with only placeholders
    .replace(/##?\s*Benefícios\s*:?\s*\n\s*[^\n]*(?:\[|a empresa|include|listar|ex:)[^\n]*\n/gi, '')
    // Remove benefit sections that are just examples/placeholders
    .replace(/##?\s*Benefícios\s*:?\s*\n\s*\[[^\]]*ex:[^\]]*\][^\n]*\n/gi, '')
    // Clean up multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Remove trailing "Benefícios:" with nothing meaningful after
    .replace(/##?\s*Benefícios\s*:?\s*$/gm, '')
    .trim();
}

/**
 * Try enhancing with Gemini API
 * @param {string} apiKey - Gemini API key
 * @param {string} rawDescription - Raw description
 * @param {string} jobTitle - Job title
 * @param {string} companyName - Company name
 * @returns {Promise<string|null>} - Enhanced description or null if fails
 */
async function tryGemini(apiKey, rawDescription, jobTitle, companyName) {
  if (!apiKey) return null;

  try {
    const prompt = buildPrompt(rawDescription, jobTitle, companyName);

    const response = await fetch(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText).error || {};
      throw new Error(`Gemini API error: ${response.status} - ${errorJson.message || errorText.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      // Check for safety ratings (Gemini may block some content)
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Content blocked by safety: ${data.promptFeedback.blockReason}`);
      }
      throw new Error('Invalid response from Gemini API - no text in response');
    }

    let enhancedDescription = data.candidates[0].content.parts[0].text.trim();

    // Clean up placeholders and empty sections
    enhancedDescription = cleanupEnhancedText(enhancedDescription);

    // Validate enhanced description quality
    // Accept if either:
    // 1. At least 300 characters (reasonable minimum - some jobs are concise)
    // 2. OR at least 15% of original (for very long originals)
    const MIN_LENGTH = 300;
    const MIN_PERCENTAGE = 0.15;

    if (enhancedDescription.length < MIN_LENGTH && enhancedDescription.length < rawDescription.length * MIN_PERCENTAGE) {
      throw new Error(`Enhanced description too short: ${enhancedDescription.length} chars (min: ${MIN_LENGTH} or ${Math.floor(rawDescription.length * MIN_PERCENTAGE)} chars)`);
    }

    return enhancedDescription;

  } catch (error) {
    console.warn(`  ⚠️  Gemini failed: ${error.message}`);
    return null;
  }
}

/**
 * Try enhancing with Groq API (FREE tier available)
 * @param {string} rawDescription - Raw description
 * @param {string} jobTitle - Job title
 * @param {string} companyName - Company name
 * @returns {Promise<string|null>} - Enhanced description or null if fails
 */
async function tryGroq(rawDescription, jobTitle, companyName) {
  if (!GROQ_API_KEY) return null;

  try {
    const prompt = buildPrompt(rawDescription, jobTitle, companyName);

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 4000,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText).error || {};
      throw new Error(`Groq API error: ${response.status} - ${errorJson.message || errorText.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from Groq API');
    }

    let enhancedDescription = data.choices[0].message.content.trim();

    // Clean up placeholders and empty sections
    enhancedDescription = cleanupEnhancedText(enhancedDescription);

    // Validate enhanced description quality  
    // Accept if either:
    // 1. At least 300 characters (reasonable minimum - some jobs are concise)
    // 2. OR at least 15% of original (for very long originals)
    const MIN_LENGTH = 300;
    const MIN_PERCENTAGE = 0.15;

    if (enhancedDescription.length < MIN_LENGTH && enhancedDescription.length < rawDescription.length * MIN_PERCENTAGE) {
      throw new Error(`Enhanced description too short: ${enhancedDescription.length} chars (min: ${MIN_LENGTH} or ${Math.floor(rawDescription.length * MIN_PERCENTAGE)} chars)`);
    }

    return enhancedDescription;

  } catch (error) {
    console.warn(`  ⚠️  Groq failed: ${error.message}`);
    return null;
  }
}


/**
 * Clean HTML using basic text processing (fallback)
 * Converts HTML to proper Markdown format
 * @param {string} html - HTML text
 * @returns {string} - Clean Markdown text (NEVER returns HTML)
 */
function cleanHtmlFallback(html = '') {
  if (!html) return '';

  let text = html
    // Decode HTML entities FIRST
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ')
    
    // Convert headings to proper Markdown
    .replace(/<h1[^>]*>(.*?)<\/h1>/gis, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, '\n\n### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gis, '\n\n#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gis, '\n\n##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gis, '\n\n###### $1\n\n')
    
    // Convert links to Markdown [text](url)
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gis, '[$2]($1)')
    
    // Convert bold/strong to Markdown **text**
    .replace(/<strong[^>]*>(.*?)<\/strong>/gis, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gis, '**$1**')
    
    // Convert italic/em to Markdown *text*
    .replace(/<em[^>]*>(.*?)<\/em>/gis, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gis, '*$1*')
    
    // Convert lists to Markdown (must be done before removing li tags)
    .replace(/<li[^>]*>(.*?)<\/li>/gis, '* $1\n')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    
    // Convert paragraphs and breaks
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br[^>]*>/gi, '\n')
    
    // Remove style, script, iframe and other non-content tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gis, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gis, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gis, '')
    
    // Remove divs, spans (keep content)
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    
    // Remove ALL remaining HTML tags (safety net - ensures NO HTML survives)
    .replace(/<[^>]+>/g, '')
    
    // Clean up whitespace to proper Markdown formatting
    .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' ')     // Normalize horizontal whitespace
    .trim();

  // Smart truncation if too long (fallback for when AI is down)
  const MAX_LENGTH = 2500;
  if (text.length > MAX_LENGTH) {
    // Find the last period before MAX_LENGTH to cut cleanly
    const cutPoint = text.lastIndexOf('.', MAX_LENGTH);
    if (cutPoint > MAX_LENGTH * 0.8) {
      text = text.substring(0, cutPoint + 1);
    } else {
      text = text.substring(0, MAX_LENGTH);
    }

    text += '\n\n(Descrição resumida automaticamente. Clique em "Aplicar" para ver detalhes completos.)';
  }

  return text;
}

/**
 * Enhance description with fallback chain
 * @param {string} rawDescription - Raw description from source
 * @param {string} jobTitle - Job title for context
 * @param {string} companyName - Company name for context
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<string>} - Enhanced description
 */
export async function enhanceDescription(rawDescription, jobTitle = '', companyName = '', useCache = true) {
  try {
    // Skip if description is too short or empty
    if (!rawDescription || rawDescription.trim().length < 50) {
      return rawDescription;
    }

    // Check cache first
    const cacheKey = getCacheKey(rawDescription, jobTitle);
    if (useCache && cache.has(cacheKey)) {
      console.log('  💾 Using cached description');
      return cache.get(cacheKey);
    }

    // Rate limiting between jobs
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

    let enhanced = null;
    let method = '';

    // Try 1: Gemini (primary key)
    if (GEMINI_API_KEY) {
      console.log(`  🤖 Trying Gemini (primary)...`);
      enhanced = await tryGemini(GEMINI_API_KEY, rawDescription, jobTitle, companyName);
      if (enhanced) {
        method = 'Gemini (primary)';
      }
    }

    // Try 2: Groq (FREE, GPU-accelerated)
    if (!enhanced && GROQ_API_KEY) {
      // Small delay before trying next API to respect rate limits
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

      console.log(`  🤖 Trying Groq (FREE, GPU-accelerated)...`);
      enhanced = await tryGroq(rawDescription, jobTitle, companyName);
      if (enhanced) {
        method = 'Groq (FREE)';
      }
    }

    // Try 3: Gemini (secondary key)
    if (!enhanced && GEMINI_API_KEY_2) {
      // Small delay before trying secondary Gemini
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

      console.log(`  🤖 Trying Gemini (secondary key)...`);
      enhanced = await tryGemini(GEMINI_API_KEY_2, rawDescription, jobTitle, companyName);
      if (enhanced) {
        method = 'Gemini (secondary)';
      }
    }

    // Validate result
    // We want aggressive summarization, so we DON'T check for % of original length anymore
    // Just check if it's not empty and has a reasonable minimum length (e.g. 200 chars)
    if (!enhanced || enhanced.length < 200) {
      console.warn(`  ⚠️  Enhancement result too short (<200 chars) or failed, using HTML fallback`);
      enhanced = null; // Force fallback to HTML cleaning
    }

    // Try 4: HTML cleaning fallback (converts HTML → Markdown)
    if (!enhanced) {
      console.log(`  🧹 Using HTML cleaning fallback...`);
      enhanced = cleanHtmlFallback(rawDescription);
      method = 'HTML cleaning (fallback)';
    }

    // CRITICAL: Final safety check - ensure NO HTML is ever returned
    // This is our last line of defense to guarantee Markdown output
    if (enhanced && /<[a-z][\s\S]*>/i.test(enhanced)) {
      console.warn(`  ⚠️  WARNING: HTML detected in output, stripping tags...`);
      // Strip ALL remaining HTML tags as absolute last resort
      enhanced = enhanced.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      method += ' (HTML stripped)';
    }

    // Cache the result for future use (keep last 100 entries)
    if (useCache) {
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(cacheKey, enhanced);
    }

    console.log(`  ✅ Enhanced using: ${method}`);

    return enhanced;

  } catch (error) {
    console.error(`  ❌ Enhancement error: ${error.message}`);
    // Return cleaned HTML as ultimate fallback
    return cleanHtmlFallback(rawDescription);
  }
}

/**
 * Check if AI enhancement is available
 * @returns {boolean} - True if at least one API key is configured
 */
export function isEnhancementAvailable() {
  return !!(GEMINI_API_KEY || GEMINI_API_KEY_2 || GROQ_API_KEY);
}

