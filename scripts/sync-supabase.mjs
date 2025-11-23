#!/usr/bin/env node
/**
 * Sync jobs from Supabase to jobs.json
 * 
 * This script:
 * 1. Reads active jobs from Supabase
 * 2. Joins with companies, categories, and tags
 * 3. Transforms to the Job format expected by the frontend
 * 4. Writes to src/data/jobs.json
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { z } from 'zod';

config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  console.error('');
  console.error('To fix this:');
  console.error('1. In Vercel: Go to Project Settings → Environment Variables');
  console.error('2. Add these variables:');
  console.error('   - SUPABASE_URL: Your Supabase project URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (keep secret!)');
  console.error('');
  console.error('See docs/SUPABASE_SETUP.md for detailed instructions.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// URL validation schema
const UrlSchema = z
  .string()
  .url('Invalid URL format')
  .refine((v) => /^(https?:)\/\//.test(v), 'URL must use http or https protocol');

/**
 * Validate URL
 */
function validateUrl(url, fieldName, fallback = null) {
  if (!url) {
    return { isValid: false, url: fallback, error: `${fieldName} is required` };
  }

  const result = UrlSchema.safeParse(url);
  if (!result.success) {
    return { isValid: false, url: fallback || url, error: result.error.errors[0].message };
  }

  return { isValid: true, url: result.data };
}

/**
 * Parse posted date to ISO 8601 format
 */
function parsePostedDate(date) {
  if (!date) return new Date().toISOString();

  // If already ISO format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(date)) {
    return date;
  }

  // If YYYY-MM-DD format, convert to ISO
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(date + 'T00:00:00Z').toISOString();
  }

  try {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch {
    // fall through
  }

  return new Date().toISOString();
}

/**
 * Get company logo, with fallback to placeholder
 */
function getCompanyLogo(companyLogoUrl, companyName) {
  if (companyLogoUrl) {
    const logoValidation = validateUrl(companyLogoUrl, 'Company Logo', '/images/company-placeholder.svg');
    if (logoValidation.isValid) {
      return logoValidation.url;
    }
  }

  // Try to find logo in public/images/companies/
  // Try multiple extensions (svg, png, jpg, jpeg)
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^the|^a|^an/, '');

  // Default to .svg first (most common), fallback to placeholder if not found
  return `/images/companies/${slug}.svg`;
}

/**
 * Sync jobs from Supabase
 */
async function syncJobs() {
  console.log('🔄 Syncing jobs from Supabase...');
  console.log(`📋 Project: ${SUPABASE_URL}`);

  try {
    // Fetch active jobs with related data
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        *,
        companies:company_id (
          id,
          name,
          logo_url,
          website
        ),
        categories:category_id (
          id,
          name
        ),
        job_tags (
          tags:tag_id (
            id,
            name
          )
        )
      `)
      .eq('status', 'ativa')
      .order('date_posted', { ascending: false });

    if (jobsError) {
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }

    console.log(`📦 Found ${jobs?.length || 0} active jobs in Supabase`);

    if (!jobs || jobs.length === 0) {
      console.log('⚠️  No active jobs found');
      return;
    }

    const transformedJobs = [];

    for (const job of jobs) {
      try {
        const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
        const category = Array.isArray(job.categories) ? job.categories[0] : job.categories;
        const jobTags = Array.isArray(job.job_tags) ? job.job_tags : [];

        if (!company || !category) {
          console.warn(`⚠️  Skipping ${job.id}: missing company or category`);
          continue;
        }

        const companyName = company.name;
        const companyLogoUrl = company.logo_url || null;
        const companyWebsite = company.website || null;

        // Validate Apply Link URL (critical - must be valid)
        const applyLinkValidation = validateUrl(job.apply_link, 'Apply Link');
        if (!applyLinkValidation.isValid) {
          console.warn(`⚠️  Skipping ${job.id}: invalid Apply Link URL: ${job.apply_link} (${applyLinkValidation.error})`);
          continue;
        }

        // Get company logo (with fallback)
        const validatedLogo = getCompanyLogo(companyLogoUrl, companyName);

        // Get tags
        const tags = jobTags
          .map((jt) => {
            const tag = Array.isArray(jt.tags) ? jt.tags[0] : jt.tags;
            return tag?.name;
          })
          .filter(Boolean);

        if (tags.length === 0) {
          console.warn(`⚠️  Skipping ${job.id}: no tags found`);
          continue;
        }

        // Limit description length for shortDescription (max 300 chars)
        const shortDesc = job.description && job.description.length > 300
          ? job.description.slice(0, 297) + '...'
          : job.short_description || undefined;

        // Build location object (remove null values - only include if they exist)
        const location = {
          scope: job.location_scope || 'remote-brazil',
        };
        if (job.location_detail) location.note = job.location_detail;
        if (job.location_country_code) location.countryCode = job.location_country_code;

        // Build salary object if available (remove null values)
        let salary = undefined;
        if (job.salary_min || job.salary_max || job.salary_currency) {
          salary = {};
          if (job.salary_min) salary.min = job.salary_min;
          if (job.salary_max) salary.max = job.salary_max;
          salary.currency = job.salary_currency || 'BRL';
        }

        const transformedJob = {
          id: job.id,
          companyName,
          companyLogo: validatedLogo,
          jobTitle: job.job_title,
          description: job.description || 'Descrição não disponível.',
          applyLink: applyLinkValidation.url,
          postedDate: parsePostedDate(job.date_posted),
          category: category.name,
          tags,
          location,
        };

        // Add optional fields only if they have values (not null/undefined)
        if (companyWebsite) transformedJob.companyWebsite = companyWebsite;
        if (shortDesc) transformedJob.shortDescription = shortDesc;
        if (job.contract_type) transformedJob.contractType = job.contract_type;
        if (salary) transformedJob.salary = salary;

        transformedJobs.push(transformedJob);
        console.log(`✅ ${transformedJob.id}: ${transformedJob.jobTitle} (${transformedJob.category})`);
      } catch (err) {
        console.error(`❌ Error processing job ${job.id}: ${err.message}`);
      }
    }

    // Write to jobs.json
    const outputPath = resolve(process.cwd(), 'src/data/jobs.json');
    writeFileSync(outputPath, JSON.stringify(transformedJobs, null, 2), 'utf-8');

    console.log(`\n✅ Successfully synced ${transformedJobs.length} jobs to ${outputPath}`);
    console.log('💡 Run "npm run validate:jobs" to check schema compliance');

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncJobs();

