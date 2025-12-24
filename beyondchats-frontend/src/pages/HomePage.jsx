import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import { FileText, Sparkles, Calendar, User, ExternalLink, ArrowRight } from 'lucide-react';

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'original', 'enhanced'

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getAll();
      setArticles(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load articles. Make sure the backend server is running.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'original') return !article.is_updated;
    if (filter === 'enhanced') return article.is_updated;
    return true;
  });

  const originalArticles = articles.filter(a => !a.is_updated);
  const enhancedArticles = articles.filter(a => a.is_updated);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button 
            onClick={fetchArticles}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Article Management System
        </h1>
        <p className="text-lg text-gray-600">
          View and compare original articles with their AI-enhanced versions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900">{articles.length}</p>
            </div>
            <FileText className="w-12 h-12 text-primary-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Original Articles</p>
              <p className="text-3xl font-bold text-blue-600">{originalArticles.length}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Enhanced Articles</p>
              <p className="text-3xl font-bold text-green-600">{enhancedArticles.length}</p>
            </div>
            <Sparkles className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          All ({articles.length})
        </button>
        <button
          onClick={() => setFilter('original')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'original'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Original ({originalArticles.length})
        </button>
        <button
          onClick={() => setFilter('enhanced')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'enhanced'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Enhanced ({enhancedArticles.length})
        </button>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No articles found.</p>
          <p className="text-sm text-gray-500">Run <code className="bg-gray-100 px-2 py-1 rounded">npm run scrape</code> to add articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }) {
  return (
    <div className="card group">
      <div className="flex items-start justify-between mb-3">
        <span className={`badge ${article.is_updated ? 'badge-enhanced' : 'badge-original'}`}>
          {article.is_updated ? (
            <>
              <Sparkles className="w-3 h-3 inline mr-1" />
              Enhanced
            </>
          ) : (
            <>
              <FileText className="w-3 h-3 inline mr-1" />
              Original
            </>
          )}
        </span>
        <span className="text-xs text-gray-500">ID: {article.id}</span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {article.title}
      </h3>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {article.content?.substring(0, 150)}...
      </p>

      <div className="flex items-center text-xs text-gray-500 space-x-4 mb-4">
        {article.author && (
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {article.author}
          </div>
        )}
        {article.published_date && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(article.published_date).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-4 border-t">
        <Link
          to={`/article/${article.id}`}
          className="flex-1 btn-primary text-center"
        >
          View Details
          <ArrowRight className="w-4 h-4 inline ml-1" />
        </Link>
        
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            title="View original source"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {article.is_updated && article.original_article_id && (
        <Link
          to={`/compare/${article.original_article_id}/${article.id}`}
          className="mt-2 w-full btn-secondary text-center text-sm"
        >
          Compare with Original
        </Link>
      )}
    </div>
  );
}

export default HomePage;