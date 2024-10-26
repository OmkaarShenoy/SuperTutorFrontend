import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LessonList = () => {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await axios.get('/lessons'); // Use relative path so mock intercepts it
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      alert('Failed to fetch lessons. Please try again later.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Available Lessons</h1>
      {lessons.length === 0 ? (
        <p>No lessons available. Be the first to create one!</p>
      ) : (
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {lessons.map((lesson) => (
            <li key={lesson.id} style={{ margin: '15px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <Link to={`/lessons/${lesson.id}`} style={{ textDecoration: 'none', color: '#007bff', fontSize: '20px' }}>
                {lesson.title}
              </Link>
              <p>By: {lesson.author}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LessonList;