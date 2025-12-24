require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { initDatabase } = require('../database');
const Article = require('../models/Article');

// Configuration
const BEYONDCHATS_URL = 'https://beyondchats.com/blogs/';
const MAX_ARTICLES = 5;

async function scrapeArticles() {
  console.log('🚀 Starting article scraper...\n');

  try {
    // Initialize database
    await initDatabase();

    // Fetch the blogs page
    console.log(`📡 Fetching ${BEYONDCHATS_URL}...`);
    const response = await axios.get(BEYONDCHATS_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const articles = [];

    // Try multiple selectors to find articles
    const selectors = [
      'article',
      '.blog-post',
      '.post',
      '[class*="post-"]',
      '[class*="article"]',
      '.card',
      '[class*="blog"]'
    ];

    for (const selector of selectors) {
      $(selector).each((i, elem) => {
        if (articles.length >= MAX_ARTICLES * 2) return false; // Get extra in case some fail

        const $elem = $(elem);
        
        // Try to find title
        let title = '';
        const titleSelectors = ['h1', 'h2', 'h3', '.title', '[class*="title"]', 'a'];
        for (const ts of titleSelectors) {
          title = $elem.find(ts).first().text().trim();
          if (title && title.length > 10) break;
        }

        // Try to find link
        let link = $elem.find('a').first().attr('href');
        
        if (title && link) {
          // Make URL absolute
          if (!link.startsWith('http')) {
            link = link.startsWith('/') 
              ? `https://beyondchats.com${link}` 
              : `https://beyondchats.com/${link}`;
          }

          articles.push({ title, url: link });
        }
      });

      if (articles.length >= MAX_ARTICLES) break;
    }

    // Remove duplicates
    const uniqueArticles = Array.from(
      new Map(articles.map(a => [a.url, a])).values()
    );

    console.log(`✓ Found ${uniqueArticles.length} unique articles\n`);

    // Get the last 5 (oldest) articles
    const articlesToScrape = uniqueArticles.slice(-MAX_ARTICLES);

    // Scrape each article's content
    for (let i = 0; i < articlesToScrape.length; i++) {
      const articleData = articlesToScrape[i];
      console.log(`[${i + 1}/${articlesToScrape.length}] Scraping: ${articleData.title}`);

      try {
        const articleResponse = await axios.get(articleData.url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $article = cheerio.load(articleResponse.data);

        // Extract content
        const content = extractContent($article);
        const author = extractAuthor($article);
        const imageUrl = extractImage($article, articleData.url);
        const publishedDate = extractDate($article);

        // Save to database
        await Article.create({
          title: articleData.title,
          content: content || 'Content could not be extracted. Visit the original URL.',
          author: author || 'BeyondChats',
          url: articleData.url,
          published_date: publishedDate,
          image_url: imageUrl,
          is_updated: false
        });

        console.log(`  ✓ Saved successfully\n`);

        // Be nice to the server
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`  ✗ Error: ${error.message}\n`);
        
        // Save with minimal data
        await Article.create({
          title: articleData.title,
          content: 'Content could not be scraped. Please visit the original URL.',
          author: 'BeyondChats',
          url: articleData.url,
          is_updated: false
        });
      }
    }

    console.log('✅ Scraping completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    process.exit(1);
  }
}

// Helper functions
function extractContent($) {
  const selectors = [
    'article .content',
    '.post-content',
    '.entry-content',
    'article',
    'main',
    '[class*="content"]'
  ];

  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    if (text && text.length > 100) {
      return text.substring(0, 5000); // Limit content length
    }
  }

  return null;
}

function extractAuthor($) {
  const selectors = [
    '.author',
    '.post-author',
    '[rel="author"]',
    '[class*="author"]',
    '.byline'
  ];

  for (const selector of selectors) {
    const author = $(selector).first().text().trim();
    if (author) return author;
  }

  return null;
}

function extractImage($, baseUrl) {
  const selectors = [
    '.featured-image img',
    'article img',
    '.post-image img',
    'meta[property="og:image"]',
    'img'
  ];

  for (const selector of selectors) {
    let src = $(selector).first().attr('src') || $(selector).first().attr('content');
    
    if (src) {
      // Make URL absolute
      if (!src.startsWith('http')) {
        const base = new URL(baseUrl);
        src = src.startsWith('/') 
          ? `${base.origin}${src}` 
          : `${base.origin}/${src}`;
      }
      return src;
    }
  }

  return null;
}

function extractDate($) {
  const selectors = [
    'time',
    '.date',
    '.post-date',
    '.published',
    '[class*="date"]',
    'meta[property="article:published_time"]'
  ];

  for (const selector of selectors) {
    const dateText = $(selector).first().text().trim() || $(selector).first().attr('datetime') || $(selector).first().attr('content');
    
    if (dateText) {
      try {
        const date = new Date(dateText);
        if (!isNaN(date)) {
          return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      } catch (e) {
        // Continue to next selector
      }
    }
  }

  return null;
}

// Run the scraper
scrapeArticles();