#!/usr/bin/env node
/**
 * Fetch and normalize jobs from Lever API
 * 
 * Lever API endpoints:
 * - https://api.lever.co/v0/postings/{company}?mode=json
 * - Public job board: https://jobs.lever.co/{company}
 * 
 * This script:
 * 1. Fetches jobs from Lever API
 * 2. Normalizes data to our Job type format
 * 3. Maps categories and determines location scope
 * 4. Filters relevant jobs for creative/tech positions
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { htmlToMarkdown } from './lib/html-to-markdown.mjs';
import { extractTagsIntelligently } from './extract-tags.mjs';
import { enhanceDescription } from './enhance-description.mjs';
import { garbageCollectJobsWithGracePeriod, safetyCheckJobCount } from './gc-utils.mjs';
import { categorizeJob } from '../src/lib/categories.ts';

// Configuration
const LEVER_API_BASE = 'https://api.lever.co/v0/postings';

// Logo.dev API for company logos (Lever API doesn't provide logos)
// Free tier: 1000 requests/month
const LOGO_DEV_TOKEN = process.env.LOGO_DEV_TOKEN || 'pk_X-1ZO13GSgeOoUrIuJ6GMQ';

/**
 * Generate logo URL using logo.dev service
 * @param {string} domain - Company domain (e.g., 'fanatee.com')
 * @param {number} size - Logo size in pixels (default: 128 for better quality)
 * @returns {string} Logo URL
 */
