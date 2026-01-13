const API_BASE_URL = 'http://localhost:5000';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('adminToken') || '';
};

// ============ USERS API ============

export const usersAPI = {
  // Get all users
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Create new user
  create: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: 'defaultPassword123', // Default password for admin-created users
          role: userData.role
        })
      });
      if (!response.ok) throw new Error('Failed to create user');
      const data = await response.json();
      return data.user || data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  update: async (userId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          status: updateData.status,
          role: updateData.role
        })
      });
      if (!response.ok) throw new Error('Failed to update user');
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  delete: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// ============ QUIZZES API ============

export const quizzesAPI = {
  // Get all quizzes
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes?limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      const data = await response.json();
      return data.quizzes || [];
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  },

  // Create new quiz
  create: async (quizData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: quizData.title,
          description: quizData.category,
          category_id: 1, // Default category
          status: quizData.status
        })
      });
      if (!response.ok) throw new Error('Failed to create quiz');
      const data = await response.json();
      return data.quiz || data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  // Update quiz
  update: async (quizId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: updateData.title,
          description: updateData.category,
          status: updateData.status
        })
      });
      if (!response.ok) throw new Error('Failed to update quiz');
      return await response.json();
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  // Delete quiz
  delete: async (quizId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete quiz');
      return await response.json();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }
};

// ============ QUESTIONS API ============

export const questionsAPI = {
  // Get questions for a quiz
  getByQuiz: async (quizId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/questions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  // Create question
  create: async (quizId, questionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          question_text: questionData.question,
          options: JSON.stringify(questionData.options),
          correct_answer: questionData.options[questionData.correctAnswer]
        })
      });
      if (!response.ok) throw new Error('Failed to create question');
      const data = await response.json();
      return data.question || data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  // Update question
  update: async (quizId, questionId, questionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          question_text: questionData.question,
          options: JSON.stringify(questionData.options),
          correct_answer: questionData.options[questionData.correctAnswer]
        })
      });
      if (!response.ok) throw new Error('Failed to update question');
      return await response.json();
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Delete question
  delete: async (quizId, questionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete question');
      return await response.json();
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }
};

// ============ DASHBOARD STATS API ============

export const statsAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  }
};
// ============ LEADERBOARD API ============

export const leaderboardAPI = {
  // Get leaderboard
  getLeaderboard: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard/leaderboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      return data.leaderboard || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Get user quiz history
  getUserQuizHistory: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard/user-quiz-history/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user quiz history');
      const data = await response.json();
      return data.quizHistory || [];
    } catch (error) {
      console.error('Error fetching user quiz history:', error);
      return [];
    }
  },

  // Get quiz stats
  getQuizStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard/quiz-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch quiz stats');
      const data = await response.json();
      return data.quizStats || [];
    } catch (error) {
      console.error('Error fetching quiz stats:', error);
      return [];
    }
  },

  // Get platform stats
  getPlatformStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard/platform-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch platform stats');
      const data = await response.json();
      return data.stats || {};
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {};
    }
  }
};