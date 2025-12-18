import './BalanceView.css'

function BalanceView({ balances, currentUserId }) {
  if (!balances || balances.length === 0) {
    return (
      <div className="empty-state">
        <h3>No balances yet</h3>
        <p>Balances will appear here after expenses are approved</p>
      </div>
    )
  }

  // Separate balances into what user owes and what they're owed
  const userOwes = balances.filter(b => b.fromUser?._id === currentUserId && b.amount > 0)
  const userIsOwed = balances.filter(b => b.toUser?._id === currentUserId && b.amount > 0)

  return (
    <div className="balances-container">
      {userOwes.length > 0 && (
        <div className="balance-section">
          <h3 className="section-title">You Owe</h3>
          <div className="balances-list">
            {userOwes.map((balance) => (
              <div key={balance._id} className="balance-card card owe-card">
                <div className="balance-user">
                  <div className="user-avatar">
                    {balance.toUser?.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{balance.toUser?.username}</div>
                    <div className="user-email">{balance.toUser?.email}</div>
                  </div>
                </div>
                <div className="balance-amount owe-amount">
                  ₹{balance.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userIsOwed.length > 0 && (
        <div className="balance-section">
          <h3 className="section-title">You Are Owed</h3>
          <div className="balances-list">
            {userIsOwed.map((balance) => (
              <div key={balance._id} className="balance-card card owed-card">
                <div className="balance-user">
                  <div className="user-avatar">
                    {balance.fromUser?.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{balance.fromUser?.username}</div>
                    <div className="user-email">{balance.fromUser?.email}</div>
                  </div>
                </div>
                <div className="balance-amount owed-amount">
                  ₹{balance.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userOwes.length === 0 && userIsOwed.length === 0 && (
        <div className="empty-state">
          <h3>All settled up! 🎉</h3>
          <p>You have no outstanding balances</p>
        </div>
      )}
    </div>
  )
}

export default BalanceView
