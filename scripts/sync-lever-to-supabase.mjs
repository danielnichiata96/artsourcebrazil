#!/usr/bin/env node
/**
 * Sync Lever jobs to Supabase
 * 
 * This script:
 * 1. Reads jobs from lever-jobs-output.json
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
const leverJobsPath = resolve(__dirname, 'lever-jobs-output.json');

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

  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('name', companyName)
    .single();

  if (existing) {
    if (logoUrl) {
      await supabase
        .from('companies')
        .update({ logo_url: logoUrl })
        .eq('id', existing.id);
    }
    return existing.id;
  }

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

  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (existing) {
    return existing.id;
  }

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

  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('name', tagName)
    .single();

  if (existing) {
    return existing.id;
  }

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
 * Link job to tags
 */
async function linkJobTags(jobId, tagIds) {
  if (!tagIds || tagIds.length === 0) return;

  // Delete existing links
  await supabase
    .from('job_tags')
    .delete()
    .eq('job_id', jobId);

  // Create new links
  const links = tagIds.map(tagId => ({ job_id: jobId, tag_id: tagId }));
  const { error } = await supabase
    .from('job_tags')
    .insert(links);

  if (error) {
    console.error(`  ❌ Error linking tags: ${error.message}`);
  }
}

/**
 * Main sync function
 */
async function syncLeverJobs() {
  console.log('🚀 Syncing Lever Jobs → Supabase');
  console.log('═'.repeat(60));
  
  // Read jobs file
  console.log(`📖 Reading jobs from: ${leverJobsPath}`);
  let jobs;
  try {
    const fileContent = readFileSync(leverJobsPath, 'utf-8');
    jobs = JSON.parse(fileContent);
  } catch (error) {
    console.error('❌ Error reading Lever jobs file:', error.message);
    console.error('   Make sure to run: npm run fetch:lever first');
    process.exit(1);
  }

  console.log(`📦 Found ${jobs.length} jobs in file\n`);

  // Check if AI enhancement is available
  const hasAI = await isEnhancementAvailable();
  if (!hasAI) {
    console.warn('⚠️  No AI API keys found - descriptions will not be enhanced');
    console.warn('   Set GOOGLE_GEMINI_API_KEY or OPENAI_API_KEY in .env\n');
  }

  console.log(`📦 Syncing ${jobs.length} jobs to Supabase...\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const job of jobs) {
    try {
      // Get or create company
      const companyId = await getOrCreateCompany(job.companyName, job.companyLogo);
      if (!companyId) {
        console.error(`  ❌ ${job.id} - Failed to get/create company`);
        failureCount++;
        continue;
      }

      // Get or create category
      const categoryId = await getOrCreateCategory(job.category);
      if (!categoryId) {
        console.error(`  ❌ ${job.id} - Failed to get/create category`);
        failureCount++;
        continue;
      }

      // Enhance description with AI if available
      let finalDescription = job.description;
      if (hasAI && job.description) {
        const enhanced = await enhanceDescription(job.id, job.description, job.jobTitle);
        if (enhanced) {
          finalDescription = enhanced;
        }
      }

      // Clean HTML entities
      const cleanDescription = cleanHtmlEntities(finalDescription);
      const cleanTitle = cleanHtmlEntities(job.jobTitle);

      // Upsert job
      const { data: upsertedJob, error: jobError } = await supabase
        .from('jobs')
        .upsert({
          id: job.id,
          company_id: companyId,
          category_id: categoryId,
          job_title: cleanTitle,
          description: cleanDescription,
          short_description: job.shortDescription ? cleanHtmlEntities(job.shortDescription) : null,
          apply_link: job.applyLink,
          date_posted: job.postedDate,
          location_scope: job.location?.scope || 'remote-worldwide',
          location_detail: job.location?.note || null,
          contract_type: job.contractType || null,
          status: 'ativa',
          source: 'lever',
          salary_min: job.salary?.min || null,
          salary_max: job.salary?.max || null,
          salary_currency: job.salary?.currency || null,
        }, {
          onConflict: 'id',
        })
        .select('id')
        .single();

      if (jobError) {
        console.error(`  ❌ ${job.id} - ${cleanTitle}`);
        console.error(`     Error: ${jobError.message}`);
        failureCount++;
        continue;
      }

      // Get or create tags and link them
      if (job.tags && job.tags.length > 0) {
        const tagIds = await Promise.all(
          job.tags.map(tagName => getOrCreateTag(tagName))
        );
        const validTagIds = tagIds.filter(id => id !== null);
        await linkJobTags(upsertedJob.id, validTagIds);
      }

      console.log(`  ✅ ${job.id} - ${cleanTitle}`);
      successCount++;

    } catch (error) {
      console.error(`  ❌ ${job.id} - Unexpected error: ${error.message}`);
      failureCount++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Sync completed: ${successCount} successful, ${failureCount} failed`);
  console.log('═'.repeat(60));

  // Verify count in DB
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ativa')
    .like('id', 'FAN-%');

  console.log(`\n🔍 Verified: ${count} active Lever jobs in Supabase\n`);
}

// Run sync
syncLeverJobs().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

