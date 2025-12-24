// Quick test script to verify Phase 2 setup
require('dotenv').config();

console.log('🧪 Testing Phase 2 Configuration...\n');

// Check if required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'scripts/enhanceArticle.js',
  'scripts/helpers/googleSearch.js',
  'scripts/helpers/llmService.js',
  '.env'
];

console.log('1️⃣ Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(function(file) {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(exists ? '  ✓' : '  ✗', file);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ Some files are missing. Please create them first.');
  process.exit(1);
}

console.log('\n2️⃣ Checking API keys configuration...');

const configs = {
  'Google Gemini (FREE)': process.env.GEMINI_API_KEY,
  'SerpAPI (Google Search)': process.env.SERPAPI_KEY,
  'OpenAI': process.env.OPENAI_API_KEY,
  'Anthropic Claude': process.env.ANTHROPIC_API_KEY
};

let hasAnyLLMKey = false;
let hasSearchKey = false;

Object.keys(configs).forEach(function(name) {
  const key = configs[name];
  const configured = key && key !== 'your_' + name.toLowerCase().replace(/\s+/g, '_') + '_key_here';
  
  if (configured) {
    if (name.includes('SerpAPI')) {
      hasSearchKey = true;
    } else {
      hasAnyLLMKey = true;
    }
  }
  
  console.log(configured ? '  ✓' : '  ✗', name + ':', configured ? 'Configured' : 'Not configured');
});

console.log('\n3️⃣ Checking dependencies...');

const requiredPackages = [
  'axios',
  'cheerio',
  'jsdom',
  '@mozilla/readability'
];

const optionalPackages = [
  'serpapi',
  'puppeteer',
  'openai',
  '@google/generative-ai',
  '@anthropic-ai/sdk'
];

let missingRequired = [];

requiredPackages.forEach(function(pkg) {
  try {
    require(pkg);
    console.log('  ✓', pkg);
  } catch (e) {
    console.log('  ✗', pkg, '- MISSING');
    missingRequired.push(pkg);
  }
});

if (missingRequired.length > 0) {
  console.log('\n❌ Missing required packages. Run:');
  console.log('npm install ' + missingRequired.join(' '));
  process.exit(1);
}

console.log('\n4️⃣ Testing server connection...');

const axios = require('axios');
const BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

axios.get(BASE_URL + '/health')
  .then(function(response) {
    console.log('  ✓ Server is running');
    console.log('  ✓ Health check:', response.data.status);
    
    // Check if articles exist
    return axios.get(BASE_URL + '/api/articles');
  })
  .then(function(response) {
    const count = response.data.data.length;
    console.log('  ✓ Database has', count, 'article(s)');
    
    if (count === 0) {
      console.log('\n⚠️  No articles found. Run: npm run scrape');
    }
    
    console.log('\n✅ Phase 2 Setup Complete!\n');
    
    console.log('📋 Summary:');
    console.log('  - Files: ✓ All present');
    console.log('  - Server: ✓ Running');
    console.log('  - Articles: ' + count + ' in database');
    console.log('  - LLM: ' + (hasAnyLLMKey ? '✓ Configured' : '⚠️  Using fallback (basic enhancement)'));
    console.log('  - Search: ' + (hasSearchKey ? '✓ SerpAPI' : '⚠️  Will use Puppeteer'));
    
    console.log('\n🚀 Ready to run: npm run enhance\n');
    
    if (!hasAnyLLMKey) {
      console.log('💡 TIP: Get free Google Gemini API key from:');
      console.log('   https://makersuite.google.com/app/apikey');
      console.log('   Add it to .env as: GEMINI_API_KEY=your_key_here\n');
    }
    
    process.exit(0);
  })
  .catch(function(error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('  ✗ Server not running');
      console.log('\n❌ Please start the server first:');
      console.log('   Run: npm start\n');
    } else {
      console.log('  ✗ Error:', error.message);
    }
    process.exit(1);
  });