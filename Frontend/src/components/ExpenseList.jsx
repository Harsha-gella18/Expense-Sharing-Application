import './ExpenseList.css'

function ExpenseList({ expenses, currentUserId, onRespond }) {
  if (!expenses || expenses.length === 0) {
    return null
  }

  return (
    <div className="expenses-list">
      {expenses.map((expense) => {
        const userApproval = expense.approvals?.find(
          a => a.userId._id === currentUserId || a.userId === currentUserId
        )
        const isPending = userApproval?.status === 'PENDING'
        
        // Show approval status for each participant
        const approvalSummary = expense.approvals ? {
          total: expense.approvals.length,
          accepted: expense.approvals.filter(a => a.status === 'ACCEPTED').length,
          pending: expense.approvals.filter(a => a.status === 'PENDING').length,
          rejected: expense.approvals.filter(a => a.status === 'REJECTED').length
        } : null

        return (
          <div key={expense._id} className="expense-card card">
            <div className="expense-header">
              <div>
                <h3 className="expense-description">{expense.description}</h3>
                <p className="expense-meta">
                  Paid by <strong>{expense.paidBy?.username}</strong>
                  <span className="separator">•</span>
                  {new Date(expense.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="expense-amount">
                ₹{expense.totalAmount.toFixed(2)}
              </div>
            </div>

            <div className="expense-details">
              <div className="expense-info-row">
                <span className="info-label">Split Type:</span>
                <span className="info-value">
                  <span className={`badge badge-${expense.splitType.toLowerCase()}`}>
                    {expense.splitType}
                  </span>
                </span>
              </div>
              <div className="expense-info-row">
                <span className="info-label">Status:</span>
                <span className={`badge badge-${expense.status.toLowerCase()}`}>
                  {expense.status}
                </span>
              </div>
              {approvalSummary && (
                <div className="expense-info-row">
                  <span className="info-label">Approvals:</span>
                  <span className="info-value approval-summary">
                    ✓ {approvalSummary.accepted} / {approvalSummary.total}
                    {approvalSummary.pending > 0 && (
                      <span className="pending-count"> ({approvalSummary.pending} pending)</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {expense.splitDetails && expense.splitDetails.length > 0 && (
              <div className="split-details">
                <h4>Split Details:</h4>
                <div className="split-list">
                  {expense.splitDetails.map((split, index) => {
                    const approval = expense.approvals?.find(
                      a => (a.userId._id || a.userId) === (split.userId._id || split.userId)
                    )
                    // Calculate actual amount based on split type
                    let splitAmount = 0;
                    if (expense.splitType === 'EQUAL') {
                      splitAmount = expense.totalAmount / expense.splitDetails.length;
                    } else if (expense.splitType === 'EXACT') {
                      splitAmount = split.value;
                    } else if (expense.splitType === 'PERCENTAGE') {
                      splitAmount = (split.value / 100) * expense.totalAmount;
                    }
                    
                    return (
                      <div key={index} className="split-item">
                        <span className="split-user">
                          {split.userId?.username || 'Unknown'}
                          {approval && (
                            <span className={`approval-badge badge-${approval.status.toLowerCase()}`}>
                              {approval.status === 'ACCEPTED' && '✓'}
                              {approval.status === 'PENDING' && '⏳'}
                              {approval.status === 'REJECTED' && '✗'}
                            </span>
                          )}
                        </span>
                        <span className="split-amount">
                          ₹{splitAmount.toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {isPending && (
              <div className="expense-actions">
                <div className="action-message">
                  ⚠️ Please review and approve/reject this expense
                </div>
                <div className="action-buttons">
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => onRespond(expense._id, 'ACCEPT')}
                  >
                    ✓ Accept
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => onRespond(expense._id, 'REJECT')}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ExpenseList
