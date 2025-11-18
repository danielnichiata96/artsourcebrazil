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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_KEY_2 = process.env.GEMINI_API_KEY_2; // Optional second key
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Optional Groq key (FREE tier available)
// Gemini API configuration
// Available models (verified):
// - gemini-2.0-flash (fast, recommended for most use cases)
// - gemini-2.5-flash (latest, faster)
// - gemini-2.5-pro (best quality, slower)
// - gemini-flash-latest (always latest flash model)
// - gemini-pro-latest (always latest pro model)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || 'v1beta';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent`;
// Groq API (FREE tier: 7,400 requests/min, very fast GPU-accelerated)
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile'; // Fast and free
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Rate limiting
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const cache = new Map(); // In-memory cache

/**
 * Build enhancement prompt for AI
 */
function buildPrompt(rawDescription, jobTitle = '', companyName = '') {
  return `Você é um especialista em redação de descrições de vagas de emprego.

IMPORTANTE - Regras de limpeza obrigatórias:
1. **NÃO inclua placeholders** como "[A empresa incluirá aqui...]", "[Informações sobre benefícios...]", "[A empresa deve listar...]", etc.
2. **Remova completamente** seções vazias ou genéricas (Benefícios apenas se houver lista real e específica de benefícios)
3. **Remova completamente** declarações legais redundantes ("Equal Opportunity", "We are an equal opportunity employer", "embraces diversity and inclusion", etc.)
4. **Só inclua** seções com conteúdo real e útil
5. **Se não houver benefícios específicos na descrição original, NÃO crie uma seção de Benefícios**

Melhore a seguinte descrição de vaga, mantendo todas as informações importantes, mas:
1. **Organize** em seções claras (Sobre a vaga, Responsabilidades, Requisitos)
2. **Remova completamente** informações legais genéricas (Equal Opportunity, diversity statements, etc.)
3. **Remova** seções vazias ou com placeholders (Benefícios apenas se houver lista real de benefícios na descrição original)
4. **Simplifique** linguagem corporativa excessiva, mas mantenha profissionalismo
5. **Formatte** com parágrafos bem estruturados
6. **Mantenha** todos os detalhes técnicos importantes
7. **Traduza para português brasileiro** se necessário, mantendo termos técnicos em inglês quando apropriado
8. **Preserve** quebras de linha e estrutura quando relevantes

**Título da vaga:** ${jobTitle}
**Empresa:** ${companyName}

**Descrição original:**
${rawDescription.substring(0, 3000)}${rawDescription.length > 3000 ? '...' : ''}

**Descrição melhorada (apenas o texto, sem comentários ou explicações, SEM placeholders, SEM seções vazias, SEM declarações legais genéricas):**`;
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
    if (enhancedDescription.length < rawDescription.length * 0.3) {
      throw new Error('Enhanced description too short after cleanup');
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

    const response = await fetch(GROQ_API_URL, {
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
    if (enhancedDescription.length < rawDescription.length * 0.3) {
      throw new Error('Enhanced description too short after cleanup');
    }

    return enhancedDescription;

  } catch (error) {
    console.warn(`  ⚠️  Groq failed: ${error.message}`);
    return null;
  }
}


/**
 * Clean HTML using basic text processing (fallback)
 * Removes HTML tags, entities, and formats text
 * @param {string} html - HTML text
 * @returns {string} - Cleaned text
 */
function cleanHtmlFallback(html = '') {
  if (!html) return '';

  let text = html
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    // Remove HTML tags but preserve structure
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<b[^>]*>/gi, '**')
    .replace(/<\/b>/gi, '**')
    .replace(/<em[^>]*>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<i[^>]*>/gi, '*')
    .replace(/<\/i>/gi, '*')
    .replace(/<h[1-6][^>]*>/gi, '\n\n## ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

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
  // Skip if description is too short or empty
  if (!rawDescription || rawDescription.trim().length < 50) {
    return rawDescription;
  }

  // Check cache
  if (useCache) {
    const cacheKey = `${jobTitle}-${rawDescription.substring(0, 100)}`.toLowerCase();
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
  }

  // Rate limiting
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

  let enhanced = null;
  let method = '';

  // Try 1: Gemini (primary)
  if (GEMINI_API_KEY) {
    console.log(`  🤖 Trying Gemini (primary)...`);
    enhanced = await tryGemini(GEMINI_API_KEY, rawDescription, jobTitle, companyName);
    if (enhanced) {
      method = 'Gemini (primary)';
    }
  }

  // Try 2: Groq (FREE) OR Gemini (secondary)
  if (!enhanced) {
    // Try Groq first (FREE and fast)
    if (GROQ_API_KEY) {
      console.log(`  🤖 Trying Groq (FREE, GPU-accelerated)...`);
      enhanced = await tryGroq(rawDescription, jobTitle, companyName);
      if (enhanced) {
        method = 'Groq (FREE)';
      }
    }
    
    // If Groq failed, try Gemini secondary key
    if (!enhanced && GEMINI_API_KEY_2) {
      console.log(`  🤖 Trying Gemini (secondary key)...`);
      enhanced = await tryGemini(GEMINI_API_KEY_2, rawDescription, jobTitle, companyName);
      if (enhanced) {
        method = 'Gemini (secondary)';
      }
    }
  }

  // Try 3: HTML cleaning fallback
  if (!enhanced) {
    console.log(`  🧹 Using HTML cleaning fallback...`);
    enhanced = cleanHtmlFallback(rawDescription);
    method = 'HTML cleaning (fallback)';
  }

  // Validate result
  if (!enhanced || enhanced.length < rawDescription.length * 0.3) {
    console.warn(`  ⚠️  Enhancement quality low, using original`);
    enhanced = rawDescription;
    method = 'original (validation failed)';
  }

  // Cache result (keep last 100 entries)
  if (useCache && cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  if (useCache) {
    const cacheKey = `${jobTitle}-${rawDescription.substring(0, 100)}`.toLowerCase();
    cache.set(cacheKey, enhanced);
  }

  if (method) {
    console.log(`  ✅ Enhanced using: ${method}`);
  }

  return enhanced;
}

/**
 * Check if AI enhancement is available
 * @returns {boolean} - True if at least one API key is configured
 */
export function isEnhancementAvailable() {
  return !!(GEMINI_API_KEY || GEMINI_API_KEY_2 || GROQ_API_KEY);
}

