const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, function(err) {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

function initDatabase() {
  return new Promise(function(resolve, reject) {
    const sql = `
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT,
        url TEXT,
        published_date TEXT,
        image_url TEXT,
        is_updated BOOLEAN DEFAULT 0,
        original_article_id INTEGER,
        reference_links TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (original_article_id) REFERENCES articles(id)
      )
    `;
    
    db.run(sql, function(err) {
      if (err) {
        reject(err);
      } else {
        console.log('Articles table created or already exists');
        resolve();
      }
    });
  });
}

function run(sql, params) {
  if (!params) params = [];
  
  return new Promise(function(resolve, reject) {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ 
          id: this.lastID, 
          changes: this.changes 
        });
      }
    });
  });
}

function all(sql, params) {
  if (!params) params = [];
  
  return new Promise(function(resolve, reject) {
    db.all(sql, params, function(err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function get(sql, params) {
  if (!params) params = [];
  
  return new Promise(function(resolve, reject) {
    db.get(sql, params, function(err, row) {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = {
  db: db,
  initDatabase: initDatabase,
  run: run,
  all: all,
  get: get
};