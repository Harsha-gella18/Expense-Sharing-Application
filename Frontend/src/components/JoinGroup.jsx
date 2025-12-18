import { useState } from 'react'
import { useGroup } from '../context/GroupContext'

function JoinGroup({ onClose, onSuccess }) {
  const [joinCode, setJoinCode] = useState('')
  const [status, setStatus] = useState(null) // null, 'pending', 'accepted', 'rejected'
  const { joinGroup, loading } = useGroup()
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const result = await joinGroup(joinCode)
    
    if (result.success) {
      setStatus('pending')
      if (onSuccess) onSuccess()
    } else {
      setError(result.error)
    }
  }

  const handleClose = () => {
    if (status === 'pending' && onSuccess) {
      onSuccess()
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join a Group</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        {!status ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="joinCode" className="form-label">
                Join Code
              </label>
              <input
                id="joinCode"
                type="number"
                className="form-input"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                autoFocus
                disabled={loading}
                maxLength={6}
              />
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                Ask the group admin for the join code
              </small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending Request...' : 'Send Join Request'}
              </button>
            </div>
          </form>
        ) : (
          <div className="status-content">
            <div className={`status-icon status-${status}`}>
              {status === 'pending' && '⏳'}
              {status === 'accepted' && '✓'}
              {status === 'rejected' && '✗'}
            </div>
            <h3>
              {status === 'pending' && 'Request Sent'}
              {status === 'accepted' && 'Request Accepted'}
              {status === 'rejected' && 'Request Rejected'}
            </h3>
            <p className="status-message">
              {status === 'pending' && 'Your join request has been sent to group members. You\'ll be notified once they approve it.'}
              {status === 'accepted' && 'You\'ve been added to the group! You can now view and add expenses.'}
              {status === 'rejected' && 'Your join request was rejected. Please contact the group admin.'}
            </p>
            <button className="btn btn-primary" onClick={handleClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JoinGroup
