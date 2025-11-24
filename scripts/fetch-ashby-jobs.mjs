#!/usr/bin/env node
/**
 * Fetch jobs from Ashby API (REST)
 * 
 * FIXED: Now using the stable REST API instead of GraphQL!
 * The REST API is much simpler, faster, and doesn't have rate limiting issues.
 * 
 * API Endpoint: GET https://api.ashbyhq.com/posting-api/job-board/{company}
 * 
 * Usage:
 *   node scripts/fetch-ashby-jobs.mjs
 * 
 * Configuration:
 *   - COMPANY_SLUG: The company's Ashby identifier (e.g., 'deel')
 */

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const COMPANY_SLUG = 'ashby'; // Options: 'ashby', 'deel', 'ramp', 'notion', 'loom'
const REST_ENDPOINT = `https://api.ashbyhq.com/posting-api/job-board/${COMPANY_SLUG}`;
const OUTPUT_FILE = join(__dirname, `${COMPANY_SLUG}-jobs-output.json`);

// ============================================================================
// CATEGORY MAPPING
// ============================================================================

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

/**
 * Determine category from job title
 */
function determineCategory(title) {
  const titleLower = title.toLowerCase();
  
  // Check for excluded keywords
  for (const keyword of excludedKeywords) {
    if (titleLower.includes(keyword)) {
      return null; // Filter out
    }
  }
  
  // Check title against category mappings
  for (const [category, keywords] of Object.entries(titleCategoryMap)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Game Dev'; // Default fallback
}

// ============================================================================
// LOCATION MAPPING
// ============================================================================

/**
 * Determine location scope from location string
 */
function determineLocationScope(locationName) {
  const locationLower = locationName.toLowerCase();
  
  // Brazil specific
  if (locationLower.includes('brazil') || locationLower.includes('brasil')) {
    return 'remote-brazil';
  }
  
  // LATAM
  if (
    locationLower.includes('latin america') ||
    locationLower.includes('latam') ||
    locationLower.includes('south america')
  ) {
    return 'remote-latam';
  }
  
  // Remote worldwide
  if (
    locationLower.includes('remote') ||
    locationLower.includes('anywhere') ||
    locationLower.includes('global')
  ) {
    return 'remote-worldwide';
  }
  
  // Hybrid
  if (locationLower.includes('hybrid')) {
    return 'hybrid';
  }
  
  // Default to worldwide if unclear
  return 'remote-worldwide';
}

/**
 * Check if location is relevant for our audience
 */
function isRelevantLocation(locationName) {
  const locationLower = locationName.toLowerCase();
  
  // Always include Brazil and LATAM
  if (locationLower.includes('brazil') || locationLower.includes('brasil')) return true;
  if (locationLower.includes('latin america') || locationLower.includes('latam')) return true;
  if (locationLower.includes('south america')) return true;
  
  // Include worldwide remote
  if (locationLower.includes('remote') && !locationLower.includes('us only')) return true;
  if (locationLower.includes('anywhere')) return true;
  if (locationLower.includes('global')) return true;
  
  // Exclude specific regions that don't match
  const excludedRegions = ['us only', 'usa only', 'united states only', 'north america only'];
  for (const region of excludedRegions) {
    if (locationLower.includes(region)) return false;
  }
  
  return false;
}

// ============================================================================
// TAG EXTRACTION
// ============================================================================

/**
 * Extract intelligent tags from title and description
 */
function extractTags(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const tags = new Set();
  
  const tagKeywords = {
    'Unity': /\bunity\b/,
    'Unreal': /\bunreal\b/,
    'Blender': /\bblender\b/,
    'Maya': /\bmaya\b/,
    '3ds Max': /\b3ds max\b/,
    'Houdini': /\bhoudini\b/,
    'ZBrush': /\bzbrush\b/,
    'Substance': /\bsubstance\b/,
    'Photoshop': /\bphotoshop\b/,
    'After Effects': /\bafter effects\b/,
    'Figma': /\bfigma\b/,
    'Animation': /\banimation\b/,
    'Rigging': /\brigging\b/,
    'Modeling': /\bmodeling\b/,
    'Texturing': /\btexturing\b/,
    'VFX': /\bvfx\b|\bvisual effects\b/,
    'UI': /\bui\b|\buser interface\b/,
    'UX': /\bux\b|\buser experience\b/,
    'Game Dev': /\bgame dev\b|\bgames\b/,
    'Mobile': /\bmobile\b/,
    'Web': /\bweb\b/,
    'AR/VR': /\bar\b|\bvr\b|\bvirtual reality\b/,
  };
  
  for (const [tag, regex] of Object.entries(tagKeywords)) {
    if (regex.test(text)) {
      tags.add(tag);
    }
  }
  
  return Array.from(tags).slice(0, 5);
}

// ============================================================================
// HTML UTILITIES
// ============================================================================

/**
 * Convert HTML to plain text
 */
function htmlToPlainText(html) {
  if (!html) return '';
  
  let text = html;
  
  // Decode common HTML entities manually
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&nbsp;': ' ',
    '&#8217;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
  };
  
  for (const [entity, char] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, 'g'), char);
  }
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Fetch jobs from Ashby REST API
 */
async function fetchJobs() {
  try {
    const response = await fetch(REST_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`REST request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }
}

// ============================================================================
// JOB NORMALIZATION
// ============================================================================

/**
 * Normalize job from Ashby REST format to our standard format
 */
function normalizeJob(job) {
  const jobId = `DEL-${job.id}`;
  
  // Determine category
  const category = determineCategory(job.title);
  if (!category) {
    return null; // Filtered out
  }
  
  // Determine location scope
  const locationScope = determineLocationScope(job.location || 'Remote');
  
  // Extract salary if available
  let salary = null;
  if (job.compensationTierSummary) {
    // e.g., "$80,000 - $120,000 USD"
    const salaryMatch = job.compensationTierSummary.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)\s*([A-Z]{3})?/);
    if (salaryMatch) {
      salary = {
        min: parseFloat(salaryMatch[1].replace(/,/g, '')),
        max: parseFloat(salaryMatch[2].replace(/,/g, '')),
        currency: salaryMatch[3] || 'USD',
      };
    }
  }
  
  // Clean description
  const description = job.descriptionPlain || htmlToPlainText(job.descriptionHtml) || 'No description available';
  
  // Extract tags
  const tags = extractTags(job.title, description);
  
  // Map employment type
  const contractTypeMap = {
    'FullTime': 'Full-time',
    'PartTime': 'Part-time',
    'Contract': 'Contract',
    'Intern': 'Internship',
  };
  const contractType = contractTypeMap[job.employmentType] || 'Full-time';
  
  return {
    id: jobId,
    companyName: 'Deel',
    companyLogo: null,
    jobTitle: job.title,
    description: description,
    shortDescription: description.substring(0, 200) + '...',
    applyLink: job.jobUrl || `https://jobs.ashbyhq.com/${COMPANY_SLUG}/${job.id}`,
    postedDate: job.publishedDate || new Date().toISOString(),
    category: category,
    tags: tags,
    location: {
      scope: locationScope,
      text: job.location || 'Remote',
    },
    contractType: contractType,
    salary: salary,
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Fetching jobs from Ashby API (REST)...');
  console.log(`📋 Company: ${COMPANY_SLUG}`);
  console.log('═'.repeat(60));
  
  try {
    // Fetch all jobs
    console.log(`🔍 Fetching from: ${REST_ENDPOINT}`);
    const jobs = await fetchJobs();
    
    console.log(`📦 Found ${jobs.length} total jobs`);
    
    if (jobs.length === 0) {
      console.warn('⚠️  No jobs found. Check if the company slug is correct.');
      writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2));
      return;
    }
    
    // Filter and normalize
    console.log('\n🔄 Processing jobs...\n');
    const normalizedJobs = [];
    
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      try {
        console.log(`[${i + 1}/${jobs.length}] Processing: ${job.title}`);
        
        // Check if listed
        if (!job.isListed) {
          console.log(`  ⏭️  Skipped (not listed)`);
          continue;
        }
        
        // Check location
        if (!isRelevantLocation(job.location || '')) {
          console.log(`  ⏭️  Filtered out (location: ${job.location})`);
          continue;
        }
        
        // Normalize
        const normalized = normalizeJob(job);
        
        if (!normalized) {
          console.log(`  ⏭️  Filtered out (not relevant for creative/tech focus)`);
          continue;
        }
        
        normalizedJobs.push(normalized);
        console.log(`  ✅ Created: ${normalized.id} - ${normalized.category}`);
        
      } catch (error) {
        console.error(`  ❌ Error processing job: ${error.message}`);
      }
    }
    
    // Save to file
    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Successfully processed ${normalizedJobs.length} jobs`);
    console.log('═'.repeat(60));
    
    writeFileSync(OUTPUT_FILE, JSON.stringify(normalizedJobs, null, 2));
    console.log(`\n📄 Output saved to: ${OUTPUT_FILE}`);
    
    // Summary
    if (normalizedJobs.length > 0) {
      const categoryCounts = normalizedJobs.reduce((acc, job) => {
        acc[job.category] = (acc[job.category] || 0) + 1;
        return acc;
      }, {});
      
      const scopeCounts = normalizedJobs.reduce((acc, job) => {
        acc[job.location.scope] = (acc[job.location.scope] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Summary:');
      console.log('Categories:', categoryCounts);
      console.log('Location Scopes:', scopeCounts);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
