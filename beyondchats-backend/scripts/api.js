// Test script for API endpoints
// Make sure the server is running first: npm start
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing BeyondChats API...\n');
  console.log('⚠️  Make sure server is running: npm start\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const health = await axios.get(BASE_URL + '/health');
    console.log('✓ Health:', health.data.status);
    console.log();

    // Test 2: Get all articles
    console.log('2️⃣ Testing GET all articles...');
    const allArticles = await axios.get(BASE_URL + '/api/articles');
    console.log('✓ Found', allArticles.data.data.length, 'articles');
    if (allArticles.data.data.length > 0) {
      console.log('  First article:', allArticles.data.data[0].title);
    }
    console.log();

    // Test 3: Get latest article
    console.log('3️⃣ Testing GET latest article...');
    const latest = await axios.get(BASE_URL + '/api/articles/latest');
    console.log('✓ Latest article:', latest.data.data.title);
    console.log();

    // Test 4: Get single article
    if (allArticles.data.data.length > 0) {
      const firstId = allArticles.data.data[0].id;
      console.log('4️⃣ Testing GET single article (ID:', firstId + ')...');
      const single = await axios.get(BASE_URL + '/api/articles/' + firstId);
      console.log('✓ Article:', single.data.data.title);
      console.log();
    }

    // Test 5: Create new article
    console.log('5️⃣ Testing POST create article...');
    const newArticle = await axios.post(BASE_URL + '/api/articles', {
      title: 'Test Article - ' + new Date().toISOString(),
      content: 'This is a test article created via API',
      author: 'API Tester',
      url: 'https://example.com/test',
      is_updated: false
    });
    console.log('✓ Created article ID:', newArticle.data.data.id);
    const newId = newArticle.data.data.id;
    console.log();

    // Test 6: Update article
    console.log('6️⃣ Testing PUT update article (ID:', newId + ')...');
    const updated = await axios.put(BASE_URL + '/api/articles/' + newId, {
      title: 'Updated Test Article',
      content: 'This content has been updated'
    });
    console.log('✓ Updated article:', updated.data.data.title);
    console.log();

    // Test 7: Delete article
    console.log('7️⃣ Testing DELETE article (ID:', newId + ')...');
    await axios.delete(BASE_URL + '/api/articles/' + newId);
    console.log('✓ Article deleted');
    console.log();

    console.log('✅ All tests passed!');
    process.exit(0);

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to server!');
      console.error('   Make sure the server is running:');
      console.error('   Run: npm start');
      console.error('   Then in another terminal run: node scripts/test-api.js');
    } else {
      console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    }
    process.exit(1);
  }
}

testAPI();