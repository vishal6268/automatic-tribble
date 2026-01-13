import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './test.css';
import { questionsAPI } from '../../services/adminApi';

const MCQTestPlatform = () => {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizId, setQuizId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    // Check authentication
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      navigate('/login');
      return;
    }

    // Load selected quiz
    const selectedQuizId = localStorage.getItem('selectedQuizId');
    const selectedQuizTitle = localStorage.getItem('selectedQuizTitle');

    if (!selectedQuizId) {
      navigate('/practice');
      return;
    }

    setQuizId(selectedQuizId);
    setQuizTitle(selectedQuizTitle);
    loadQuestions(selectedQuizId);
  }, [navigate]);

  const loadQuestions = async (quizId) => {
    setLoading(true);
    try {
      const questionsData = await questionsAPI.getByQuiz(quizId);
      
      // Parse options if they're stored as JSON strings
      const parsedQuestions = questionsData.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }));
      
      setQuestions(parsedQuestions);
      // Initialize answers object
      const answers = {};
      parsedQuestions.forEach((q, idx) => {
        answers[idx] = null;
      });
      setUserAnswers(answers);
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Failed to load quiz questions');
      navigate('/practice');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    // Set timer if needed (e.g., 30 seconds per question)
    const totalTime = questions.length * 30; // 30 seconds per question
    setTimeLeft(totalTime);
  };

  const handleAnswerSelect = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = () => {
    // Calculate score
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) {
        score++;
      }
    });
    setShowResults(true);
  };

  const handleBackToQuizzes = () => {
    localStorage.removeItem('selectedQuizId');
    localStorage.removeItem('selectedQuizTitle');
    navigate('/practice');
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
      <div className="test-container">
        <div className="loading">Loading quiz...</div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="test-container">
        <div className="quiz-intro">
          <div className="intro-header">
            <h1>{quizTitle}</h1>
            <button className="logout-link" onClick={handleLogout}>Logout</button>
          </div>

          <div className="intro-content">
            <div className="intro-info">
              <h2>Quiz Instructions</h2>
              <ul>
                <li>Read each question carefully</li>
                <li>Select the most appropriate answer</li>
                <li>You can review your answers before submitting</li>
                <li>Once submitted, you cannot change your answers</li>
                <li>Your score will be recorded</li>
              </ul>

              <div className="quiz-details">
                <div className="detail-card">
                  <span className="detail-label">Total Questions</span>
                  <span className="detail-value">{questions.length}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">Unlimited</span>
                </div>
              </div>
            </div>

            <button className="start-button" onClick={handleStartQuiz}>
              Start Quiz →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = Object.keys(userAnswers).reduce((sum, idx) => {
      return sum + (userAnswers[idx] === questions[idx].correct_answer ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / questions.length) * 100);
    const resultStatus = percentage >= 80 ? 'Pass' : percentage >= 50 ? 'Moderate' : 'Fail';
    const resultColor = percentage >= 80 ? '#2ecc71' : percentage >= 50 ? '#f39c12' : '#e74c3c';

    return (
      <div className="test-container">
        <div className="results-page">
          <div className="results-header">
            <h1>Quiz Completed!</h1>
            <p>{quizTitle}</p>
          </div>

          <div className="results-body">
            <div className="score-display">
              <div className="score-circle" style={{ borderColor: resultColor }}>
                <div className="score-text">
                  <span className="score-number">{score}/{questions.length}</span>
                  <span className="score-label">Correct</span>
                </div>
              </div>

              <div className="score-details">
                <div className="score-item">
                  <span className="score-label">Percentage</span>
                  <span className="score-value" style={{ color: resultColor }}>{percentage}%</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Result</span>
                  <span className="score-value" style={{ color: resultColor }}>{resultStatus}</span>
                </div>
              </div>
            </div>

            <div className="review-section">
              <h3>Answer Review</h3>
              <div className="review-list">
                {questions.map((q, idx) => (
                  <div key={idx} className="review-item">
                    <div className="review-number">Q{idx + 1}</div>
                    <div className="review-content">
                      <p className="review-question">{q.question_text}</p>
                      <div className="review-answers">
                        <span className="your-answer">Your Answer: <strong>{userAnswers[idx] || 'Not answered'}</strong></span>
                        <span className={`correct-answer ${userAnswers[idx] === q.correct_answer ? 'correct' : 'incorrect'}`}>
                          Correct Answer: <strong>{q.correct_answer}</strong>
                        </span>
                      </div>
                    </div>
                    <div className={`review-status ${userAnswers[idx] === q.correct_answer ? 'correct' : 'incorrect'}`}>
                      {userAnswers[idx] === q.correct_answer ? '✓' : '✗'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="results-footer">
            <button className="back-btn" onClick={handleBackToQuizzes}>
              ← Back to Quizzes
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  return (
    <div className="test-container">
      <div className="test-header">
        <div className="header-left">
          <button className="back-link" onClick={handleBackToQuizzes}>← Back</button>
          <h2>{quizTitle}</h2>
        </div>
        <div className="header-right">
          <span className="question-counter">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="test-content">
        <div className="question-section">
          <h3 className="question-text">{currentQuestion.question_text}</h3>

          <div className="options-container">
            {currentQuestion.options && currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                className={`option-btn ${currentAnswer === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option)}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button
            className="nav-btn prev-btn"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </button>

          <div className="question-indicators">
            {questions.map((_, idx) => (
              <button
                key={idx}
                className={`indicator ${idx === currentQuestionIndex ? 'current' : ''} ${userAnswers[idx] !== null ? 'answered' : ''}`}
                onClick={() => setCurrentQuestionIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            className="nav-btn next-btn"
            onClick={handleNext}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MCQTestPlatform;