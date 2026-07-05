import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const AdminRequestsPanel = ({ team, onClose, socket }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(`/api/teams/${team.id}/requests`);
      setRequests(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [team.id]);

  const handleAction = async (requestId, action, userId) => {
    setProcessing((p) => ({ ...p, [requestId]: true }));
    try {
      const { data } = await axios.post(`/api/teams/${team.id}/requests/${requestId}`, { action });

      // Notify the user via socket
      if (socket) {
        socket.emit('request:notify', {
          userId,
          teamId: team.id,
          teamName: team.name,
          action,
        });
      }

      // Remove the request from list after action
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setProcessing((p) => ({ ...p, [requestId]: false }));
    }
  };

  const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : '??';

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Join Requests — {team.name}</h2>
          <button id="admin-panel-close-btn" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <span className="spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
            No pending join requests
          </div>
        ) : (
          <div className="requests-panel">
            {requests.map((req) => (
              <div className="request-item" key={req.id}>
                <div className="request-avatar">{getInitials(req.user.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="request-name">{req.user.name}</div>
                  <div className="request-email">{req.user.email}</div>
                </div>
                <div className="request-actions">
                  <button
                    id={`accept-req-${req.id}`}
                    className="btn btn-success"
                    disabled={processing[req.id]}
                    onClick={() => handleAction(req.id, 'ACCEPTED', req.user.id)}
                  >
                    {processing[req.id] ? '...' : 'Accept'}
                  </button>
                  <button
                    id={`reject-req-${req.id}`}
                    className="btn btn-danger"
                    disabled={processing[req.id]}
                    onClick={() => handleAction(req.id, 'REJECTED', req.user.id)}
                  >
                    {processing[req.id] ? '...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequestsPanel;
