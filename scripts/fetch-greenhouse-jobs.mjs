#!/usr/bin/env node
/**
 * Fetch and normalize jobs from Greenhouse API
 * 
 * This script:
 * 1. Fetches jobs from Greenhouse board API
 * 2. Gets detailed information for each job
 * 3. Normalizes data to our Job type format
 * 4. Maps categories and determines location scope
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Configuration
const GREENHOUSE_API_BASE = 'https://boards-api.greenhouse.io/v1/boards';
const COMPANY_SLUG = 'wildlifestudios';

// Category mapping: Map Greenhouse departments/metadata to our categories
const departmentCategoryMap = {
  'Game Development Hub': 'Game Dev',
  'Game Dev': 'Game Dev',
  'Game Tech': 'Game Dev',
  'Cloud Platform Engineering': 'Game Dev',
  'Social Gaming': 'Game Dev',
  'Creatives Studio': '3D', // Default to 3D for creatives, will be refined by title
  'Marketing Tech': 'Game Dev', // Data roles related to games
};

// Category mapping based on job title keywords
// Priority: Check for specific categories first, then broader ones
const titleCategoryMap = {
  // VFX - Most specific, check first
  'VFX': [
    'vfx', 'visual effects', 'effects artist', 'fx artist',
    'particle', 'real-time vfx', 'special effects',
  ],
  // 3D - Focus on modeling, texturing, lighting (not animation)
  '3D': [
    '3d artist', '3d game artist', '3d modeler', '3d modeler',
    '3d modelling', '3d modeling', 'character artist 3d',
    'environment artist 3d', '3d generalist', '3d specialist',
    '3d designer', 'modeling', 'modelling', 'modeller',
    'texturing', 'lighting artist', '3d environment',
    // Only 3D-specific roles (without animation keywords)
  ],
  // 2D Art - Focus on 2D art/illustration (not animation)
  '2D Art': [
    '2d artist', '2d game artist', 'concept artist', 'illustrator',
    '2d art', 'game artist', 'art 2d',
  ],
  // Animation - Focus on animation-specific roles (rigging, character animation)
  'Animation': [
    'animator', 'character animator', 'environment animator',
    'rigging', 'animation artist', 'motion graphics',
    'sprite animation', '2d animation', '3d animation',
  ],
  'Design': [
    'designer', 'ux', 'ui', 'user experience', 'user interface',
    'product designer', 'visual designer', 'graphic designer',
    'ux designer', 'ui designer',
  ],
  'Game Dev': [
    'game engineer', 'game developer', 'software engineer',
    'engineer', 'developer', 'programmer', 'qa', 'sre',
    'site reliability', 'data engineer', 'data scientist',
  ],
};

// Jobs to filter out (not relevant for creative/tech focus)
const excludedKeywords = [
  'fp&a', 'finance', 'accounting', 'head of marketing',
  'marketing manager', 'hr', 'human resources', 'recruiter',
  'sales', 'business development', 'legal', 'lawyer',
];

// Default category if no match found
const DEFAULT_CATEGORY = 'Game Dev';

/**
 * Check if job should be filtered out
 * @param {string} title - Job title
 * @returns {boolean} - True if should be filtered out
 */
function shouldFilterJob(title = '') {
  const lowerTitle = title.toLowerCase();
  return excludedKeywords.some(keyword => lowerTitle.includes(keyword));
}

/**
 * Map job title and departments to our category
 * Intelligently separates 3D, 2D Art, and Animation
 * @param {string} title - Job title
 * @param {string} description - Job description (for context)
 * @param {string[]} departments - Array of department names
 * @returns {string | null} - Mapped category or null if should be filtered
 */
function mapCategory(title = '', description = '', departments = []) {
  const lowerTitle = title.toLowerCase();
  const lowerDescription = description.toLowerCase();
  const allText = `${lowerTitle} ${lowerDescription}`;

  // Filter out irrelevant jobs
  if (shouldFilterJob(title)) {
    return null; // Signal to filter out
  }

  // PRIORITY 1: Explicit "3D" in title (most specific)
  // This prevents "3D Game Artist" from being categorized as "2D Art"
  if (/\b3d\b/i.test(title)) {
    return '3D';
  }

  // PRIORITY 2: VFX (very specific keywords)
  if (titleCategoryMap['VFX'].some(keyword => allText.includes(keyword))) {
    return 'VFX';
  }

  // PRIORITY 3: Animation (before 2D Art, as some 2D artists also animate)
  const hasAnimationKeywords = titleCategoryMap['Animation'].some(keyword => lowerTitle.includes(keyword));
  if (hasAnimationKeywords && /animation|rigging/i.test(lowerTitle)) {
    return 'Animation';
  }

  // PRIORITY 4: 2D Art (after 3D and Animation checks)
  if (titleCategoryMap['2D Art'].some(keyword => allText.includes(keyword))) {
    return '2D Art';
  }

  // PRIORITY 5: Design
  if (titleCategoryMap['Design'].some(keyword => lowerTitle.includes(keyword))) {
    return 'Design';
  }

  // PRIORITY 6: Game Dev (catch-all for tech roles)
  if (titleCategoryMap['Game Dev'].some(keyword => allText.includes(keyword))) {
    return 'Game Dev';
  }

  // Then try departments
  for (const dept of departments) {
    const name = dept.name || dept;
    if (departmentCategoryMap[name]) {
      return departmentCategoryMap[name];
    }

    // Check for partial matches
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(departmentCategoryMap)) {
      if (lowerName.includes(key.toLowerCase())) {
        return value;
      }
    }
  }

  // FALLBACK: Log warning and use default category
  console.warn(`⚠️  No category match for "${title}", using fallback: ${DEFAULT_CATEGORY}`);
  return DEFAULT_CATEGORY;
}

