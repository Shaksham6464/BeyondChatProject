import { Link } from 'react-router-dom';
import { FileText, Sparkles } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary-600 hover:text-primary-700">
            <Sparkles className="w-6 h-6" />
            <span>BeyondChats Articles</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>All Articles</span>
            </Link>
            
            <a
              href="http://localhost:3000/api/articles"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              API
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;