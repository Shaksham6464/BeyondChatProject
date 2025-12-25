require('dotenv').config();

// Option 1: OpenAI (GPT-4)
async function enhanceWithOpenAI(originalArticle, referenceArticles) {
  const OpenAI = require('openai');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: apiKey });

  const prompt = buildPrompt(originalArticle, referenceArticles);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a professional content writer. Enhance articles by improving their formatting, structure, and content quality while maintaining the original message."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return response.choices[0].message.content;
}

// Option 2: Google Gemini (FREE!)
async function enhanceWithGemini(originalArticle, referenceArticles) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_key_here') {
    throw new Error('Gemini API key not configured. Get free key from https://makersuite.google.com/app/apikey');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = buildPrompt(originalArticle, referenceArticles);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Option 3: Anthropic Claude
async function enhanceWithClaude(originalArticle, referenceArticles) {
  const Anthropic = require('@anthropic-ai/sdk');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey || apiKey === 'your_anthropic_key_here') {
    throw new Error('Anthropic API key not configured');
  }

  const anthropic = new Anthropic({ apiKey: apiKey });

  const prompt = buildPrompt(originalArticle, referenceArticles);

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.content[0].text;
}

// Build the enhancement prompt
function buildPrompt(originalArticle, referenceArticles) {
  let prompt = 'You are enhancing an article to improve its quality, formatting, and readability.\n\n';
  
  prompt += '=== ORIGINAL ARTICLE ===\n';
  prompt += 'Title: ' + originalArticle.title + '\n';
  prompt += 'Content:\n' + originalArticle.content.substring(0, 1500) + '\n\n';
  
  prompt += '=== REFERENCE ARTICLES (Top ranking on Google) ===\n';
  referenceArticles.forEach(function(article, index) {
    prompt += '\nReference ' + (index + 1) + ':\n';
    prompt += 'Title: ' + article.title + '\n';
    prompt += 'URL: ' + article.url + '\n';
    prompt += 'Content excerpt:\n' + article.content.substring(0, 800) + '\n';
  });
  
  prompt += '\n=== YOUR TASK ===\n';
  prompt += 'Rewrite and enhance the ORIGINAL ARTICLE by:\n';
  prompt += '1. Improving the structure and formatting (use clear sections, headings)\n';
  prompt += '2. Making the content more engaging and professional\n';
  prompt += '3. Incorporating relevant insights from the reference articles\n';
  prompt += '4. Keeping the core message of the original article\n';
  prompt += '5. Making it similar in style and quality to the top-ranking reference articles\n\n';
  
  prompt += 'IMPORTANT:\n';
  prompt += '- Do NOT include any preamble or meta-commentary\n';
  prompt += '- Start directly with the enhanced article content\n';
  prompt += '- Use markdown formatting for headings and structure\n';
  prompt += '- Keep it between 500-1500 words\n';
  prompt += '- Do NOT add a references section (we will add that separately)\n\n';
  
  prompt += 'Enhanced Article:';
  
  return prompt;
}

// Main enhancement function - tries providers in order
async function enhanceWithLLM(originalArticle, referenceArticles) {
  console.log('  Preparing prompt...');
  
  // Try Gemini first (it's free!)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_key_here') {
    try {
      console.log('  Using: Google Gemini (Free)');
      const enhanced = await enhanceWithGemini(originalArticle, referenceArticles);
      return enhanced + '\n\n' + buildReferencesSection(referenceArticles);
    } catch (error) {
      console.error('  Gemini failed:', error.message);
    }
  }

  // Try OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here') {
    try {
      console.log('  Using: OpenAI GPT');
      const enhanced = await enhanceWithOpenAI(originalArticle, referenceArticles);
      return enhanced + '\n\n' + buildReferencesSection(referenceArticles);
    } catch (error) {
      console.error('  OpenAI failed:', error.message);
    }
  }

  // Try Claude
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_key_here') {
    try {
      console.log('  Using: Anthropic Claude');
      const enhanced = await enhanceWithClaude(originalArticle, referenceArticles);
      return enhanced + '\n\n' + buildReferencesSection(referenceArticles);
    } catch (error) {
      console.error('  Claude failed:', error.message);
    }
  }

  // Fallback: Simple template-based enhancement
  console.log('  ⚠️  No LLM API key configured, using basic enhancement');
  return createBasicEnhancement(originalArticle, referenceArticles);
}

// Fallback: Basic enhancement without LLM
function createBasicEnhancement(originalArticle, referenceArticles) {
  let enhanced = '# ' + originalArticle.title + '\n\n';
  enhanced += '## Introduction\n\n';
  enhanced += originalArticle.content.substring(0, 300) + '...\n\n';
  enhanced += '## Key Points\n\n';
  enhanced += 'This article has been enhanced based on top-ranking content on this topic.\n\n';
  enhanced += originalArticle.content.substring(300, 1000) + '...\n\n';
  enhanced += '## Conclusion\n\n';
  enhanced += 'For more information, see the references below.\n\n';
  enhanced += buildReferencesSection(referenceArticles);
  
  return enhanced;
}

// Build references section
function buildReferencesSection(referenceArticles) {
  let references = '---\n\n## References\n\n';
  references += 'This article was enhanced using insights from the following sources:\n\n';
  
  referenceArticles.forEach(function(article, index) {
    references += (index + 1) + '. [' + article.title + '](' + article.url + ')\n';
  });
  
  return references;
}

module.exports = {
  enhanceWithLLM: enhanceWithLLM
};