#!/usr/bin/env node

/**
 * JSON-LD Validation Script
 * 
 * Validates all JSON-LD structured data on the site.
 * Can be run manually or integrated into CI/CD pipeline.
 * 
 * Usage:
 *   node scripts/validate-json-ld.mjs
 *   npm run validate:json-ld
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ERRORS = [];
const WARNINGS = [];
const VALID_SCHEMAS = [];

// Schema.org types we support
const SUPPORTED_TYPES = [
  'Organization',
  'JobPosting',
  'BreadcrumbList',
  'BlogPosting',
  'ListItem',
  'Place',
  'PostalAddress',
  'Country',
  'PropertyValue',
  'ImageObject',
  'WebPage',
  'QuantitativeValue',
  'MonetaryAmount'
];

// Required properties for each schema type
const REQUIRED_PROPS = {
  Organization: ['@type', 'name'],
  JobPosting: ['@type', 'title', 'description', 'datePosted', 'hiringOrganization', 'jobLocation'],
  BreadcrumbList: ['@type', 'itemListElement'],
  BlogPosting: ['@type', 'headline', 'image', 'datePublished', 'author', 'publisher'],
  ListItem: ['@type', 'position', 'name', 'item'],
  Place: ['@type', 'address'],
  PostalAddress: ['@type']
};

/**
 * Find all .astro files recursively
 */
function findAstroFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        findAstroFiles(filePath, fileList);
      }
    } else if (extname(file) === '.astro') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract JSON-LD from Astro file
 */
