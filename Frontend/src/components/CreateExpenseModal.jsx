import { useState } from 'react'
import { expensesAPI } from '../services/api'
import './Modal.css'
import './CreateExpenseModal.css'

function CreateExpenseModal({ groupId, members, onClose, onExpenseCreated }) {
  const [formData, setFormData] = useState({
    description: '',
    totalAmount: '',
    paidBy: '',
    splitType: 'EQUAL',
    splitDetails: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Prepare split details based on split type
      let splitDetails = []
      
      if (formData.splitType === 'EQUAL') {
        // Equal split among all selected members
        const selectedMembers = members.filter(m => 
          formData.splitDetails.includes(m.userId._id)
        )
        const amountPerPerson = parseFloat(formData.totalAmount) / selectedMembers.length
        
        splitDetails = selectedMembers.map(member => ({
          userId: member.userId._id,
          amount: amountPerPerson
        }))
      } else {
        // For EXACT and PERCENTAGE, splitDetails should already be formatted
        splitDetails = formData.splitDetails
      }

      const expenseData = {
        description: formData.description,
        totalAmount: parseFloat(formData.totalAmount),
        paidBy: formData.paidBy,
        splitType: formData.splitType,
        splitDetails
      }

      await expensesAPI.create(groupId, expenseData)
      onExpenseCreated()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  const handleMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      splitDetails: prev.splitDetails.includes(userId)
        ? prev.splitDetails.filter(id => id !== userId)
        : [...prev.splitDetails, userId]
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
            <label htmlFor="description" className="form-label">Description</label>
            <input
              id="description"
              type="text"
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Dinner at restaurant"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalAmount" className="form-label">Total Amount</label>
            <input
              id="totalAmount"
              type="number"
              step="0.01"
              className="form-input"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="paidBy" className="form-label">Paid By</label>
            <select
              id="paidBy"
              className="form-select"
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              required
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
            <label htmlFor="splitType" className="form-label">Split Type</label>
            <select
              id="splitType"
              className="form-select"
              value={formData.splitType}
              onChange={(e) => setFormData({ ...formData, splitType: e.target.value, splitDetails: [] })}
            >
              <option value="EQUAL">Equal Split</option>
              <option value="EXACT">Exact Amounts</option>
              <option value="PERCENTAGE">Percentage</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Split Between</label>
            <div className="members-checkbox-list">
              {members?.map((member) => (
                <label key={member._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.splitDetails.includes(member.userId._id)}
                    onChange={() => handleMemberToggle(member.userId._id)}
                  />
                  <span>{member.userId.username}</span>
                </label>
              ))}
            </div>
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
              disabled={loading || formData.splitDetails.length === 0}
            >
              {loading ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateExpenseModal
