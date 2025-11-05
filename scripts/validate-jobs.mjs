#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const jobsPath = resolve(root, 'src', 'data', 'jobs.json');

const Categories = z.enum(['Game Dev', '3D & Animation', 'Design (UI/UX)']);

const jobSchema = z.object({
  id: z.string().min(1, 'id is required'),
  companyName: z.string().min(1, 'companyName is required'),
  companyLogo: z.string().min(1, 'companyLogo is required'),
  jobTitle: z.string().min(1, 'jobTitle is required'),
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
});

const jobsSchema = z.array(jobSchema).nonempty('jobs.json must contain at least one job');

function failAndExit(message) {
  console.error(`\n❌ Validation failed: ${message}`);
  process.exit(1);
}

try {
  const raw = readFileSync(jobsPath, 'utf-8');
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

  // Logo existence check (in /public)
  const publicRoot = resolve(root, 'public');
  for (const j of jobs) {
    if (j.companyLogo.startsWith('/')) {
      const logoPath = resolve(publicRoot, '.' + j.companyLogo);
      if (!existsSync(logoPath)) {
        console.error(`- companyLogo not found at ${j.companyLogo} (resolved ${logoPath})`);
        failAndExit('One or more company logos are missing from /public');
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
