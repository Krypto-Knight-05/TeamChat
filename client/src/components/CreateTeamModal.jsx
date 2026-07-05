import React, { useState } from 'react';
import axios from '../api/axios';

const CreateTeamModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [created, setCreated] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/teams/create', form);
      setCreated(data);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  const copyGroupId = () => {
    navigator.clipboard.writeText(created.groupId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create a Team</h2>
          <button id="create-team-close-btn" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!created ? (
          <>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-team-name">Team Name</label>
                <input
                  id="new-team-name"
                  className="form-input"
                  type="text"
                  name="name"
                  placeholder="e.g. Design Team"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-team-desc">Description (optional)</label>
                <input
                  id="new-team-desc"
                  className="form-input"
                  type="text"
                  name="description"
                  placeholder="What is this team for?"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              <button
                id="create-team-submit-btn"
                className="btn btn-primary"
                type="submit"
                disabled={loading}
                style={{ marginTop: '8px' }}
              >
                {loading ? <span className="spinner" /> : 'Create Team'}
              </button>
            </form>
          </>
        ) : (
          <div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              🎉 <strong style={{ color: 'var(--text-primary)' }}>{created.name}</strong> was created! Share the Group ID below with people you want to invite.
            </p>

            <div className="group-id-box">
              <div>
                <div className="group-id-label">Group ID</div>
                <div className="group-id-value">{created.groupId}</div>
              </div>
              <button id="copy-group-id-btn" className="copy-btn" onClick={copyGroupId}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Members can join using this code. Only you (the admin) can approve join requests.
            </p>

            <button id="create-team-done-btn" className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTeamModal;
