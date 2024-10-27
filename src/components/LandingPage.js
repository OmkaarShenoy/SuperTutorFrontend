import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="header">
        <h2 className="header-title">SuperTutor</h2>
        <hr className="header-line" />
      </header>

      {/* Main Content */}
      <div className="content">
        <h1 className="main-title">Learn and Master Complex Topics</h1>
        <p className="subtext">
          Dive into interactive lessons crafted to boost your skills and confidence. Start your journey with us today.
        </p>
        <button className="learn-button" onClick={() => navigate('/learn')}>
          Start Learning
        </button>
      </div>
    </div>
  );
};

export default LandingPage;