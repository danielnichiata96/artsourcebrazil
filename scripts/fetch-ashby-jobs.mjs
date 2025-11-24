#!/usr/bin/env node
/**
 * Fetch and normalize jobs from Ashby API
 * 
 * Ashby uses a GraphQL API for their public job boards:
 * - Endpoint: https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams
 * - Uses GraphQL POST requests
 * 
 * This script:
 * 1. Fetches jobs from Ashby GraphQL API
 * 2. Fetches detailed job information for each posting
 * 3. Normalizes data to our Job type format
 * 4. Maps categories and determines location scope
 * 5. Filters relevant jobs for creative/tech positions
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Configuration
const ASHBY_GRAPHQL_ENDPOINT = 'https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams';
const COMPANY_SLUG = 'deel'; // Default: Deel
const COMPANY_NAME = 'Deel';
const COMPANY_LOGO = null;

// Reuse category mapping
const titleCategoryMap = {
  'VFX': ['vfx', 'visual effects', 'effects artist', 'fx artist', 'particle'],
  '3D': ['3d artist', '3d game artist', '3d modeler', '3d modeller', 'modeling', 'texturing', 'lighting artist'],
  '2D Art': ['2d artist', '2d game artist', 'concept artist', 'illustrator', '2d art'],
  'Animation': ['animator', 'character animator', 'rigging', 'animation artist', 'motion graphics'],
  'Design': ['designer', 'ux', 'ui', 'user experience', 'user interface', 'product designer'],
  'Game Dev': ['game engineer', 'game developer', 'software engineer', 'engineer', 'developer', 'programmer'],
};

const excludedKeywords = [
  'fp&a', 'finance', 'accounting', 'head of marketing',
  'marketing manager', 'hr', 'human resources', 'recruiter',
  'sales', 'business development', 'legal', 'lawyer',
];

const DEFAULT_CATEGORY = 'Game Dev';

/**
 * GraphQL query to fetch job board with teams
 */
const JOB_BOARD_QUERY = `
query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
  jobBoard: jobBoardWithTeams(
    organizationHostedJobsPageName: $organizationHostedJobsPageName
  ) {
    teams {
      id
      name
      parentTeamId
    }
    jobPostings {
      id
      title
      teamId
      locationId
      locationName
      employmentType
      compensationTierSummary
    }
  }
}
`;

/**
 * GraphQL query to fetch job posting details
 */
const JOB_DETAILS_QUERY = `
query ApiJobPosting($organizationHostedJobsPageName: String!, $jobPostingId: String!) {
  jobPosting(
    organizationHostedJobsPageName: $organizationHostedJobsPageName
    jobPostingId: $jobPostingId
  ) {
    id
    title
    teamName
    locationName
    locationId
    employmentType
    descriptionHtml
    publishedDate
    applicationFormDefinition {
      sections {
        fields {
          fieldId
          title
          isRequired
        }
      }
    }
    info {
      descriptionPlain
    }
  }
}
`;

/**
 * Check if job should be filtered out
 */
function shouldFilterJob(title = '') {
  const lowerTitle = title.toLowerCase();
  return excludedKeywords.some(keyword => lowerTitle.includes(keyword));
}

/**
 * Map job title to category
 */
function mapCategory(title = '', description = '') {
  const lowerTitle = title.toLowerCase();
  const lowerDescription = description.toLowerCase();
  const allText = `${lowerTitle} ${lowerDescription}`;

  if (shouldFilterJob(title)) {
    return null;
  }

  if (/\b3d\b/i.test(title)) {
    return '3D';
  }

  for (const [category, keywords] of Object.entries(titleCategoryMap)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      return category;
    }
  }

  console.warn(`⚠️  No category match for "${title}", using fallback: ${DEFAULT_CATEGORY}`);
  return DEFAULT_CATEGORY;
}

/**
 * Determine location scope from Ashby data
 */
function determineLocationScope(locationName = '', employmentType = '') {
  const lowerLocation = locationName.toLowerCase();
  const lowerType = employmentType.toLowerCase();

  // Check for remote keywords
  if (lowerLocation.includes('remote') || lowerType.includes('remote')) {
    // Brazil-specific
    if (lowerLocation.includes('brazil') || lowerLocation.includes('brasil')) {
      return 'remote-brazil';
    }
    // LATAM
    if (lowerLocation.includes('latin america') || lowerLocation.includes('latam') || 
        lowerLocation.includes('americas')) {
      return 'remote-latam';
    }
    // North & South America
    if (lowerLocation.includes('north to south america')) {
      return 'remote-latam';
    }
    // Worldwide
    return 'remote-worldwide';
  }

  // Hybrid
  if (lowerType.includes('hybrid')) {
    return 'hybrid';
  }

  // Onsite if location specified
  if (locationName) {
    return 'onsite';
  }

  return 'remote-worldwide';
}

/**
 * Extract tags
 */
