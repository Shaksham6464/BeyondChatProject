const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// GET /api/articles - Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles',
      error: error.message
    });
  }
});

// GET /api/articles/latest - Get latest article
router.get('/latest', async (req, res) => {
  try {
    const article = await Article.findLatest();
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'No articles found'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching latest article:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest article',
      error: error.message
    });
  }
});

// GET /api/articles/:id - Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get updated versions if this is an original article
    if (!article.is_updated) {
      const updatedVersions = await Article.findUpdatedVersions(article.id);
      article.updated_versions = updatedVersions;
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching article',
      error: error.message
    });
  }
});

// POST /api/articles - Create new article
router.post('/', async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      url,
      published_date,
      image_url,
      is_updated,
      original_article_id,
      reference_links
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const article = await Article.create({
      title,
      content,
      author,
      url,
      published_date,
      image_url,
      is_updated,
      original_article_id,
      reference_links
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating article',
      error: error.message
    });
  }
});

// PUT /api/articles/:id - Update article
router.put('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const updatedArticle = await Article.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: updatedArticle
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating article',
      error: error.message
    });
  }
});

// DELETE /api/articles/:id - Delete article
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Article.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting article',
      error: error.message
    });
  }
});

module.exports = router;