/**
 * Determine location scope from Greenhouse data
 * @param {object} metadata - Metadata array from Greenhouse
 * @param {object} location - Location object from Greenhouse
 * @returns {string} - Location scope (remote-brazil, remote-worldwide, hybrid, onsite)
 */
function determineLocationScope(metadata = [], location = {}) {
  // Check Work Model in metadata
  const workModel = metadata.find(m => m.name === 'Work Model');
  if (workModel) {
    const model = workModel.value?.toLowerCase() || '';
    if (model.includes('remote')) {
      // Check if there's location restriction
      const locationName = location?.name?.toLowerCase() || '';
      if (locationName.includes('brazil') || locationName.includes('são paulo')) {
        return 'remote-brazil';
      }
      return 'remote-worldwide';
    }
    if (model.includes('hybrid')) {
      return 'hybrid';
    }
  }

  // Default to onsite if location specified
  if (location?.name) {
    return 'onsite';
  }

  // Fallback
  return 'remote-brazil';
}

/**
 * Extract tags from job title and content using intelligent AI extraction
 * Falls back to smart keyword matching if AI is unavailable
 * @param {string} title - Job title
 * @param {string} content - Job description content
 * @returns {Promise<string[]>} - Array of relevant tags
 */
async function extractTags(title = '', content = '') {
  // Use intelligent tag extraction (with AI fallback to smart keyword matching)
  const { extractTagsIntelligently } = await import('./extract-tags.mjs');
  return await extractTagsIntelligently(title, content);
}

/**
 * Decode HTML entities to plain text
 * Handles all common HTML entities including numeric and hex entities
 * @param {string} html - HTML content with entities
 * @returns {string} - Decoded text
 */
