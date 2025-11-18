#!/usr/bin/env node
/**
 * Test enhancement system with a sample description
 * Useful for debugging API issues
 */

import { config } from 'dotenv';
import { enhanceDescription, isEnhancementAvailable } from './enhance-description.mjs';

config();

const testDescription = `
<p>The Art Team at Wildlife is growing. With an audience of millions, our games are a gateway to unforgettable characters, vibrant worlds, and emotionally rich experiences.</p>
<p>We are a collective of versatile, curious, and passionate artists working in synergy with designers, engineers, and PMs to create iconic mobile games.</p>
<ul>
<li>Strong 2D fundamentals</li>
<li>Experience with Gen-AI tools</li>
<li>Portfolio required</li>
</ul>
`;

async function test() {
  console.log('🧪 Testing Enhancement System\n');
  console.log('═'.repeat(60));
  
  // Check if enhancement is available
  const available = isEnhancementAvailable();
  console.log(`\n📊 Enhancement Available: ${available ? '✅ Yes' : '❌ No'}`);
  
  if (!available) {
    console.log('\n⚠️  No API keys configured. Enhancement will use HTML cleaning fallback.');
    console.log('💡 To enable AI enhancement, add to .env:');
    console.log('   GEMINI_API_KEY="your-key"');
    console.log('   OR');
    console.log('   OPENAI_API_KEY="your-key"');
  }
  
  console.log('\n📝 Original Description:');
  console.log('-'.repeat(60));
  console.log(testDescription);
  
  console.log('\n✨ Enhancing...\n');
  
  const start = Date.now();
  const enhanced = await enhanceDescription(
    testDescription,
    'Senior 2D Game Artist',
    'Wildlife Studios'
  );
  const duration = Date.now() - start;
  
  console.log('\n📝 Enhanced Description:');
  console.log('-'.repeat(60));
  console.log(enhanced);
  
  console.log(`\n⏱️  Duration: ${duration}ms`);
  console.log(`📏 Original: ${testDescription.length} chars`);
  console.log(`📏 Enhanced: ${enhanced.length} chars`);
  console.log('\n✅ Test complete!\n');
}

test().catch(console.error);

