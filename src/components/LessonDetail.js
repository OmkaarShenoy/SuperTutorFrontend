// src/components/LessonDetail.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing icons
import './LessonDetail.css';
import { FaHome} from 'react-icons/fa'; // Importing the icons
import {IoIosCreate}  from 'react-icons/io'

const LessonDetail = () => {
  const { id } = useParams(); // lesson_id from the URL parameters
  const [lesson, setLesson] = useState(null);
  const [selectedSubLesson, setSelectedSubLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userSolution, setUserSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // Chat messages for user and AI interactions
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/lessons/${id}`);
      setLesson(response.data);
      setSelectedSubLesson(response.data.lessons[0]); // Set the first sub-lesson as default
    } catch (error) {
      console.error('Error fetching lesson:', error);
      alert('Failed to fetch lesson. Please try again later.');
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userSolution.trim() === '') {
      alert('Please enter your solution.');
      return;
    }

    setLoading(true);

    const subLessonId = selectedSubLesson?.id;
    if (!subLessonId) {
      console.error("Sublesson ID not found");
      alert('Unable to find the sublesson ID.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/lessons/${id}/${subLessonId}/submit`,
        null,
        {
          params: {
            submission: userSolution,
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
        `http://localhost:8000/lessons/${id}/${subLessonId}/chat`,
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

  const mathJaxConfig = {
    loader: { load: ["input/tex", "output/chtml"] },
    tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="lesson-detail-container" style={{ display: 'flex' }}>
        {/* Collapsible Sidebar */}
        <div
          className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
          style={{
            backgroundColor: '#0F0A19',
            width: sidebarOpen ? '200px' : '0',
            overflow: 'hidden',
            transition: 'width 0.3s',
            borderRadius: '8px',
            padding: sidebarOpen ? '20px' : '0px',
            margin: '20px 0',
            border: sidebarOpen ? '1px solid #ccc' : '0px'
          }}
        >
              <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'center', padding: '10px', margin: 0 }}>
        <li style={{ margin: '0 15px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#fff', fontSize: '18px' }}>
            <FaHome size={30} style={{ marginRight: '0px' }} /> {/* Lesson icon */}
          </Link>
        </li>
        <li style={{ margin: '0 15px' }}>
          <Link to="/create" style={{ textDecoration: 'none', color: '#fff', fontSize: '18px' }}>
            <IoIosCreate size={30} style={{ marginRight: '0px' }} /> {/* Create lesson icon */}
          </Link>
        </li>
        <li>
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            left: sidebarOpen ? '200px' : '-10px',
            top: '55px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            transition: 'left 0.3s',
          }}
        >
          {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
        </li>
      </ul>
          <h1>{lesson.title}</h1>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {lesson.lessons.map((subLesson, index) => (
              <li
                key={index}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: selectedSubLesson === subLesson ? '#333333' : 'transparent',
                  borderRadius: '5px',
                  marginBottom: '5px',
                  padding: sidebarOpen ? '20px' : '0px',

                }}
                onClick={() => setSelectedSubLesson(subLesson)}
              >
                {subLesson.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Sidebar Toggle Button */}


        {/* Main Content Area with Four Quadrants */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '20px', padding: '20px' }}>
          {/* Top Left Quadrant: Prompt and Question */}
          <div className="quadrant quadrant-prompt">
            <h2>{selectedSubLesson?.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: selectedSubLesson?.lesson_text }} />
          </div>

          {/* Top Right Quadrant: Rendered LaTeX Solution */}
          <div className="quadrant quadrant-html">
            <h2>Rendered Solution</h2>
            <MathJax dynamic>
              <div>
                {userSolution ? `$$${userSolution}$$` : 'No solution to display. Start typing your LaTeX solution.'}
              </div>
            </MathJax>
          </div>

          {/* Bottom Left Quadrant: Solution Editor */}
          <div className="quadrant quadrant-editor">
            <h2>Your Solution</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <textarea
                value={userSolution}
                onChange={(e) => setUserSolution(e.target.value)}
                placeholder="Enter your LaTeX solution here..."
                required
                style={{ flex: 1, marginBottom: '10px' }}
              ></textarea>
              <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}>
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
    </MathJaxContext>
  );
};

export default LessonDetail;