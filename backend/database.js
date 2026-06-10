// Pure JavaScript database - no build tools needed!
// Saves all chats to a JSON file on your computer

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'chatdata.json');

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ sessions: {}, messages: {} }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function createSession(id, title) {
  const data = loadData();
  const session = {
    id,
    title: title || 'New Chat',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  data.sessions[id] = session;
  data.messages[id] = [];
  saveData(data);
  return session;
}

function getAllSessions() {
  const data = loadData();
  return Object.values(data.sessions).sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );
}

function updateSessionTitle(id, title) {
  const data = loadData();
  if (data.sessions[id]) {
    data.sessions[id].title = title;
    data.sessions[id].updated_at = new Date().toISOString();
    saveData(data);
  }
}

function deleteSession(id) {
  const data = loadData();
  delete data.sessions[id];
  delete data.messages[id];
  saveData(data);
}

function saveMessage(sessionId, role, content) {
  const data = loadData();
  if (!data.messages[sessionId]) data.messages[sessionId] = [];
  data.messages[sessionId].push({ role, content });
  if (data.sessions[sessionId]) {
    data.sessions[sessionId].updated_at = new Date().toISOString();
  }
  saveData(data);
}

function getMessages(sessionId) {
  const data = loadData();
  return data.messages[sessionId] || [];
}

module.exports = {
  createSession,
  getAllSessions,
  updateSessionTitle,
  deleteSession,
  saveMessage,
  getMessages,
};
