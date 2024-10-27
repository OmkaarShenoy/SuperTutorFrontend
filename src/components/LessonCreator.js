import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LessonCreator.css';

const HOST = 'https://tutor-backend.lokegaonkar.in';

const LessonCreator = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subLessons, setSubLessons] = useState([
    {
      title: '',
      prompt: '',
      question: '',
      type: 'latex',
      solutionBoilerplate: '',
    },
  ]);

  const navigate = useNavigate();

  const handleSubLessonChange = (index, field, value) => {
    const updatedSubLessons = [...subLessons];
    updatedSubLessons[index][field] = value;
    setSubLessons(updatedSubLessons);
  };

  const addSubLesson = () => {
    setSubLessons([
      ...subLessons,
      {
        title: '',
        prompt: '',
        question: '',
        type: 'linux',
        solutionBoilerplate: '',
      },
    ]);
  };

  const removeSubLesson = (index) => {
    const updatedSubLessons = [...subLessons];
    updatedSubLessons.splice(index, 1);
    setSubLessons(updatedSubLessons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all sub-lesson fields
    for (let i = 0; i < subLessons.length; i++) {
      const sub = subLessons[i];
      for (const key in sub) {
        if (sub[key].trim() === '') {
          alert(`Please fill out all fields for Sub-Lesson ${i + 1}.`);
          return;
        }
      }
    }

    const newLesson = { title, author, sublessons: subLessons };

    try {
      await axios.post(`${HOST}/lessons/`, newLesson, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      alert('Lesson created successfully!');
      navigate('/learn');
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Failed to create lesson. Please try again.');
    }
  };

  return (
    <div className="lesson-creator-container">
      <button onClick={() => navigate(-1)} className="back-button">
        Back
      </button>
      <h1 className="form-title">Create a New Lesson</h1>
      <form onSubmit={handleSubmit} className="lesson-form">
        <div className="form-group">
          <label>Lesson Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter lesson title..."
          />
        </div>
        <div className="form-group">
          <label>Author:</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            placeholder="Enter author name..."
          />
        </div>
        <hr className="section-divider" />
        {subLessons.map((subLesson, index) => (
          <div key={index} className="sublesson-container">
            <h2>Sub-Lesson {index + 1}</h2>
            <div className="form-group">
              <label>Sub-Lesson Title:</label>
              <input
                type="text"
                value={subLesson.title}
                onChange={(e) => handleSubLessonChange(index, 'title', e.target.value)}
                required
                placeholder="Enter sub-lesson title..."
              />
            </div>
            <div className="form-group">
              <label>Prompt:</label>
              <textarea
                value={subLesson.prompt}
                onChange={(e) => handleSubLessonChange(index, 'prompt', e.target.value)}
                required
                placeholder="Enter the prompt..."
                rows="3"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Question:</label>
              <textarea
                value={subLesson.question}
                onChange={(e) => handleSubLessonChange(index, 'question', e.target.value)}
                required
                placeholder="Enter the question..."
                rows="3"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Solution Boilerplate:</label>
              <textarea
                value={subLesson.solutionBoilerplate}
                onChange={(e) => handleSubLessonChange(index, 'solutionBoilerplate', e.target.value)}
                required
                placeholder="Enter the solution boilerplate..."
                rows="4"
              ></textarea>
            </div>
            {subLessons.length > 1 && (
              <button type="button" onClick={() => removeSubLesson(index)} className="remove-sublesson-button">
                Remove Sub-Lesson
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSubLesson} className="add-sublesson-button">
          Add Another Sub-Lesson
        </button>
        <button type="submit" className="submit-button">
          Create Lesson
        </button>
      </form>
    </div>
  );
};

export default LessonCreator;