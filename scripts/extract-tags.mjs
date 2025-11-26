#!/usr/bin/env node
/**
 * Intelligent tag extraction using AI with smart fallback
 * 
 * Strategy:
 * 1. Use AI to extract tags intelligently (avoids false positives like "Go" from "Google")
 * 2. If AI fails, use smart keyword matching with word boundaries
 * 3. Always validate tags against known technology/skill lists
 * 
 * This ensures high-quality tags without false positives.
 */

import { config } from 'dotenv';
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_KEY_2 = process.env.GEMINI_API_KEY_2;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || 'v1beta';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent`;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'; // Updated model
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Valid technology tags (to validate AI output)
const VALID_TECH_TAGS = new Set([
  'Unity', 'Unreal', 'Python', 'JavaScript', 'TypeScript', 'C#', 'Go', 'Java',
  'C++', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'Git', 'CI/CD',
]);

// Valid role/skill tags
const VALID_ROLE_TAGS = new Set([
  '3D', '2D', 'Animation', 'VFX', 'Design', 'Artist', 'AI', 'Mobile',
  'Game Dev', 'Engine', 'Senior',
]);

// All valid tags combined
const ALL_VALID_TAGS = new Set([...VALID_TECH_TAGS, ...VALID_ROLE_TAGS]);

/**
 * Build prompt for AI tag extraction
 */
function buildTagExtractionPrompt(title = '', description = '') {
  return `You are a job tagging expert. Extract ONLY relevant technology and skill tags from this job posting.

CRITICAL RULES:
1. Extract tags ONLY from job requirements, responsibilities, and qualifications
2. IGNORE background stories, company history, or founder experiences (e.g., "founder worked in VFX" does NOT mean the job needs VFX skills)
3. IGNORE technologies mentioned only as examples of what the company builds (unless explicitly required for the role)
4. DO NOT include tags from partial word matches (e.g., "Go" from "Google", "Mongo", or "Django")
5. DO NOT include creative/game tags (Unity, Unreal, 3D, 2D, VFX, Animation) for software engineering roles UNLESS explicitly required in job responsibilities
6. Return ONLY technologies and skills the candidate MUST or SHOULD have
7. Return tags as a comma-separated list
8. Use these exact tag names (case-sensitive): Unity, Unreal, Python, JavaScript, TypeScript, C#, Go, Java, C++, Rust, PHP, Ruby, React, Vue, Angular, Node.js, Next.js, Django, Flask, Rails, AWS, GCP, Azure, Docker, Kubernetes, Postgres, MongoDB, Redis, Git, CI/CD, GraphQL, REST API, 3D, 2D, Animation, VFX, Design, UI/UX, Mobile, Game Dev, Engine, DevOps, Backend, Frontend, Full-stack
9. If no relevant tags found, return "none"
10. Maximum 10 tags
11. Include "Senior" ONLY if title contains "Senior", "Lead", "Principal", or "Staff"

Job Title: ${title}

Description (focus on Requirements and Responsibilities):
${description.substring(0, 2000)}${description.length > 2000 ? '...' : ''}

REMEMBER: Extract tags ONLY from what the CANDIDATE needs to know/do, NOT from company background or examples.

