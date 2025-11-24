/**
 * API Endpoint: Approve Draft and Publish Job
 * 
 * POST /api/admin/approve-draft
 * 
 * Approves a paid draft and creates a published job.
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { sendJobApprovedEmail } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        // Check authentication
        const authToken = cookies.get('admin_token')?.value;
        const validToken = import.meta.env.ADMIN_TOKEN || 'admin123';
        
        if (authToken !== validToken) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const body = await request.json();
        const { draft_id } = body;

        if (!draft_id) {
            return new Response(
                JSON.stringify({ error: 'Missing draft_id' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Fetch the draft
        const { data: draft, error: fetchError } = await supabase
            .from('job_drafts')
            .select('*')
            .eq('id', draft_id)
            .eq('status', 'paid')
            .single();

        if (fetchError || !draft) {
            return new Response(
                JSON.stringify({ error: 'Draft not found or not paid' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const data = draft.draft_data;

        // Generate job ID (slug from title)
        const companySlug = (data.company_name || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const titleSlug = (data.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const jobId = `${companySlug}-${titleSlug}-${Date.now()}`.slice(0, 100);

        // Map contract_type from form values to database values
        // Form: full-time, part-time, contract, freelance
        // DB: CLT, PJ, B2B, Freelance, Estágio, Internship
        const contractTypeMap: Record<string, string> = {
            'full-time': 'CLT',
            'part-time': 'PJ',
            'contract': 'B2B',
            'freelance': 'Freelance',
        };
        const mappedContractType = contractTypeMap[data.contract_type] || 'PJ';

        // Map draft data to jobs table structure
        // Note: jobs table uses different column names
        const newJob = {
            id: jobId,
            job_title: data.title,
            description: data.description,
            short_description: data.description.substring(0, 200), // First 200 chars
            apply_link: data.application_url,
            date_posted: new Date().toISOString().split('T')[0], // DATE format (YYYY-MM-DD)
            location_scope: data.location_scope,
            contract_type: mappedContractType, // Use mapped value
            status: 'ativa',
            source: 'manual', // Manual posting via admin
            company_logo_url: data.company_logo_url || null,
            salary_min: data.salary_min || null,
            salary_max: data.salary_max || null,
            salary_currency: data.salary_currency || 'BRL',
            location_detail: data.location_text || null,
            location_country_code: 'BR',
            // Note: company_id and category_id are NULL for now (can be linked later)
            company_id: null,
            category_id: null,
        };

        const { error: insertError } = await supabase
            .from('jobs')
            .insert(newJob);

        if (insertError) {
            console.error('Error creating job:', insertError);
            return new Response(
                JSON.stringify({ error: 'Failed to create job', details: insertError.message }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Update draft status
        const { error: updateError } = await supabase
            .from('job_drafts')
            .update({
                status: 'published',
                published_job_id: jobId,
                published_at: new Date().toISOString(),
                approved_by: 'admin', // TODO: Track actual admin user
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', draft_id);

        if (updateError) {
            console.error('Error updating draft:', updateError);
            // Job was created but draft update failed - log for manual fix
            return new Response(
                JSON.stringify({ 
                    error: 'Job created but draft update failed', 
                    job_id: jobId,
                    details: updateError.message 
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log(`✅ Draft ${draft_id} approved and published as job ${jobId}`);

        // Send approval email to customer
        const siteUrl = import.meta.env.SITE || 'https://remotejobsbr.com';
        const jobUrl = `${siteUrl}/jobs/${jobId}`;
        
        try {
            await sendJobApprovedEmail(draft.email, data.title, jobUrl);
        } catch (emailError) {
            console.error('Failed to send approval email (non-critical):', emailError);
            // Don't fail the request if email fails
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                job_id: jobId,
                message: 'Draft approved and job published successfully'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in approve-draft:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

