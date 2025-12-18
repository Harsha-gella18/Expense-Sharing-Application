import { useState } from 'react'
import api from '../api/axios'
import './SettlementForm.css'

function SettlementForm({ groupId, members, balances, currentUserId, onClose, onSettled, isModal = true }) {
  const [formData, setFormData] = useState({
    toUser: '',
    amount: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get balances where current user owes money
  const userOwes = balances.filter(
    b => (b.fromUser?._id || b.fromUser) === currentUserId && b.amount > 0
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const settlementData = {
        toUser: formData.toUser,
        amount: parseFloat(formData.amount)
      }

      await api.post(`/groups/${groupId}/settle`, settlementData)
      if (onSettled) onSettled()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to settle balance')
    } finally {
      setLoading(false)
    }
  }

  const handleUserChange = (e) => {
    const userId = e.target.value
    setFormData({ ...formData, toUser: userId, amount: '' })
    
    // Find the balance with this user and pre-fill the amount
    const balance = userOwes.find(b => (b.toUser?._id || b.toUser) === userId)
    if (balance) {
      setFormData({ toUser: userId, amount: balance.amount.toString() })
    }
  }

  const content = (
    <>
      {userOwes.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <h3>No outstanding balances</h3>
          <p>You don't owe anyone in this group</p>
          {isModal && (
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="toUser" className="form-label">
              Settle Payment To *
            </label>
            <select
              id="toUser"
              className="form-select"
              value={formData.toUser}
              onChange={handleUserChange}
              required
              disabled={loading}
            >
              <option value="">Select member</option>
              {userOwes.map((balance) => (
                <option key={balance._id} value={balance.toUser._id || balance.toUser}>
                  {balance.toUser.username} - You owe: ₹{balance.amount.toFixed(2)}
                </option>
              ))}
            </select>
            <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
              Select who you want to pay
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              Settlement Amount *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
              disabled={loading}
              max={
                userOwes.find(b => (b.toUser?._id || b.toUser) === formData.toUser)?.amount || undefined
              }
            />
            {formData.toUser && (
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                Maximum: ₹{userOwes.find(b => (b.toUser?._id || b.toUser) === formData.toUser)?.amount.toFixed(2)}
              </small>
            )}
          </div>

          <div className="settlement-info">
            <strong>Note:</strong> Mark this settlement only after you have actually paid the person. 
            This will reduce your balance with them by the specified amount.
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className={isModal ? "modal-actions" : "form-actions"}>
            {isModal && (
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? 'Settling...' : '💸 Settle Balance'}
            </button>
          </div>
        </form>
      )}
    </>
  )

  if (!isModal) {
    return <div className="settlement-form-container">{content}</div>
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settle Balance</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {content}
      </div>
    </div>
  )
}

export default SettlementForm