function getCompanyLogoUrl(domain, size = 128) {
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${size}`;
}

/**
 * Check if a job is relevant for Brazilian audience
 * Filters out jobs that are specifically for other regions
 * 
 * @param {object} leverJob - Raw Lever job data
 * @param {string} locationScope - Determined location scope
 * @param {string} description - Job description text
 * @returns {boolean} True if job should be included
 */
function isRelevantForBrazil(leverJob, locationScope, description) {
  const descLower = description.toLowerCase();
  const titleLower = (leverJob.text || '').toLowerCase();

  // FIRST: Check exclusion patterns (these override location detection)
  // Because some companies misconfigure Lever with Country: BR for all jobs
  const excludePatterns = [
    // Regional editors/roles for specific non-Brazil countries
    /regional\s+(?:editor|manager|coordinator).*(?:polish|indonesian|south\s+africa|german|french|italian|spanish|japanese|korean|chinese|indian|vietnamese|thai|arabic|turkish|russian|portuguese\s+-\s+portugal)/i,
    // Explicit language requirements for non-Portuguese
    /(?:english|polish|indonesian|german|french|italian|spanish|japanese|korean|chinese)\s+(?:fluent|native|speaker|language\s+focus)/i,
    // Based in specific regions (not Brazil/LATAM)
    /based\s+in\s+(?:poland|indonesia|europe|us|usa|uk|germany|france|italy|spain|japan|korea|china|india|canada|australia|south\s+africa)/i,
    // Location requirements in description
    /location:\s*based\s+in\s+(?:poland|indonesia|europe|us|usa|uk|germany)/i,
    // Must be located in (exclude Brazil/LATAM)
    /must\s+be\s+(?:located|based)\s+in\s+(?!brazil|brasil|latam|latin\s+america|são\s+paulo|rio)/i,
    // Timezone requirements for non-LATAM
    /(?:cet|gmt|pst|apac|emea)\s+timezone/i,
  ];

  for (const pattern of excludePatterns) {
    if (pattern.test(titleLower) || pattern.test(descLower)) {
      return false;
    }
  }

  // SECOND: Include Brazil-specific jobs
  if (locationScope === 'remote-brazil' || locationScope === 'hybrid' || locationScope === 'onsite') {
    return true;
  }

  // THIRD: Include LATAM jobs
  if (locationScope === 'remote-latam') {
    return true;
  }

  // FOURTH: For worldwide jobs without exclusions, include them
  // (These are jobs that accept applicants from anywhere, including Brazil)
  return true;
}

// Company configurations (Lever slug → company info)
const LEVER_COMPANIES = {
  fanatee: {
    slug: 'fanatee',
    name: 'Fanatee',
    domain: 'fanatee.com',
    description: 'Mobile game company behind CodyCross and other word games',
  },
};

// Current company to fetch
const CURRENT_COMPANY = 'fanatee';
const COMPANY_SLUG = LEVER_COMPANIES[CURRENT_COMPANY].slug;
const COMPANY_NAME = LEVER_COMPANIES[CURRENT_COMPANY].name;
const COMPANY_LOGO = getCompanyLogoUrl(LEVER_COMPANIES[CURRENT_COMPANY].domain);

/**
 * Map job title and description to our 4-pillar category system
 * Uses the intelligent categorizeJob() function from categories.ts
 * @param {string} title - Job title
 * @param {string} description - Job description (for context)
 * @returns {string | null} - Mapped category or null if should be filtered
 */
function mapCategory(title = '', description = '') {
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
 * Determine location scope from Lever data
 * 
 * Lever API provides multiple location indicators:
 * - workplaceType: "hybrid" | "remote" | "onsite" (most reliable)
 * - categories.location: "Hybrid" | "Remote" | city name
 * - categories.commitment: "Full-time" | "Part-time" etc
 * - country: "BR" | "US" etc
 */
function determineLocationScope(leverJob, description = '') {
  const workplaceType = (leverJob.workplaceType || '').toLowerCase();
  const categoryLocation = (leverJob.categories?.location || '').toLowerCase();
  const country = (leverJob.country || '').toUpperCase();
  const allLocations = (leverJob.categories?.allLocations || []).map(l => l.toLowerCase());
  const descLower = description.toLowerCase();

  // Priority 0: Check description for explicit non-Brazil locations
  // Some companies misconfigure Lever with BR but the role is actually elsewhere
  const internationalKeywords = [
    'based in europe', 'based in poland', 'based in us', 'based in usa',
    'europe only', 'us only', 'emea', 'apac', 'americas',
    'north america', 'european', 'uk based', 'us based',
  ];
  const hasInternationalLocation = internationalKeywords.some(kw => descLower.includes(kw));

  // Priority 1: Use workplaceType if available (most reliable)
  if (workplaceType === 'hybrid' && !hasInternationalLocation) {
    return 'hybrid';
  }

  if (workplaceType === 'onsite' && !hasInternationalLocation) {
    return 'onsite';
  }

  // Priority 2: Check categories.location
  if (categoryLocation.includes('hybrid') || allLocations.some(l => l.includes('hybrid'))) {
    if (!hasInternationalLocation) {
      return 'hybrid';
    }
  }

  // Priority 3: Check for remote indicators
  const isRemote = workplaceType === 'remote' ||
    categoryLocation.includes('remote') ||
    allLocations.some(l => l.includes('remote'));

  if (isRemote || hasInternationalLocation) {
    // If description mentions international locations, it's worldwide
    if (hasInternationalLocation) {
      return 'remote-worldwide';
    }
    // Check country for Brazil-specific remote
    if (country === 'BR') {
      return 'remote-brazil';
    }
    // Check location text for LATAM
    if (categoryLocation.includes('latam') || categoryLocation.includes('latin america')) {
      return 'remote-latam';
    }
    return 'remote-worldwide';
  }

  // Priority 4: If country is BR but not explicitly remote, could be hybrid/onsite
  if (country === 'BR') {
    // Assume remote-brazil for BR-based companies with remote-friendly culture
    // This can be overridden by explicit workplaceType
    return 'remote-brazil';
  }

  // Fallback: worldwide remote (most Lever jobs are remote-friendly)
  return 'remote-worldwide';
}

/**
 * Extract tags from job title
 */
async function extractTags(title = '', description = '') {
  try {
    return await extractTagsIntelligently(title, description);
  } catch (error) {
    // Fallback to simple extraction
    return [];
  }
}

/**
 * Detect contract type
 */
function detectContractType(text = '', commitment = '') {
  const allText = `${text} ${commitment}`.toLowerCase();

  if (/\b(intern|internship|estágio|estagio)\b/i.test(allText)) {
    return 'Internship';
  }
  if (/\b(freelance|contractor|consultoria)\b/i.test(allText)) {
    return 'Freelance';
  }
  if (/\b(full.?time|full time)\b/i.test(allText)) {
    return 'CLT'; // Assume full-time = CLT for Brazil
  }
  if (/\b(part.?time|part time)\b/i.test(allText)) {
    return 'PJ'; // Assume part-time = PJ for Brazil
  }

  return null;
}

/**
 * Generate unique ID
 */
function generateJobId(leverId, companyName) {
  const companyPrefix = companyName
    .toUpperCase()
    .replace(/\s+/g, '')
    .substring(0, 3);
  // Use lever UUID last part
  const idSuffix = leverId.split('-').pop() || leverId.substring(0, 6);
  return `${companyPrefix}-${idSuffix}`;
}

/**
 * Normalize Lever job to our format
 * @param {object} leverJob - Job from Lever API
 * @param {string} syncId - Current sync session ID
 * @param {string} syncTimestamp - Current sync timestamp
 * @returns {Promise<object>} - Normalized job
 */
async function normalizeJob(leverJob, syncId, syncTimestamp) {
  const title = leverJob.text || '';
  const descriptionHtml = leverJob.description || '';
  const descriptionPlain = leverJob.descriptionPlain || descriptionHtml;

  // Store raw description as backup
  const rawDescription = descriptionHtml;

  // Convert HTML to Markdown for rich formatting
  // Lever may have relative links, resolve them to jobs.lever.co
  const descriptionMarkdown = htmlToMarkdown(descriptionHtml, {
    baseUrl: `https://jobs.lever.co/${COMPANY_SLUG}`
  });

  // Enhance description with AI (concise, ~400 words)
  console.log('  🤖 Enhancing description with AI...');
  const enhancedDescription = await enhanceDescription(
    rawDescription,
    title,
    COMPANY_NAME
  );

  // Short description from plain text (no markdown)
  const shortDescription = descriptionPlain.length > 300
    ? descriptionPlain.slice(0, 297) + '...'
    : descriptionPlain;

  const category = mapCategory(title, descriptionPlain);

  // Filter out irrelevant jobs
  if (!category) {
    return null;
  }

  const tags = await extractTags(title, descriptionPlain);
  const locationScope = determineLocationScope(leverJob, descriptionPlain);

  // Filter out jobs not relevant for Brazilian audience
  if (!isRelevantForBrazil(leverJob, locationScope, descriptionPlain)) {
    return null; // Skip this job
  }

  const contractType = detectContractType(
    `${title} ${descriptionPlain}`,
    leverJob.categories?.commitment || ''
  );

  const id = generateJobId(leverJob.id, COMPANY_NAME);

  // Build location text based on determined scope
  const locationText = buildLocationText(leverJob, locationScope);

  // Enhance tags with team info from Lever
  const enhancedTags = enhanceTagsWithLeverData(tags, leverJob);

  return {
    id,
    companyName: COMPANY_NAME,
    companyLogo: COMPANY_LOGO,
    jobTitle: title,
    description: enhancedDescription, // AI-enhanced, concise description
    raw_description: rawDescription, // Original HTML for backup
    shortDescription,
    applyLink: leverJob.hostedUrl || leverJob.applyUrl,
    postedDate: leverJob.createdAt ? new Date(leverJob.createdAt).toISOString() : new Date().toISOString(),
    category,
    tags: enhancedTags.length > 0 ? enhancedTags : [category],
    location: {
      scope: locationScope,
      text: locationText,
    },
    contractType,
    salary: null,
    // GC tracking fields
    sync_id: syncId,
    last_synced_at: syncTimestamp,
    // Additional metadata from Lever
    meta: {
      team: leverJob.categories?.team || null,
      commitment: leverJob.categories?.commitment || null,
      workplaceType: leverJob.workplaceType || null,
      country: leverJob.country || null,
    },
  };
}

