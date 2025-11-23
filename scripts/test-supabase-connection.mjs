#!/usr/bin/env node
/**
 * Test Supabase Connection
 * 
 * This script tests the connection to Supabase and verifies:
 * 1. Connection works
 * 2. Tables exist
 * 3. Basic CRUD operations work
 * 
 * Usage:
 *   node scripts/test-supabase-connection.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('\n💡 See docs/SUPABASE_SETUP.md for setup instructions');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testConnection() {
  console.log('🧪 Testing Supabase Connection');
  console.log('═'.repeat(60));
  console.log(`📋 Project: ${SUPABASE_URL}\n`);

  let allTestsPassed = true;

  // Test 1: Connection
  console.log('📖 Test 1: Testing connection...');
  console.log('─'.repeat(60));
  try {
    const { data, error } = await supabase.from('categories').select('count').limit(1);

    if (error && error.message.includes('relation "categories" does not exist')) {
      console.log('⚠️  Connection works, but tables not created yet');
      console.log('   → Run the SQL migration in Supabase Dashboard (SQL Editor)');
      console.log('   → Or use: npx supabase db push');
      allTestsPassed = false;
      return;
    } else if (error) {
      throw error;
    }

    console.log('✅ Connection successful!');
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    if (error.message.includes('Invalid API key')) {
      console.error('   → Check SUPABASE_SERVICE_ROLE_KEY in .env');
    } else if (error.message.includes('Failed to fetch')) {
      console.error('   → Check SUPABASE_URL in .env');
    }
    allTestsPassed = false;
    return;
  }

  // Test 2: Read categories
  console.log('\n📖 Test 2: Reading categories...');
  console.log('─'.repeat(60));
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    console.log(`✅ Found ${data.length} categories:`);
    data.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name} (ID: ${cat.id})`);
    });

    if (data.length === 0) {
      console.log('⚠️  No categories found (should have 5 initial categories)');
    }
  } catch (error) {
    console.error(`❌ Failed to read categories: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 3: Read companies (should be empty initially)
  console.log('\n📖 Test 3: Reading companies...');
  console.log('─'.repeat(60));
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(5);

    if (error) throw error;

    console.log(`✅ Companies table accessible (${data.length} companies found)`);
    if (data.length > 0) {
      data.forEach((company, index) => {
        console.log(`  ${index + 1}. ${company.name} (ID: ${company.id})`);
      });
    }
  } catch (error) {
    console.error(`❌ Failed to read companies: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 4: Read jobs (should be empty initially)
  console.log('\n📖 Test 4: Reading jobs...');
  console.log('─'.repeat(60));
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .limit(5);

    if (error) throw error;

    console.log(`✅ Jobs table accessible (${data.length} jobs found)`);
    if (data.length > 0) {
      data.forEach((job, index) => {
        console.log(`  ${index + 1}. [${job.id}] ${job.job_title}`);
      });
    }
  } catch (error) {
    console.error(`❌ Failed to read jobs: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 5: Test upsert (create/update test record)
  console.log('\n📖 Test 5: Testing upsert...');
  console.log('─'.repeat(60));
  try {
    const testCompanyName = '__TEST_CONNECTION__';

    // Try to upsert a test company
    const { data: upsertData, error: upsertError } = await supabase
      .from('companies')
      .upsert({
        name: testCompanyName,
        website: 'https://example.com',
      }, {
        onConflict: 'name',
      })
      .select();

    if (upsertError) throw upsertError;

    console.log(`✅ Upsert successful (created/updated test company)`);
    const testCompanyId = upsertData[0].id;

    // Clean up: delete test company
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', testCompanyId);

    if (deleteError) {
      console.warn(`⚠️  Created test company but failed to delete: ${deleteError.message}`);
    } else {
      console.log(`✅ Test record cleaned up`);
    }
  } catch (error) {
    console.error(`❌ Failed to test upsert: ${error.message}`);
    allTestsPassed = false;
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  if (allTestsPassed) {
    console.log('✅ All tests passed!');
    console.log('\n💡 Your Supabase connection is ready.');
    console.log('   Next steps:');

    console.log('   2. Test sync: npm run fetch:greenhouse && npm run sync:greenhouse:supabase');
  } else {
    console.log('❌ Some tests failed. Check errors above.');
  }
  console.log('═'.repeat(60));
}

testConnection().catch(console.error);

