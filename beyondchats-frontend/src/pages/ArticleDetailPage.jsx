import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import { ArrowLeft, Calendar, User, ExternalLink, Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getById(id);
      setArticle(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load article');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || 'Article not found'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Articles
      </button>

      {/* Article Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <span className={`badge ${article.is_updated ? 'badge-enhanced' : 'badge-original'}`}>
            {article.is_updated ? (
              <>
                <Sparkles className="w-4 h-4 inline mr-1" />
                Enhanced Version
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 inline mr-1" />
                Original Article
              </>
            )}
          </span>
          <span className="text-sm text-gray-500">ID: {article.id}</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          {article.author && (
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              <span>{article.author}</span>
            </div>
          )}
          
          {article.published_date && (
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{new Date(article.published_date).toLocaleDateString()}</span>
            </div>
          )}

          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              <span>View Source</span>
            </a>
          )}
        </div>

        {/* Compare Button */}
        {article.is_updated && article.original_article_id && (
          <Link
            to={`/compare/${article.original_article_id}/${article.id}`}
            className="btn-primary inline-block mb-6"
          >
            Compare with Original Version
          </Link>
        )}

        {/* Image */}
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
      </div>

      {/* Article Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="prose max-w-none">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </div>

      {/* References */}
      {article.reference_links && article.reference_links.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">References</h2>
          <ul className="space-y-2">
            {article.reference_links.map((ref, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary-600 font-semibold mr-2">{index + 1}.</span>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline flex items-center"
                >
                  {ref.title}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ArticleDetailPage;