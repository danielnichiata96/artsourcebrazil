#!/usr/bin/env node
import Airtable from 'airtable';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load environment variables
config();

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME = 'Jobs' } = process.env;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env');
  process.exit(1);
}

// Category mapping
const categoryMap = {
  'VFX': 'VFX',
  'Arte 3D': '3D & Animation',
  '3D': '3D & Animation',
  'UX/UI': 'Design',
  'Design': 'Design',
  'Game Dev': 'Game Dev',
  'Programação': 'Game Dev',
};

// Location scope mapping (matches Airtable values exactly)
const locationScopeMap = {
  'Remoto - Global': 'remote-worldwide',
  'Remoto - Brazil': 'remote-brazil',
  'Remoto - LATAM': 'remote-latam',
  'Híbrido': 'hybrid',
  'Presencial': 'onsite',
  // Fallback variants
  'Remoto (Global)': 'remote-worldwide',
  'Remoto (Brasil)': 'remote-brazil',
  'Remoto (LATAM)': 'remote-latam',
};

/**
 * Get company logo with smart fallback strategy:
 * 1. Try local files in /public/images/companies/
 * 2. Try Clearbit Logo API (free, auto-fetches from company domain)
 * 3. Use placeholder as final fallback
 */
function getCompanyLogo(record, companyName) {
  // Map company names to local logo filenames
  const localLogos = {
    'Automattic': 'automattic.png',
    'Beffio': 'beffio.png',
    'Circle.so': 'circleso.png',
    'Fortis Games': 'fortisgames.png',
    'Wildlife Studios': 'wildlifestudios.svg',
  };
  
  // Check if we have a local logo
  if (localLogos[companyName]) {
    return `/images/companies/${localLogos[companyName]}`;
  }
  
  // Try to extract domain for Clearbit fallback
  // Common patterns: "Company Name" → "companyname.com"
  const domain = companyName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
  
  // Use Clearbit Logo API as fallback (free, 100k requests/month)
  // Returns transparent PNG, auto-sized
  if (domain) {
    return `https://logo.clearbit.com/${domain}.com`;
  }
  
  // Final fallback
  return '/images/company-placeholder.svg';
}

function getCompanyName(record) {
  // Use the lookup field "Company Name" that returns actual names
  const names = record.get('Company Name');
  if (!names || names.length === 0) return 'Unknown Company';
  return names[0]; // Get first company name
}

function getCategoryName(record) {
  // Use the lookup field "Category Name" that returns actual names
  const names = record.get('Category Name');
  if (!names || names.length === 0) return null;
  return names[0]; // Get first category name
}

function getTagNames(record) {
  // Use the lookup field "Tag Names" that returns actual names
  const names = record.get('Tag Names');
  if (!names || names.length === 0) return [];
  return names; // Return all tag names
}

function parsePostedDate(airtableDate) {
  if (!airtableDate) throw new Error('Posted date is required');
  
  // If already ISO 8601, return as-is
  if (/^\d{4}-\d{2}-\d{2}T/.test(airtableDate)) {
    return airtableDate;
  }
  
  // Parse and convert to ISO
  const date = new Date(airtableDate);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${airtableDate}`);
  }
  
  return date.toISOString();
}

function buildSalary(record) {
  const min = record.get('Salario_Min');
  const max = record.get('Salario_Max');
  const currency = record.get('Moeda');
  
  if (!currency) return undefined;
  if (!min && !max) return undefined;
  
  return {
    min: min || undefined,
    max: max || undefined,
    currency: currency.toUpperCase(),
  };
}

async function syncJobs() {
  console.log('🔄 Syncing jobs from Airtable...');
  console.log(`📋 Table: ${AIRTABLE_TABLE_NAME}`);
  console.log(`🔑 Base ID: ${AIRTABLE_BASE_ID}`);
  
  const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
  const jobs = [];
  
  try {
    const records = await base(AIRTABLE_TABLE_NAME)
      .select({
        maxRecords: 100,
        filterByFormula: `{Status} = 'Ativa'`, // Only active jobs
      })
      .all();
    
    console.log(`📦 Found ${records.length} records with Status = 'Ativa'`);
    
    for (const record of records) {
      try {
        const rawCategory = getCategoryName(record);
        const rawLocationScope = record.get('Location Scope');
        const tagNames = getTagNames(record);
        const id = record.get('ID');
        const description = record.get('Description (PT)') || 'Descrição não disponível.';
        
        if (!rawCategory || !rawLocationScope || !tagNames || tagNames.length === 0) {
          console.warn(`⚠️  Skipping ${id}: missing required fields (category, location, or tags)`);
          continue;
        }
        
        // Limit description length for shortDescription (max 300 chars)
        const shortDesc = description.length > 300 
          ? description.slice(0, 297) + '...' 
          : description;
        
        const companyName = getCompanyName(record);
        
        const job = {
          id: id,
          companyName: companyName,
          companyLogo: getCompanyLogo(record, companyName),
          jobTitle: record.get('Job Title'),
          description: description,
          shortDescription: shortDesc,
          applyLink: record.get('Apply Link'),
          postedDate: parsePostedDate(record.get('Date Posted')),
          category: categoryMap[rawCategory] || rawCategory,
          tags: tagNames,
          location: {
            scope: locationScopeMap[rawLocationScope] || 'remote-brazil',
            note: undefined, // Not in current schema
            countryCode: undefined, // Not in current schema
          },
          contractType: undefined, // Not in current schema
          salary: undefined, // Not in current schema
        };
        
        jobs.push(job);
        console.log(`✅ ${job.id}: ${job.jobTitle} (${job.category})`);
      } catch (err) {
        console.error(`❌ Error processing record: ${err.message}`);
      }
    }
    
    // Write to jobs.json
    const outputPath = resolve(process.cwd(), 'src/data/jobs.json');
    writeFileSync(outputPath, JSON.stringify(jobs, null, 2), 'utf-8');
    
    console.log(`\n✅ Successfully synced ${jobs.length} jobs to ${outputPath}`);
    console.log('💡 Run "npm run validate:jobs" to check schema compliance');
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncJobs();

