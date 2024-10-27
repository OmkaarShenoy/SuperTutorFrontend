import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SubLessonCreator.css';

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
    solution: '',
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
    for (const key in subLessonData) {
      if (subLessonData[key].trim() === '') {
        alert(`Please fill out the ${formatFieldName(key)} field.`);
        return;
      }
    }

    try {
      await axios.post(`${HOST}/lessons/${selectedLessonId}/sublessons`, subLessonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Sublesson added successfully!');
      navigate(`/lessons/${selectedLessonId}`);
    } catch (error) {
      console.error('Error adding sublesson:', error);
      alert('Failed to add sublesson. Please try again.');
    }
  };

  const formatFieldName = (fieldName) => {
    const fieldMap = {
      title: 'Title',
      prompt: 'Prompt',
      question: 'Question',
      type: 'Type',
      solutionBoilerplate: 'Solution Boilerplate',
      solution: 'Solution',
    };
    return fieldMap[fieldName] || fieldName;
  };

  return (
    <div className="sublesson-creator-container">
      <button onClick={() => navigate(-1)} className="back-button">
        Back
      </button>
      <h1 className="form-title">Add a Sub-Lesson</h1>
      <form onSubmit={handleSubmit} className="sublesson-form">
        <div className="form-group">
          <label>Select Lesson:</label>
          <select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} required>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title} (ID: {lesson.id})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Sub-Lesson Title:</label>
          <input
            type="text"
            value={subLessonData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
            placeholder="Enter sub-lesson title..."
          />
        </div>

        <div className="form-group">
          <label>Prompt:</label>
          <textarea
            value={subLessonData.prompt}
            onChange={(e) => handleInputChange('prompt', e.target.value)}
            required
            placeholder="Enter the prompt..."
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Question:</label>
          <textarea
            value={subLessonData.question}
            onChange={(e) => handleInputChange('question', e.target.value)}
            required
            placeholder="Enter the question..."
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Type:</label>
          <select value={subLessonData.type} onChange={(e) => handleInputChange('type', e.target.value)} required>
            <option value="latex">LaTeX</option>
            <option value="text">Text</option>
            <option value="linux">Linux</option>
          </select>
        </div>

        <div className="form-group">
          <label>Solution Boilerplate:</label>
          <textarea
            value={subLessonData.solutionBoilerplate}
            onChange={(e) => handleInputChange('solutionBoilerplate', e.target.value)}
            required
            placeholder="Enter the solution boilerplate..."
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Solution:</label>
          <textarea
            value={subLessonData.solution}
            onChange={(e) => handleInputChange('solution', e.target.value)}
            required
            placeholder="Enter the detailed solution..."
            rows="4"
          ></textarea>
        </div>

        <button type="submit" className="submit-button">
          Add Sub-Lesson
        </button>
      </form>
    </div>
  );
};

export default SubLessonCreator;