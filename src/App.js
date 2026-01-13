import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Styling
import './App.css';

// Components (src/components/ se)
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Auth from './components/Auth/Auth';

// Pages (src/pages/ se)
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Admin from './pages/Admin/Admin';
import Profile from './pages/Profile/Profile';
import Practice from './pages/Practice/Practice';
import QuizSelection from './pages/QuizSelection/QuizSelection';
import MCQTestPlatform from './pages/MCQTestPlatform'; // Tera main test code [cite: 145]

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/quiz-selection" element={<QuizSelection />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/test" element={<MCQTestPlatform />} /> {/* MCQ Portal Route [cite: 145] */}
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<Auth />} />
            <Route path="/reset-password/:token" element={<Auth />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;