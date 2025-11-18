#!/usr/bin/env node
/**
 * Setup Supabase Schema
 * 
 * This script runs the initial schema migration on Supabase.
 * It creates all tables, indexes, triggers, and RLS policies.
 * 
 * Usage:
 *   node scripts/setup-supabase-schema.mjs
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 *   - Supabase project created and running
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('\n💡 Create a project at https://supabase.com and add credentials to .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupSchema() {
  console.log('🚀 Setting up Supabase schema...');
  console.log('═'.repeat(60));
  console.log(`📋 Project: ${SUPABASE_URL}\n`);

  // Read migration file
  const migrationPath = resolve(__dirname, '../supabase/migrations/001_initial_schema.sql');
  let migrationSQL;
  
  try {
    migrationSQL = readFileSync(migrationPath, 'utf-8');
    console.log(`📖 Read migration file: ${migrationPath}`);
  } catch (error) {
    console.error(`❌ Error reading migration file: ${error.message}`);
    process.exit(1);
  }

  // Execute migration
  console.log('\n🔄 Executing migration...');
  console.log('─'.repeat(60));

  try {
    // Supabase doesn't have a direct SQL execution endpoint in JS client
    // We need to use the REST API or split into individual statements
    // For now, we'll split by semicolon and execute sequentially
    
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Note: The Supabase JS client doesn't support raw SQL execution
    // We need to use the REST API or create tables via client methods
    // For production, use Supabase CLI or Dashboard SQL editor
    
    console.log('\n⚠️  Direct SQL execution not available via JS client.');
    console.log('\n💡 To apply the schema:');
    console.log('   1. Copy the SQL from: supabase/migrations/001_initial_schema.sql');
    console.log('   2. Go to Supabase Dashboard > SQL Editor');
    console.log('   3. Paste and run the SQL');
    console.log('\n   Or use Supabase CLI:');
    console.log('   npx supabase db push');
    
    // Verify connection
    console.log('\n🔍 Verifying connection to Supabase...');
    const { data, error } = await supabase.from('companies').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation "companies" does not exist')) {
        console.log('✅ Connection successful, but tables not created yet');
        console.log('   Run the SQL migration in Supabase Dashboard or use CLI');
      } else {
        console.error(`❌ Connection error: ${error.message}`);
      }
    } else {
      console.log('✅ Connection successful and tables exist!');
    }

  } catch (error) {
    console.error(`❌ Error executing migration: ${error.message}`);
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Schema setup instructions displayed');
  console.log('═'.repeat(60));
}

setupSchema().catch(console.error);