/**
 * Build descriptive location text based on determined location scope
 */
function buildLocationText(leverJob, locationScope) {
  const workplaceType = leverJob.workplaceType || '';
  const categoryLocation = leverJob.categories?.location || '';

  // Build descriptive text based on determined scope (not raw Lever data)
  switch (locationScope) {
    case 'hybrid':
      return 'Híbrido • Brasil';
    case 'onsite':
      if (categoryLocation && !categoryLocation.toLowerCase().includes('onsite')) {
        return `Presencial • ${categoryLocation}`;
      }
      return 'Presencial • Brasil';
    case 'remote-brazil':
      return 'Remoto • Brasil';
    case 'remote-latam':
      return 'Remoto • LATAM';
    case 'remote-worldwide':
      return 'Remoto • Global';
    default:
      // Fallback to category location
      if (categoryLocation) {
        return categoryLocation;
      }
      return 'Remoto';
  }
}

/**
 * Enhance tags with data from Lever categories and job title
 */
function enhanceTagsWithLeverData(tags, leverJob) {
  const enhanced = [...tags];
  const team = (leverJob.categories?.team || '').toLowerCase();
  const commitment = (leverJob.categories?.commitment || '').toLowerCase();
  const title = (leverJob.text || '').toLowerCase();

  // Map Lever team to our tag system
  const teamTagMap = {
    'engineering': 'Game Dev',
    'development': 'Game Dev',
    'product': 'Design',
    'design': 'Design',
    'art': 'Artist',
    'marketing': 'Marketing',
    'data': 'Data',
    'content': 'Content',
    'localization': 'Localization',
    'qa': 'QA',
    'community': 'Community',
  };

  for (const [teamKey, tag] of Object.entries(teamTagMap)) {
    if (team.includes(teamKey) && !enhanced.includes(tag)) {
      enhanced.push(tag);
    }
  }

  // Add commitment-based tags
  if (commitment.includes('freelance') && !enhanced.includes('Freelance')) {
    enhanced.push('Freelance');
  }
  if (commitment.includes('part-time') && !enhanced.includes('Part-time')) {
    enhanced.push('Part-time');
  }
  if (commitment.includes('intern') && !enhanced.includes('Estágio')) {
    enhanced.push('Estágio');
  }

  // Add title-based tags for common keywords
  const titleTagMap = {
    'editor': 'Content',
    'regional': 'Localization',
    'localization': 'Localization',
    'translator': 'Localization',
    'motion': 'Motion',
    'video': 'Video',
    'community': 'Community',
    'analyst': 'Data',
    'data': 'Data',
  };

  for (const [keyword, tag] of Object.entries(titleTagMap)) {
    if (title.includes(keyword) && !enhanced.includes(tag)) {
      enhanced.push(tag);
    }
  }

  // Remove duplicates and limit to 10 tags max
  return [...new Set(enhanced)].slice(0, 10);
}

