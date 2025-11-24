import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

/**
 * API route to report a job
 * 
 * POST /api/report-job
 * Body: { job_id: string, reason?: string }
 * 
 * Actions:
 * 1. Mark job as reported in Supabase
 * 2. Send email notification to admin
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.text();
    if (!body) {
      return new Response(
        JSON.stringify({ error: 'Request body is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { job_id, reason } = JSON.parse(body);

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'job_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Get job details
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*, companies(name)')
      .eq('id', job_id)
      .single();

    if (fetchError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Mark job as reported in Supabase
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        reported: true,
        reported_at: new Date().toISOString(),
        reported_reason: reason || null,
      })
      .eq('id', job_id);

    if (updateError) {
      console.error('Error updating job:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to mark job as reported' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Send email notification to admin
    try {
      // Import email function dynamically to avoid issues in build
      const { sendJobReportEmail } = await import('../../lib/email');
      
      await sendJobReportEmail({
        jobId: job_id,
        jobTitle: job.job_title,
        companyName: job.companies?.name || 'Unknown Company',
        applyLink: job.apply_link,
        reason: reason || 'No reason provided',
      });
    } catch (emailError) {
      console.error('Error sending report email:', emailError);
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Job reported successfully. Thank you for helping us maintain quality!' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in report-job API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

