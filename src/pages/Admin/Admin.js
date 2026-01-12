import React, { useState } from 'react';
import './Admin.css';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Admin password - in a real app, this would be handled securely on the backend
  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin password');
    }
  };

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

  const renderLoginForm = () => (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>🔒 Admin Access</h1>
        <p>Enter the admin password to access the dashboard</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-password">Admin Password</label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          <button type="submit" className="admin-login-btn">
            Access Admin Panel
          </button>
        </form>

        <div className="admin-login-info">
          <p><strong>Demo Password:</strong> admin123</p>
          <small>This is for demonstration purposes only. In production, use secure authentication.</small>
        </div>
      </div>
    </div>
  );

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

  if (!isAuthenticated) {
    return renderLoginForm();
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <button
            className="logout-btn"
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
              setError('');
            }}
          >
            Logout
          </button>
        </div>
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