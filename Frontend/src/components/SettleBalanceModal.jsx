import { useState } from 'react'
import { balancesAPI } from '../services/api'
import './Modal.css'

function SettleBalanceModal({ groupId, members, balances, currentUserId, onClose, onBalanceSettled }) {
  const [formData, setFormData] = useState({
    toUser: '',
    amount: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get balances where current user owes money
  const userOwes = balances.filter(
    b => b.fromUser?._id === currentUserId && b.amount > 0
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

      await balancesAPI.settle(groupId, settlementData)
      onBalanceSettled()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to settle balance')
    } finally {
      setLoading(false)
    }
  }

  const handleUserChange = (e) => {
    const userId = e.target.value
    setFormData({ ...formData, toUser: userId, amount: '' })
    
    // Find the balance with this user and pre-fill the amount
    const balance = userOwes.find(b => b.toUser?._id === userId)
    if (balance) {
      setFormData({ toUser: userId, amount: balance.amount.toString() })
    }
  }

  if (userOwes.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Settle Balance</h2>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="empty-state" style={{ padding: '2rem' }}>
            <h3>No outstanding balances</h3>
            <p>You don't owe anyone in this group</p>
          </div>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settle Balance</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="toUser" className="form-label">Pay To</label>
            <select
              id="toUser"
              className="form-select"
              value={formData.toUser}
              onChange={handleUserChange}
              required
            >
              <option value="">Select member</option>
              {userOwes.map((balance) => (
                <option key={balance._id} value={balance.toUser._id}>
                  {balance.toUser.username} - Owe: ₹{balance.amount.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              className="form-input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
              max={
                userOwes.find(b => b.toUser?._id === formData.toUser)?.amount || undefined
              }
            />
            {formData.toUser && (
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                Maximum: ₹{userOwes.find(b => b.toUser?._id === formData.toUser)?.amount.toFixed(2)}
              </small>
            )}
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
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? 'Settling...' : 'Settle Balance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SettleBalanceModal
