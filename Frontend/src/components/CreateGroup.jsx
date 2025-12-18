import { useState } from 'react'
import { useGroup } from '../context/GroupContext'
import './CreateGroup.css'

function CreateGroup({ onClose, onSuccess }) {
  const [name, setName] = useState('')
  const { createGroup, loading } = useGroup()
  const [error, setError] = useState('')
  const [joinCode, setJoinCode] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const result = await createGroup({ name })
    
    if (result.success) {
      setJoinCode(result.data.joinCode)
      if (onSuccess) onSuccess(result.data)
    } else {
      setError(result.error)
    }
  }

  const handleClose = () => {
    if (joinCode && onSuccess) {
      onSuccess()
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Group</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        {!joinCode ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="groupName" className="form-label">
                Group Name
              </label>
              <input
                id="groupName"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekend Trip, Roommates"
                required
                autoFocus
                disabled={loading}
              />
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
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h3>Group Created Successfully!</h3>
            <div className="join-code-display">
              <label>Share this code with members:</label>
              <div className="code-value">{joinCode}</div>
            </div>
            <p className="help-text">
              Members can join using this 6-digit code. You can find it later in the group details.
            </p>
            <button className="btn btn-primary" onClick={handleClose}>
              Go to Group
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateGroup
