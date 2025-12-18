import { useState } from 'react'
import api from '../api/axios'
import './ExpenseForm.css'

function ExpenseForm({ groupId, members, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    description: '',
    totalAmount: '',
    paidBy: '',
    splitType: 'EQUAL',
    selectedParticipants: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.selectedParticipants.length === 0) {
      setError('Please select at least one participant')
      return
    }

    setLoading(true)

    try {
      // Prepare split details based on split type
      let splitDetails = []
      const amount = parseFloat(formData.totalAmount)

      if (formData.splitType === 'EQUAL') {
        const perPerson = amount / formData.selectedParticipants.length
        splitDetails = formData.selectedParticipants.map(userId => ({
          userId,
          value: perPerson
        }))
      } else {
        // For EXACT and PERCENTAGE, we'll use equal split for now
        // In a full implementation, you'd have inputs for each participant
        const perPerson = amount / formData.selectedParticipants.length
        splitDetails = formData.selectedParticipants.map(userId => ({
          userId,
          value: perPerson
        }))
      }

      const expenseData = {
        description: formData.description,
        totalAmount: amount,
        paidBy: formData.paidBy,
        splitType: formData.splitType,
        splitDetails
      }

      await api.post(`/groups/${groupId}/expenses`, expenseData)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  const handleParticipantToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      selectedParticipants: prev.selectedParticipants.includes(userId)
        ? prev.selectedParticipants.filter(id => id !== userId)
        : [...prev.selectedParticipants, userId]
    }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Expense</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <input
              id="description"
              type="text"
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Dinner at restaurant"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalAmount" className="form-label">
              Total Amount *
            </label>
            <input
              id="totalAmount"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="paidBy" className="form-label">
              Paid By *
            </label>
            <select
              id="paidBy"
              className="form-select"
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              required
              disabled={loading}
            >
              <option value="">Select member</option>
              {members?.map((member) => (
                <option key={member._id} value={member.userId._id}>
                  {member.userId.username}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="splitType" className="form-label">
              Split Type *
            </label>
            <select
              id="splitType"
              className="form-select"
              value={formData.splitType}
              onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
              disabled={loading}
            >
              <option value="EQUAL">Equal Split</option>
              <option value="EXACT">Exact Amounts</option>
              <option value="PERCENTAGE">Percentage</option>
            </select>
            <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
              For this version, all split types divide equally. Advanced splits coming soon!
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              Split Between * (Select participants)
            </label>
            <div className="participants-list">
              {members?.map((member) => (
                <label key={member._id} className="participant-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.selectedParticipants.includes(member.userId._id)}
                    onChange={() => handleParticipantToggle(member.userId._id)}
                    disabled={loading}
                  />
                  <span className="participant-name">{member.userId.username}</span>
                  {formData.selectedParticipants.includes(member.userId._id) && formData.totalAmount && (
                    <span className="participant-amount">
                      ₹{(parseFloat(formData.totalAmount) / formData.selectedParticipants.length).toFixed(2)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-info">
            <strong>Important:</strong> This expense will be marked as PENDING until all participants approve it. 
            It will not affect balances until approved.
          </div>

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
              disabled={loading || formData.selectedParticipants.length === 0}
            >
              {loading ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseForm
