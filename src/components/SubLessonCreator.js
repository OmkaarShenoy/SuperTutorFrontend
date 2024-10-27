// src/components/SubLessonCreator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HOST = 'http://localhost:8000';

const SubLessonCreator = () => {
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [subLessonData, setSubLessonData] = useState({
    title: '',
    prompt: '',
    question: '',
    type: 'latex',
    solutionBoilerplate: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`${HOST}/lessons`);
      setLessons(response.data);
      if (response.data.length > 0) {
        setSelectedLessonId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      alert('Failed to fetch lessons. Please try again later.');
    }
  };

  const handleInputChange = (field, value) => {
    setSubLessonData({
      ...subLessonData,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Ensure all fields are filled
    for (const key in subLessonData) {
      if (subLessonData[key].trim() === '') {
        alert(`Please fill out the ${key} field.`);
        return;
      }
    }

    try {
      await axios.post(
        `${HOST}/lessons/${selectedLessonId}/sublessons`,
        subLessonData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      alert('Sublesson added successfully!');
      navigate(`/lessons/${selectedLessonId}`);
    } catch (error) {
      console.error('Error adding sublesson:', error);
      alert('Failed to add sublesson. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add a Sub-Lesson</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Select Lesson:</label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          >
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title} (ID: {lesson.id})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Sub-Lesson Title:</label>
          <input
            type="text"
            value={subLessonData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Prompt:</label>
          <textarea
            value={subLessonData.prompt}
            onChange={(e) => handleInputChange('prompt', e.target.value)}
            required
            rows="4"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          ></textarea>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Question:</label>
          <textarea
            value={subLessonData.question}
            onChange={(e) => handleInputChange('question', e.target.value)}
            required
            rows="4"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          ></textarea>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Type:</label>
          <select
            value={subLessonData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          >
            <option value="latex">LaTeX</option>
            <option value="linux">Linux</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Solution Boilerplate:</label>
          <textarea
            value={subLessonData.solutionBoilerplate}
            onChange={(e) => handleInputChange('solutionBoilerplate', e.target.value)}
            required
            rows="4"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          ></textarea>
        </div>

        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>
          Add Sub-Lesson
        </button>
      </form>
    </div>
  );
};

export default SubLessonCreator;
