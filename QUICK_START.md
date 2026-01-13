# How to Use the MCQ Platform with Database

## Running the Application

### 1. Start Backend Server
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

### 2. Start Frontend (in another terminal)
```bash
npm start
# Runs on http://localhost:3000
```

---

## Database Location
- **File**: `backend/mcq_platform.db`
- **Type**: SQLite3
- **Auto-created** on first run

---

## Admin Login
- **Password**: `admin123`
- **Access**: Go to `/admin` path

---

## Key Features Implemented

### ✅ User Management
- Create new users
- Edit user details (role, status)
- Delete users
- View user details
- Search users by name/email

### ✅ Quiz Management
- Create new quizzes
- Edit quiz details
- Delete quizzes
- View quiz details
- Search quizzes by title/category

### ✅ Question Management
- Add questions to quizzes
- Edit questions
- Delete questions
- View all questions in a quiz
- Set correct answer for each question

### ✅ Dashboard Statistics
- Total users (real-time)
- Total quizzes (real-time)
- Total questions (real-time)
- Active users count (real-time)
- Recent users list
- Recent quizzes list

### ✅ Data Persistence
- All data saved to SQLite database
- Data persists after page refresh
- Data persists after application restart

---

## Database Tables

```
users
├── id, name, email, password
├── role, status
└── created_at, updated_at

quizzes
├── id, title, description
├── category_id, created_by
├── status, total_questions
└── created_at, updated_at

questions
├── id, quiz_id
├── question_text, options
├── correct_answer, explanation
└── created_at

categories
├── id, name, description
└── created_at

quiz_attempts
├── id, user_id, quiz_id
├── score, time_taken
└── completed_at

user_answers
├── id, attempt_id, question_id
├── user_answer, is_correct
└── points_earned
```

---

## API Endpoints

### Admin
- `GET /admin/users` - Get all users
- `GET /admin/dashboard-stats` - Get stats
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

### Quizzes
- `GET /quizzes` - Get all quizzes
- `POST /quizzes` - Create quiz
- `PUT /quizzes/:id` - Update quiz
- `DELETE /quizzes/:id` - Delete quiz

### Questions
- `GET /quizzes/:id/questions` - Get questions
- `POST /quizzes/:id/questions` - Add question
- `PUT /quizzes/:id/questions/:qId` - Update question
- `DELETE /quizzes/:id/questions/:qId` - Delete question

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

---

## File Structure

```
src/
├── services/
│   └── adminApi.js           # API service layer
├── pages/
│   └── Admin/
│       ├── Admin.js          # Admin panel component
│       └── Admin.css         # Styles
└── components/
    └── Auth/
        └── Auth.js           # Login component

backend/
├── server.js                 # Express server
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── quizzes.js
│   ├── users.js
│   └── categories.js
└── mcq_platform.db           # Database (SQLite3)
```

---

## Testing the Features

### Test 1: Create a User
1. Go to http://localhost:3000/admin
2. Login with password: `admin123`
3. Go to Users section
4. Click "+ Add New User"
5. Fill form and submit
6. Check dashboard - Total Users count increases ✅

### Test 2: Create a Quiz
1. Go to Quizzes section
2. Click "+ Create New Quiz"
3. Fill title and category
4. Submit
5. Check dashboard - Total Quizzes count increases ✅

### Test 3: Add Questions
1. Go to Quizzes section
2. Click "Questions" on any quiz
3. Click "+ Add New Question"
4. Fill question, options, correct answer
5. Submit
6. Check dashboard - Total Questions count increases ✅

### Test 4: Data Persistence
1. Create some data
2. Refresh the page (Ctrl+R)
3. Data is still there ✅
4. Close application
5. Restart both frontend and backend
6. Data is still in database ✅

---

## Environment Variables (Optional)

Create `.env` in backend folder:
```
PORT=5000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

---

## Support

For issues:
1. Check browser console (F12)
2. Check backend console
3. Verify database file exists
4. Verify both servers are running
5. Check `DATABASE_INTEGRATION.md` for detailed info
