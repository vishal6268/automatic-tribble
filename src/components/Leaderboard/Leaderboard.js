import React, { useState, useEffect } from 'react';
import './Leaderboard.css';
import { leaderboardAPI } from '../../services/adminApi';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [quizStats, setQuizStats] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [leaderboardData, quizStatsData, platformStatsData] = await Promise.all([
        leaderboardAPI.getLeaderboard(),
        leaderboardAPI.getQuizStats(),
        leaderboardAPI.getPlatformStats()
      ]);
      
      setLeaderboard(leaderboardData);
      setQuizStats(quizStatsData);
      setPlatformStats(platformStatsData);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    const history = await leaderboardAPI.getUserQuizHistory(user.id);
    setUserHistory(history);
  };

  const getResultColor = (result) => {
    if (result === 'Pass') return '#4caf50';
    if (result === 'Moderate') return '#ff9800';
    return '#f44336';
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return '#4caf50';
    if (accuracy >= 50) return '#ff9800';
    return '#f44336';
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>📊 Leaderboard & Statistics</h1>
        <p>Track user performance and quiz statistics</p>
      </div>

      {/* Platform Stats Overview */}
      {platformStats && (
        <div className="platform-stats-section">
          <div className="stat-card">
            <div className="stat-number">{platformStats.total_users || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{platformStats.total_quizzes || 0}</div>
            <div className="stat-label">Total Quizzes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{platformStats.total_attempts || 0}</div>
            <div className="stat-label">Total Attempts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{platformStats.overall_accuracy?.toFixed(2) || 0}%</div>
            <div className="stat-label">Avg Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{platformStats.avg_time_per_attempt ? formatTime(platformStats.avg_time_per_attempt) : 'N/A'}</div>
            <div className="stat-label">Avg Time</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Top Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          📝 Quiz Statistics
        </button>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="leaderboard-content">
          <div className="leaderboard-section">
            <h2>🏆 Top Performers</h2>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User Name</th>
                  <th>Quizzes</th>
                  <th>Attempts</th>
                  <th>Total Score</th>
                  <th>Accuracy</th>
                  <th>Avg Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((user, index) => (
                    <tr key={user.id} className={index < 3 ? 'top-rank' : ''}>
                      <td>
                        <span className="rank-badge">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </span>
                      </td>
                      <td className="user-name">{user.name}</td>
                      <td>{user.quizzes_attempted || 0}</td>
                      <td>{user.total_attempts || 0}</td>
                      <td className="score-cell">
                        <strong>{user.total_score || 0}</strong>
                      </td>
                      <td>
                        <div className="accuracy-badge" style={{ backgroundColor: getAccuracyColor(user.average_accuracy || 0) }}>
                          {(user.average_accuracy || 0).toFixed(2)}%
                        </div>
                      </td>
                      <td>{formatTime(user.avg_time_taken)}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => handleUserClick(user)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      No quiz attempts yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* User Details Modal */}
          {selectedUser && (
            <div className="user-details-section">
              <div className="user-header">
                <h2>{selectedUser.name}'s Quiz History</h2>
                <button className="close-btn" onClick={() => setSelectedUser(null)}>✕</button>
              </div>
              
              <div className="user-summary">
                <div className="summary-item">
                  <span className="label">Quizzes Attempted:</span>
                  <span className="value">{selectedUser.quizzes_attempted || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Attempts:</span>
                  <span className="value">{selectedUser.total_attempts || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Score:</span>
                  <span className="value" style={{ color: '#2196f3' }}>{selectedUser.total_score || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Average Accuracy:</span>
                  <span className="value" style={{ color: getAccuracyColor(selectedUser.average_accuracy || 0) }}>
                    {(selectedUser.average_accuracy || 0).toFixed(2)}%
                  </span>
                </div>
              </div>

              <table className="user-history-table">
                <thead>
                  <tr>
                    <th>Quiz Name</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Questions</th>
                    <th>Accuracy</th>
                    <th>Time Taken</th>
                    <th>Result</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userHistory.length > 0 ? (
                    userHistory.map((attempt) => (
                      <tr key={attempt.attempt_id}>
                        <td className="quiz-title">{attempt.quiz_title}</td>
                        <td>{attempt.category || 'N/A'}</td>
                        <td className="score-cell"><strong>{attempt.score}/{attempt.total_questions}</strong></td>
                        <td>{attempt.total_questions}</td>
                        <td>
                          <div className="accuracy-badge" style={{ backgroundColor: getAccuracyColor(attempt.accuracy) }}>
                            {attempt.accuracy.toFixed(2)}%
                          </div>
                        </td>
                        <td>{formatTime(attempt.time_taken)}</td>
                        <td>
                          <span className="result-badge" style={{ backgroundColor: getResultColor(attempt.result) }}>
                            {attempt.result}
                          </span>
                        </td>
                        <td>{new Date(attempt.completed_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        No quiz attempts
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quiz Statistics Tab */}
      {activeTab === 'quizzes' && (
        <div className="quizzes-stats-section">
          <h2>📈 Quiz Performance Statistics</h2>
          <div className="quiz-stats-grid">
            {quizStats.length > 0 ? (
              quizStats.map((quiz) => (
                <div key={quiz.id} className="quiz-stat-card">
                  <div className="quiz-stat-header">
                    <h3>{quiz.title}</h3>
                    <span className="category-tag">{quiz.category || 'General'}</span>
                  </div>
                  
                  <div className="quiz-stat-info">
                    <div className="stat-item">
                      <span className="stat-label">👥 Participants</span>
                      <span className="stat-value">{quiz.total_participants || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">📊 Attempts</span>
                      <span className="stat-value">{quiz.total_attempts || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">🎯 Avg Accuracy</span>
                      <span className="stat-value" style={{ color: getAccuracyColor(quiz.avg_accuracy) }}>
                        {(quiz.avg_accuracy || 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">⏱️ Avg Time</span>
                      <span className="stat-value">{formatTime(quiz.avg_time_taken)}</span>
                    </div>
                  </div>

                  {/* Simple accuracy bar graph */}
                  <div className="accuracy-bar-container">
                    <div className="accuracy-bar">
                      <div 
                        className="accuracy-fill"
                        style={{
                          width: `${Math.min(quiz.avg_accuracy || 0, 100)}%`,
                          backgroundColor: getAccuracyColor(quiz.avg_accuracy || 0)
                        }}
                      ></div>
                    </div>
                    <span className="bar-label">{(quiz.avg_accuracy || 0).toFixed(1)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                No quiz data available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;