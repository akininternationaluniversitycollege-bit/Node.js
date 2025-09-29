// ai-website.js
// Run with: node ai-website.js
// Install once: npm install express @google/generative-ai cors

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 REPLACE THIS WITH YOUR ACTUAL API KEY FROM https://aistudio.google.com/api-keys
const API_KEY = 'YOUR_API_KEY_HERE';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Serve the single HTML page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Exclusive AI Assistant</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #f8fafc;
      color: #1e293b;
    }
    h1 {
      color: #4f46e5;
      text-align: center;
      margin-bottom: 10px;
    }
    .subtitle {
      text-align: center;
      color: #64748b;
      margin-bottom: 30px;
    }
    textarea {
      width: 100%;
      height: 120px;
      padding: 14px;
      margin: 12px 0;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 16px;
      resize: vertical;
      box-sizing: border-box;
    }
    button {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      display: block;
      margin: 0 auto;
      transition: background 0.2s;
    }
    button:hover {
      background: #4338ca;
    }
    button:disabled {
      background: #a5b4fc;
      cursor: not-allowed;
    }
    #response {
      margin-top: 24px;
      padding: 18px;
      background: white;
      border-radius: 12px;
      border-left: 4px solid #818cf8;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      white-space: pre-wrap;
      line-height: 1.6;
    }
    .loading {
      color: #7c3aed;
      font-style: italic;
    }
    .error {
      color: #ef4444;
    }
  </style>
</head>
<body>
  <h1>✨ Exclusive AI Assistant</h1>
  <p class="subtitle">Powered by Google Gemini & AI Studio</p>
  <textarea id="prompt" placeholder="Ask anything... e.g., 'Write a poem about the moon'"></textarea>
  <button onclick="askAI()" id="sendBtn">Send</button>
  <div id="response"></div>

  <script>
    async function askAI() {
      const prompt = document.getElementById('prompt').value.trim();
      const responseDiv = document.getElementById('response');
      const sendBtn = document.getElementById('sendBtn');
      
      if (!prompt) {
        responseDiv.innerHTML = '<span class="error">Please enter a question.</span>';
        return;
      }

      sendBtn.disabled = true;
      responseDiv.innerHTML = '<span class="loading">🧠 Thinking...</span>';

      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        const data = await res.json();

        if (res.ok) {
          responseDiv.textContent = data.reply;
        } else {
          responseDiv.innerHTML = '<span class="error">❌ ' + (data.error || 'Unknown error') + '</span>';
        }
      } catch (err) {
        responseDiv.innerHTML = '<span class="error">🌐 Network error. Is the server running?</span>';
      } finally {
        sendBtn.disabled = false;
      }
    }

    // Allow Enter+Shift for new line, Enter alone to send
    document.getElementById('prompt').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        askAI();
      }
    });
  </script>
</body>
</html>
  `);
});

// AI API endpoint
app.post('/api/ask', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('AI Error:', error.message || error);
    let msg = 'Failed to reach AI service.';
    if (error.message?.includes('API_KEY_INVALID')) {
      msg = 'Invalid API key. Check your Google AI Studio key.';
    }
    res.status(500).json({ error: msg });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Exclusive AI Website is running at http://localhost:${PORT}`);
  console.log(`🔑 Make sure your API key is set correctly in the code.`);
});

