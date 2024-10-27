// src/components/SubLessonCreator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HOST = 'https://tutor-backend.lokegaonkar.in';

const SubLessonCreator = () => {
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [subLessonData, setSubLessonData] = useState({
    title: '',
    prompt: '',
    question: '',
    type: 'latex',
    solutionBoilerplate: '',
    solution: '', // New field for Solution
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
        alert(`Please fill out the ${formatFieldName(key)} field.`);
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

  // Helper function to format field names for alerts
  const formatFieldName = (fieldName) => {
    switch (fieldName) {
      case 'title':
        return 'Title';
      case 'prompt':
        return 'Prompt';
      case 'question':
        return 'Question';
      case 'type':
        return 'Type';
      case 'solutionBoilerplate':
        return 'Solution Boilerplate';
      case 'solution':
        return 'Solution';
      default:
        return fieldName;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Back
      </button>
      <h1>Add a Sub-Lesson</h1>
      <form onSubmit={handleSubmit}>
        {/* Select Lesson */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Select Lesson:</label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title} (ID: {lesson.id})
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Lesson Title */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Sub-Lesson Title:</label>
          <input
            type="text"
            value={subLessonData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
            placeholder="Enter sub-lesson title..."
          />
        </div>

        {/* Prompt */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Prompt:</label>
          <textarea
            value={subLessonData.prompt}
            onChange={(e) => handleInputChange('prompt', e.target.value)}
            required
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical',
            }}
            placeholder="Enter the prompt..."
          ></textarea>
        </div>

        {/* Question */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Question:</label>
          <textarea
            value={subLessonData.question}
            onChange={(e) => handleInputChange('question', e.target.value)}
            required
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical',
            }}
            placeholder="Enter the question..."
          ></textarea>
        </div>

        {/* Type */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Type:</label>
          <select
            value={subLessonData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="latex">LaTeX</option>
            <option value="text">Text</option>
            <option value="linux">Linux</option>
          </select>
        </div>

        {/* Solution Boilerplate */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Solution Boilerplate:</label>
          <textarea
            value={subLessonData.solutionBoilerplate}
            onChange={(e) => handleInputChange('solutionBoilerplate', e.target.value)}
            required
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical',
            }}
            placeholder="Enter the solution boilerplate..."
          ></textarea>
        </div>

        {/* New Section: Solution */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Solution:</label>
          <textarea
            value={subLessonData.solution}
            onChange={(e) => handleInputChange('solution', e.target.value)}
            required
            rows="6"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical',
            }}
            placeholder="Enter the detailed solution..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: 'val(--accent-color)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Add Sub-Lesson
        </button>
      </form>
    </div>
  );
};

export default SubLessonCreator;