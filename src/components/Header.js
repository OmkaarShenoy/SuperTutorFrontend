// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav>
      <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'center', padding: '10px', margin: 0 }}>
        <li style={{ margin: '0 15px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontSize: '18px' }}>
            Lessons
          </Link>
        </li>
        <li style={{ margin: '0 15px' }}>
          <Link to="/create" style={{ textDecoration: 'none', color: '#007bff', fontSize: '18px' }}>
            Create Lesson
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;