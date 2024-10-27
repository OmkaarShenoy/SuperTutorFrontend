// src/components/LessonDetail.js
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaHome, FaPlay, FaStop } from 'react-icons/fa';
import { IoIosCreate } from 'react-icons/io';
import './LessonDetail.css';

const LessonDetail = () => {
  const HOST = 'https://tutor-backend.lokegaonkar.in';
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [selectedSubLesson, setSelectedSubLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userSolution, setUserSolution] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [solutionInput, setSolutionInput] = useState('');
  const [promptAudio, setPromptAudio] = useState(null); // State for the prompt audio

  useEffect(() => {
    fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (selectedSubLesson && selectedSubLesson.solution_boilerplate) {
      setUserSolution(selectedSubLesson.solution_boilerplate);
      setSolutionInput(selectedSubLesson.solution_boilerplate);
    } else {
      setUserSolution('');
      setSolutionInput('');
    }
  }, [selectedSubLesson]);
  

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
        setRenderedHtml('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      setRenderedHtml(response.data.output || '');
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
    if (subLessonId === -1) {
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

      setRenderedHtml(response.data.output || '');
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
    const updatedChatMessages = [...chatMessages, { sender: 'user', message: userMessage }];

    setChatMessages(updatedChatMessages);
    setChatInput('');

    try {
      const subLessonId = lesson.sublessons.indexOf(selectedSubLesson);
      if (subLessonId === -1) {
        console.error("Sublesson ID not found");
        return;
      }

      const response = await axios.post(
        `${HOST}/lessons/${id}/${subLessonId}/chat`,
        {
          submission: userSolution,
          messages: updatedChatMessages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.message,
          })),
        }
      );

      const aiReply = response.data.content;
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

  // Helper function to strip HTML tags
  const stripHtml = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // TTS Function for Prompt
  const handlePromptTTS = async () => {
    if (!selectedSubLesson || !selectedSubLesson.lesson_text) {
      alert('No prompt available to convert to speech.');
      return;
    }

    try {
      // Remove HTML tags from the lesson_text
      const plainText = stripHtml(selectedSubLesson.lesson_text);

      // Send POST request to '/tts' with the text
      const response = await axios.post(`${HOST}/tts`, {
        text: plainText,
        language: 'en-US',  // Optional: specify language
        voice_name: 'en-US-Wavenet-D'  // Optional: specify voice
      });

      const audioUrl = response.data.audio_url;

      // If an audio is already playing, stop it
      if (promptAudio) {
        promptAudio.pause();
        promptAudio.currentTime = 0;
      }

      // Create a new Audio object and store it in state
      const audio = new Audio(audioUrl);
      setPromptAudio(audio);

      // Play the audio
      audio.play();

      // Optional: Handle when the audio ends
      audio.onended = () => {
        setPromptAudio(null);
      };

    } catch (error) {
      console.error('Error in TTS:', error);
      alert('Failed to convert text to speech.');
    }
  };

  // Function to stop the prompt audio
  const handlePromptStop = () => {
    if (promptAudio) {
      promptAudio.pause();
      promptAudio.currentTime = 0;
      setPromptAudio(null);
    }
  };

  // TTS Function for AI Messages
  const handleTTS = async () => {
    // Find the latest AI message
    const latestAIMessages = chatMessages.filter(msg => msg.sender === 'ai');
    if (latestAIMessages.length === 0) {
      alert('No AI messages to convert to speech.');
      return;
    }

    const latestAIMessage = latestAIMessages[latestAIMessages.length - 1];

    try {
      // Send POST request to '/tts' with the text
      const response = await axios.post(`${HOST}/tts`, {
        text: latestAIMessage.message,
        language: 'en-US',  // Optional: specify language
        voice_name: 'en-US-Wavenet-D'  // Optional: specify voice
      });

      const audioUrl = response.data.audio_url;

      // Play the audio
      const audio = new Audio(audioUrl);
      audio.play();

    } catch (error) {
      console.error('Error in TTS:', error);
      alert('Failed to convert text to speech.');
    }
  };

  if (!lesson) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  // Determine if the current lesson type is 'text'
  const isTextLesson = selectedSubLesson?.lesson_type === 'text';

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
              {sidebarOpen ? <FaChevronLeft size={30} /> : <FaChevronRight size={30} />}
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

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr', // Equal widths for both columns
          gridTemplateRows: '1fr 1fr',    // Two rows
          gap: '20px',
          padding: '20px'
        }}
      >
        {/* Top Left Quadrant: Prompt and Question */}
        <div className="quadrant quadrant-prompt" style={{ gridColumn: 1, gridRow: 1 }}>
          <div dangerouslySetInnerHTML={{ __html: selectedSubLesson?.lesson_text }} />
          <div className="tts-controls" style={{ position: 'sticky', bottom: '10px', right: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handlePromptTTS} className="tts-button" disabled={promptAudio !== null}>
              <FaPlay size={20} />
            </button>
            <button onClick={handlePromptStop} className="tts-button" disabled={promptAudio === null}>
              <FaStop size={20} />
            </button>
          </div>
        </div>

        {/* Conditionally Rendered Solution Quadrant */}
        {!isTextLesson && (
          <div className="quadrant quadrant-html" style={{ gridColumn: 2, gridRow: 1 }}>
            <h2>Rendered Solution</h2>
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          </div>
        )}

        {/* Bottom Left Quadrant: Solution Editor */}
        <div className="quadrant quadrant-editor" style={{ gridColumn: 1, gridRow: 2 }}>
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

        {/* AI Chat Section */}
        <div
          className="quadrant quadrant-feedback"
          style={{
            gridColumn: '2 / 3', // Always in the second column
            gridRow: isTextLesson ? '1 / 3' : '2 / 3',    // Span both rows if 'text', else only second row
            height: isTextLesson ? '100%' : 'auto',       // Full height if 'text'
          }}
        >
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
              <div className="chat-buttons">
                <button type="submit">Send</button>
                <button type="button" onClick={handleTTS}>TTS</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;