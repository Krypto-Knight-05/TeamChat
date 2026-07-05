import React, { useState } from 'react';
import axios from '../api/axios';

const JoinTeamModal = ({ onClose }) => {
  const [groupId, setGroupId] = useState('');
  const [status, setStatus] = useState(null); // null | 'pending' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const { data } = await axios.post('/api/teams/join', { groupId: groupId.trim().toUpperCase() });
      setStatus('pending');
      setMessage(`Request sent to join "${data.team.name}". Waiting for admin approval.`);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to send join request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Join a Team</h2>
          <button id="join-team-close-btn" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {status === null && (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Enter the 8-character Group ID shared by your team admin.
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="join-group-id">Group ID</label>
              <input
                id="join-group-id"
                className="form-input"
                type="text"
                placeholder="e.g. AB12CD34"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value.toUpperCase())}
                maxLength={8}
                required
                autoFocus
                style={{ fontFamily: 'Courier New, monospace', letterSpacing: '0.1em', fontSize: '16px' }}
              />
            </div>
            <button
              id="join-team-submit-btn"
              className="btn btn-primary"
              type="submit"
              disabled={loading || groupId.length !== 8}
              style={{ marginTop: '8px' }}
            >
              {loading ? <span className="spinner" /> : 'Send Join Request'}
            </button>
          </form>
        )}

        {status === 'pending' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <div className="pending-badge" style={{ display: 'inline-flex', marginBottom: '12px' }}>
              Request Pending
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '10px' }}>
              {message}
            </p>
            <button
              id="join-team-close-done-btn"
              className="btn btn-ghost"
              onClick={onClose}
              style={{ marginTop: '18px', width: '100%' }}
            >
              Close
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="form-error">{message}</div>
            <button className="btn btn-ghost" onClick={() => setStatus(null)} style={{ width: '100%' }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTeamModal;
