#!/usr/bin/env node
/**
 * Fetch and normalize jobs from Greenhouse API
 * 
 * This script:
 * 1. Fetches jobs from Greenhouse board API
 * 2. Gets detailed information for each job
 * 3. Normalizes data to our Job type format
 * 4. Maps categories using intelligent categorization (4 pillars)
 * 5. Filters out non-creative industry jobs
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { htmlToMarkdown } from './lib/html-to-markdown.mjs';
import { enhanceDescription } from './enhance-description.mjs';
import { garbageCollectJobsWithGracePeriod, safetyCheckJobCount } from './gc-utils.mjs';

// Import the smart categorization function
import { categorizeJob } from '../src/lib/categories.ts';

// Configuration
const GREENHOUSE_API_BASE = 'https://boards-api.greenhouse.io/v1/boards';

// Logo.dev API for company logos
const LOGO_DEV_TOKEN = process.env.LOGO_DEV_TOKEN || 'pk_X-1ZO13GSgeOoUrIuJ6GMQ';

/**
 * Get company logo URL using logo.dev service
 * @param {string} domain - Company domain (e.g., 'wildlifestudios.com')
 * @returns {string} Logo URL
 */
function getCompanyLogoUrl(domain) {
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128`;
}

// Company configurations for Greenhouse
const GREENHOUSE_COMPANIES = {
  wildlifestudios: {
    slug: 'wildlifestudios',
    name: 'Wildlife Studios',
    domain: 'wildlifestudios.com',
  },
  automattic: {
    slug: 'automattic',
    name: 'Automattic',
    domain: 'automattic.com',
  },
  gitlab: {
    slug: 'gitlab',
    name: 'GitLab',
    domain: 'gitlab.com',
  },
  monks: {
    slug: 'monks',
    name: 'Monks',
    domain: 'monks.com',
  },
  aestudio: {
    slug: 'aestudio',
    name: 'AE.Studio',
    domain: 'ae.studio',
  },
};

// Current company to fetch
const CURRENT_COMPANY = 'wildlifestudios';
const COMPANY_CONFIG = GREENHOUSE_COMPANIES[CURRENT_COMPANY];
const COMPANY_SLUG = COMPANY_CONFIG.slug;
const COMPANY_NAME = COMPANY_CONFIG.name;
const COMPANY_LOGO = getCompanyLogoUrl(COMPANY_CONFIG.domain);

/**
 * Map job title and description to our 4-pillar category system
 * Uses the intelligent categorizeJob() function from categories.ts
 * @param {string} title - Job title
 * @param {string} description - Job description (for context)
 * @param {string[]} departments - Array of department names (legacy, not used)
 * @returns {string | null} - Mapped category or null if should be filtered
 */
function mapCategory(title = '', description = '', departments = []) {
  // Use the smart categorization function
  const category = categorizeJob(title, description);
  
  // If categorizeJob returns null, it means the job should be filtered out
  if (!category) {
    console.log(`  ❌ Rejected: "${title}" (não é indústria criativa)`);
    return null;
  }
  
  console.log(`  ✅ Categorized: "${title}" → ${category}`);
  return category;
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
 * @param {string} syncId - Current sync session ID
 * @param {string} syncTimestamp - Current sync timestamp
 * @returns {Promise<object>} - Normalized job
 */
async function normalizeJob(greenhouseJob, syncId, syncTimestamp) {
  // Fetch full job details
  const details = await fetchJobDetails(greenhouseJob.id);

  const title = greenhouseJob.title || details.title || '';
  const content = details.content || '';

  // Store raw description as backup
  const rawDescription = content;

  // Convert HTML to Markdown for rich formatting
  // Greenhouse may have relative links, resolve them
  const descriptionMarkdown = htmlToMarkdown(content, {
    baseUrl: `https://job-boards.greenhouse.io/${COMPANY_SLUG}`
  });
  // Plain text for search/categorization
  const descriptionPlain = htmlToText(content);

  // Enhance description with AI (concise, ~400 words)
  console.log('  🤖 Enhancing description with AI...');
  const enhancedDescription = await enhanceDescription(
    rawDescription,
    title,
    COMPANY_NAME
  );

  // Limit description length for shortDescription (max 300 chars)
  const shortDescription = descriptionPlain.length > 300
    ? descriptionPlain.slice(0, 297) + '...'
    : descriptionPlain;

  // Map category with description context for better detection
  const category = mapCategory(
    title,
    descriptionPlain,
    details.departments || greenhouseJob.departments || []
  );

  // Filter out irrelevant jobs (returns null)
  if (!category) {
    return null;
  }

  const tags = await extractTags(title, descriptionPlain);
  const locationScope = determineLocationScope(
    details.metadata || greenhouseJob.metadata || [],
    details.location || greenhouseJob.location || {}
  );

  // Detect contract type
  const contractType = detectContractType(title, descriptionPlain);

  const id = generateJobId(greenhouseJob.id, greenhouseJob.company_name || 'WLF');

  return {
    id,
    companyName: greenhouseJob.company_name || COMPANY_NAME,
    companyLogo: COMPANY_LOGO,
    jobTitle: title,
    description: enhancedDescription, // AI-enhanced, concise description
    raw_description: rawDescription, // Original HTML for backup
    shortDescription,
    applyLink: greenhouseJob.absolute_url || details.absolute_url,
    postedDate: greenhouseJob.first_published || new Date().toISOString(),
    category,
    tags: tags.length > 0 ? tags : [category], // Fallback to category if no tags
    location: {
      scope: locationScope,
      text: details.location?.name || greenhouseJob.location?.name || 'Remote',
    },
    contractType, // Now detects Estágio for internships
    salary: null,
    // GC tracking fields
    sync_id: syncId,
    last_synced_at: syncTimestamp,
  };
}

/**
 * Main function to fetch and process Greenhouse jobs
 */
async function fetchGreenhouseJobs() {
  // Generate sync session ID
  const syncId = randomUUID();
  const syncTimestamp = new Date().toISOString();

  console.log('🚀 Fetching jobs from Greenhouse API...');
  console.log(`📋 Company: ${COMPANY_SLUG}`);
  console.log(`🔄 Sync Session: ${syncId}`);
  console.log(`⏰ Timestamp: ${syncTimestamp}`);
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
        const normalized = await normalizeJob(job, syncId, syncTimestamp);

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

    // ============================================================================
    // GARBAGE COLLECTION
    // ============================================================================

    // Safety check: Ensure we got enough jobs before running GC
    if (safetyCheckJobCount(normalizedJobs.length, 5)) {
      console.log('\n🧹 Running Garbage Collection...');
      console.log('   Strategy: Grace period (7 days)');
      console.log('   Note: This is a DRY RUN - actual GC happens in sync-to-supabase script');
      console.log('   Jobs will be marked with sync_id for GC tracking');
    } else {
      console.log('\n⚠️  Skipping GC safety check failed');
    }

  } catch (error) {
    console.error('❌ Error fetching Greenhouse jobs:', error.message);
    process.exit(1);
  }
}

// Run the script
fetchGreenhouseJobs();

