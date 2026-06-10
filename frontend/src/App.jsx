import { useState, useEffect, useRef } from 'react'

const API = 'http://localhost:3001/api'

async function apiGet(path) {
  const res = await fetch(API + path)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
async function apiPost(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
async function apiDelete(path) {
  const res = await fetch(API + path, { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

const USERS_KEY = 'chitti_users'
const SESSION_KEY = 'chitti_auth'
function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') }
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }
function getLoggedIn() { return localStorage.getItem(SESSION_KEY) }
function setLoggedIn(e) { localStorage.setItem(SESSION_KEY, e) }
function doLogout() { localStorage.removeItem(SESSION_KEY) }

// ══════════════════════════════════════════
//  AUTH SCREEN
// ══════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [newPass, setNewPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function go(m) { setMode(m); setError(''); setSuccess('') }

  function handleLogin(e) {
    e.preventDefault(); setError('')
    const user = getUsers().find(u => u.email === email && u.password === password)
    if (!user) return setError('Wrong email or password!')
    setLoggedIn(email); onLogin(email)
  }
  function handleSignup(e) {
    e.preventDefault(); setError('')
    if (password !== confirm) return setError('Passwords do not match!')
    if (password.length < 6) return setError('Password must be at least 6 characters!')
    const users = getUsers()
    if (users.find(u => u.email === email)) return setError('Email already registered!')
    users.push({ email, password }); saveUsers(users)
    setSuccess('Account created! Please login.')
    setMode('login'); setPassword(''); setConfirm('')
  }
  function handleForgot(e) {
    e.preventDefault(); setError('')
    const users = getUsers()
    const idx = users.findIndex(u => u.email === email)
    if (idx === -1) return setError('Email not found!')
    if (newPass.length < 6) return setError('Password must be at least 6 characters!')
    users[idx].password = newPass; saveUsers(users)
    setSuccess('Password reset! Please login.')
    setMode('login'); setNewPass('')
  }

  const titles = { login: 'Welcome Back', signup: 'Create Account', forgot: 'Reset Password' }
  const subs = { login: 'Login to Chitti AI', signup: 'Join Chitti AI for free', forgot: 'Reset your password' }

  return (
    <div className="auth-bg">
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-icon-wrap"><span className="auth-icon">🤖</span></div>
          <h1 className="auth-app-name">Chitti AI</h1>
          <p className="auth-tagline">Free · Fast · Intelligent</p>
        </div>

        <div className="auth-tabs">
          {['login','signup'].map(t => (
            <button key={t} className={`auth-tab ${mode===t?'active':''}`} onClick={() => go(t)}>
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="auth-form-title">{titles[mode]}</div>
        <div className="auth-form-sub">{subs[mode]}</div>

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="field-wrap">
              <span className="field-icon">✉️</span>
              <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field-wrap">
              <span className="field-icon">🔒</span>
              <input className="auth-input" type={showPass?'text':'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>{showPass?'🙈':'👁️'}</button>
            </div>
            {error && <div className="auth-error">⚠️ {error}</div>}
            {success && <div className="auth-success">✅ {success}</div>}
            <button className="auth-btn" type="submit">Login →</button>
            <div className="auth-forgot" onClick={() => go('forgot')}>Forgot password?</div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup}>
            <div className="field-wrap">
              <span className="field-icon">✉️</span>
              <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field-wrap">
              <span className="field-icon">🔒</span>
              <input className="auth-input" type={showPass?'text':'password'} placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>{showPass?'🙈':'👁️'}</button>
            </div>
            <div className="field-wrap">
              <span className="field-icon">🔒</span>
              <input className="auth-input" type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            {error && <div className="auth-error">⚠️ {error}</div>}
            <button className="auth-btn" type="submit">Create Account →</button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot}>
            <div className="field-wrap">
              <span className="field-icon">✉️</span>
              <input className="auth-input" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field-wrap">
              <span className="field-icon">🔑</span>
              <input className="auth-input" type="password" placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
            </div>
            {error && <div className="auth-error">⚠️ {error}</div>}
            {success && <div className="auth-success">✅ {success}</div>}
            <button className="auth-btn" type="submit">Reset Password →</button>
            <div className="auth-forgot" onClick={() => go('login')}>← Back to Login</div>
          </form>
        )}

        <div className="auth-footer">Free forever · No credit card needed</div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
//  MAIN CHAT APP
// ══════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(getLoggedIn())
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingMsg, setEditingMsg] = useState(null)
  const [editText, setEditText] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => { if (user) loadSessions() }, [user])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  if (!user) return <AuthScreen onLogin={setUser} />

  async function loadSessions() {
    try { setSessions(await apiGet('/sessions')) }
    catch (e) { setError('Cannot connect to backend. Run: cd backend && node server.js') }
  }

  async function newChat() {
    try {
      const s = await apiPost('/sessions', {})
      setSessions(prev => [s, ...prev])
      setActiveSession(s); setMessages([]); setError('')
    } catch (e) { setError(e.message) }
  }

  async function loadSession(s) {
    setActiveSession(s); setError('')
    try { setMessages(await apiGet(`/sessions/${s.id}/messages`)) }
    catch (e) { setError(e.message) }
  }

  async function deleteSession(e, id) {
    e.stopPropagation()
    try {
      await apiDelete(`/sessions/${id}`)
      setSessions(prev => prev.filter(s => s.id !== id))
      if (activeSession?.id === id) { setActiveSession(null); setMessages([]) }
    } catch (e) { setError(e.message) }
  }

  async function sendMessage(textOverride) {
    const text = (textOverride || input).trim()
    if (!text || loading) return
    let session = activeSession
    if (!session) {
      try { session = await apiPost('/sessions', {}); setSessions(prev => [session, ...prev]); setActiveSession(session) }
      catch (e) { setError(e.message); return }
    }
    setInput(''); setError('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const data = await apiPost('/chat', { sessionId: session.id, message: text })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      loadSessions()
    } catch (e) {
      setError('Error: ' + e.message)
      setMessages(prev => prev.slice(0, -1))
    } finally { setLoading(false) }
  }

  async function submitEdit(idx) {
    const newText = editText.trim()
    if (!newText) return
    setMessages(messages.slice(0, idx)); setEditingMsg(null)
    await sendMessage(newText)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  function handleLogout() {
    doLogout(); setUser(null); setSessions([]); setActiveSession(null); setMessages([])
  }

  const initials = user ? user[0].toUpperCase() : '?'

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">🤖 <span>Chitti AI</span></div>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <button className="new-chat-btn" onClick={newChat}>
          <span>+</span> New Chat
        </button>

        <div className="session-list">
          <div className="session-list-label">Recent Chats</div>
          {sessions.length === 0 && <p className="empty-hint">No chats yet</p>}
          {sessions.map(s => (
            <div key={s.id} className={`session-item ${activeSession?.id === s.id ? 'active' : ''}`} onClick={() => loadSession(s)}>
              <span className="session-icon">💬</span>
              <span className="session-title">{s.title}</span>
              <button className="delete-btn" onClick={(e) => deleteSession(e, s.id)} title="Delete">🗑</button>
            </div>
          ))}
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-email">{user}</div>
            <div className="user-plan">Free Plan</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          {!sidebarOpen && (
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          )}
          <span className="topbar-title">{activeSession ? activeSession.title : 'Chitti AI'}</span>
          <div className="topbar-badge">🟢 Online</div>
        </div>

        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-robot">🤖</div>
              <h2>Hi, I'm Chitti!</h2>
              <p>Your free AI assistant — powered by OpenRouter</p>
              <div className="suggestions">
                {['Write a Python function', 'Help me write an email', 'Explain AI simply', 'Tell me a joke'].map(s => (
                  <button key={s} className="suggestion-btn" onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="avatar">{msg.role === 'user' ? initials : '🤖'}</div>
              <div className="bubble-wrap">
                {editingMsg === i ? (
                  <div className="edit-box">
                    <textarea className="edit-input" value={editText} onChange={e => setEditText(e.target.value)} rows={3} />
                    <div className="edit-btns">
                      <button className="edit-save" onClick={() => submitEdit(i)}>Send ➤</button>
                      <button className="edit-cancel" onClick={() => setEditingMsg(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bubble"><pre className="msg-text">{msg.content}</pre></div>
                    {msg.role === 'user' && (
                      <button className="edit-msg-btn" onClick={() => { setEditingMsg(i); setEditText(msg.content) }} title="Edit">✏️ Edit</button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="avatar">🤖</div>
              <div className="bubble">
                <div className="typing"><span/><span/><span/></div>
              </div>
            </div>
          )}

          {error && <div className="error-banner">⚠️ {error}</div>}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-box">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask Chitti anything... (Enter to send, Shift+Enter for new line)"
              rows={1} disabled={loading} />
            <button className={`send-btn ${loading || !input.trim() ? 'disabled' : ''}`}
              onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? '⏳' : '➤'}
            </button>
          </div>
          <p className="hint">Chitti AI · Free via OpenRouter · History saved on your computer</p>
        </div>
      </div>
    </div>
  )
}
