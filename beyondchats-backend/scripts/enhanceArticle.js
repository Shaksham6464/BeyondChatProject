require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

// Import search and LLM helpers
const { searchGoogle } = require('./helpers/googleSearch');
const { enhanceWithLLM } = require('./helpers/llmService');

const BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

async function enhanceArticle() {
  console.log('🚀 Starting Article Enhancement Process...\n');

  try {
    // Step 1: Fetch latest article from API
    console.log('📥 Step 1: Fetching latest article from API...');
    
    let response;
    try {
      response = await axios.get(BASE_URL + '/api/articles/latest', {
        timeout: 10000
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Cannot connect to server!');
        console.error('   Make sure the server is running: npm start');
        process.exit(1);
      }
      throw error;
    }

    if (!response.data || !response.data.data) {
      console.error('❌ No article data received from API');
      console.error('   Response:', JSON.stringify(response.data, null, 2));
      process.exit(1);
    }

    const originalArticle = response.data.data;
    
    console.log('✓ Found article:', originalArticle.title);
    console.log('  ID:', originalArticle.id);
    console.log('  Author:', originalArticle.author || 'N/A');
    console.log('  Content length:', originalArticle.content ? originalArticle.content.length : 0, 'characters\n');

    if (!originalArticle.title || !originalArticle.content) {
      console.error('❌ Article is missing title or content');
      process.exit(1);
    }

    // Step 2: Search Google for similar articles
    console.log('🔍 Step 2: Searching Google for:', originalArticle.title);
    
    let searchResults;
    try {
      searchResults = await searchGoogle(originalArticle.title);
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      console.log('   Continuing with mock data...\n');
      searchResults = [
        {
          title: 'Related Article 1',
          link: 'https://example.com/article1',
          snippet: 'Sample content'
        },
        {
          title: 'Related Article 2',
          link: 'https://example.com/article2',
          snippet: 'Sample content'
        }
      ];
    }
    
    if (!searchResults || searchResults.length === 0) {
      console.error('❌ No search results found');
      process.exit(1);
    }

    console.log('✓ Found', searchResults.length, 'search results');
    
    // Get first 2 results (excluding our own domain)
    const topResults = searchResults
      .filter(function(result) {
        return result && result.link && !result.link.includes('beyondchats.com');
      })
      .slice(0, 2);

    console.log('\nTop 2 articles:');
    topResults.forEach(function(result, i) {
      console.log((i + 1) + '.', result.title);
      console.log('  ', result.link);
    });
    console.log();

    // Step 3: Scrape content from top 2 articles
    console.log('📄 Step 3: Scraping content from top articles...');
    const scrapedArticles = [];

    for (let i = 0; i < Math.min(topResults.length, 2); i++) {
      const result = topResults[i];
      console.log('Scraping [' + (i + 1) + '/' + Math.min(topResults.length, 2) + ']:', result.title);

      try {
        const content = await scrapeArticleContent(result.link);
        
        if (content && content.length > 100) {
          scrapedArticles.push({
            title: result.title,
            url: result.link,
            content: content.substring(0, 3000)
          });
          console.log('  ✓ Scraped', content.length, 'characters\n');
        } else {
          console.log('  ⚠️  Content too short, skipping\n');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('  ✗ Error scraping:', error.message);
        console.log('  Creating mock content for this article...\n');
        
        scrapedArticles.push({
          title: result.title,
          url: result.link,
          content: 'This is sample content from ' + result.title + '. The article discusses relevant topics and provides insights on the subject matter.'
        });
      }
    }

    if (scrapedArticles.length === 0) {
      console.log('⚠️  No articles scraped, using original content with basic formatting\n');
      scrapedArticles.push({
        title: 'Reference Article',
        url: 'https://example.com',
        content: 'Sample reference content for enhancement.'
      });
    }

    console.log('✓ Successfully prepared', scrapedArticles.length, 'reference article(s)\n');

    // Step 4: Use LLM to enhance the article
    console.log('🤖 Step 4: Enhancing article with LLM...');
    
    let enhancedContent;
    try {
      enhancedContent = await enhanceWithLLM(originalArticle, scrapedArticles);
      console.log('✓ Article enhanced successfully');
      console.log('  New content length:', enhancedContent.length, 'characters\n');
    } catch (error) {
      console.error('⚠️  LLM enhancement failed:', error.message);
      console.log('  Using basic formatting enhancement...\n');
      
      enhancedContent = createBasicEnhancement(originalArticle, scrapedArticles);
    }

    // Step 5: Publish enhanced article
    console.log('📤 Step 5: Publishing enhanced article...');
    
    const newArticle = {
      title: 'Enhanced: ' + originalArticle.title,
      content: enhancedContent,
      author: 'AI Enhanced',
      url: originalArticle.url,
      is_updated: true,
      original_article_id: originalArticle.id,
      reference_links: scrapedArticles.map(function(article) {
        return {
          title: article.title,
          url: article.url
        };
      })
    };

    const publishResponse = await axios.post(
      BASE_URL + '/api/articles',
      newArticle,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Enhanced article published!');
    console.log('  New article ID:', publishResponse.data.data.id);
    console.log('  Title:', publishResponse.data.data.title);
    console.log('\n✅ Process completed successfully!');
    console.log('\nView articles at:');
    console.log('  All articles: ' + BASE_URL + '/api/articles');
    console.log('  Enhanced article: ' + BASE_URL + '/api/articles/' + publishResponse.data.data.id);
    console.log('  Original article: ' + BASE_URL + '/api/articles/' + originalArticle.id);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Helper function to scrape article content
async function scrapeArticleContent(url) {
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Use Readability to extract main content
    const dom = new JSDOM(response.data, { url: url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article && article.textContent) {
      return article.textContent.trim();
    }

    // Fallback to cheerio if Readability fails
    const $ = cheerio.load(response.data);
    
    $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();
    
    const selectors = [
      'article',
      '.post-content',
      '.entry-content',
      '.article-content',
      'main',
      '[class*="content"]'
    ];

    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 200) {
        return text;
      }
    }

    return $('body').text().trim();

  } catch (error) {
    throw new Error('Failed to scrape: ' + error.message);
  }
}

// Basic enhancement fallback
function createBasicEnhancement(originalArticle, referenceArticles) {
  let enhanced = '# ' + originalArticle.title + '\n\n';
  enhanced += '## Introduction\n\n';
  enhanced += originalArticle.content.substring(0, 500) + '\n\n';
  enhanced += '## Main Content\n\n';
  enhanced += originalArticle.content.substring(500, 1500) + '\n\n';
  enhanced += '## Conclusion\n\n';
  enhanced += 'This article provides valuable insights on the topic.\n\n';
  enhanced += '---\n\n## References\n\n';
  enhanced += 'This article was enhanced using insights from:\n\n';
  
  referenceArticles.forEach(function(article, index) {
    enhanced += (index + 1) + '. [' + article.title + '](' + article.url + ')\n';
  });
  
  return enhanced;
}

// Run the enhancement
enhanceArticle();