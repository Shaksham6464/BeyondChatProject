// Quick script to check what articles exist in the database
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function checkArticles() {
  console.log('🔍 Checking articles in database...\n');

  try {
    // Check server health
    console.log('1. Checking server...');
    const health = await axios.get(BASE_URL + '/health');
    console.log('   ✓ Server is running:', health.data.status, '\n');

    // Get all articles
    console.log('2. Fetching all articles...');
    const response = await axios.get(BASE_URL + '/api/articles');
    const articles = response.data.data;

    console.log('   ✓ Found', articles.length, 'article(s)\n');

    if (articles.length === 0) {
      console.log('❌ No articles in database!');
      console.log('\n📝 To add articles, run:');
      console.log('   npm run scrape\n');
      process.exit(1);
    }

    // Display article details
    console.log('📄 Articles in database:\n');
    articles.forEach(function(article) {
      console.log('---');
      console.log('ID:', article.id);
      console.log('Title:', article.title);
      console.log('Author:', article.author || 'N/A');
      console.log('Is Updated:', article.is_updated ? 'Yes' : 'No');
      console.log('Content Length:', article.content ? article.content.length : 0, 'chars');
      if (article.original_article_id) {
        console.log('Original Article ID:', article.original_article_id);
      }
      console.log('URL:', article.url || 'N/A');
    });
    console.log('---\n');

    // Try to get latest article
    console.log('3. Testing /latest endpoint...');
    try {
      const latest = await axios.get(BASE_URL + '/api/articles/latest');
      console.log('   ✓ Latest article:', latest.data.data.title);
      console.log('   ID:', latest.data.data.id);
      console.log('\n✅ Everything looks good! Ready to run: npm run enhance\n');
    } catch (error) {
      console.log('   ✗ Error getting latest article:', error.message);
      if (error.response) {
        console.log('   Response:', error.response.data);
      }
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to server!');
      console.log('   Make sure server is running: npm start\n');
    } else {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    process.exit(1);
  }
}

checkArticles();