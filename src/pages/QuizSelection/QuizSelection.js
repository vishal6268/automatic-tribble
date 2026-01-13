import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuizSelection.css';
import { quizzesAPI } from '../../services/adminApi';

const QuizSelection = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const email = localStorage.getItem('userEmail');
    if (!token) {
      navigate('/login');
      return;
    }
    setUserEmail(email);
    loadQuizzes();
  }, [navigate]);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const quizzesData = await quizzesAPI.getAll();
      // Filter only published quizzes
      const publishedQuizzes = quizzesData.filter(q => q.status === 'published' || q.status === 'Published');
      
      setQuizzes(publishedQuizzes);
      setFilteredQuizzes(publishedQuizzes);

      // Extract unique categories
      const uniqueCategories = [...new Set(publishedQuizzes.map(q => q.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterQuizzes(category, searchQuery);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterQuizzes(selectedCategory, query);
  };

  const filterQuizzes = (category, search) => {
    let filtered = quizzes;

    if (category !== 'all') {
      filtered = filtered.filter(q => q.category === category);
    }

    if (search) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.description && q.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredQuizzes(filtered);
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizDetails(true);
  };

  const handleCloseDetails = () => {
    setShowQuizDetails(false);
    setSelectedQuiz(null);
  };

  const handleStartQuiz = (quiz) => {
    // Store selected quiz info in localStorage
    localStorage.setItem('selectedQuizId', quiz.id);
    localStorage.setItem('selectedQuizTitle', quiz.title);
    // Store quiz selection in backend for user history
    const token = localStorage.getItem('userToken');
    fetch('http://localhost:5000/users/quiz-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quizId: quiz.id })
    });
    // Navigate to MCQ test page
    navigate('/test');
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedQuizId');
    localStorage.removeItem('selectedQuizTitle');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="quiz-selection-container">
        <div className="loading-spinner">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="quiz-selection-container">
      {/* Header */}
      <div className="quiz-selection-header">
        <div className="header-content">
          <div>
            <h1>📝 Choose Your Quiz</h1>
            <p>Select from our collection of quizzes and test your knowledge</p>
            <p className="user-info">Logged in as: <strong>{userEmail}</strong></p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="quiz-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search quizzes by title or description..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-filter">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryFilter('all')}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>Found <strong>{filteredQuizzes.length}</strong> quiz{filteredQuizzes.length !== 1 ? 'zes' : ''}</p>
      </div>

      {/* Quizzes Grid */}
      <div className="quizzes-grid">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <div className="quiz-card-header">
                <h3>{quiz.title}</h3>
                <span className="category-badge">{quiz.category}</span>
              </div>

              <div className="quiz-card-body">
                <p className="quiz-description">
                  {quiz.description || 'No description available'}
                </p>

                <div className="quiz-stats">
                  <div className="stat">
                    <span className="stat-icon">❓</span>
                    <div>
                      <span className="stat-label">Questions</span>
                      <span className="stat-value">{quiz.total_questions || 0}</span>
                    </div>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">⏱️</span>
                    <div>
                      <span className="stat-label">Time Limit</span>
                      <span className="stat-value">{quiz.time_limit ? quiz.time_limit + ' min' : 'No limit'}</span>
                    </div>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">📊</span>
                    <div>
                      <span className="stat-label">Difficulty</span>
                      <span className="stat-value">Mixed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="quiz-card-footer">
                <button
                  className="view-btn"
                  onClick={() => handleSelectQuiz(quiz)}
                >
                  View Details
                </button>
                <button
                  className="start-btn"
                  onClick={() => handleStartQuiz(quiz)}
                >
                  Start Quiz
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-quizzes">
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <h3>No Quizzes Found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Details Modal */}
      {showQuizDetails && selectedQuiz && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedQuiz.title}</h2>
              <button className="close-btn" onClick={handleCloseDetails}>✕</button>
            </div>

            <div className="modal-body">
              <div className="quiz-detail-section">
                <h3>📌 Quiz Information</h3>
                <div className="detail-item">
                  <span className="label">Category:</span>
                  <span className="value">{selectedQuiz.category}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Questions:</span>
                  <span className="value">{selectedQuiz.total_questions || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time Limit:</span>
                  <span className="value">{selectedQuiz.time_limit ? selectedQuiz.time_limit + ' minutes' : 'No limit'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className="value status-published">Published</span>
                </div>
              </div>

              <div className="quiz-detail-section">
                <h3>📝 Description</h3>
                <p className="description">
                  {selectedQuiz.description || 'No detailed description available.'}
                </p>
              </div>

              <div className="quiz-detail-section">
                <h3>💡 Instructions</h3>
                <ul className="instructions">
                  <li>Read each question carefully before selecting your answer</li>
                  <li>Each question has only one correct answer</li>
                  <li>You can navigate between questions using Next/Previous buttons</li>
                  <li>Your progress is automatically saved</li>
                  <li>You can review your answers before submitting</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseDetails}>
                Close
              </button>
              <button className="btn-start" onClick={() => {
                handleCloseDetails();
                handleStartQuiz(selectedQuiz);
              }}>
                Start Quiz →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSelection;
