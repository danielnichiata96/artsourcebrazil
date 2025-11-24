#!/usr/bin/env node
/**
 * Fetch and normalize jobs from Lever API
 * 
 * This script:
 * 1. Fetches jobs from Lever API (api.lever.co/v0/postings/{company})
 * 2. Normalizes data to our Job type format
 * 3. Maps categories and determines location scope
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Configuration
const LEVER_API_BASE = 'https://api.lever.co/v0/postings';
const COMPANY_SLUG = 'atlassian'; // Default for testing, can be changed

// Category mapping based on job title keywords (reused from Greenhouse script logic)
const titleCategoryMap = {
    'VFX': ['vfx', 'visual effects', 'effects artist', 'fx artist', 'particle', 'real-time vfx'],
    '3D': ['3d artist', '3d game artist', '3d modeler', 'character artist 3d', 'environment artist 3d', '3d generalist', 'texturing', 'lighting artist'],
    '2D Art': ['2d artist', '2d game artist', 'concept artist', 'illustrator', '2d art', 'game artist'],
    'Animation': ['animator', 'character animator', 'rigging', 'animation artist', 'motion graphics'],
    'Design': ['designer', 'ux', 'ui', 'product designer', 'visual designer', 'graphic designer'],
    'Game Dev': ['game engineer', 'game developer', 'software engineer', 'engineer', 'developer', 'programmer', 'data scientist'],
};

const DEFAULT_CATEGORY = 'Game Dev';

function mapCategory(title = '', description = '', team = '') {
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();
    const lowerTeam = team.toLowerCase();
    const allText = `${lowerTitle} ${lowerDesc}`;

    // Priority checks
    if (/\b3d\b/i.test(title)) return '3D';
    if (titleCategoryMap['VFX'].some(k => allText.includes(k))) return 'VFX';
    if (titleCategoryMap['Animation'].some(k => lowerTitle.includes(k))) return 'Animation';
    if (titleCategoryMap['2D Art'].some(k => allText.includes(k))) return '2D Art';
    if (titleCategoryMap['Design'].some(k => lowerTitle.includes(k))) return 'Design';
    if (titleCategoryMap['Game Dev'].some(k => allText.includes(k))) return 'Game Dev';

    // Team mapping
    if (lowerTeam.includes('art') || lowerTeam.includes('creative')) return '2D Art';
    if (lowerTeam.includes('engineering') || lowerTeam.includes('tech')) return 'Game Dev';
    if (lowerTeam.includes('design')) return 'Design';

    return DEFAULT_CATEGORY;
}

function determineLocationScope(categories = {}) {
    const commitment = categories.commitment || '';
    const location = categories.location || '';
    const team = categories.team || '';

    const fullText = `${commitment} ${location} ${team}`.toLowerCase();

    if (fullText.includes('remote')) {
        if (fullText.includes('brazil') || fullText.includes('são paulo') || fullText.includes('rio de janeiro')) {
            return 'remote-brazil';
        }
        return 'remote-worldwide';
    }

    if (fullText.includes('hybrid')) return 'hybrid';
    return 'onsite';
}

async function fetchLeverJobs() {
    console.log('🚀 Fetching jobs from Lever API...');
    console.log(`📋 Company: ${COMPANY_SLUG}`);

    try {
        const url = `${LEVER_API_BASE}/${COMPANY_SLUG}?mode=json`;
        console.log(`🔍 Fetching from: ${url}`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

        const jobs = await response.json();
        console.log(`📦 Found ${jobs.length} jobs`);

        const normalizedJobs = jobs.map(job => {
            const category = mapCategory(job.text, job.descriptionPlain, job.categories?.team);

            return {
                id: `LEV-${job.id}`,
                companyName: COMPANY_SLUG.charAt(0).toUpperCase() + COMPANY_SLUG.slice(1),
                companyLogo: `/images/companies/${COMPANY_SLUG}.svg`, // Placeholder
                jobTitle: job.text,
                description: job.description, // Lever provides HTML description
                shortDescription: job.descriptionPlain.slice(0, 300) + '...',
                applyLink: job.applyUrl,
                postedDate: new Date(job.createdAt).toISOString(),
                category,
                tags: [category, job.categories?.team, job.categories?.commitment].filter(Boolean),
                location: {
                    scope: determineLocationScope(job.categories),
                    text: job.categories?.location || 'Remote'
                },
                contractType: job.categories?.commitment || null,
                salary: null
            };
        });

        const outputPath = resolve(process.cwd(), 'scripts/lever-jobs-output.json');
        writeFileSync(outputPath, JSON.stringify(normalizedJobs, null, 2));
        console.log(`✅ Saved ${normalizedJobs.length} jobs to ${outputPath}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fetchLeverJobs();
