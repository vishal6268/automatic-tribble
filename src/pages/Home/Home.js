import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <header className="hero-section">
      <div className="hero-content">
        <h1>Master Your Knowledge</h1>
        <p>
          Join thousands of students practicing multiple choice questions 
          to improve their skills and ace their exams.
        </p>
        <button className="cta-button">Start Practicing Now</button>
      </div>
    </header>
  );
};

export default Home;