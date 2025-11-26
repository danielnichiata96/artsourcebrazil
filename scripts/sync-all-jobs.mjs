#!/usr/bin/env node
/**
 * Master script: Fetch + Sync all jobs to Supabase
 * 
 * This script orchestrates the entire job sync pipeline:
 * 1. Fetches jobs from all external APIs (Greenhouse, Ashby, Lever)
 * 2. Syncs each source to Supabase (applies categorization, validation, AI enhancement)
 * 3. Reports success/failure for each step
 * 
 * Usage:
 *   npm run sync:all
 *   node scripts/sync-all-jobs.mjs
 * 
 * Ideal for:
 *   - Cron jobs (run every 6-12 hours)
 *   - Manual full refresh
 *   - CI/CD pipelines
 */

import { execSync } from 'node:child_process';

const sources = [
  { name: 'Greenhouse', fetch: 'npm run fetch:greenhouse', sync: 'npm run sync:greenhouse' },
  { name: 'Ashby', fetch: 'npm run fetch:ashby', sync: 'npm run sync:ashby' },
  { name: 'Lever', fetch: 'npm run fetch:lever', sync: 'npm run sync:lever' },
];

console.log('🚀 Starting full job sync pipeline...\n');
console.log('═'.repeat(60));

const results = {
  success: [],
  failed: [],
};

for (const source of sources) {
  console.log(`\n📦 Processing ${source.name}...`);
  console.log('─'.repeat(60));
  
  try {
    // Step 1: Fetch
    console.log(`  1️⃣ Fetching jobs from ${source.name} API...`);
    execSync(source.fetch, { stdio: 'inherit' });
    console.log(`  ✅ Fetch completed`);
    
    // Step 2: Sync
    console.log(`  2️⃣ Syncing to Supabase...`);
    execSync(source.sync, { stdio: 'inherit' });
    console.log(`  ✅ Sync completed`);
    
    results.success.push(source.name);
  } catch (error) {
    console.error(`  ❌ Failed to process ${source.name}:`, error.message);
    results.failed.push(source.name);
  }
}

// Final report
console.log('\n' + '═'.repeat(60));
console.log('📊 FINAL REPORT');
console.log('═'.repeat(60));
console.log(`✅ Successful: ${results.success.join(', ') || 'None'}`);
console.log(`❌ Failed: ${results.failed.join(', ') || 'None'}`);
console.log('═'.repeat(60));

if (results.failed.length > 0) {
  console.error('\n⚠️  Some sources failed. Check logs above for details.');
  process.exit(1);
}

console.log('\n✨ All jobs synced successfully!');

// Trigger Vercel rebuild if webhook is configured
const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;
if (VERCEL_DEPLOY_HOOK) {
  console.log('\n🚀 Triggering Vercel rebuild...');
  try {
    const response = await fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' });
    if (response.ok) {
      console.log('✅ Vercel rebuild triggered successfully!');
    } else {
      console.warn(`⚠️  Vercel webhook returned status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to trigger Vercel rebuild:', error.message);
  }
} else {
  console.warn('\n⚠️  VERCEL_DEPLOY_HOOK not set - site will not auto-rebuild');
  console.warn('   Set this env var to trigger automatic deploys after sync');
}

