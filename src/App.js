// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import LessonList from './components/LessonList';
import LessonCreator from './components/LessonCreator';
import LessonDetail from './components/LessonDetail';
import { MathJaxContext } from 'better-react-mathjax';
import './styles.css'; // Import global styles
import './App.css';

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
  options: { 
    renderActions: {
      addMenu: [] // Disables the MathJax context menu
    }
  }
};

function App() {
  return (
    <MathJaxContext config={mathJaxConfig}>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<LessonList />} />
            <Route path="/create" element={<LessonCreator />} />
            <Route path="/lessons/:id" element={<LessonDetail />} />
          </Routes>
        </div>
      </Router>
    </MathJaxContext>
  );
}

export default App;