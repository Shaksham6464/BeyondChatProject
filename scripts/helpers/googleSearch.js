require('dotenv').config();

// Method 1: Using SerpAPI (Recommended - Easiest)
async function searchWithSerpAPI(query) {
  const { getJson } = require('serpapi');
  
  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey || apiKey === 'your_serpapi_key_here') {
    throw new Error('SerpAPI key not configured. Get one from https://serpapi.com/');
  }

  try {
    const response = await getJson({
      engine: "google",
      q: query,
      api_key: apiKey,
      num: 10
    });

    const results = [];
    
    if (response.organic_results) {
      for (const result of response.organic_results) {
        results.push({
          title: result.title,
          link: result.link,
          snippet: result.snippet || ''
        });
      }
    }

    return results;

  } catch (error) {
    throw new Error('SerpAPI error: ' + error.message);
  }
}

// Method 2: Using Puppeteer (Free but slower)
async function searchWithPuppeteer(query) {
  const puppeteer = require('puppeteer');

  console.log('  Using Puppeteer (this may take a moment)...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    // Search Google
    const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for results
    await page.waitForSelector('#search', { timeout: 10000 });

    // Extract search results
    const results = await page.evaluate(function() {
      const items = [];
      const searchResults = document.querySelectorAll('#search .g');

      for (let i = 0; i < Math.min(10, searchResults.length); i++) {
        const result = searchResults[i];
        const titleElement = result.querySelector('h3');
        const linkElement = result.querySelector('a');
        const snippetElement = result.querySelector('.VwiC3b, .yXK7lf, [data-sncf="1"]');

        if (titleElement && linkElement) {
          items.push({
            title: titleElement.textContent,
            link: linkElement.href,
            snippet: snippetElement ? snippetElement.textContent : ''
          });
        }
      }

      return items;
    });

    await browser.close();
    return results;

  } catch (error) {
    await browser.close();
    throw new Error('Puppeteer error: ' + error.message);
  }
}

// Method 3: Simple fallback (mock data for testing)
function getMockResults(query) {
  console.log('  ⚠️  Using mock data (no real search performed)');
  console.log('  Configure SERPAPI_KEY in .env for real searches\n');
  
  return [
    {
      title: 'Example Article 1 about ' + query,
      link: 'https://example.com/article-1',
      snippet: 'This is a sample article for testing purposes.'
    },
    {
      title: 'Example Article 2 about ' + query,
      link: 'https://example.com/article-2',
      snippet: 'This is another sample article for testing.'
    }
  ];
}

// Main search function - tries methods in order
async function searchGoogle(query) {
  console.log('  Searching for:', query);

  // Try SerpAPI first (if configured)
  if (process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== 'your_serpapi_key_here') {
    try {
      console.log('  Method: SerpAPI');
      return await searchWithSerpAPI(query);
    } catch (error) {
      console.error('  SerpAPI failed:', error.message);
    }
  }

  // Try Puppeteer as fallback
  try {
    console.log('  Method: Puppeteer (web scraping)');
    return await searchWithPuppeteer(query);
  } catch (error) {
    console.error('  Puppeteer failed:', error.message);
  }

  // Use mock data as last resort
  console.log('  Method: Mock data (for testing)');
  return getMockResults(query);
}

module.exports = {
  searchGoogle: searchGoogle
};