# MCQ Platform Backend

A Node.js/Express backend for the MCQ (Multiple Choice Questions) testing platform with SQLite database.

## Features

- User authentication and authorization (JWT)
- Quiz management with categories
- User progress tracking
- Admin dashboard with statistics
- Password reset functionality
- SQLite database for data persistence

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **CORS**: cors

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000` by default.

## Database

The application uses SQLite database (`mcq_platform.db`) which is automatically created and initialized when the server starts.

### Database Schema

- **users**: User accounts with authentication
- **categories**: Quiz categories
- **quizzes**: Quiz definitions
- **questions**: Individual questions
- **quiz_attempts**: User quiz attempts
- **user_answers**: Individual question answers

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| GET | `/profile` | Get current user profile | Yes |

### Quizzes (`/api/quizzes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all published quizzes | No |
| GET | `/:id` | Get quiz details | No |
| POST | `/` | Create new quiz | Admin |
| PUT | `/:id` | Update quiz | Admin |
| DELETE | `/:id` | Delete quiz | Admin |
| POST | `/:id/attempt` | Submit quiz attempt | Yes |
| GET | `/:id/results/:attemptId` | Get quiz results | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| GET | `/quiz-attempts` | Get user's quiz attempts | Yes |
| GET | `/statistics` | Get user's statistics | Yes |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard-stats` | Get dashboard statistics | Admin |
| GET | `/users` | Get all users | Admin |
| PUT | `/users/:id` | Update user status/role | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/quiz-attempts` | Get all quiz attempts | Admin |
| POST | `/categories` | Create category | Admin |
| GET | `/categories` | Get all categories | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |
| GET | `/settings` | Get system settings | Admin |
| PUT | `/settings` | Update system settings | Admin |

### Categories (`/api/categories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all categories | No |
| GET | `/:id` | Get category with quizzes | No |
| POST | `/` | Create category | Admin |
| PUT | `/:id` | Update category | Admin |
| DELETE | `/:id` | Delete category | Admin |

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **user**: Regular user with access to quizzes and profile management
- **admin**: Administrator with full access to all endpoints including user management

## Default Admin Account

When the server starts, a default admin account is created:
- Email: `admin@mcqplatform.com`
- Password: `admin123`

**Important**: Change this password after first login!

## Development

### Available Scripts

- `npm start`: Start the development server with nodemon
- `npm run dev`: Alternative development start command

### Environment Variables

- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT token signing (required)
- `NODE_ENV`: Environment mode (development/production)

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message description"
}
```

Validation errors return:

```json
{
  "errors": [
    {
      "msg": "Error message",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Add proper validation for all endpoints
3. Include authentication checks where required
4. Test endpoints with tools like Postman or curl
5. Update this README for any new endpoints

## License

This project is part of the MCQ Platform application.