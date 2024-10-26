// src/mockBackend.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Initialize the Mock Adapter
const mock = new MockAdapter(axios); // Optional delay

// Sample data for a list of lessons with full details for each lesson
const lessons = [
  {
    id: 1,
    title: 'Introduction to LaTeX for Mathematical Typesetting',
    author: 'Dr. Jane Doe',
    sub_lessons: [
      {
        title: 'Learning Basic LaTeX Commands',
        prompt: 'LaTeX is widely used for typesetting mathematical documents. It excels in handling complex mathematical equations. For example, to write a quadratic equation in standard form, you would use LaTeX syntax like `ax^2 + bx + c = 0`. Let\'s explore how to represent equations and their solutions using LaTeX.',
        question: 'Using LaTeX, typeset the solution to the quadratic equation x² - 5x + 6 = 0. Use the quadratic formula x = (-b ± sqrt(b² - 4ac)) / 2a for your solution.',
        type: 'latex',
        solutionBoilerplate: '\\begin{align*} x &= \\frac{-(-5) \\pm \\sqrt{(-5)^2 - 4 \\cdot 1 \\cdot 6}}{2 \\cdot 1} \\\\ x &= \\frac{5 \\pm \\sqrt{25 - 24}}{2} \\\\ x &= \\frac{5 \\pm 1}{2} \\\\ x_1 &= 3, \\quad x_2 &= 2 \\end{align*}',
      },
    ],
  },
  {
    id: 2,
    title: 'Advanced LaTeX Techniques',
    author: 'Prof. John Smith',
    sub_lessons: [
      {
        title: 'Advanced Math Symbols in LaTeX',
        prompt: 'Learn to use advanced LaTeX symbols for mathematical expressions. This includes integrals, summations, and matrices. Try writing these symbols in LaTeX.',
        question: 'Use LaTeX to typeset the integral of x from 0 to infinity, ∫_0^∞ x dx.',
        type: 'latex',
        solutionBoilerplate: '\\int_0^{\\infty} x \\, dx',
      },
    ],
  },
];

// Function to wrap LaTeX in MathJax delimiters
const wrapWithMathJax = (latex) => {
  return `
    <div>
      <h2>Rendered Solution</h2>
      <div>
        $$${latex}$$
      </div>
    </div>
  `;
};

// Mock GET /lessons to return a list of lesson summaries
mock.onGet('/lessons').reply(200, lessons.map(({ id, title, author }) => ({ id, title, author })));

// Mock GET /lessons/{id} to return the details of a specific lesson
mock.onGet(new RegExp('^/lessons/\\d+$')).reply((config) => {
  const id = parseInt(config.url.match(/\/lessons\/(\d+)/)[1]);
  const lesson = lessons.find((lesson) => lesson.id === id);
  if (lesson) {
    return [200, lesson];
  } else {
    return [404, { message: 'Lesson not found' }];
  }
});

// Mock POST /lessons/{id}/submit for submitting a lesson solution
mock.onPost(new RegExp('^/lessons/\\d+/submit$')).reply((config) => {
  const id = parseInt(config.url.match(/\/lessons\/(\d+)\/submit$/)[1]);
  const data = JSON.parse(config.data);
  const lesson = lessons.find((lesson) => lesson.id === id);

  if (lesson) {
    const userSolution = data.userSolution;

    // Simple feedback logic
    let feedback = 'Great job! Your solution is correct.';
    if (userSolution.includes('x = 2') && userSolution.includes('x = 3')) {
      feedback = 'Excellent! You correctly solved the equation.';
    } else {
      feedback = 'Please review your solution. Ensure you have correctly factored the equation.';
    }

    // Wrap the user's LaTeX in MathJax delimiters
    const html = wrapWithMathJax(userSolution);

    return [
      200,
      {
        feedback,
        html,
      },
    ];
  } else {
    return [404, { message: 'Lesson not found' }];
  }
});

// Mock POST /lessons/{id}/chat for chatting with AI
mock.onPost(new RegExp('^/lessons/\\d+/chat$')).reply((config) => {
  const id = parseInt(config.url.match(/\/lessons\/(\d+)\/chat$/)[1]);
  const data = JSON.parse(config.data);
  const lesson = lessons.find((lesson) => lesson.id === id);

  if (lesson) {
    const userMessage = data.message.toLowerCase();
    let aiReply = "I'm here to help! Could you please elaborate?";

    if (userMessage.includes('hello') || userMessage.includes('hi')) {
      aiReply = 'Hello! How can I assist you with your LaTeX solution today?';
    } else if (userMessage.includes('thank')) {
      aiReply = "You're welcome! Let me know if you have any more questions.";
    }

    return [200, { reply: aiReply }];
  } else {
    return [404, { message: 'Lesson not found' }];
  }
});

export default mock;