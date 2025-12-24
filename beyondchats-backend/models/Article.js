const { run, all, get } = require('../database');

class Article {
  // Create new article
  static async create(data) {
    const {
      title,
      content,
      author = null,
      url = null,
      published_date = null,
      image_url = null,
      is_updated = 0,
      original_article_id = null,
      reference_links = null
    } = data;

    const referencesJson = reference_links ? JSON.stringify(reference_links) : null;

    const sql = `
      INSERT INTO articles (
        title, content, author, url, published_date, 
        image_url, is_updated, original_article_id, reference_links
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await run(sql, [
      title,
      content,
      author,
      url,
      published_date,
      image_url,
      is_updated ? 1 : 0,
      original_article_id,
      referencesJson
    ]);

    return this.findById(result.id);
  }

  // Find all articles
  static async findAll() {
    const sql = `
      SELECT a.*, 
             o.title as original_title
      FROM articles a
      LEFT JOIN articles o ON a.original_article_id = o.id
      ORDER BY a.created_at DESC
    `;

    const articles = await all(sql);
    return articles.map(this.formatArticle);
  }

  // Find article by ID
  static async findById(id) {
    const sql = `
      SELECT a.*, 
             o.title as original_title
      FROM articles a
      LEFT JOIN articles o ON a.original_article_id = o.id
      WHERE a.id = ?
    `;

    const article = await get(sql, [id]);
    return article ? this.formatArticle(article) : null;
  }

  // Update article
  static async update(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'title', 'content', 'author', 'url', 'published_date',
      'image_url', 'is_updated', 'original_article_id', 'reference_links'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        
        if (field === 'reference_links' && data[field]) {
          values.push(JSON.stringify(data[field]));
        } else if (field === 'is_updated') {
          values.push(data[field] ? 1 : 0);
        } else {
          values.push(data[field]);
        }
      }
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE articles SET ${fields.join(', ')} WHERE id = ?`;
    await run(sql, values);

    return this.findById(id);
  }

  // Delete article
  static async delete(id) {
    const sql = 'DELETE FROM articles WHERE id = ?';
    const result = await run(sql, [id]);
    return result.changes > 0;
  }

  // Get latest article (for Phase 2)
  static async findLatest() {
    const sql = `
      SELECT * FROM articles 
      WHERE is_updated = 0 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const article = await get(sql);
    return article ? this.formatArticle(article) : null;
  }

  // Get updated versions of an article
  static async findUpdatedVersions(originalId) {
    const sql = `
      SELECT * FROM articles 
      WHERE original_article_id = ? 
      ORDER BY created_at DESC
    `;

    const articles = await all(sql, [originalId]);
    return articles.map(this.formatArticle);
  }

  // Format article object
  static formatArticle(article) {
    return {
      ...article,
      is_updated: Boolean(article.is_updated),
      reference_links: article.reference_links ? JSON.parse(article.reference_links) : null
    };
  }
}

module.exports = Article;