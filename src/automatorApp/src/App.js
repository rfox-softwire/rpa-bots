import React, { useState } from 'react';
import './App.css';

function App() {
  const [instructions, setInstructions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User instructions:', instructions);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>RPA Automation Tool</h1>
      </header>
      <main className="app-main">
        <div className="instructions-container">
          <h2>What would you like to automate?</h2>
          <form onSubmit={handleSubmit} className="instructions-form">
            <textarea
              className="instructions-input"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter your automation instructions here..."
              rows={10}
              required
            />
            <button type="submit" className="submit-button">
              Submit Instructions
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
