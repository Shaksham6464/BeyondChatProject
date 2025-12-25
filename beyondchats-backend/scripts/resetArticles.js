// Reset all articles to is_updated = false
// This is useful if you want to re-enhance articles

const { db } = require('../database');

console.log('🔄 Resetting article flags...\n');

db.run(
  'UPDATE articles SET is_updated = 0 WHERE is_updated = 1',
  function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }

    console.log('✓ Reset', this.changes, 'article(s)');
    console.log('✓ All articles are now marked as original (not updated)\n');
    console.log('Ready to run: npm run enhance\n');
    
    db.close();
    process.exit(0);
  }
);