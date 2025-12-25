import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function ComparisonPage() {
  const { originalId, enhancedId } = useParams();
  const navigate = useNavigate();
  const [originalArticle, setOriginalArticle] = useState(null);
  const [enhancedArticle, setEnhancedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, [originalId, enhancedId]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const [originalRes, enhancedRes] = await Promise.all([
        articlesAPI.getById(originalId),
        articlesAPI.getById(enhancedId)
      ]);
      setOriginalArticle(originalRes.data);
      setEnhancedArticle(enhancedRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (error || !originalArticle || !enhancedArticle) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || 'Articles not found'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Articles
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Article Comparison
        </h1>
        <p className="text-gray-600">
          Side-by-side view of original and enhanced versions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Original Length</p>
          <p className="text-2xl font-bold text-blue-600">
            {originalArticle.content.length} chars
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Enhanced Length</p>
          <p className="text-2xl font-bold text-green-600">
            {enhancedArticle.content.length} chars
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Change</p>
          <p className={`text-2xl font-bold ${
            enhancedArticle.content.length > originalArticle.content.length
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {enhancedArticle.content.length > originalArticle.content.length ? '+' : ''}
            {((enhancedArticle.content.length - originalArticle.content.length) / originalArticle.content.length * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Side by Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Article */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-900">Original Article</h2>
            </div>
            <p className="text-sm text-blue-700 mt-1">ID: {originalArticle.id}</p>
          </div>
          
          <div className="p-6 max-h-[800px] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {originalArticle.title}
            </h3>
            
            {originalArticle.author && (
              <p className="text-sm text-gray-600 mb-4">
                By {originalArticle.author}
              </p>
            )}
            
            <div className="prose max-w-none">
              <ReactMarkdown>{originalArticle.content}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Enhanced Article */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-green-900">Enhanced Article</h2>
            </div>
            <p className="text-sm text-green-700 mt-1">ID: {enhancedArticle.id}</p>
          </div>
          
          <div className="p-6 max-h-[800px] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {enhancedArticle.title}
            </h3>
            
            {enhancedArticle.author && (
              <p className="text-sm text-gray-600 mb-4">
                By {enhancedArticle.author}
              </p>
            )}
            
            <div className="prose max-w-none">
              <ReactMarkdown>{enhancedArticle.content}</ReactMarkdown>
            </div>

            {/* References */}
            {enhancedArticle.reference_links && enhancedArticle.reference_links.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-lg font-bold text-gray-900 mb-3">References</h4>
                <ul className="space-y-2 text-sm">
                  {enhancedArticle.reference_links.map((ref, index) => (
                    <li key={index}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {index + 1}. {ref.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComparisonPage;