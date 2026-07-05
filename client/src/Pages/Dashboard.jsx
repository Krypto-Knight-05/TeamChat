import React, { useState, useEffect, useRef, useCallback } from 'react';
import useAuth from '../context/authContext';
import { getSocket, disconnectSocket } from '../lib/socket';
import axios from '../api/axios';
import CreateTeamModal from '../components/CreateTeamModal';
import JoinTeamModal from '../components/JoinTeamModal';
import AdminRequestsPanel from '../components/AdminRequestsPanel';

const Dashboard = () => {
  const { user, token, logout } = useAuth();

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  const [notification, setNotification] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toast notification helper
  const showNotif = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // Connect socket
  useEffect(() => {
    if (!token) return;
    const s = getSocket(token);

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));

    s.on('chat:new', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Notify user if their join request was handled
    s.on('request:result', ({ teamName, action }) => {
      if (action === 'ACCEPTED') {
        showNotif(`🎉 You were accepted into "${teamName}"! Refresh your teams.`, 'success');
        fetchTeams();
      } else {
        showNotif(`Your request to join "${teamName}" was declined.`, 'error');
      }
    });

    setSocket(s);

    return () => {
      disconnectSocket();
    };
  }, [token]);

  // Fetch teams on mount
  const fetchTeams = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/teams/my');
      setTeams(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Switch to a team
  const openTeam = async (team) => {
    if (activeTeam?.id === team.id) return;

    // Leave old room
    if (activeTeam && socket) {
      socket.emit('team:leave', { teamId: activeTeam.id });
    }

    setActiveTeam(team);
    setMessages([]);

    // Join new socket room
    if (socket) {
      socket.emit('team:join', { teamId: team.id }, ({ ok, error }) => {
        if (!ok) showNotif(error, 'error');
      });
    }

    // Load message history
    try {
      const { data } = await axios.get(`/api/teams/${team.id}/messages`);
      setMessages(data);
    } catch {
      showNotif('Failed to load messages', 'error');
    }

    inputRef.current?.focus();
  };

  // Send message
  const sendMessage = () => {
    if (!text.trim() || !socket || !activeTeam) return;
    socket.emit('chat:send', { teamId: activeTeam.id, text: text.trim() }, ({ ok, error }) => {
      if (!ok) showNotif(error, 'error');
    });
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Helpers
  const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : '??';
  const isAdmin = (team) => team?.adminId === user?.id;

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group messages by sender (consecutive messages from same sender)
  const groupMessages = (msgs) => {
    const groups = [];
    msgs.forEach((msg) => {
      const last = groups[groups.length - 1];
      if (last && last.senderId === msg.sender.id) {
        last.messages.push(msg);
      } else {
        groups.push({ senderId: msg.sender.id, senderName: msg.sender.name, messages: [msg] });
      }
    });
    return groups;
  };

  const messageGroups = groupMessages(messages);
  const isMine = (senderId) => senderId === user?.id;

  return (
    <div className="dashboard">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-icon">💬</div>
          TeamChat
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-user">
          <div className="topbar-avatar">{getInitials(user?.name)}</div>
          <span>{user?.name}</span>
          <span
            className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}
            title={isConnected ? 'Connected' : 'Disconnected'}
            style={{ marginLeft: '4px' }}
          />
        </div>
        <button
          id="logout-btn"
          className="btn btn-ghost"
          onClick={logout}
          style={{ marginLeft: '8px', padding: '6px 14px', fontSize: '13px' }}
        >
          Sign Out
        </button>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">Your Teams ({teams.length})</div>

          <div className="sidebar-teams">
            {teams.length === 0 && (
              <div className="empty-state">
                No teams yet. Create or join one!
              </div>
            )}
            {teams.map((team) => (
              <div
                key={team.id}
                className={`team-item ${activeTeam?.id === team.id ? 'active' : ''}`}
                onClick={() => openTeam(team)}
                id={`team-item-${team.id}`}
              >
                <div className="team-avatar">{getInitials(team.name)}</div>
                <div className="team-info">
                  <div className="team-name">{team.name}</div>
                  <div className="team-meta">
                    {team._count?.members ?? 0} member{team._count?.members !== 1 ? 's' : ''}
                  </div>
                </div>
                {isAdmin(team) && (
                  <span className="team-admin-badge">Admin</span>
                )}
              </div>
            ))}
          </div>

          <div className="sidebar-actions">
            <button
              id="create-team-btn"
              className="sidebar-btn primary"
              onClick={() => setShowCreate(true)}
            >
              ＋ Create Team
            </button>
            <button
              id="join-team-btn"
              className="sidebar-btn"
              onClick={() => setShowJoin(true)}
            >
              ⊕ Join Team
            </button>
            {activeTeam && isAdmin(activeTeam) && (
              <button
                id="admin-requests-btn"
                className="sidebar-btn"
                onClick={() => setShowRequests(true)}
                style={{ color: 'var(--accent)', borderColor: 'rgba(26,122,74,0.25)' }}
              >
                🔔 Join Requests
              </button>
            )}
          </div>
        </aside>

        {/* Chat Panel */}
        <main className="chat-panel">
          {!activeTeam ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <div className="chat-empty-title">Select a team to start chatting</div>
              <div className="chat-empty-text">Or create / join a new team from the sidebar.</div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-avatar">{getInitials(activeTeam.name)}</div>
                <div className="chat-header-info">
                  <div className="chat-header-name">{activeTeam.name}</div>
                  <div className="chat-header-meta">
                    {activeTeam.description || `${activeTeam._count?.members ?? ''} members`}
                    {isAdmin(activeTeam) && ' · You are the admin'}
                  </div>
                </div>
                <span
                  style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>

              {/* Messages */}
              <div className="messages-container" id="messages-container">
                {messages.length === 0 && (
                  <div className="empty-state" style={{ marginTop: '40px' }}>
                    No messages yet. Say hello! 👋
                  </div>
                )}

                {messageGroups.map((group, gi) => (
                  <div key={gi}>
                    {!isMine(group.senderId) && (
                      <div className="message-sender-label">{group.senderName}</div>
                    )}
                    {group.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`message-row ${isMine(msg.sender.id) ? 'mine' : 'theirs'}`}
                      >
                        <div className={`bubble ${isMine(msg.sender.id) ? 'mine' : 'theirs'}`}>
                          {msg.text}
                          <div className="bubble-time">{formatTime(msg.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="message-input-bar">
                <input
                  id="message-input"
                  ref={inputRef}
                  className="message-input"
                  type="text"
                  placeholder={`Message #${activeTeam.name}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isConnected}
                  autoComplete="off"
                />
                <button
                  id="send-message-btn"
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={!isConnected || !text.trim()}
                  title="Send message"
                >
                  ↑
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreated={(team) => {
            setTeams((prev) => [team, ...prev]);
            showNotif(`Team "${team.name}" created!`);
          }}
        />
      )}

      {showJoin && <JoinTeamModal onClose={() => setShowJoin(false)} />}

      {showRequests && activeTeam && (
        <AdminRequestsPanel
          team={activeTeam}
          socket={socket}
          onClose={() => {
            setShowRequests(false);
            fetchTeams(); // refresh member counts
          }}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.msg}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
