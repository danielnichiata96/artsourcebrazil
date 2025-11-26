#!/usr/bin/env node
/**
 * Garbage collection utilities for job sync
 * 
 * Provides reusable functions for tracking and cleaning up stale jobs
 */

/**
 * Perform garbage collection with grace period
 * Marks jobs as closed if they haven't been synced in X days
 * 
 * @param {object} supabase - Supabase client instance
 * @param {string} companyId - Company identifier
 * @param {number} gracePeriodDays - Number of days before considering a job stale (default: 7)
 * @returns {Promise<object>} - Result with count of closed jobs
 */
export async function garbageCollectJobsWithGracePeriod(supabase, companyId, gracePeriodDays = 7) {
    console.log(`\n🗑️  Running Garbage Collection for ${companyId}...`);
    console.log(`   Grace period: ${gracePeriodDays} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays);

    try {
        // First, get jobs that will be closed (for logging)
        const { data: toClose, error: selectError } = await supabase
            .from('jobs')
            .select('id, job_title, last_synced_at')
            .eq('company_id', companyId)
            .eq('status', 'ativa')
            .lt('last_synced_at', cutoffDate.toISOString());

        if (selectError) {
            console.error('❌ Error querying stale jobs:', selectError.message);
            return { success: false, error: selectError, closedCount: 0 };
        }

        if (!toClose || toClose.length === 0) {
            console.log('   ✅ No stale jobs found');
            return { success: true, closedCount: 0 };
        }

        console.log(`   Found ${toClose.length} stale jobs:`);
        toClose.forEach(job => {
            const daysSince = Math.floor((Date.now() - new Date(job.last_synced_at)) / (1000 * 60 * 60 * 24));
            console.log(`     - ${job.id}: ${job.job_title} (${daysSince} days old)`);
        });

        // Now close them
        const { data: closed, error: updateError } = await supabase
            .from('jobs')
            .update({
                status: 'closed',
                closed_at: new Date().toISOString(),
            })
            .eq('company_id', companyId)
            .eq('status', 'ativa')
            .lt('last_synced_at', cutoffDate.toISOString())
            .select();

        if (updateError) {
            console.error('❌ Error closing jobs:', updateError.message);
            return { success: false, error: updateError, closedCount: 0 };
        }

        console.log(`   🗑️  Successfully closed ${closed?.length || 0} jobs`);
        return { success: true, closedCount: closed?.length || 0 };

    } catch (error) {
        console.error('❌ Garbage Collection failed:', error.message);
        return { success: false, error, closedCount: 0 };
    }
}

/**
 * Perform immediate garbage collection by sync ID
 * Marks jobs as closed if they don't have the current sync_id
 * 
 * WARNING: Only use this if you're confident the API returned all jobs
 * 
 * @param {object} supabase - Supabase client instance
 * @param {string} currentSyncId - UUID of current sync session
 * @param {string} companyId - Company identifier
 * @returns {Promise<object>} - Result with count of closed jobs
 */
export async function garbageCollectJobsBySync(supabase, currentSyncId, companyId) {
    console.log(`\n🗑️  Running Immediate GC for ${companyId}...`);
    console.log(`   Current Sync ID: ${currentSyncId.substring(0, 8)}...`);

    try {
        // Get jobs that will be closed
        const { data: toClose, error: selectError } = await supabase
            .from('jobs')
            .select('id, job_title, sync_id, last_synced_at')
            .eq('company_id', companyId)
            .eq('status', 'ativa')
            .neq('sync_id', currentSyncId);

        if (selectError) {
            console.error('❌ Error querying stale jobs:', selectError.message);
            return { success: false, error: selectError, closedCount: 0 };
        }

        if (!toClose || toClose.length === 0) {
            console.log('   ✅ No stale jobs found');
            return { success: true, closedCount: 0 };
        }

        console.log(`   Found ${toClose.length} stale jobs:`);
        toClose.forEach(job => {
            console.log(`     - ${job.id}: ${job.job_title}`);
            console.log(`       Last synced: ${job.last_synced_at}`);
        });

        // Close them
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
            return { success: false, error: updateError, closedCount: 0 };
        }

        console.log(`   🗑️  Successfully closed ${closed?.length || 0} jobs`);
        return { success: true, closedCount: closed?.length || 0 };

    } catch (error) {
        console.error('❌ Garbage Collection failed:', error.message);
        return { success: false, error, closedCount: 0 };
    }
}

/**
 * Safety check: Ensure API returned enough jobs before running GC
 * Prevents accidental mass deletion if API has issues
 * 
 * @param {number} jobCount - Number of jobs returned from API
 * @param {number} minExpected - Minimum expected jobs (default: 5)
 * @returns {boolean} - True if safe to proceed
 */
export function safetyCheckJobCount(jobCount, minExpected = 5) {
    if (jobCount < minExpected) {
        console.warn('⚠️  WARNING: Too few jobs returned from API!');
        console.warn(`   Expected at least ${minExpected}, got ${jobCount}`);
        console.warn('   Skipping Garbage Collection to prevent mass deletion');
        console.warn('   This might be a temporary API issue');
        return false;
    }
    return true;
}
