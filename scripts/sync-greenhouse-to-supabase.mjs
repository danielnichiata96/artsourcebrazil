#!/usr/bin/env node
/**
 * Sync Greenhouse jobs to Supabase
 * 
 * This script:
 * 1. Reads jobs from greenhouse-jobs-output.json
 * 2. Upserts jobs to Supabase (inserts or updates)
 * 3. Creates/updates companies, categories, and tags as needed
 * 4. Links jobs to companies, categories, and tags via foreign keys
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { enhanceDescription, isEnhancementAvailable } from './enhance-description.mjs';

config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const greenhouseJobsPath = resolve(__dirname, 'greenhouse-jobs-output.json');

/**
 * Clean HTML entities from text
 */
function cleanHtmlEntities(text = '') {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Get or create company in Supabase
 */
async function getOrCreateCompany(companyName, logoUrl = null) {
  if (!companyName) return null;

  // Try to find existing
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('name', companyName)
    .single();

  if (existing) {
    // Update logo if provided
    if (logoUrl) {
      await supabase
        .from('companies')
        .update({ logo_url: logoUrl })
        .eq('id', existing.id);
    }
    return existing.id;
  }

  // Create new
  const { data: created, error } = await supabase
    .from('companies')
    .insert({
      name: companyName,
      logo_url: logoUrl,
    })
    .select('id')
    .single();

  if (error) {
    console.error(`  ❌ Error creating company "${companyName}": ${error.message}`);
    return null;
  }

  return created.id;
}

/**
 * Get or create category in Supabase
 */
async function getOrCreateCategory(categoryName) {
  if (!categoryName) return null;

  // Try to find existing
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (existing) {
    return existing.id;
  }

  // Category should already exist from initial seed, but create if missing
  console.warn(`  ⚠️  Category "${categoryName}" not found, creating...`);
  const { data: created, error } = await supabase
    .from('categories')
    .insert({ name: categoryName })
    .select('id')
    .single();

  if (error) {
    console.error(`  ❌ Error creating category "${categoryName}": ${error.message}`);
    return null;
  }

  return created.id;
}

/**
 * Get or create tag in Supabase
 */
async function getOrCreateTag(tagName) {
  if (!tagName) return null;

  // Try to find existing
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('name', tagName)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new
  const { data: created, error } = await supabase
    .from('tags')
    .insert({ name: tagName })
    .select('id')
    .single();

  if (error) {
    console.error(`  ❌ Error creating tag "${tagName}": ${error.message}`);
    return null;
  }

  return created.id;
}

/**
 * Read Greenhouse jobs from JSON file
 */
function readGreenhouseJobs() {
  try {
    console.log(`📖 Reading jobs from: ${greenhouseJobsPath}`);
    const fileContent = readFileSync(greenhouseJobsPath, 'utf-8');
    const jobs = JSON.parse(fileContent);
    console.log(`📦 Found ${jobs.length} jobs in file`);
    return jobs;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ File not found: ${greenhouseJobsPath}`);
      console.error('💡 Run scripts/fetch-greenhouse-jobs.mjs first to generate the JSON file');
    } else {
      console.error(`❌ Error reading file: ${error.message}`);
    }
    process.exit(1);
  }
}

/**
 * Sync a single job to Supabase
 */
async function syncJob(job) {
  try {
    // Get or create company
    const companyId = await getOrCreateCompany(job.companyName, job.companyLogo);

    // Get or create category
    const categoryId = await getOrCreateCategory(job.category);

    // Format date (YYYY-MM-DD)
    let datePosted = job.postedDate;
    if (typeof datePosted === 'string' && datePosted.includes('T')) {
      datePosted = datePosted.split('T')[0];
    }

    // Enhance description using AI (with fallback chain)
    let description = job.description;
    if (isEnhancementAvailable()) {
      console.log(`  ✨ Enhancing description for ${job.id}...`);
      description = await enhanceDescription(
        job.description,
        job.jobTitle,
        job.companyName
      );
    }

    // Generate short description from enhanced text
    const shortDescription = description.length > 300
      ? description.substring(0, 297) + '...'
      : description;

    // Prepare job data for Supabase
    const jobData = {
      id: job.id,
      company_id: companyId,
      category_id: categoryId,
      job_title: job.jobTitle,
      description: cleanHtmlEntities(description),
      short_description: shortDescription ? cleanHtmlEntities(shortDescription) : null,
      apply_link: job.applyLink,
      date_posted: datePosted,
      location_scope: job.location?.scope || 'remote-brazil',
      contract_type: job.contractType || null,
      status: 'ativa',
      source: 'greenhouse',
      company_logo_url: job.companyLogo || null,
      location_detail: job.location?.note || null,
      location_country_code: job.location?.countryCode || null,
      salary_min: job.salary?.min || null,
      salary_max: job.salary?.max || null,
      salary_currency: job.salary?.currency || null,
    };

    // Upsert job (insert or update)
    const { data: jobRecord, error: jobError } = await supabase
      .from('jobs')
      .upsert(jobData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (jobError) {
      console.error(`  ❌ Error syncing job ${job.id}: ${jobError.message}`);
      return false;
    }

    // Sync job tags
    if (job.tags && job.tags.length > 0) {
      // Get or create all tags
      const tagIds = [];
      for (const tagName of job.tags) {
        const tagId = await getOrCreateTag(tagName);
        if (tagId) {
          tagIds.push(tagId);
        }
      }

      if (tagIds.length > 0) {
        // Delete existing job_tags for this job
        await supabase
          .from('job_tags')
          .delete()
          .eq('job_id', job.id);

        // Insert new job_tags
        const jobTags = tagIds.map(tagId => ({
          job_id: job.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('job_tags')
          .insert(jobTags);

        if (tagsError) {
          console.warn(`  ⚠️  Error syncing tags for job ${job.id}: ${tagsError.message}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error(`  ❌ Error syncing job ${job.id}: ${error.message}`);
    return false;
  }
}

/**
 * Main sync function
 */
async function sync() {
  console.log('🚀 Syncing Greenhouse Jobs → Supabase');
  console.log('═'.repeat(60));

  const jobs = readGreenhouseJobs();

  if (jobs.length === 0) {
    console.log('⚠️  No jobs to sync');
    return;
  }

  console.log(`\n📦 Syncing ${jobs.length} jobs to Supabase...\n`);

  let successful = 0;
  let failed = 0;

  for (const job of jobs) {
    const success = await syncJob(job);
    if (success) {
      successful++;
      console.log(`  ✅ ${job.id} - ${job.jobTitle}`);
    } else {
      failed++;
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Sync completed: ${successful} successful, ${failed} failed`);
  console.log('═'.repeat(60));

  // Verify sync
  const { data: syncedJobs, error } = await supabase
    .from('jobs')
    .select('id, job_title, status')
    .eq('status', 'ativa')
    .eq('source', 'greenhouse');

  if (!error && syncedJobs) {
    console.log(`\n🔍 Verified: ${syncedJobs.length} active Greenhouse jobs in Supabase`);
  }
}

sync().catch(console.error);

