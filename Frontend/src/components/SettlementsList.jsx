import { useState } from 'react'
import './SettlementsList.css'

function SettlementsList({ settlements, currentUserId, onResponse }) {
  const [respondingTo, setRespondingTo] = useState(null)

  // Separate settlements into pending and history
  const pendingSettlements = settlements.filter(s => s.status === 'PENDING')
  const completedSettlements = settlements.filter(s => s.status !== 'PENDING')

  // Filter pending settlements where current user is the recipient
  const pendingForMe = pendingSettlements.filter(
    s => (s.toUser._id || s.toUser) === currentUserId
  )

  // Filter pending settlements where current user is the sender
  const pendingFromMe = pendingSettlements.filter(
    s => (s.fromUser._id || s.fromUser) === currentUserId
  )

  const handleResponse = async (settlementId, action) => {
    setRespondingTo(settlementId)
    try {
      await onResponse(settlementId, action)
    } finally {
      setRespondingTo(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (settlements.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Settlements</h3>
        <p>No settlement requests yet</p>
      </div>
    )
  }

  return (
    <div className="settlements-container">
      {/* Pending settlements for current user to respond */}
      {pendingForMe.length > 0 && (
        <div className="settlements-section">
          <h3 className="section-title">Pending Approvals</h3>
          <div className="settlements-list">
            {pendingForMe.map((settlement) => (
              <div key={settlement._id} className="settlement-card card pending-card">
                <div className="settlement-header">
                  <div className="settlement-user">
                    <div className="user-avatar">
                      {settlement.fromUser?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{settlement.fromUser?.username}</div>
                      <div className="settlement-message">wants to settle</div>
                    </div>
                  </div>
                  <div className="settlement-amount">₹{settlement.amount.toFixed(2)}</div>
                </div>
                <div className="settlement-footer">
                  <div className="settlement-date">{formatDate(settlement.createdAt)}</div>
                  <div className="settlement-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleResponse(settlement._id, 'REJECT')}
                      disabled={respondingTo === settlement._id}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleResponse(settlement._id, 'ACCEPT')}
                      disabled={respondingTo === settlement._id}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending settlements sent by current user */}
      {pendingFromMe.length > 0 && (
        <div className="settlements-section">
          <h3 className="section-title">Waiting for Approval</h3>
          <div className="settlements-list">
            {pendingFromMe.map((settlement) => (
              <div key={settlement._id} className="settlement-card card sent-card">
                <div className="settlement-header">
                  <div className="settlement-user">
                    <div className="user-avatar">
                      {settlement.toUser?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{settlement.toUser?.username}</div>
                      <div className="settlement-message">Pending approval</div>
                    </div>
                  </div>
                  <div className="settlement-amount">₹{settlement.amount.toFixed(2)}</div>
                </div>
                <div className="settlement-footer">
                  <div className="settlement-date">{formatDate(settlement.createdAt)}</div>
                  <span className="badge badge-pending">⏳ Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed settlements history */}
      {completedSettlements.length > 0 && (
        <div className="settlements-section">
          <h3 className="section-title">Settlement History</h3>
          <div className="settlements-list">
            {completedSettlements.map((settlement) => {
              const isFromMe = (settlement.fromUser._id || settlement.fromUser) === currentUserId
              const otherUser = isFromMe ? settlement.toUser : settlement.fromUser
              
              return (
                <div key={settlement._id} className="settlement-card card history-card">
                  <div className="settlement-header">
                    <div className="settlement-user">
                      <div className="user-avatar">
                        {otherUser?.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{otherUser?.username}</div>
                        <div className="settlement-message">
                          {isFromMe ? 'You settled' : 'Settled with you'}
                        </div>
                      </div>
                    </div>
                    <div className="settlement-amount">₹{settlement.amount.toFixed(2)}</div>
                  </div>
                  <div className="settlement-footer">
                    <div className="settlement-date">{formatDate(settlement.createdAt)}</div>
                    <span className={`badge badge-${settlement.status.toLowerCase()}`}>
                      {settlement.status === 'ACCEPTED' && '✓ Accepted'}
                      {settlement.status === 'REJECTED' && '✗ Rejected'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default SettlementsList