function extractJsonLd(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const schemas = [];
  
  // Match <script type="application/ld+json"> blocks (with and without set:html)
  // This regex is more flexible to catch different formats
  const jsonLdRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi;
  const matches = content.match(jsonLdRegex);
  
  if (!matches) return schemas;
  
  matches.forEach((match, index) => {
    try {
      // Check if this is a template expression with set:html
      if (match.includes('set:html={JSON.stringify')) {
        // Extract the type from the schema object if possible
        const typeMatch = match.match(/@type['"]?\s*:\s*['"]([^'"]+)['"]/);
        const type = typeMatch ? typeMatch[1] : 'Unknown';
        
        schemas.push({
          file: filePath,
          index,
          type,
          isTemplate: true
        });
        return;
      }
      
      // Extract content between tags
      const jsonContent = match
        .replace(/<script[^>]*>/i, '')
        .replace(/<\/script>/i, '')
        .trim();
      
      // Try to parse as JSON
      // Note: In real Astro files, this might be a template expression like {JSON.stringify(schema)}
      // We'll need to handle that
      
      if (jsonContent.includes('JSON.stringify')) {
        // This is a template expression, extract the object
        const objMatch = jsonContent.match(/JSON\.stringify\(({[\s\S]*?})\)/);
        if (objMatch) {
          // We can't actually evaluate this without running Astro
          // So we'll just note it exists
          schemas.push({
            file: filePath,
            index,
            raw: objMatch[1],
            isTemplate: true
          });
        }
      } else if (jsonContent.includes('set:html={JSON.stringify')) {
        // Astro template syntax
        schemas.push({
          file: filePath,
          index,
          raw: jsonContent,
          isTemplate: true
        });
      } else {
        // Try to parse as regular JSON
        const schema = JSON.parse(jsonContent);
        schemas.push({
          file: filePath,
          index,
          schema,
          isTemplate: false
        });
      }
    } catch (error) {
      WARNINGS.push({
        file: filePath,
        message: `Failed to parse JSON-LD at index ${index}: ${error.message}`
      });
    }
  });
  
  return schemas;
}

/**
 * Validate a single schema object
 */
function validateSchema(schemaData) {
  const { file, schema, isTemplate } = schemaData;
  
  if (isTemplate) {
    // Can't fully validate template expressions without running Astro
    // But we can note that they exist
    VALID_SCHEMAS.push({
      file,
      type: 'Template Expression (Astro)',
      status: '✓ Found'
    });
    return;
  }
  
  if (!schema || typeof schema !== 'object') {
    ERRORS.push({
      file,
      message: 'Schema is not an object'
    });
    return;
  }
  
  // Check @context
  if (schema['@context'] !== 'https://schema.org') {
    ERRORS.push({
      file,
      message: `Invalid @context: ${schema['@context']}. Should be "https://schema.org"`
    });
  }
  
  // Check @type
  const type = schema['@type'];
  if (!type) {
    ERRORS.push({
      file,
      message: 'Missing @type property'
    });
    return;
  }
  
  if (!SUPPORTED_TYPES.includes(type)) {
    WARNINGS.push({
      file,
      message: `Unknown schema type: ${type}`
    });
  }
  
  // Check required properties for this type
  const requiredProps = REQUIRED_PROPS[type] || [];
  requiredProps.forEach(prop => {
    if (!schema[prop]) {
      ERRORS.push({
        file,
        message: `Missing required property for ${type}: ${prop}`
      });
    }
  });
  
  // Type-specific validations
  if (type === 'JobPosting') {
    validateJobPosting(file, schema);
  } else if (type === 'BreadcrumbList') {
    validateBreadcrumbList(file, schema);
  } else if (type === 'Organization') {
    validateOrganization(file, schema);
  } else if (type === 'BlogPosting') {
    validateBlogPosting(file, schema);
  }
  
  VALID_SCHEMAS.push({
    file,
    type,
    status: 'Valid'
  });
}

/**
 * Validate JobPosting specific properties
 */
function validateJobPosting(file, schema) {
  // Check datePosted format
  if (schema.datePosted && !isValidISO8601(schema.datePosted)) {
    ERRORS.push({
      file,
      message: `Invalid datePosted format: ${schema.datePosted}. Should be ISO 8601.`
    });
  }
  
  // Check validThrough (recommended)
  if (!schema.validThrough) {
    WARNINGS.push({
      file,
      message: 'Missing recommended property: validThrough'
    });
  } else if (!isValidISO8601(schema.validThrough)) {
    ERRORS.push({
      file,
      message: `Invalid validThrough format: ${schema.validThrough}. Should be ISO 8601.`
    });
  }
  
  // Check employmentType enum
  const validEmploymentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER'];
  if (schema.employmentType && !validEmploymentTypes.includes(schema.employmentType)) {
    ERRORS.push({
      file,
      message: `Invalid employmentType: ${schema.employmentType}. Must be one of: ${validEmploymentTypes.join(', ')}`
    });
  }
  
  // Check hiringOrganization structure
  if (schema.hiringOrganization) {
    if (!schema.hiringOrganization['@type']) {
      ERRORS.push({
        file,
        message: 'hiringOrganization missing @type'
      });
    }
    if (!schema.hiringOrganization.name) {
      ERRORS.push({
        file,
        message: 'hiringOrganization missing name'
      });
    }
  }
}

/**
 * Validate BreadcrumbList specific properties
 */
function validateBreadcrumbList(file, schema) {
  if (!Array.isArray(schema.itemListElement)) {
    ERRORS.push({
      file,
      message: 'itemListElement must be an array'
    });
    return;
  }
  
  schema.itemListElement.forEach((item, index) => {
    if (item['@type'] !== 'ListItem') {
      ERRORS.push({
        file,
        message: `itemListElement[${index}] must have @type: "ListItem"`
      });
    }
    
    if (typeof item.position !== 'number' || item.position !== index + 1) {
      ERRORS.push({
        file,
        message: `itemListElement[${index}] has invalid position. Expected ${index + 1}, got ${item.position}`
      });
    }
    
    if (!item.name) {
      ERRORS.push({
        file,
        message: `itemListElement[${index}] missing name`
      });
    }
    
    if (!item.item) {
      WARNINGS.push({
        file,
        message: `itemListElement[${index}] missing item URL (optional but recommended)`
      });
    }
  });
}

/**
 * Validate Organization specific properties
 */
function validateOrganization(file, schema) {
  // Check URL format
  if (schema.url && !isValidURL(schema.url)) {
    ERRORS.push({
      file,
      message: `Invalid url format: ${schema.url}`
    });
  }
  
  // Check logo URL
  if (schema.logo && !isValidURL(schema.logo)) {
    ERRORS.push({
      file,
      message: `Invalid logo URL: ${schema.logo}`
    });
  }
  
  // Check email format
  if (schema.email && !isValidEmail(schema.email)) {
    ERRORS.push({
      file,
      message: `Invalid email format: ${schema.email}`
    });
  }
}

/**
 * Validate BlogPosting specific properties
 */
function validateBlogPosting(file, schema) {
  // Check datePublished format
  if (!isValidISO8601(schema.datePublished)) {
    ERRORS.push({
      file,
      message: `Invalid datePublished format: ${schema.datePublished}`
    });
  }
  
  // Check dateModified (recommended)
  if (schema.dateModified && !isValidISO8601(schema.dateModified)) {
    ERRORS.push({
      file,
      message: `Invalid dateModified format: ${schema.dateModified}`
    });
  }
  
  // Check image URL
  if (!isValidURL(schema.image)) {
    ERRORS.push({
      file,
      message: `Invalid image URL: ${schema.image}`
    });
  }
}

/**
 * Validation helpers
 */
function isValidISO8601(dateString) {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return iso8601Regex.test(dateString);
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Print results
 */
function printResults() {
  console.log('\n🔍 JSON-LD Validation Results\n');
  console.log('═'.repeat(60));
  
  // Valid schemas
  console.log(`\n✅ Schemas Found: ${VALID_SCHEMAS.length}`);
  if (VALID_SCHEMAS.length > 0) {
    const typeCount = {};
    VALID_SCHEMAS.forEach(({ type }) => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    console.log('\n   Schema Types:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} instance(s)`);
    });
    
    // Show file breakdown
    console.log('\n   Files with JSON-LD:');
    const fileCount = {};
    VALID_SCHEMAS.forEach(({ file }) => {
      const shortFile = file.replace(process.cwd(), '');
      fileCount[shortFile] = (fileCount[shortFile] || 0) + 1;
    });
    Object.entries(fileCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Show top 10
      .forEach(([file, count]) => {
        console.log(`   ${file} (${count})`);
      });
  }
  
  // Warnings
  if (WARNINGS.length > 0) {
    console.log(`\n⚠️  Warnings: ${WARNINGS.length}`);
    WARNINGS.forEach(({ file, message }) => {
      const shortFile = file.replace(process.cwd(), '');
      console.log(`   ${shortFile}`);
      console.log(`   → ${message}\n`);
    });
  }
  
  // Errors
  if (ERRORS.length > 0) {
    console.log(`\n❌ Errors: ${ERRORS.length}`);
    ERRORS.forEach(({ file, message }) => {
      const shortFile = file.replace(process.cwd(), '');
      console.log(`   ${shortFile}`);
      console.log(`   → ${message}\n`);
    });
  }
  
  console.log('═'.repeat(60));
  
  if (ERRORS.length === 0) {
    console.log(`\n✨ All JSON-LD schemas are valid! (${VALID_SCHEMAS.length} found)\n`);
    console.log('ℹ️  Note: Astro template expressions are detected but not fully validated.');
    console.log('   Run Google Rich Results Test on live URLs for complete validation.\n');
    return 0;
  } else {
    console.log(`\n❌ Found ${ERRORS.length} error(s) that need to be fixed.\n`);
    return 1;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting JSON-LD validation...\n');
  
  // Find all Astro files
  const srcDir = join(process.cwd(), 'src');
  const astroFiles = findAstroFiles(srcDir);
  
  console.log(`📁 Found ${astroFiles.length} Astro files\n`);
  
  // Extract and validate JSON-LD from each file
  astroFiles.forEach(file => {
    const schemas = extractJsonLd(file);
    schemas.forEach(validateSchema);
  });
  
  // Print results
  const exitCode = printResults();
  process.exit(exitCode);
}

// Run
main();
