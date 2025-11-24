#!/usr/bin/env node
/**
 * EXEMPLO: Fetcher com Garbage Collection
 * 
 * Este é um exemplo de como implementar GC nos fetchers.
 * Baseado no fetch-greenhouse-jobs.mjs com adições de:
 * - Sync Session ID
 * - Garbage Collection de vagas fantasmas
 * 
 * NÃO EXECUTAR EM PRODUÇÃO - É APENAS UM EXEMPLO!
 */

import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const COMPANY_SLUG = 'wildlifestudios';
const COMPANY_ID = 'wildlife-studios'; // ID no Supabase
const API_URL = `https://boards-api.greenhouse.io/v1/boards/${COMPANY_SLUG}/jobs`;

// Supabase (exemplo - use suas credenciais reais)
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-key'
);

// ============================================================================
// GARBAGE COLLECTION
// ============================================================================

/**
 * Close jobs that weren't synced in this session
 * @param {string} currentSyncId - UUID of current sync session
 * @param {string} companyId - Company identifier
 */
async function garbageCollectJobs(currentSyncId, companyId) {
  console.log(`\n🗑️  Running Garbage Collection for ${companyId}...`);
  console.log(`   Current Sync ID: ${currentSyncId}`);
  
  try {
    // Debug: Show which jobs would be closed
    const { data: toClose, error: selectError } = await supabase
      .from('jobs')
      .select('id, job_title, sync_id, last_synced_at')
      .eq('company_id', companyId)
      .eq('status', 'ativa')
      .neq('sync_id', currentSyncId);

    if (selectError) {
      console.error('❌ Error querying stale jobs:', selectError.message);
      return;
    }

    if (!toClose || toClose.length === 0) {
      console.log('   ✅ No stale jobs found');
      return;
    }

    console.log(`   Found ${toClose.length} stale jobs:`);
    toClose.forEach(job => {
      console.log(`     - ${job.id}: ${job.job_title}`);
      console.log(`       Last synced: ${job.last_synced_at}`);
    });

    // Close the jobs
    const { data: closed, error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('company_id', companyId)
      .eq('status', 'ativa')
      .neq('sync_id', currentSyncId)
      .select();

    if (updateError) {
      console.error('❌ Error closing jobs:', updateError.message);
      return;
    }

    console.log(`   🗑️  Successfully closed ${closed?.length || 0} jobs`);
    
  } catch (error) {
    console.error('❌ Garbage Collection failed:', error.message);
  }
}

/**
 * Garbage Collection with Grace Period
 * Only closes jobs not synced for more than X days
 */
async function garbageCollectJobsWithGracePeriod(companyId, gracePeriodDays = 7) {
  console.log(`\n🗑️  Running GC with ${gracePeriodDays}-day grace period...`);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays);
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('company_id', companyId)
      .eq('status', 'ativa')
      .lt('last_synced_at', cutoffDate.toISOString())
      .select();

    if (error) {
      console.error('❌ GC Error:', error.message);
      return;
    }

    console.log(`   🗑️  Closed ${data?.length || 0} jobs not seen in ${gracePeriodDays} days`);
    
  } catch (error) {
    console.error('❌ Garbage Collection failed:', error.message);
  }
}

// ============================================================================
// MAIN FETCHER LOGIC
// ============================================================================

