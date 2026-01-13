import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import { usersAPI, quizzesAPI, questionsAPI } from '../../services/adminApi';

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Quiz Management States
  const [quizzes, setQuizzes] = useState([
    { 
      id: 1, 
      title: 'JavaScript Basics', 
      createdBy: 'Admin', 
      questions: 2, 
      status: 'Published', 
      category: 'Programming', 
      createdDate: '2024-01-10',
      questionsList: [
        { id: 1, question: 'What is JavaScript?', options: ['A scripting language', 'A coffee brand', 'A movie'], correctAnswer: 0 },
        { id: 2, question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language'], correctAnswer: 0 }
      ]
    },
    { 
      id: 2, 
      title: 'React Fundamentals', 
      createdBy: 'Admin', 
      questions: 1, 
      status: 'Draft', 
      category: 'Programming', 
      createdDate: '2024-01-09',
      questionsList: [
        { id: 1, question: 'What is React?', options: ['A library', 'A framework', 'A language'], correctAnswer: 0 }
      ]
    },
    { 
      id: 3, 
      title: 'CSS Advanced', 
      createdBy: 'Admin', 
      questions: 1, 
      status: 'Published', 
      category: 'Web Design', 
      createdDate: '2024-01-08',
      questionsList: [
        { id: 1, question: 'What is CSS?', options: ['Cascading Style Sheets', 'Computer Style System', 'Coding Style Source'], correctAnswer: 0 }
      ]
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingQuiz, setViewingQuiz] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // User Management States
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', joinDate: '2024-01-10', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', joinDate: '2024-01-09', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', joinDate: '2024-01-08', status: 'Inactive' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User', joinDate: '2024-01-07', status: 'Active' },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    questions: '',
    status: 'Draft'
  });
  
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'User',
    status: 'Active'
  });
  
  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  // Admin password - in a real app, this would be handled securely on the backend
  const ADMIN_PASSWORD = 'admin123';

  // Load data from database when component mounts
  useEffect(() => {
    loadAllData();
  }, []);

  // Load all data from database
  const loadAllData = async () => {
    try {
      // Load users
      const usersData = await usersAPI.getAll();
      if (usersData && usersData.length > 0) {
        setUsers(usersData.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'User',
          joinDate: user.created_at ? user.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
          status: user.status === 'active' ? 'Active' : 'Inactive'
        })));
      }

      // Load quizzes
      const quizzesData = await quizzesAPI.getAll();
      if (quizzesData && quizzesData.length > 0) {
        setQuizzes(quizzesData.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          category: quiz.description || 'General',
          questions: quiz.total_questions || 0,
          status: quiz.status === 'draft' ? 'Draft' : 'Published',
          createdBy: quiz.creator_name || 'Admin',
          createdDate: quiz.created_at ? quiz.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
          questionsList: []
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin password');
    }
  };

  // Quiz Management Functions
  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setFormData({ title: '', category: '', questions: '', status: 'Draft' });
    setShowQuizModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      category: quiz.category,
      questions: quiz.questions,
      status: quiz.status
    });
    setShowQuizModal(true);
  };

  const handleViewQuiz = (quiz) => {
    setViewingQuiz(quiz);
  };

  const handleDeleteQuiz = (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      quizzesAPI.delete(id).then(() => {
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
        alert('Quiz deleted successfully');
      }).catch(error => {
        alert('Error deleting quiz: ' + error.message);
      });
    }
  };

  const handleSaveQuiz = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      alert('Please fill in all fields');
      return;
    }

    if (editingQuiz) {
      // Update existing quiz
      quizzesAPI.update(editingQuiz.id, {
        title: formData.title,
        category: formData.category,
        status: formData.status.toLowerCase()
      }).then(() => {
        setQuizzes(quizzes.map(quiz =>
          quiz.id === editingQuiz.id
            ? {
                ...quiz,
                title: formData.title,
                category: formData.category,
                status: formData.status
              }
            : quiz
        ));
        alert('Quiz updated successfully');
        setShowQuizModal(false);
        setEditingQuiz(null);
        setFormData({ title: '', category: '', questions: '', status: 'Draft' });
      }).catch(error => {
        alert('Error updating quiz: ' + error.message);
      });
    } else {
      // Create new quiz
      quizzesAPI.create({
        title: formData.title,
        category: formData.category,
        status: formData.status.toLowerCase()
      }).then(() => {
        loadAllData(); // Reload quizzes from database
        alert('Quiz created successfully');
        setShowQuizModal(false);
        setFormData({ title: '', category: '', questions: '', status: 'Draft' });
      }).catch(error => {
        alert('Error creating quiz: ' + error.message);
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Question Management Functions
  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionFormData({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer
    });
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (quizId, questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuizzes(quizzes.map(quiz =>
        quiz.id === quizId
          ? {
              ...quiz,
              questionsList: quiz.questionsList.filter(q => q.id !== questionId),
              questions: quiz.questionsList.filter(q => q.id !== questionId).length
            }
          : quiz
      ));
      alert('Question deleted successfully');
    }
  };

  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const index = parseInt(name.split('-')[1]);
      setQuestionFormData(prev => {
        const newOptions = [...prev.options];
        newOptions[index] = value;
        return { ...prev, options: newOptions };
      });
    } else {
      setQuestionFormData(prev => ({
        ...prev,
        [name]: name === 'correctAnswer' ? parseInt(value) : value
      }));
    }
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    
    if (!questionFormData.question || questionFormData.options.some(opt => !opt)) {
      alert('Please fill in all question and option fields');
      return;
    }

    const currentQuiz = editingQuiz;
    if (!currentQuiz) return;

    if (editingQuestion) {
      // Update existing question
      setQuizzes(quizzes.map(quiz =>
        quiz.id === currentQuiz.id
          ? {
              ...quiz,
              questionsList: quiz.questionsList.map(q =>
                q.id === editingQuestion.id
                  ? {
                      ...q,
                      question: questionFormData.question,
                      options: questionFormData.options,
                      correctAnswer: questionFormData.correctAnswer
                    }
                  : q
              )
            }
          : quiz
      ));
      alert('Question updated successfully');
    } else {
      // Create new question
      setQuizzes(quizzes.map(quiz =>
        quiz.id === currentQuiz.id
          ? {
              ...quiz,
              questionsList: [
                ...quiz.questionsList,
                {
                  id: Math.max(...quiz.questionsList.map(q => q.id), 0) + 1,
                  question: questionFormData.question,
                  options: questionFormData.options,
                  correctAnswer: questionFormData.correctAnswer
                }
              ],
              questions: quiz.questionsList.length + 1
            }
          : quiz
      ));
      alert('Question added successfully');
    }

    setShowQuestionForm(false);
    setEditingQuestion(null);
    setQuestionFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });

    // Update editingQuiz for consistency
    const updatedQuiz = quizzes.find(q => q.id === currentQuiz.id);
    if (updatedQuiz) {
      setEditingQuiz(updatedQuiz);
    }
  };

  // User Management Functions
  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', role: 'User', status: 'Active' });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowUserModal(true);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      usersAPI.delete(id).then(() => {
        setUsers(users.filter(user => user.id !== id));
        alert('User deleted successfully');
      }).catch(error => {
        alert('Error deleting user: ' + error.message);
      });
    }
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    
    if (!userFormData.name || !userFormData.email) {
      alert('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userFormData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (editingUser) {
      // Update existing user
      usersAPI.update(editingUser.id, {
        status: userFormData.status.toLowerCase(),
        role: userFormData.role.toLowerCase()
      }).then(() => {
        setUsers(users.map(user =>
          user.id === editingUser.id
            ? {
                ...user,
                name: userFormData.name,
                email: userFormData.email,
                role: userFormData.role,
                status: userFormData.status
              }
            : user
        ));
        alert('User updated successfully');
        setShowUserModal(false);
        setUserFormData({ name: '', email: '', role: 'User', status: 'Active' });
      }).catch(error => {
        alert('Error updating user: ' + error.message);
      });
    } else {
      // Create new user
      usersAPI.create({
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role.toLowerCase()
      }).then(() => {
        loadAllData(); // Reload users from database
        alert('User created successfully');
        setShowUserModal(false);
        setUserFormData({ name: '', email: '', role: 'User', status: 'Active' });
      }).catch(error => {
        alert('Error creating user: ' + error.message);
      });
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic stats based on actual data
  const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions, 0);
  const activeUsersCount = users.filter(user => user.status === 'Active').length;
  
  const stats = {
    totalUsers: users.length,
    totalQuizzes: quizzes.length,
    totalQuestions: totalQuestions,
    activeUsers: activeUsersCount
  };

  // Get recent users (last 3)
  const recentUsers = [...users].reverse().slice(0, 3);

  // Get recent quizzes (last 3)
  const recentQuizzes = [...quizzes].reverse().slice(0, 3);

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
        <button className="primary-btn" onClick={handleCreateUser}>+ Add New User</button>
        <input 
          type="text" 
          placeholder="Search users by name or email..." 
          className="search-input"
          value={userSearchQuery}
          onChange={(e) => setUserSearchQuery(e.target.value)}
        />
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.joinDate}</td>
                  <td>
                    <span className={`status ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn view" onClick={() => handleViewUser(user)}>View</button>
                    <button className="action-btn edit" onClick={() => handleEditUser(user)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal - Create/Edit */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveUser} className="quiz-form">
              <div className="form-group">
                <label>User Name *</label>
                <input
                  type="text"
                  name="name"
                  value={userFormData.name}
                  onChange={handleUserFormChange}
                  placeholder="Enter user name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleUserFormChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserFormChange}
                  >
                    <option value="User">User</option>
                    <option value="Premium User">Premium User</option>
                    <option value="Moderator">Moderator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={userFormData.status}
                    onChange={handleUserFormChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-btn">
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
                <button type="button" className="secondary-btn" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close" onClick={() => setViewingUser(null)}>×</button>
            </div>
            
            <div className="quiz-details">
              <div className="detail-item">
                <label>ID:</label>
                <span>{viewingUser.id}</span>
              </div>
              <div className="detail-item">
                <label>Name:</label>
                <span>{viewingUser.name}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{viewingUser.email}</span>
              </div>
              <div className="detail-item">
                <label>Role:</label>
                <span>{viewingUser.role}</span>
              </div>
              <div className="detail-item">
                <label>Join Date:</label>
                <span>{viewingUser.joinDate}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status ${viewingUser.status.toLowerCase()}`}>
                  {viewingUser.status}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="primary-btn" onClick={() => {
                handleEditUser(viewingUser);
                setViewingUser(null);
              }}>
                Edit User
              </button>
              <button className="secondary-btn" onClick={() => setViewingUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderQuizzes = () => (
    <div className="admin-section">
      <h2>Quiz Management</h2>
      <div className="section-header">
        <button className="primary-btn" onClick={handleCreateQuiz}>+ Create New Quiz</button>
        <input 
          type="text" 
          placeholder="Search quizzes by title or category..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map(quiz => (
                <tr key={quiz.id}>
                  <td>{quiz.id}</td>
                  <td>{quiz.title}</td>
                  <td>{quiz.category}</td>
                  <td>{quiz.questions}</td>
                  <td>{quiz.createdBy}</td>
                  <td>
                    <span className={`status ${quiz.status.toLowerCase()}`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td>{quiz.createdDate}</td>
                  <td>
                    <button className="action-btn view" onClick={() => handleViewQuiz(quiz)}>View</button>
                    <button className="action-btn edit" onClick={() => {
                      handleEditQuiz(quiz);
                      setShowQuestionsModal(true);
                    }}>Questions</button>
                    <button className="action-btn edit" onClick={() => handleEditQuiz(quiz)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDeleteQuiz(quiz.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No quizzes found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h3>
              <button className="modal-close" onClick={() => setShowQuizModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveQuiz} className="quiz-form">
              <div className="form-group">
                <label>Quiz Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  placeholder="Enter category (e.g., Programming, Web Design)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-btn">
                  {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                </button>
                <button type="button" className="secondary-btn" onClick={() => setShowQuizModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Quiz Modal */}
      {viewingQuiz && (
        <div className="modal-overlay" onClick={() => setViewingQuiz(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Quiz Details</h3>
              <button className="modal-close" onClick={() => setViewingQuiz(null)}>×</button>
            </div>
            
            <div className="quiz-details">
              <div className="detail-item">
                <label>Title:</label>
                <span>{viewingQuiz.title}</span>
              </div>
              <div className="detail-item">
                <label>Category:</label>
                <span>{viewingQuiz.category}</span>
              </div>
              <div className="detail-item">
                <label>Number of Questions:</label>
                <span>{viewingQuiz.questions}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status ${viewingQuiz.status.toLowerCase()}`}>
                  {viewingQuiz.status}
                </span>
              </div>
              <div className="detail-item">
                <label>Created By:</label>
                <span>{viewingQuiz.createdBy}</span>
              </div>
              <div className="detail-item">
                <label>Created Date:</label>
                <span>{viewingQuiz.createdDate}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="primary-btn" onClick={() => {
                handleEditQuiz(viewingQuiz);
                setViewingQuiz(null);
              }}>
                Edit Quiz
              </button>
              <button className="secondary-btn" onClick={() => setViewingQuiz(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Questions Modal */}
      {showQuestionsModal && editingQuiz && (
        <div className="modal-overlay" onClick={() => setShowQuestionsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Questions - {editingQuiz.title}</h3>
              <button className="modal-close" onClick={() => setShowQuestionsModal(false)}>×</button>
            </div>
            
            <div className="questions-container">
              <button className="primary-btn" onClick={handleAddQuestion} style={{ marginBottom: '1.5rem' }}>
                + Add New Question
              </button>

              {editingQuiz.questionsList && editingQuiz.questionsList.length > 0 ? (
                <div className="questions-list">
                  {editingQuiz.questionsList.map((question, index) => (
                    <div key={question.id} className="question-item">
                      <div className="question-header">
                        <h4>Question {index + 1}</h4>
                        <div className="question-actions">
                          <button className="action-btn edit" onClick={() => handleEditQuestion(question)}>
                            Edit
                          </button>
                          <button className="action-btn delete" onClick={() => handleDeleteQuestion(editingQuiz.id, question.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="question-text"><strong>{question.question}</strong></p>
                      <div className="options-list">
                        {question.options.map((option, idx) => (
                          <div key={idx} className={`option ${idx === question.correctAnswer ? 'correct' : ''}`}>
                            <span className="option-letter">{String.fromCharCode(65 + idx)}.</span>
                            <span className="option-text">{option}</span>
                            {idx === question.correctAnswer && <span className="correct-badge">✓ Correct</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                  No questions added yet. Click "Add New Question" to get started.
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowQuestionsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Form Modal */}
      {showQuestionForm && editingQuiz && (
        <div className="modal-overlay" onClick={() => setShowQuestionForm(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
              <button className="modal-close" onClick={() => setShowQuestionForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveQuestion} className="question-form">
              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  name="question"
                  value={questionFormData.question}
                  onChange={handleQuestionFormChange}
                  placeholder="Enter the question"
                  rows="3"
                  required
                />
              </div>

              <div className="options-form">
                <label>Options *</label>
                {questionFormData.options.map((option, index) => (
                  <div key={index} className="option-input-group">
                    <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                    <input
                      type="text"
                      name={`option-${index}`}
                      value={option}
                      onChange={handleQuestionFormChange}
                      placeholder={`Enter option ${index + 1}`}
                      required
                    />
                    <label className="correct-answer-label">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={index}
                        checked={questionFormData.correctAnswer === index}
                        onChange={handleQuestionFormChange}
                      />
                      Correct Answer
                    </label>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-btn">
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
                <button type="button" className="secondary-btn" onClick={() => setShowQuestionForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
              navigate('/');
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