async function extractTags(title = '', description = '') {
  try {
    const { extractTagsIntelligently } = await import('./extract-tags.mjs');
    return await extractTagsIntelligently(title, description);
  } catch (error) {
    return [];
  }
}

/**
 * Detect contract type
 */
function detectContractType(employmentType = '', title = '', description = '') {
  const allText = `${employmentType} ${title} ${description}`.toLowerCase();

  if (/\b(intern|internship|estágio|estagio)\b/i.test(allText)) {
    return 'Internship';
  }
  if (/\b(freelance|contractor|consultoria)\b/i.test(allText)) {
    return 'Freelance';
  }
  if (/\b(full.?time|full time)\b/i.test(allText)) {
    return 'CLT';
  }
  if (/\b(part.?time|part time)\b/i.test(allText)) {
    return 'PJ';
  }

  return null;
}

/**
 * Generate unique ID
 */
function generateJobId(ashbyId, companyName) {
  const companyPrefix = companyName
    .toUpperCase()
    .replace(/\s+/g, '')
    .substring(0, 3);
  // Use last part of UUID
  const idSuffix = ashbyId.split('-')[0] || ashbyId.substring(0, 8);
  return `${companyPrefix}-${idSuffix}`;
}

/**
 * Fetch GraphQL data
 */
async function fetchGraphQL(query, variables) {
  const response = await fetch(ASHBY_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

/**
 * Fetch job details
 */
async function fetchJobDetails(jobPostingId) {
  const data = await fetchGraphQL(JOB_DETAILS_QUERY, {
    organizationHostedJobsPageName: COMPANY_SLUG,
    jobPostingId,
  });

  return data.jobPosting;
}

/**
 * Convert HTML to plain text
 */
function htmlToText(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize Ashby job to our format
 */
async function normalizeJob(ashbyJob) {
  // Fetch full details
  const details = await fetchJobDetails(ashbyJob.id);

  const title = details.title || ashbyJob.title || '';
  const descriptionHtml = details.descriptionHtml || '';
  const descriptionPlain = details.info?.descriptionPlain || htmlToText(descriptionHtml);

  const shortDescription = descriptionPlain.length > 300
    ? descriptionPlain.slice(0, 297) + '...'
    : descriptionPlain;

  const category = mapCategory(title, descriptionPlain);

  if (!category) {
    return null;
  }

  const tags = await extractTags(title, descriptionPlain);
  const locationScope = determineLocationScope(
    ashbyJob.locationName || details.locationName || '',
    ashbyJob.employmentType || details.employmentType || ''
  );

  const contractType = detectContractType(
    ashbyJob.employmentType || '',
    title,
    descriptionPlain
  );

  const id = generateJobId(ashbyJob.id, COMPANY_NAME);

  // Construct apply URL
  const applyUrl = `https://jobs.ashbyhq.com/${COMPANY_SLUG}/${ashbyJob.id}`;

  return {
    id,
    companyName: COMPANY_NAME,
    companyLogo: COMPANY_LOGO,
    jobTitle: title,
    description: descriptionPlain,
    shortDescription,
    applyLink: applyUrl,
    postedDate: details.publishedDate || new Date().toISOString(),
    category,
    tags: tags.length > 0 ? tags : [category],
    location: {
      scope: locationScope,
      text: ashbyJob.locationName || details.locationName || 'Remote',
    },
    contractType,
    salary: ashbyJob.compensationTierSummary || null,
  };
}

/**
 * Main function
 */
async function fetchAshbyJobs() {
  console.log('🚀 Fetching jobs from Ashby API (GraphQL)...');
  console.log(`📋 Company: ${COMPANY_SLUG}`);
  console.log('═'.repeat(60));

  try {
    console.log('🔍 Fetching job board...');

    const data = await fetchGraphQL(JOB_BOARD_QUERY, {
      organizationHostedJobsPageName: COMPANY_SLUG,
    });

    const jobs = data.jobBoard.jobPostings || [];
    console.log(`📦 Found ${jobs.length} jobs`);
    console.log('\n🔄 Processing jobs...\n');

    const normalizedJobs = [];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      try {
        console.log(`[${i + 1}/${jobs.length}] Processing: ${job.title}`);
        const normalized = await normalizeJob(job);

        if (!normalized) {
          console.log(`  ⏭️  Filtered out (not relevant)`);
          continue;
        }

        normalizedJobs.push(normalized);
        console.log(`  ✅ Created: ${normalized.id} - ${normalized.category}`);

        await new Promise(resolve => setTimeout(resolve, 150)); // Longer delay for GraphQL
      } catch (error) {
        console.error(`  ❌ Error processing job ${job.id}: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Successfully processed ${normalizedJobs.length} jobs`);
    console.log('═'.repeat(60));

    // Save output
    const outputPath = resolve(process.cwd(), 'scripts/ashby-jobs-output.json');
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
    console.error('❌ Error fetching Ashby jobs:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run
fetchAshbyJobs();
