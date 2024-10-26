// src/components/LessonDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import './LessonDetail.css';

const LessonDetail = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [userSolution, setUserSolution] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    fetchLesson();
    // eslint-disable-next-line
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await axios.get(`/lessons/${id}`);
      setLesson(response.data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      alert('Failed to fetch lesson. Please try again later.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userSolution.trim() === '') {
      alert('Please enter your solution.');
      return;
    }

    setLoading(true);
    setFeedback('');

    try {
      const response = await axios.post(`/lessons/${id}/submit`, {
        userSolution,
      });

      setFeedback(response.data.feedback);
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
      const response = await axios.post(`/lessons/${id}/chat`, {
        message: userMessage,
      });

      const aiReply = response.data.reply;
      setChatMessages((prevMessages) => [...prevMessages, { sender: 'ai', message: aiReply }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setChatMessages((prevMessages) => [...prevMessages, { sender: 'ai', message: 'Sorry, I could not process that.' }]);
    }
  };

  if (!lesson) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const subLesson = lesson.sub_lessons[0];

  // MathJax configuration
  const mathJaxConfig = {
    loader: { load: ["input/tex", "output/chtml"] },
    tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="lesson-detail-container">
        {/* Top Left Quadrant: Prompt and Question */}
        <div className="quadrant quadrant-prompt">
          <h2>{subLesson.title}</h2>
          <p><strong>Prompt:</strong> {subLesson.prompt}</p>
          <p><strong>Question:</strong> {subLesson.question}</p>
        </div>

        {/* Top Right Quadrant: Rendered LaTeX */}
        <div className="quadrant quadrant-html">
          <h2>Rendered Solution</h2>
          <MathJax dynamic>
            <div>
              {userSolution ? `$$${userSolution}$$` : 'No solution to display. Start typing your LaTeX solution.'}
            </div>
          </MathJax>
        </div>

        {/* Bottom Left Quadrant: Editor and Submit Button */}
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

        {/* Bottom Right Quadrant: Feedback and Chat */}
        <div className="quadrant quadrant-feedback">
          <h2>Feedback</h2>
          <div className="feedback">
            {feedback ? <p>{feedback}</p> : <p>No feedback yet. Submit your solution to receive feedback.</p>}
          </div>
          <hr />
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
    </MathJaxContext>
  );
};

export default LessonDetail;