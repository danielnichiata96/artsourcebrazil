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

// Configuration
const LEVER_API_BASE = 'https://api.lever.co/v0/postings';
const COMPANY_SLUG = 'fanatee';
const COMPANY_NAME = 'Fanatee';
const COMPANY_LOGO = null; // Will use placeholder

// Reuse same category mapping from Greenhouse
const titleCategoryMap = {
  'VFX': [
    'vfx', 'visual effects', 'effects artist', 'fx artist',
    'particle', 'real-time vfx', 'special effects',
  ],
  '3D': [
    '3d artist', '3d game artist', '3d modeler', '3d modeller',
    '3d modelling', '3d modeling', 'character artist 3d',
    'environment artist 3d', '3d generalist', '3d specialist',
    '3d designer', 'modeling', 'modelling', 'modeller',
    'texturing', 'lighting artist', '3d environment',
  ],
  '2D Art': [
    '2d artist', '2d game artist', 'concept artist', 'illustrator',
    '2d art', 'game artist', 'art 2d',
  ],
  'Animation': [
    'animator', 'character animator', 'environment animator',
    'rigging', 'animation artist', 'motion graphics',
    'sprite animation', '2d animation', '3d animation',
  ],
  'Design': [
    'designer', 'ux', 'ui', 'user experience', 'user interface',
    'product designer', 'visual designer', 'graphic designer',
  ],
  'Game Dev': [
    'game engineer', 'game developer', 'software engineer',
    'engineer', 'developer', 'programmer', 'qa', 'sre',
    'site reliability', 'data engineer', 'data scientist',
  ],
};

const excludedKeywords = [
  'fp&a', 'finance', 'accounting', 'head of marketing',
  'marketing manager', 'hr', 'human resources', 'recruiter',
  'sales', 'business development', 'legal', 'lawyer',
];

const DEFAULT_CATEGORY = 'Game Dev';

/**
 * Check if job should be filtered out
 */
function shouldFilterJob(title = '') {
  const lowerTitle = title.toLowerCase();
  return excludedKeywords.some(keyword => lowerTitle.includes(keyword));
}

/**
 * Map job title to our category
 */
function mapCategory(title = '', description = '') {
  const lowerTitle = title.toLowerCase();
  const lowerDescription = description.toLowerCase();
  const allText = `${lowerTitle} ${lowerDescription}`;

  if (shouldFilterJob(title)) {
    return null;
  }

  // Priority 1: Explicit "3D" in title
  if (/\b3d\b/i.test(title)) {
    return '3D';
  }

  // Priority 2-6: Check each category
  for (const [category, keywords] of Object.entries(titleCategoryMap)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      return category;
    }
  }

  console.warn(`⚠️  No category match for "${title}", using fallback: ${DEFAULT_CATEGORY}`);
  return DEFAULT_CATEGORY;
}

/**
 * Determine location scope from Lever data
 */
function determineLocationScope(location = '', commitment = '', categories = {}) {
  const lowerLocation = location.toLowerCase();
  const lowerCommitment = commitment.toLowerCase();
  
  // Check if remote
  if (lowerLocation.includes('remote') || lowerCommitment.includes('remote')) {
    // Check for Brazil-specific
    if (lowerLocation.includes('brazil') || lowerLocation.includes('brasil')) {
      return 'remote-brazil';
    }
    // Check for LATAM
    if (lowerLocation.includes('latin america') || lowerLocation.includes('latam')) {
      return 'remote-latam';
    }
    // Otherwise worldwide
    return 'remote-worldwide';
  }

  // Check for hybrid
  if (lowerCommitment.includes('hybrid')) {
    return 'hybrid';
  }

  // Default to onsite if location specified
  if (location) {
    return 'onsite';
  }

  return 'remote-worldwide'; // Fallback
}

/**
 * Extract tags from job title
 */
async function extractTags(title = '', description = '') {
  try {
    const { extractTagsIntelligently } = await import('./extract-tags.mjs');
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
 */
async function normalizeJob(leverJob) {
  const title = leverJob.text || '';
  const description = leverJob.description || '';
  const descriptionPlain = leverJob.descriptionPlain || description;

  // Limit description
  const shortDescription = descriptionPlain.length > 300
    ? descriptionPlain.slice(0, 297) + '...'
    : descriptionPlain;

  const category = mapCategory(title, descriptionPlain);

  // Filter out irrelevant jobs
  if (!category) {
    return null;
  }

  const tags = await extractTags(title, descriptionPlain);
  const locationScope = determineLocationScope(
    leverJob.location || '',
    leverJob.commitment || '',
    leverJob.categories || {}
  );

  const contractType = detectContractType(
    `${title} ${descriptionPlain}`,
    leverJob.commitment || ''
  );

  const id = generateJobId(leverJob.id, COMPANY_NAME);

  return {
    id,
    companyName: COMPANY_NAME,
    companyLogo: COMPANY_LOGO,
    jobTitle: title,
    description: descriptionPlain,
    shortDescription,
    applyLink: leverJob.hostedUrl || leverJob.applyUrl,
    postedDate: leverJob.createdAt ? new Date(leverJob.createdAt).toISOString() : new Date().toISOString(),
    category,
    tags: tags.length > 0 ? tags : [category],
    location: {
      scope: locationScope,
      text: leverJob.location || 'Remote',
    },
    contractType,
    salary: null,
  };
}

/**
 * Main function
 */
async function fetchLeverJobs() {
  console.log('🚀 Fetching jobs from Lever API...');
  console.log(`📋 Company: ${COMPANY_SLUG}`);
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
        const normalized = await normalizeJob(job);

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

  } catch (error) {
    console.error('❌ Error fetching Lever jobs:', error.message);
    process.exit(1);
  }
}

// Run
fetchLeverJobs();
