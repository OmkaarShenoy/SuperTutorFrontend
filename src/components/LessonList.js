import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './LessonList.css';

const HOST = 'https://tutor-backend.lokegaonkar.in';

const LessonList = () => {
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`${HOST}/lessons`);
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      alert('Failed to fetch lessons. Please try again later.');
    }
  };

  return (
    <div className="lesson-list-container">
      <h1 className="project-title">SuperTutor</h1>
      <div className="button-container">
        <button className="create-button" onClick={() => navigate('/create')}>
          + Create New Lesson
        </button>
      </div>
      {lessons.length === 0 ? (
        <p>No lessons available. Please check back later.</p>
      ) : (
        <div className="lesson-grid">
          {lessons.map((lesson) => (
            <Link to={`/lessons/${lesson.id}`} className="lesson-title">
            <div key={lesson.id} className="lesson-card">
                {lesson.title}
              <p className="lesson-author">By: {lesson.author}</p>
            </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonList;