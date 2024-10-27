// src/components/LessonCreator.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const HOST = 'https://tutor-backend.lokegaonkar.in'

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
    console.log("handleSubmit called");

    // Validation: Ensure all fields are filled
    for (let i = 0; i < subLessons.length; i++) {
        const sub = subLessons[i];
        for (const key in sub) {
            if (sub[key].trim() === '') {
                alert(`Please fill out all fields for Sub-Lesson ${i + 1}.`);
                return;
            }
        }
    }

    const newLesson = {
        title,
        author,
        sublessons: subLessons,
    };

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
    <div style={{ padding: '20px' }}>
      <h1>Create a New Lesson</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Lesson Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Author:</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <hr />
        {subLessons.map((subLesson, index) => (
    <div key={index} style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>Sub-Lesson {index + 1}</h2>
        <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Sub-Lesson Title:</label>
            <input
                type="text"
                value={subLesson.title}
                onChange={(e) => handleSubLessonChange(index, 'title', e.target.value)}
                required
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
        </div>
        <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Prompt:</label>
            <textarea
                value={subLesson.prompt}
                onChange={(e) => handleSubLessonChange(index, 'prompt', e.target.value)}
                required
                rows="3"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            ></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Question:</label>
            <textarea
                value={subLesson.question}
                onChange={(e) => handleSubLessonChange(index, 'question', e.target.value)}
                required
                rows="3"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            ></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Solution Boilerplate:</label>
            <textarea
                value={subLesson.solutionBoilerplate}
                onChange={(e) => handleSubLessonChange(index, 'solutionBoilerplate', e.target.value)}
                required
                rows="4"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            ></textarea>
        </div>
        {subLessons.length > 1 && (
            <button
                type="button"
                onClick={() => removeSubLesson(index)}
                style={{ backgroundColor: 'var(--accent-color)', color: '#fff', padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            >
                Remove Sub-Lesson
            </button>
        )}
    </div>
))}
        <button type="button" onClick={addSubLesson} style={{ marginBottom: '20px', padding: '10px 15px', fontSize: '16px' }}>
          Add Another Sub-Lesson
        </button>
        <br />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>
          Create Lesson
        </button>
      </form>
    </div>
  );
};

export default LessonCreator;