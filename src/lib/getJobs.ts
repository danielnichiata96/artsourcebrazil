/**
 * Get jobs from Supabase (Build Time)
 * 
 * This function fetches jobs from Supabase during build time.
 * Used by Astro pages and components to get fresh data at build.
 * 
 * @returns Array of Job objects
 */

import { supabase } from './supabase';
import type { Job } from './jobs';

/**
 * Transform Supabase job to frontend Job format
 */
function transformSupabaseJob(supabaseJob: any): Job {
  const company = Array.isArray(supabaseJob.companies) 
    ? supabaseJob.companies[0] 
    : supabaseJob.companies;
  const category = Array.isArray(supabaseJob.categories) 
    ? supabaseJob.categories[0] 
    : supabaseJob.categories;
  const jobTags = Array.isArray(supabaseJob.job_tags) 
    ? supabaseJob.job_tags 
    : [];

  // Get tags
  const tags = jobTags
    .map((jt: any) => {
      const tag = Array.isArray(jt.tags) ? jt.tags[0] : jt.tags;
      return tag?.name;
    })
    .filter(Boolean);

  // Get company logo (with fallback)
  let companyLogo = company?.logo_url || '/images/company-placeholder.svg';
  if (companyLogo && !companyLogo.startsWith('/') && !companyLogo.startsWith('http')) {
    companyLogo = '/images/company-placeholder.svg';
  }

  // Parse date to ISO format
  let postedDate = supabaseJob.date_posted;
  if (typeof postedDate === 'string' && !postedDate.includes('T')) {
    postedDate = new Date(postedDate + 'T00:00:00Z').toISOString();
  } else if (postedDate) {
    postedDate = new Date(postedDate).toISOString();
  } else {
    postedDate = new Date().toISOString();
  }

  // Limit description length for shortDescription (max 300 chars)
  const shortDesc = supabaseJob.description && supabaseJob.description.length > 300
    ? supabaseJob.description.slice(0, 297) + '...'
    : supabaseJob.short_description || null;

  // Build location object
  const location = {
    scope: supabaseJob.location_scope || 'remote-brazil',
    note: supabaseJob.location_detail || null,
    countryCode: supabaseJob.location_country_code || null,
  };

  // Build salary object if available
  const salary = supabaseJob.salary_min || supabaseJob.salary_max || supabaseJob.salary_currency
    ? {
        min: supabaseJob.salary_min || null,
        max: supabaseJob.salary_max || null,
        currency: supabaseJob.salary_currency || 'BRL',
      }
    : null;

  return {
    id: supabaseJob.id,
    companyName: company?.name || 'Unknown',
    companyLogo,
    companyWebsite: company?.website || null,
    jobTitle: supabaseJob.job_title,
    description: supabaseJob.description || 'Descrição não disponível.',
    shortDescription: shortDesc,
    applyLink: supabaseJob.apply_link,
    postedDate,
    category: category?.name || 'Game Dev',
    tags: tags.length > 0 ? tags : ['General'],
    location,
    contractType: supabaseJob.contract_type || null,
    salary,
  };
}

/**
 * Get all active jobs from Supabase
 * This function is called at build time by Astro pages
 */
export async function getJobs(): Promise<Job[]> {
  try {
    // Fetch active jobs with related data
    const { data: jobs, error } = await supabase
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

    if (error) {
      console.error('❌ Error fetching jobs from Supabase:', error.message);
      throw error;
    }

    if (!jobs || jobs.length === 0) {
      console.warn('⚠️  No active jobs found in Supabase');
      return [];
    }

    // Transform Supabase jobs to frontend format
    const transformedJobs = jobs
      .map((job) => {
        try {
          return transformSupabaseJob(job);
        } catch (err) {
          console.error(`❌ Error transforming job ${job.id}:`, err);
          return null;
        }
      })
      .filter((job): job is Job => job !== null);

    return transformedJobs;
  } catch (error) {
    console.error('❌ Failed to fetch jobs from Supabase:', error);
    // In case of error during build, return empty array
    // This prevents build failures but pages won't show jobs
    return [];
  }
}

/**
 * Cached jobs (for pages that use getStaticPaths)
 * Since getStaticPaths is called once per build, we can cache the result
 */
let cachedJobs: Job[] | null = null;

/**
 * Get cached jobs (cached per build)
 * Use this for getStaticPaths and other places where jobs are accessed multiple times
 */
export async function getCachedJobs(): Promise<Job[]> {
  if (cachedJobs === null) {
    cachedJobs = await getJobs();
  }
  return cachedJobs;
}

