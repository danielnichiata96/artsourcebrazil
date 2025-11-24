#!/usr/bin/env node
/**
 * Fetch and normalize jobs from Ashby API
 * 
 * This script:
 * 1. Fetches jobs from Ashby API (api.ashbyhq.com/posting-api/job-board/{company})
 * 2. Normalizes data to our Job type format
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Configuration
const ASHBY_API_BASE = 'https://api.ashbyhq.com/posting-api/job-board';
const COMPANY_SLUG = 'linear'; // Default for testing

// Reusing category mapping logic (simplified for brevity, ideally shared)
const titleCategoryMap = {
    'VFX': ['vfx', 'visual effects'],
    '3D': ['3d artist', '3d modeler'],
    '2D Art': ['2d artist', 'concept artist', 'illustrator'],
    'Animation': ['animator', 'motion graphics'],
    'Design': ['designer', 'ux', 'ui', 'product designer'],
    'Game Dev': ['engineer', 'developer', 'programmer', 'data'],
};

const DEFAULT_CATEGORY = 'Game Dev';

function mapCategory(title = '') {
    const lowerTitle = title.toLowerCase();

    if (/\b3d\b/i.test(title)) return '3D';
    if (titleCategoryMap['VFX'].some(k => lowerTitle.includes(k))) return 'VFX';
    if (titleCategoryMap['Animation'].some(k => lowerTitle.includes(k))) return 'Animation';
    if (titleCategoryMap['2D Art'].some(k => lowerTitle.includes(k))) return '2D Art';
    if (titleCategoryMap['Design'].some(k => lowerTitle.includes(k))) return 'Design';
    if (titleCategoryMap['Game Dev'].some(k => lowerTitle.includes(k))) return 'Game Dev';

    return DEFAULT_CATEGORY;
}

async function fetchAshbyJobs() {
    console.log('🚀 Fetching jobs from Ashby API...');
    console.log(`📋 Company: ${COMPANY_SLUG}`);

    try {
        const url = `${ASHBY_API_BASE}/${COMPANY_SLUG}`;
        console.log(`🔍 Fetching from: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ includeCompensation: true })
        });

        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

        const data = await response.json();
        const jobs = data.jobs || [];
        console.log(`📦 Found ${jobs.length} jobs`);

        const normalizedJobs = jobs.map(job => {
            const category = mapCategory(job.title);

            return {
                id: `ASH-${job.id}`,
                companyName: COMPANY_SLUG.charAt(0).toUpperCase() + COMPANY_SLUG.slice(1),
                companyLogo: `/images/companies/${COMPANY_SLUG}.svg`,
                jobTitle: job.title,
                description: job.descriptionHtml,
                shortDescription: (job.descriptionPlain || '').slice(0, 300) + '...',
                applyLink: job.applyUrl,
                postedDate: job.publishedAt,
                category,
                tags: [category, job.department, job.locationName].filter(Boolean),
                location: {
                    scope: job.isRemote ? 'remote-worldwide' : 'onsite', // Simplification
                    text: job.locationName
                },
                contractType: job.employmentType,
                salary: job.compensation ? {
                    min: job.compensation.min,
                    max: job.compensation.max,
                    currency: job.compensation.currency
                } : null
            };
        });

        const outputPath = resolve(process.cwd(), 'scripts/ashby-jobs-output.json');
        writeFileSync(outputPath, JSON.stringify(normalizedJobs, null, 2));
        console.log(`✅ Saved ${normalizedJobs.length} jobs to ${outputPath}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fetchAshbyJobs();