/**
 * Main function
 */
async function fetchLeverJobs() {
  // Generate sync session ID
  const syncId = randomUUID();
  const syncTimestamp = new Date().toISOString();

  console.log('🚀 Fetching jobs from Lever API...');
  console.log(`📋 Company: ${COMPANY_SLUG}`);
  console.log(`🔄 Sync Session: ${syncId}`);
  console.log(`⏰ Timestamp: ${syncTimestamp}`);
  console.log('═'.repeat(60));

  try {
    const url = `${LEVER_API_BASE}/${COMPANY_SLUG}?mode=json`;
    console.log(`🔍 Fetching from: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const jobs = await response.json();
    console.log(`📦 Found ${jobs.length} jobs`);
    console.log('\n🔄 Processing jobs...\n');

    const normalizedJobs = [];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      try {
        console.log(`[${i + 1}/${jobs.length}] Processing: ${job.text}`);
        const normalized = await normalizeJob(job, syncId, syncTimestamp);

        if (!normalized) {
          console.log(`  ⏭️  Filtered out (not relevant)`);
          continue;
        }

        normalizedJobs.push(normalized);
        console.log(`  ✅ Created: ${normalized.id} - ${normalized.category}`);

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Error processing job ${job.id}: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Successfully processed ${normalizedJobs.length} jobs`);
    console.log('═'.repeat(60));

    // Save output
    const outputPath = resolve(process.cwd(), 'scripts/lever-jobs-output.json');
    writeFileSync(outputPath, JSON.stringify(normalizedJobs, null, 2), 'utf-8');

    console.log(`\n📄 Output saved to: ${outputPath}`);

    // Summary
    const categories = {};
    const locationScopes = {};
    normalizedJobs.forEach(job => {
      categories[job.category] = (categories[job.category] || 0) + 1;
      locationScopes[job.location.scope] = (locationScopes[job.location.scope] || 0) + 1;
    });

    console.log('\n📊 Summary:');
    console.log('Categories:', categories);
    console.log('Location Scopes:', locationScopes);

    // GC safety check
    if (safetyCheckJobCount(normalizedJobs.length, 5)) {
      console.log('\n🧹 Garbage Collection ready');
      console.log('   Strategy: Grace period (7 days)');
      console.log('   Jobs marked with sync_id for tracking');
    }

  } catch (error) {
    console.error('❌ Error fetching Lever jobs:', error.message);
    process.exit(1);
  }
}

// Run
fetchLeverJobs();