function decodeHtmlEntities(html = '') {
  if (!html) return '';

  let text = html;

  // IMPORTANT: Process numeric entities FIRST, then named entities
  // This prevents conflicts (e.g., &#39; should be processed before &amp;)

  // Replace hex entities (&#x27;)
  text = text.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Replace numeric entities (&#39;)
  text = text.replace(/&#(\d+);/g, (match, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });

  // Common named HTML entities (must come after numeric to avoid conflicts)
  // Use a more comprehensive approach with regex that matches word boundaries
  const entityMap = {
    '&amp;': '&',   // Must be first to avoid double replacement
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",   // Alternative for apostrophe
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
    '&rsquo;': '\u2019',  // Right single quotation mark
    '&lsquo;': '\u2018',  // Left single quotation mark
    '&rdquo;': '\u201D',  // Right double quotation mark
    '&ldquo;': '\u201C',  // Left double quotation mark
  };

  // Replace named entities (process &amp; FIRST to avoid double-encoding)
  // Process &amp; separately first since it's the most common and critical
  text = text.replace(/&amp;/gi, '&');

  // Then replace all other named entities
  for (const [entity, replacement] of Object.entries(entityMap)) {
    // Skip &amp; as we already processed it
    if (entity === '&amp;') continue;

    // Escape special regex characters and create case-insensitive regex
    const escapedEntity = entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(escapedEntity, 'gi'), replacement);
  }

  // Final pass: handle any remaining numeric entities that might have been missed
  text = text.replace(/&#(\d+);/g, (match, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });

  return text;
}

/**
 * Convert HTML to plain text (decodes entities and removes tags)
 * @param {string} html - HTML content
 * @returns {string} - Plain text with decoded entities
 */
function htmlToText(html = '') {
  return decodeHtmlEntities(html)
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Generate unique ID for job
 * @param {number} greenhouseId - Greenhouse job ID
 * @param {string} companyName - Company name
 * @returns {string} - Unique ID
 */
function generateJobId(greenhouseId, companyName) {
  const companyPrefix = companyName
    .toUpperCase()
    .replace(/\s+/g, '')
    .substring(0, 3);
  // Use last 6 digits to ensure uniqueness
  const idSuffix = greenhouseId.toString().slice(-6);
  return `${companyPrefix}-${idSuffix}`;
}

/**
 * Fetch detailed job information
 * @param {number} jobId - Greenhouse job ID
 * @returns {Promise<object>} - Detailed job data
 */
async function fetchJobDetails(jobId) {
  const url = `${GREENHOUSE_API_BASE}/${COMPANY_SLUG}/jobs/${jobId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch job ${jobId}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Detect contract type from job title and description
 * @param {string} title - Job title
 * @param {string} description - Job description
 * @returns {string | null} - Contract type or null
 */
function detectContractType(title = '', description = '') {
  const allText = `${title} ${description}`.toLowerCase();

  // Check for internship/estágio (higher priority in title)
  if (/\b(intern|internship|estágio|estagio)\b/i.test(title)) {
    return 'Internship'; // Use English version for consistency
  }
  if (/\b(intern|internship|estágio|estagio)\b/i.test(description)) {
    return 'Internship';
  }

  // Check for other contract types
  if (/\b(freelance|freelancer|consultant|consultoria)\b/i.test(allText)) {
    return 'Freelance';
  }

  // CLT, PJ, B2B are usually specified in job descriptions
  // but we can't reliably detect them without explicit keywords

  return null;
}

/**
 * Normalize Greenhouse job to our Job format
 * @param {object} greenhouseJob - Job from Greenhouse API
 * @returns {Promise<object>} - Normalized job
 */
async function normalizeJob(greenhouseJob) {
  // Fetch full job details
  const details = await fetchJobDetails(greenhouseJob.id);

  const title = greenhouseJob.title || details.title || '';
  const content = details.content || '';
  const description = htmlToText(content); // This now decodes HTML entities

  // Limit description length for shortDescription (max 300 chars)
  const shortDescription = description.length > 300
    ? description.slice(0, 297) + '...'
    : description;

  // Map category with description context for better detection
  const category = mapCategory(
    title,
    description,
    details.departments || greenhouseJob.departments || []
  );

  // Filter out irrelevant jobs (returns null)
  if (!category) {
    return null;
  }

  const tags = await extractTags(title, description);
  const locationScope = determineLocationScope(
    details.metadata || greenhouseJob.metadata || [],
    details.location || greenhouseJob.location || {}
  );

  // Detect contract type
  const contractType = detectContractType(title, description);

  const id = generateJobId(greenhouseJob.id, greenhouseJob.company_name || 'WLF');

  return {
    id,
    companyName: greenhouseJob.company_name || 'Wildlife Studios',
    companyLogo: '/images/companies/wildlifestudios.svg', // Use existing logo
    jobTitle: title,
    description, // Now with decoded HTML entities
    shortDescription,
    applyLink: greenhouseJob.absolute_url || details.absolute_url,
    postedDate: greenhouseJob.first_published || new Date().toISOString(),
    category,
    tags: tags.length > 0 ? tags : [category], // Fallback to category if no tags
    location: {
      scope: locationScope, // This will be converted to string in orquestrador
    },
    contractType, // Now detects Estágio for internships
    salary: null,
  };
}

/**
 * Main function to fetch and process Greenhouse jobs
 */
async function fetchGreenhouseJobs() {
  console.log('🚀 Fetching jobs from Greenhouse API...');
  console.log(`📋 Company: ${COMPANY_SLUG}`);
  console.log('═'.repeat(60));

  try {
    // Fetch job list
    const listUrl = `${GREENHOUSE_API_BASE}/${COMPANY_SLUG}/jobs`;
    console.log(`🔍 Fetching job list from: ${listUrl}`);

    const listResponse = await fetch(listUrl);
    if (!listResponse.ok) {
      throw new Error(`Failed to fetch job list: ${listResponse.statusText}`);
    }

    const listData = await listResponse.json();
    const jobs = listData.jobs || [];

    console.log(`📦 Found ${jobs.length} jobs`);
    console.log('\n🔄 Processing jobs...\n');

    // Process each job
    const normalizedJobs = [];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      try {
        console.log(`[${i + 1}/${jobs.length}] Processing: ${job.title}`);
        const normalized = await normalizeJob(job);

        if (!normalized) {
          console.log(`  ⏭️  Filtered out (not relevant for creative/tech focus)`);
          continue;
        }

        normalizedJobs.push(normalized);
        console.log(`  ✅ Created: ${normalized.id} - ${normalized.category}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Error processing job ${job.id}: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Successfully processed ${normalizedJobs.length} jobs`);
    console.log('═'.repeat(60));

    // Save to JSON file for inspection
    const outputPath = resolve(process.cwd(), 'scripts/greenhouse-jobs-output.json');
    writeFileSync(outputPath, JSON.stringify(normalizedJobs, null, 2), 'utf-8');

    console.log(`\n📄 Output saved to: ${outputPath}`);
    console.log('💡 Review the output and adjust mapping as needed before integrating into main jobs.json');

    // Show summary
    const categories = {};
    const locationScopes = {};
    normalizedJobs.forEach(job => {
      categories[job.category] = (categories[job.category] || 0) + 1;
      locationScopes[job.location.scope] = (locationScopes[job.location.scope] || 0) + 1;
    });

    console.log('\n📊 Summary:');
    console.log('Categories:', categories);
    console.log('Location Scopes:', locationScopes);

  } catch (error) {
    console.error('❌ Error fetching Greenhouse jobs:', error.message);
    process.exit(1);
  }
}

// Run the script
fetchGreenhouseJobs();

