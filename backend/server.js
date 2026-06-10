require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
app.use(cors({ origin: 'https://chitti-ai-kappa.vercel.app' }));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

app.get('/api/sessions', (req, res) => {
  res.json(db.getAllSessions());
});

app.post('/api/sessions', (req, res) => {
  res.json(db.createSession(uuidv4(), 'New Chat'));
});

app.delete('/api/sessions/:id', (req, res) => {
  db.deleteSession(req.params.id);
  res.json({ success: true });
});

app.get('/api/sessions/:id/messages', (req, res) => {
  res.json(db.getMessages(req.params.id));
});

app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;
  if (!sessionId || !message) {
    return res.status(400).json({ error: 'Missing sessionId or message' });
  }
  try {
    const history = db.getMessages(sessionId);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Chitti AI',
      },
      body: JSON.stringify({
        model: 'openrouter/owl-alpha',
        messages: [
          { role: 'system', content: 'Your name is Chitti. You are a helpful AI assistant. Be friendly and clear.' },
          ...history,
          { role: 'user', content: message },
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || 'No response';

    db.saveMessage(sessionId, 'user', message);
    db.saveMessage(sessionId, 'assistant', reply);

    const allMsgs = db.getMessages(sessionId);
    if (allMsgs.length === 2) {
      db.updateSessionTitle(sessionId, message.slice(0, 40));
    }

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Chitti AI running at http://localhost:${PORT}`);
});