async function fetchJobsWithGC() {
  console.log('🚀 Fetching jobs with Garbage Collection...');
  console.log(`📋 Company: ${COMPANY_SLUG}`);
  console.log('═'.repeat(60));

  // 1. CREATE SYNC SESSION
  const syncId = randomUUID();
  const syncTimestamp = new Date().toISOString();
  
  console.log(`\n🔄 Sync Session Started`);
  console.log(`   Sync ID: ${syncId}`);
  console.log(`   Timestamp: ${syncTimestamp}\n`);

  try {
    // 2. FETCH JOBS FROM API
    console.log(`🔍 Fetching from API: ${API_URL}`);
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const jobs = data.jobs || [];
    
    console.log(`📦 Found ${jobs.length} jobs from API\n`);

    // 3. SAFETY CHECK: Prevent accidental mass deletion
    const MIN_EXPECTED_JOBS = 5;
    if (jobs.length < MIN_EXPECTED_JOBS) {
      console.warn('⚠️  WARNING: Too few jobs returned from API!');
      console.warn(`   Expected at least ${MIN_EXPECTED_JOBS}, got ${jobs.length}`);
      console.warn('   Skipping Garbage Collection to prevent mass deletion');
      console.warn('   This might be a temporary API issue');
      return;
    }

    // 4. PROCESS EACH JOB (upsert with sync_id)
    console.log('🔄 Processing jobs...\n');
    const processedIds = [];

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      try {
        console.log(`[${i + 1}/${jobs.length}] ${job.title}`);

        // Normalize job data (simplified for example)
        const normalizedJob = {
          id: `WIL-${job.id}`,
          company_id: COMPANY_ID,
          job_title: job.title,
          description: job.content || 'No description',
          apply_link: job.absolute_url,
          date_posted: job.updated_at || new Date().toISOString(),
          status: 'ativa',
          source: 'greenhouse',
          
          // CRITICAL: Add sync tracking
          sync_id: syncId,
          last_synced_at: syncTimestamp,
        };

        // Upsert to Supabase
        const { error } = await supabase
          .from('jobs')
          .upsert(normalizedJob, {
            onConflict: 'id',
          });

        if (error) {
          console.error(`  ❌ Error: ${error.message}`);
          continue;
        }

        processedIds.push(normalizedJob.id);
        console.log(`  ✅ Synced (sync_id: ${syncId.substring(0, 8)}...)`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ❌ Error processing job: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Successfully processed ${processedIds.length} jobs`);
    console.log('═'.repeat(60));

    // 5. GARBAGE COLLECTION
    console.log('\n🧹 Starting Garbage Collection Phase...');
    
    // Option A: Immediate GC (close jobs not in this sync)
    await garbageCollectJobs(syncId, COMPANY_ID);
    
    // Option B: Grace Period GC (uncomment to use instead)
    // await garbageCollectJobsWithGracePeriod(COMPANY_ID, 7);

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 Sync Session Completed Successfully!');
    console.log(`   Sync ID: ${syncId}`);
    console.log(`   Jobs Processed: ${processedIds.length}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get sync statistics for a company
 */
async function getSyncStats(companyId) {
  console.log(`\n📊 Sync Statistics for ${companyId}:\n`);

  // Total jobs
  const { count: totalJobs } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  // Active jobs
  const { count: activeJobs } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'ativa');

  // Closed jobs
  const { count: closedJobs } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'closed');

  // Recent syncs
  const { data: recentSyncs } = await supabase
    .from('jobs')
    .select('sync_id, last_synced_at')
    .eq('company_id', companyId)
    .order('last_synced_at', { ascending: false })
    .limit(5);

  console.log(`   Total Jobs: ${totalJobs}`);
  console.log(`   Active Jobs: ${activeJobs}`);
  console.log(`   Closed Jobs: ${closedJobs}`);
  console.log(`\n   Recent Syncs:`);
  
  const uniqueSyncs = [...new Set(recentSyncs?.map(s => s.sync_id))];
  uniqueSyncs.slice(0, 3).forEach((syncId, i) => {
    const sync = recentSyncs.find(s => s.sync_id === syncId);
    console.log(`     ${i + 1}. ${syncId} (${sync.last_synced_at})`);
  });
}

// ============================================================================
// CLI COMMANDS
// ============================================================================

const command = process.argv[2];

switch (command) {
  case 'sync':
    fetchJobsWithGC();
    break;
    
  case 'stats':
    getSyncStats(COMPANY_ID);
    break;
    
  case 'gc':
    console.log('Running manual Garbage Collection...');
    garbageCollectJobsWithGracePeriod(COMPANY_ID, 7);
    break;
    
  default:
    console.log(`
Usage:
  node fetch-with-gc-example.mjs sync     - Run full sync with GC
  node fetch-with-gc-example.mjs stats    - Show sync statistics
  node fetch-with-gc-example.mjs gc       - Run manual GC (7-day grace period)

Example:
  node fetch-with-gc-example.mjs sync
    `);
}

