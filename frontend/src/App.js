import React, { useState } from 'react';
import './App.css';
const SERVERURL = process.env.REACT_APP_SERVERURL;

function App() {
  const [url, setUrl] = useState('');
  const [passcode, setPasscode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          passcode: passcode || null,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>URL Shortener</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your URL"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Optional 5-digit passcode"
              pattern="[0-9]{5}"
              title="5-digit passcode (optional)"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && (
          <div className="result">
            <h3>Shortened URL:</h3>
            <div className="url-box">
              <a href={`/${result.shortUrl}`} target="_blank" rel="noopener noreferrer">
                {SERVERURL}/{result.shortUrl}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${SERVERURL}/${result.shortUrl}`);
                }}
                className="copy-button"
              >
                Copy
              </button>
            </div>
            {result.passcode && (
              <p className="passcode-info">
                Passcode: {result.passcode}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;