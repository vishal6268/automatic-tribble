import React, { useState } from 'react';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for demonstration
  const stats = {
    totalUsers: 1250,
    totalQuizzes: 45,
    totalQuestions: 1250,
    activeUsers: 89
  };

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', joinDate: '2024-01-10', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joinDate: '2024-01-09', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', joinDate: '2024-01-08', status: 'Inactive' },
  ];

  const recentQuizzes = [
    { id: 1, title: 'JavaScript Basics', createdBy: 'Admin', questions: 20, status: 'Published' },
    { id: 2, title: 'React Fundamentals', createdBy: 'Admin', questions: 15, status: 'Draft' },
    { id: 3, title: 'CSS Advanced', createdBy: 'Admin', questions: 25, status: 'Published' },
  ];

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
          <span className="stat-icon">👥</span>
        </div>
        <div className="stat-card">
          <h3>{stats.totalQuizzes}</h3>
          <p>Total Quizzes</p>
          <span className="stat-icon">📝</span>
        </div>
        <div className="stat-card">
          <h3>{stats.totalQuestions}</h3>
          <p>Total Questions</p>
          <span className="stat-icon">❓</span>
        </div>
        <div className="stat-card">
          <h3>{stats.activeUsers}</h3>
          <p>Active Users</p>
          <span className="stat-icon">🔥</span>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Recent Users</h3>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.joinDate}</td>
                    <td>
                      <span className={`status ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Recent Quizzes</h3>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Created By</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentQuizzes.map(quiz => (
                  <tr key={quiz.id}>
                    <td>{quiz.title}</td>
                    <td>{quiz.createdBy}</td>
                    <td>{quiz.questions}</td>
                    <td>
                      <span className={`status ${quiz.status.toLowerCase()}`}>
                        {quiz.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn view">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-section">
      <h2>User Management</h2>
      <div className="section-header">
        <button className="primary-btn">Add New User</button>
        <input type="text" placeholder="Search users..." className="search-input" />
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>User</td>
                <td>{user.joinDate}</td>
                <td>
                  <span className={`status ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn delete">Delete</button>
                  <button className="action-btn ban">Ban</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQuizzes = () => (
    <div className="admin-section">
      <h2>Quiz Management</h2>
      <div className="section-header">
        <button className="primary-btn">Create New Quiz</button>
        <input type="text" placeholder="Search quizzes..." className="search-input" />
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Questions</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentQuizzes.map(quiz => (
              <tr key={quiz.id}>
                <td>{quiz.id}</td>
                <td>{quiz.title}</td>
                <td>Programming</td>
                <td>{quiz.questions}</td>
                <td>{quiz.createdBy}</td>
                <td>
                  <span className={`status ${quiz.status.toLowerCase()}`}>
                    {quiz.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn view">View</button>
                  <button className="action-btn delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="admin-section">
      <h2>System Settings</h2>
      <div className="settings-grid">
        <div className="setting-card">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label>Site Title</label>
            <input type="text" defaultValue="MCQ Platform" />
          </div>
          <div className="setting-item">
            <label>Site Description</label>
            <textarea defaultValue="Online MCQ testing platform"></textarea>
          </div>
          <div className="setting-item">
            <label>Maintenance Mode</label>
            <input type="checkbox" />
          </div>
        </div>

        <div className="setting-card">
          <h3>Email Settings</h3>
          <div className="setting-item">
            <label>SMTP Host</label>
            <input type="text" placeholder="smtp.example.com" />
          </div>
          <div className="setting-item">
            <label>SMTP Port</label>
            <input type="number" placeholder="587" />
          </div>
          <div className="setting-item">
            <label>Email Templates</label>
            <button className="secondary-btn">Configure</button>
          </div>
        </div>

        <div className="setting-card">
          <h3>Security Settings</h3>
          <div className="setting-item">
            <label>Password Requirements</label>
            <select>
              <option>Basic (6+ chars)</option>
              <option>Strong (8+ chars, mixed)</option>
              <option>Very Strong (12+ chars, complex)</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Session Timeout (minutes)</label>
            <input type="number" defaultValue="60" />
          </div>
          <div className="setting-item">
            <label>Two-Factor Authentication</label>
            <input type="checkbox" />
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="primary-btn">Save Changes</button>
        <button className="secondary-btn">Reset to Defaults</button>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={`nav-item ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            📝 Quizzes
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'quizzes' && renderQuizzes()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default Admin;