Tags (comma-separated, or "none"):`;
}

/**
 * Try extracting tags using Gemini
 */
async function tryGeminiTags(apiKey, title, description) {
  if (!apiKey) return null;

  try {
    const prompt = buildTagExtractionPrompt(title, description);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent extraction
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text || text.toLowerCase() === 'none') {
      return [];
    }

    // Parse comma-separated tags
    const tags = text
      .split(',')
      .map(t => t.trim())
      .filter(t => t && ALL_VALID_TAGS.has(t));

    return tags.length > 0 ? tags : null;

  } catch (error) {
    console.warn(`  ⚠️  Gemini tags failed: ${error.message}`);
    return null;
  }
}

/**
 * Try extracting tags using Groq
 */
async function tryGroqTags(title, description) {
  if (!GROQ_API_KEY) return null;

  try {
    const prompt = buildTagExtractionPrompt(title, description);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text || text.toLowerCase() === 'none') {
      return [];
    }

    // Parse comma-separated tags
    const tags = text
      .split(',')
      .map(t => t.trim())
      .filter(t => t && ALL_VALID_TAGS.has(t));

    return tags.length > 0 ? tags : null;

  } catch (error) {
    console.warn(`  ⚠️  Groq tags failed: ${error.message}`);
    return null;
  }
}

/**
 * Smart keyword matching with word boundaries (fallback)
 * Uses word boundaries to avoid false positives
 */
function extractTagsWithKeywordMatching(title = '', content = '') {
  const allText = `${title} ${content}`;
  const tags = new Set();

  // Technology tags with word boundary matching
  const techPatterns = [
    { tag: 'Unity', pattern: /\b(unity|unity3d|unity 3d|unity engine)\b/gi },
    { tag: 'Unreal', pattern: /\b(unreal|unreal engine|ue4|ue5)\b/gi },
    { tag: 'Python', pattern: /\bpython\b/gi },
    { tag: 'JavaScript', pattern: /\b(javascript|js|ecmascript)\b/gi },
    { tag: 'TypeScript', pattern: /\b(typescript|ts)\b/gi },
    { tag: 'C#', pattern: /\b(c#|c-sharp|csharp)\b/gi },
    { tag: 'Go', pattern: /\b(golang|go language)\b|\bGo\b(?!\w)/g }, // Strict Go matching
    { tag: 'Java', pattern: /\bjava\b/gi },
    { tag: 'C++', pattern: /\b(c\+\+|cpp|c plus plus)\b/gi },
    { tag: 'React', pattern: /\b(react|reactjs)\b/gi },
    { tag: 'Node.js', pattern: /\b(node\.js|nodejs|node js)\b/gi },
    { tag: 'AWS', pattern: /\b(aws|amazon web services)\b/gi },
    { tag: 'Docker', pattern: /\bdocker\b/gi },
    { tag: 'Kubernetes', pattern: /\b(kubernetes|k8s)\b/gi },
    { tag: 'Git', pattern: /\bgit\b/gi },
    { tag: 'CI/CD', pattern: /\b(ci\/cd|continuous integration|jenkins|gitlab)\b/gi },
  ];

  // Role/skill tags
  const rolePatterns = [
    { tag: '3D', pattern: /\b(3d|3-d|three dimensional)\b/gi },
    { tag: '2D', pattern: /\b(2d|2-d|two dimensional)\b/gi },
    { tag: 'Animation', pattern: /\b(animation|animator|animating|rigging)\b/gi },
    { tag: 'VFX', pattern: /\b(vfx|visual effects|effects|particle)\b/gi },
    { tag: 'Design', pattern: /\b(design|designer|ux design|ui design)\b/gi },
    { tag: 'Artist', pattern: /\b(artist|game artist|concept artist|environment artist)\b/gi },
    { tag: 'AI', pattern: /\b(ai|artificial intelligence|gen-ai|generative ai|machine learning|ml)\b/gi },
    { tag: 'Mobile', pattern: /\b(mobile|ios|android|swift|kotlin)\b/gi },
    { tag: 'Game Dev', pattern: /\b(game|gaming|gameplay|game development)\b/gi },
    { tag: 'Engine', pattern: /\b(game engine|engine)\b/gi },
  ];

  // Check technology tags first
  for (const { tag, pattern } of techPatterns) {
    if (pattern.test(allText)) {
      tags.add(tag);
    }
  }

  // Check role tags (avoid duplicates)
  for (const { tag, pattern } of rolePatterns) {
    if (!tags.has(tag) && pattern.test(allText)) {
      tags.add(tag);
    }
  }

  // Senior/Lead level tags
  if (/\b(senior|lead|principal|staff|sr)\b/i.test(title)) {
    tags.add('Senior');
  }

  return Array.from(tags).slice(0, 10);
}

/**
 * Main function to extract tags intelligently
 * @param {string} title - Job title
 * @param {string} description - Job description
 * @returns {Promise<string[]>} - Array of tags
 */
export async function extractTagsIntelligently(title = '', description = '') {
  // Try 1: Gemini (primary)
  if (GEMINI_API_KEY) {
    const tags = await tryGeminiTags(GEMINI_API_KEY, title, description);
    if (tags && tags.length > 0) {
      return tags;
    }
  }

  // Try 2: Groq (FREE, fast)
  if (GROQ_API_KEY) {
    const tags = await tryGroqTags(title, description);
    if (tags && tags.length > 0) {
      return tags;
    }
  }

  // Try 3: Gemini (secondary)
  if (GEMINI_API_KEY_2) {
    const tags = await tryGeminiTags(GEMINI_API_KEY_2, title, description);
    if (tags && tags.length > 0) {
      return tags;
    }
  }

  // Fallback: Smart keyword matching with word boundaries
  console.log('  ✅ Extracted tags using: Keyword Matching (fallback)');
  return extractTagsWithKeywordMatching(title, description);
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const title = process.argv[2] || '';
  const description = process.argv[3] || '';

  extractTagsIntelligently(title, description)
    .then(tags => {
      console.log('Tags:', tags);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

