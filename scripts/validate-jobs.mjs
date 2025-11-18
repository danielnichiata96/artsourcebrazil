#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const jobsPath = resolve(root, 'src', 'data', 'jobs.json');

// Valid categories matching src/lib/categories.ts
const Categories = z.enum([
  'Game Dev',
  '3D',
  '2D Art',
  'Animation',
  'Design',
  'VFX',
]);

const LocationScope = z.enum([
  'remote-brazil',
  'remote-latam',
  'remote-worldwide',
  'hybrid',
  'onsite',
]);

const ContractType = z.enum(['CLT', 'PJ', 'B2B', 'Freelance', 'Estágio', 'Internship']);

const jobSchema = z.object({
  id: z.string().min(1, 'id is required'),
  companyName: z.string().min(1, 'companyName is required'),
  companyLogo: z.string().min(1, 'companyLogo is required'),
  jobTitle: z.string().min(1, 'jobTitle is required'),
  description: z
    .string()
    .trim()
    .min(20, 'description must be at least 20 characters long'),
  shortDescription: z
    .string()
    .trim()
    .max(300, 'shortDescription must have at most 300 characters')
    .optional()
    .or(z.literal('')),
  applyLink: z
    .string()
    .url('applyLink must be a valid URL (http/https)')
    .refine((v) => /^(https?:)\/\//.test(v), 'applyLink must be an external link'),
  postedDate: z.string().datetime({
    offset: true,
    message: 'postedDate must be ISO 8601 with timezone (e.g., 2025-11-04T09:00:00Z)',
  }),
  category: Categories,
  tags: z.array(z.string().min(1)).min(1, 'tags must have at least one tag'),
  location: z
    .object({
      scope: LocationScope,
      note: z
        .string()
        .trim()
        .max(160, 'location.note must have at most 160 characters')
        .optional()
        .or(z.literal('')),
      countryCode: z
        .string()
        .trim()
        .length(2, 'location.countryCode must be a 2-letter ISO code')
        .optional()
        .or(z.literal('')),
    })
    .transform((value) => ({
      ...value,
      note: value.note ? value.note.trim() : undefined,
      countryCode: value.countryCode ? value.countryCode.trim().toUpperCase() : undefined,
    })),
  contractType: ContractType.optional().or(z.literal('')),
  salary: z
    .object({
      min: z.number().positive().optional().or(z.literal('')),
      max: z.number().positive().optional().or(z.literal('')),
      currency: z
        .string()
        .trim()
        .length(3, 'salary.currency must be a 3-letter ISO code (e.g., BRL, USD)')
        .toUpperCase(),
    })
    .optional()
    .or(z.literal(''))
    .transform((value) => {
      if (!value || value === '') return undefined;
      return {
        min: value.min || undefined,
        max: value.max || undefined,
        currency: value.currency,
      };
    }),
});

const jobsSchema = z.array(jobSchema).nonempty('jobs.json must contain at least one job');

function failAndExit(message) {
  console.error(`\n❌ Validation failed: ${message}`);
  process.exit(1);
}

try {
  const raw = readFileSync(jobsPath, 'utf-8');
  
  // Check file size (max 5MB to prevent performance issues)
  const fileSizeInMB = Buffer.byteLength(raw, 'utf-8') / (1024 * 1024);
  const MAX_FILE_SIZE_MB = 5;
  
  if (fileSizeInMB > MAX_FILE_SIZE_MB) {
    failAndExit(
      `jobs.json is too large (${fileSizeInMB.toFixed(2)}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB. ` +
      `Consider archiving old jobs or optimizing data.`
    );
  }
  
  console.log(`📊 File size: ${fileSizeInMB.toFixed(2)}MB / ${MAX_FILE_SIZE_MB}MB`);
  
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    failAndExit(`jobs.json is not valid JSON: ${e.message}`);
  }

  const parsed = jobsSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.') || '(root)';
      console.error(`- ${path}: ${issue.message}`);
    }
    failAndExit('See issues above.');
  }

  const jobs = parsed.data;

  // Duplicate ID check
  const seen = new Set();
  const dupes = new Set();
  for (const j of jobs) {
    if (seen.has(j.id)) dupes.add(j.id);
    seen.add(j.id);
  }
  if (dupes.size) {
    for (const id of dupes) console.error(`- Duplicate id found: ${id}`);
    failAndExit('Duplicate job ids are not allowed.');
  }

  // Logo existence and format validation (in /public)
  const publicRoot = resolve(root, 'public');
  const VALID_IMAGE_FORMATS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'];
  
  for (const j of jobs) {
    if (j.companyLogo.startsWith('/')) {
      const logoPath = resolve(publicRoot, '.' + j.companyLogo);
      
      // Check if file exists
      if (!existsSync(logoPath)) {
        console.error(`- companyLogo not found at ${j.companyLogo} (resolved ${logoPath})`);
        failAndExit('One or more company logos are missing from /public');
      }
      
      // Validate image format
      const hasValidExtension = VALID_IMAGE_FORMATS.some(ext => 
        j.companyLogo.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        console.error(
          `- companyLogo has invalid format: ${j.companyLogo} (id: ${j.id})\n` +
          `  Valid formats: ${VALID_IMAGE_FORMATS.join(', ')}`
        );
        failAndExit('Invalid image format detected. Use PNG, JPG, SVG, WebP, or GIF only.');
      }
    } else if (j.companyLogo.startsWith('http')) {
      // Validate external URL format
      const url = j.companyLogo.toLowerCase();
      const hasValidExtension = VALID_IMAGE_FORMATS.some(ext => url.includes(ext));
      
      // Clearbit URLs don't have extensions, so we check for clearbit domain
      const isClearbit = url.includes('clearbit.com');
      
      if (!hasValidExtension && !isClearbit) {
        console.warn(
          `⚠️  Warning: External logo URL may not be a valid image: ${j.companyLogo} (id: ${j.id})\n` +
          `   Expected formats: ${VALID_IMAGE_FORMATS.join(', ')} or Clearbit URL`
        );
      }
    }
  }

  // Date sanity (not NaN)
  for (const j of jobs) {
    const d = new Date(j.postedDate);
    if (Number.isNaN(d.getTime())) {
      console.error(`- postedDate is not parseable: ${j.postedDate} (id: ${j.id})`);
      failAndExit('Invalid postedDate values.');
    }
  }

  console.log('✅ jobs.json validation passed');
  process.exit(0);
} catch (e) {
  failAndExit(e?.message || String(e));
}
