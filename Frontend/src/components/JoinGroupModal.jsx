import { useState } from 'react'
import { groupsAPI } from '../services/api'
import './Modal.css'

function JoinGroupModal({ onClose, onGroupJoined }) {
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await groupsAPI.join(parseInt(joinCode))
      onGroupJoined()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join a Group</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

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
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinGroupModal
