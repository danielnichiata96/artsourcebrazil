#!/usr/bin/env node
/**
 * Test script to fetch jobs from Greenhouse API
 * Tests integration with Wildlife Studios Greenhouse board
 * 
 * This is a proof-of-concept to validate the Greenhouse API structure
 * and understand how to normalize the data for our site format.
 */

const COMPANY_SLUG = 'wildlifestudios';

// Try different Greenhouse API endpoints
const GREENHOUSE_ENDPOINTS = [
  `https://boards.greenhouse.io/${COMPANY_SLUG}/jobs.json`,
  `https://boards-api.greenhouse.io/v1/boards/${COMPANY_SLUG}/jobs`,
  `https://job-boards.greenhouse.io/${COMPANY_SLUG}/jobs.json`,
];

/**
 * Fetch jobs from a Greenhouse API endpoint
 * @param {string} url - API endpoint URL
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function fetchGreenhouseJobs(url) {
  try {
    console.log(`\n🔍 Trying endpoint: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RemoteJobsBR/1.0',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Test all possible Greenhouse endpoints
 */
async function testGreenhouseEndpoints() {
  console.log(`🚀 Testing Greenhouse API for: ${COMPANY_SLUG}`);
  console.log('═'.repeat(60));

  for (const endpoint of GREENHOUSE_ENDPOINTS) {
    const result = await fetchGreenhouseJobs(endpoint);
    
    if (result.success) {
      console.log(`✅ SUCCESS! Found working endpoint: ${endpoint}`);
      console.log(`📊 Response structure:`, JSON.stringify(result.data, null, 2).slice(0, 1000));
      
      // Analyze the structure
      if (Array.isArray(result.data)) {
        console.log(`\n📦 Found ${result.data.length} jobs`);
        if (result.data.length > 0) {
          console.log(`\n📋 Sample job structure:`);
          console.log(JSON.stringify(result.data[0], null, 2));
        }
      } else if (result.data.jobs && Array.isArray(result.data.jobs)) {
        console.log(`\n📦 Found ${result.data.jobs.length} jobs`);
        if (result.data.jobs.length > 0) {
          console.log(`\n📋 Sample job structure:`);
          console.log(JSON.stringify(result.data.jobs[0], null, 2));
        }
      }
      
      return { success: true, endpoint, data: result.data };
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
  }

  console.log('\n⚠️  None of the standard Greenhouse endpoints worked.');
  console.log('💡 The company might use a custom Greenhouse setup or require authentication.');
  
  return { success: false };
}

/**
 * Analyze and display Greenhouse job structure
 * @param {any} greenhouseJob - Job object from Greenhouse API
 */
function analyzeJobStructure(greenhouseJob) {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 JOB STRUCTURE ANALYSIS');
  console.log('═'.repeat(60));
  
  console.log('\n📝 Available fields:');
  Object.keys(greenhouseJob).forEach(key => {
    const value = greenhouseJob[key];
    const type = Array.isArray(value) ? 'array' : typeof value;
    const preview = typeof value === 'string' 
      ? value.substring(0, 50) + (value.length > 50 ? '...' : '')
      : Array.isArray(value)
      ? `[${value.length} items]`
      : value;
    
    console.log(`  • ${key} (${type}): ${preview}`);
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🧪 Greenhouse API Test Script');
  console.log('Testing integration with Wildlife Studios Greenhouse board\n');
  
  const result = await testGreenhouseEndpoints();
  
  if (result.success) {
    // Determine which format the data is in
    const jobs = Array.isArray(result.data) 
      ? result.data 
      : result.data.jobs || [];
    
    if (jobs.length > 0) {
      analyzeJobStructure(jobs[0]);
      
      console.log('\n✅ Greenhouse API test completed successfully!');
      console.log(`📊 Found ${jobs.length} jobs`);
      console.log(`🔗 Working endpoint: ${result.endpoint}`);
      console.log('\n💡 Next steps:');
      console.log('   1. Create a normalizer function to convert Greenhouse format to our Job type');
      console.log('   2. Map Greenhouse categories to our categories');
      console.log('   3. Parse location data to determine remote/onsite/hybrid');
      console.log('   4. Extract tags from job description or metadata');
    } else {
      console.log('\n⚠️  API returned successfully but no jobs found.');
    }
  } else {
    console.log('\n❌ Greenhouse API test failed.');
    console.log('💡 Consider checking:');
    console.log('   - Is the company slug correct?');
    console.log('   - Does the company use a public Greenhouse board?');
    console.log('   - Is there a different API endpoint?');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

