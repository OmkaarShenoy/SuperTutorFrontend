// src/components/LessonDetail.js
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaHome } from 'react-icons/fa';
import { IoIosCreate } from 'react-icons/io';
import './LessonDetail.css';

const LessonDetail = () => {
  const HOST = 'http://localhost:8000';
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [selectedSubLesson, setSelectedSubLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userSolution, setUserSolution] = useState('');
  const [renderedHtml, setRenderedHtml] = useState(''); // Stores the rendered HTML
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [solutionInput, setSolutionInput] = useState(''); // Tracks typing input

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await axios.get(`${HOST}/lessons/${id}`);
      setLesson(response.data);
      setSelectedSubLesson(response.data.sublessons[0]);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      alert('Failed to fetch lesson. Please try again later.');
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const handleSolutionInputChange = (e) => {
    const newSolution = e.target.value;
    setUserSolution(newSolution);
    setSolutionInput(newSolution);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (solutionInput.trim()) {
        handleSolutionChange(solutionInput);
      } else {
        setRenderedHtml(''); // Clear the HTML view if input is empty
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [solutionInput]);

  const handleSolutionChange = async (solution) => {
    try {
      const subLessonId = lesson.sublessons.indexOf(selectedSubLesson);
      if (subLessonId === -1) {
        console.error("Sublesson ID not found");
        return;
      }

      const response = await axios.post(
        `${HOST}/lessons/${id}/${subLessonId}/submit`,
        null,
        {
          params: {
            submission: solution,
            check_solution: false,
          },
        }
      );

      setRenderedHtml(response.data.output || ''); // Set rendered HTML from the response
    } catch (error) {
      console.error('Error rendering solution:', error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (userSolution.trim() === '') {
      alert('Please enter your solution.');
      return;
    }
  
    setLoading(true);
  
    const subLessonId = lesson.sublessons.indexOf(selectedSubLesson);
    if (subLessonId === -1) {  // Update this condition
      console.error("Sublesson ID not found");
      alert('Unable to find the sublesson ID.');
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post(
        `${HOST}/lessons/${id}/${subLessonId}/submit`,
        null,
        {
          params: {
            submission: userSolution,  // Make sure userSolution is used here
            check_solution: true,
          },
        }
      );
  
      const feedback = response.data.success
        ? 'Correct! Well done.'
        : `Incorrect. ${response.data.problem || 'Check your solution.'} Hint: ${response.data.hint || ''}`;
  
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', message: feedback },
      ]);
  
      setRenderedHtml(response.data.output || ''); // Set rendered HTML on submission
    } catch (error) {
      console.error('Error submitting solution:', error);
      alert('Failed to submit solution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();

    if (chatInput.trim() === '') return;

    const userMessage = chatInput.trim();
    setChatMessages([...chatMessages, { sender: 'user', message: userMessage }]);
    setChatInput('');

    try {
      const subLessonId = selectedSubLesson?.id;
      const response = await axios.post(
        `${HOST}/lessons/${id}/${subLessonId}/chat`,
        { message: userMessage }
      );

      const aiReply = response.data.reply;
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', message: aiReply },
      ]);
    } catch (error) {
      console.error('Error in chat:', error);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', message: 'Sorry, I could not process that.' },
      ]);
    }
  };

  if (!lesson) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div className="lesson-detail-container" style={{ display: 'flex' }}>
      {/* Collapsible Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        style={{
          backgroundColor: '#282828',
          width: sidebarOpen ? '200px' : '0',
          overflow: 'hidden',
          transition: 'width 0.3s',
          borderRadius: '8px',
          padding: sidebarOpen ? '20px' : '0px',
          margin: '20px 0',
          border: sidebarOpen ? '1px solid #ccc' : '0px'
        }}
      >
        <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'flex-start', padding: '0px', margin: 0 }}>
          <li style={{ margin: '0 0px' }}>
            <Link to="/learn" style={{ textDecoration: 'none', color: '#fff', fontSize: '18px' }}>
              <FaHome size={30} style={{ marginRight: '0px' }} />
            </Link>
          </li>
          <li style={{ margin: '0 15px' }}>
            <Link to="/createsublesson" style={{ textDecoration: 'none', color: '#fff', fontSize: '18px' }}>
              <IoIosCreate size={30} style={{ marginRight: '0px' }} />
            </Link>
          </li>
          <li>
            <button
              onClick={toggleSidebar}
              style={{
                position: 'fixed',
                left: sidebarOpen ? '190px' : '-10px',
                top: '45px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                transition: 'left 0.3s',
              }}
            >
              {sidebarOpen ? <FaChevronLeft size={30}/> : <FaChevronRight size={30}/>}
            </button>
          </li>
        </ul>
        <h1>{lesson.title}</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {lesson.sublessons.map((subLesson, index) => (
            <li
              key={index}
              style={{
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: selectedSubLesson === subLesson ? 'var(--accent-color)' : 'transparent',
                borderRadius: '5px',
                marginBottom: '5px',
                fontWeight: '500'
              }}
              onClick={() => setSelectedSubLesson(subLesson)}
            >
              {subLesson.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area with Four Quadrants */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '20px', padding: '20px' }}>
        {/* Top Left Quadrant: Prompt and Question */}
        <div className="quadrant quadrant-prompt">
          <div dangerouslySetInnerHTML={{ __html: selectedSubLesson?.lesson_text }} />
        </div>

        {/* Top Right Quadrant: Rendered Solution HTML */}
        <div className="quadrant quadrant-html">
          <h2>Rendered Solution</h2>
          <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        </div>

        {/* Bottom Left Quadrant: Solution Editor */}
        <div className="quadrant quadrant-editor">
          <h2>Your Solution</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <textarea
              value={userSolution}
              onChange={handleSolutionInputChange}
              placeholder="Enter your LaTeX solution here..."
              required
              style={{ flex: 1, marginBottom: '10px' }}
            ></textarea>
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Solution'}
            </button>
          </form>
        </div>

        {/* Bottom Right Quadrant: Chat Section */}
        <div className="quadrant quadrant-feedback">
          <h2>Chat with AI</h2>
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <p>Start the conversation by typing a message.</p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className={msg.sender === 'user' ? 'user-message' : 'ai-message'}>
                    <span>{msg.message}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="chat-input">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                required
                style={{ resize: 'vertical' }}
              ></textarea>
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;