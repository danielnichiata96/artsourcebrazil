import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Job } from './jobs';

const site = 'https://artsourcebrazil.com'; // Use production URL

// Load fonts from the project's public directory
const interRegular = readFileSync(
  path.resolve(process.cwd(), 'public/fonts/inter-latin-regular.woff'),
);
const interBold = readFileSync(
  path.resolve(process.cwd(), 'public/fonts/inter-latin-bold.woff'),
);

// Main function to generate OG image
export async function generateOgImageForJob(job: Job): Promise<Buffer> {
  const markup = html`
    <div
      style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: #f3f4f6; padding: 80px; font-family: 'Inter', sans-serif;"
    >
      <!-- Header -->
      <div style="display: flex; align-items: center; margin-bottom: 40px;">
        <img
          src="${new URL('/images/logo-og.png', site)}"
          width="80"
          height="80"
          alt="ArtSource Brazil Logo"
          style="border-radius: 12px;"
        />
        <p style="margin-left: 20px; font-size: 36px; font-weight: 600; color: #111827;">
          ArtSource Brazil
        </p>
      </div>

      <!-- Main Content -->
      <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
        <p
          style="font-size: 32px; color: #4b5563; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;"
        >
          ${job.category}
        </p>
        <h1 style="font-size: 72px; font-weight: 700; color: #111827; margin: 0; line-height: 1.1;">
          ${job.jobTitle}
        </h1>
        <p style="font-size: 48px; color: #374151; margin-top: 20px;">at ${job.companyName}</p>
      </div>

      <!-- Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; flex-wrap: wrap; gap: 12px; max-width: 80%;">
          ${job.tags
            .slice(0, 4)
            .map(
              (tag) =>
                `<div style="background-color: #e0e7ff; color: #3730a3; padding: 8px 16px; border-radius: 9999px; font-size: 24px; font-weight: 500;">${tag}</div>`,
            )
            .join('')}
        </div>
        <p style="font-size: 28px; color: #4b5563;">Remote (Brazil)</p>
      </div>
    </div>
  `;

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: interRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interBold,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}
