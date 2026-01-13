import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleStartPractice = () => {
    // Always redirect to login page for authentication
    navigate('/login');
  };

  return (
    <header className="hero-section">
      <div className="hero-content">
        <h1>Master Your Knowledge</h1>
        <p>
          Join thousands of students practicing multiple choice questions 
          to improve their skills and ace their exams.
        </p>
        <button className="cta-button" onClick={handleStartPractice}>Start Practicing Now</button>
      </div>
    </header>
  );
};

export default Home;