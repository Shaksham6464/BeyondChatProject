import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ComparisonPage from './pages/ComparisonPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticleDetailPage />} />
            <Route path="/compare/:originalId/:enhancedId" element={<ComparisonPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;