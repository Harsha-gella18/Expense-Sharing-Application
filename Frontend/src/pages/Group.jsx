import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useGroup } from '../context/GroupContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import BalanceView from '../components/BalanceView'
import SettlementForm from '../components/SettlementForm'
import SettlementsList from '../components/SettlementsList'
import './Group.css'

function Group() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const { getGroupById, fetchGroups } = useGroup()
  const navigate = useNavigate()
  
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [settlements, setSettlements] = useState([])
  const [joinRequests, setJoinRequests] = useState([])
  const [activeTab, setActiveTab] = useState('expenses')
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showSettlementForm, setShowSettlementForm] = useState(false)

  useEffect(() => {
    loadGroupData()
  }, [groupId])

  const loadGroupData = async () => {
    try {
      setLoading(true)
      
      // Fetch group directly by ID, along with expenses, balances, settlements, and join requests
      const [groupRes, expensesRes, balancesRes, settlementsRes, joinRequestsRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/expenses`),
        api.get(`/groups/${groupId}/balances`),
        api.get(`/groups/${groupId}/settlements`),
        api.get(`/groups/${groupId}/join-requests`)
      ])

      if (!groupRes.data.group) {
        toast.error('Group not found')
        navigate('/dashboard')
        return
      }

      setGroup(groupRes.data.group)
      setExpenses(expensesRes.data.expenses || [])
      setBalances(balancesRes.data.balances || [])
      setSettlements(settlementsRes.data.settlements || [])
      setJoinRequests(joinRequestsRes.data.joinRequests || [])
    } catch (error) {
      console.error('Error loading group data:', error)
      toast.error(error.response?.data?.error || 'Failed to load group data')
      if (error.response?.status === 404) {
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseCreated = async () => {
    setShowExpenseForm(false)
    await loadGroupData()
    toast.success('Expense created successfully!')
  }

  const handleExpenseResponse = async (expenseId, action) => {
    try {
      await api.post(`/expenses/${expenseId}/respond`, { action })
      toast.success(`Expense ${action.toLowerCase()}ed successfully!`)
      await loadGroupData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to respond to expense')
    }
  }

  const handleBalanceSettled = async () => {
    setShowSettlementForm(false)
    await loadGroupData()
    toast.success('Settlement request sent successfully!')
  }

  const handleSettlementResponse = async (settlementId, action) => {
    try {
      await api.post(`/settlements/${settlementId}/respond`, { action })
      toast.success(`Settlement ${action.toLowerCase()}ed successfully!`)
      await loadGroupData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to respond to settlement')
    }
  }

  const handleJoinRequestResponse = async (requestId, action) => {
    try {
      await api.post(`/groups/${groupId}/join-requests/${requestId}/respond`, { action })
      toast.success(`Join request ${action.toLowerCase()}ed successfully!`)
      await loadGroupData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to respond to join request')
    }
  }

  if (loading) {
    return <div className="loading">Loading group...</div>
  }

  if (!group) {
    return <div className="empty-state">Group not found</div>
  }

  // Separate expenses by status
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING')
  const approvedExpenses = expenses.filter(e => e.status === 'APPROVED')
  const rejectedExpenses = expenses.filter(e => e.status === 'REJECTED')

  return (
    <div className="group-page">
      <div className="group-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        
        <div className="group-title-section">
          <h1>{group.name}</h1>
          <div className="group-meta">
            <span className="group-code-badge">Code: {group.joinCode}</span>
            <span className="group-members-count">
              👥 {group.members?.length} members
            </span>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="group-section card">
        <h3>Members</h3>
        <div className="members-list">
          {group.members?.map((member) => (
            <div key={member._id} className="member-item">
              <div className="member-avatar-large">
                {member.userId?.username?.[0]?.toUpperCase()}
              </div>
              <div className="member-info">
                <div className="member-name">{member.userId?.username}</div>
                <div className="member-email">{member.userId?.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Requests Section */}
      {joinRequests.length > 0 && (
        <div className="group-section card">
          <h3>
            Pending Join Requests 
            <span className="badge badge-warning">{joinRequests.length}</span>
          </h3>
          <div className="join-requests-list">
            {joinRequests.map((request) => (
              <div key={request._id} className="join-request-item">
                <div className="member-avatar-large">
                  {request.userId?.username?.[0]?.toUpperCase()}
                </div>
                <div className="member-info">
                  <div className="member-name">{request.userId?.username}</div>
                  <div className="member-email">{request.userId?.email}</div>
                  <div className="request-time">
                    Requested {new Date(request.requestedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="join-request-actions">
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => handleJoinRequestResponse(request._id, 'ACCEPT')}
                  >
                    ✓ Accept
                  </button>
                  <button
                    className="btn btn-small btn-outline"
                    onClick={() => handleJoinRequestResponse(request._id, 'REJECT')}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            📝 Expenses
          </button>
          <button
            className={`tab ${activeTab === 'balances' ? 'active' : ''}`}
            onClick={() => setActiveTab('balances')}
          >
            💰 Balances
          </button>
          <button
            className={`tab ${activeTab === 'settlements' ? 'active' : ''}`}
            onClick={() => setActiveTab('settlements')}
          >
            💸 Settlements
          </button>
        </div>

        <div className="tab-actions">
          {activeTab === 'expenses' && (
            <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
              ➕ Add Expense
            </button>
          )}
          {activeTab === 'settlements' && (
            <button className="btn btn-secondary" onClick={() => setShowSettlementForm(true)}>
              💸 Settle Balance
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'expenses' && (
          <div className="expenses-tab">
            {pendingExpenses.length > 0 && (
              <div className="expense-section">
                <h3 className="section-title">
                  <span className="badge badge-pending">Pending Approval</span>
                  <span className="section-count">({pendingExpenses.length})</span>
                </h3>
                <p className="section-note">
                  ⚠️ These expenses will not affect balances until all participants approve
                </p>
                <ExpenseList
                  expenses={pendingExpenses}
                  currentUserId={user?.id}
                  onRespond={handleExpenseResponse}
                />
              </div>
            )}

            {approvedExpenses.length > 0 && (
              <div className="expense-section">
                <h3 className="section-title">
                  <span className="badge badge-approved">Approved</span>
                  <span className="section-count">({approvedExpenses.length})</span>
                </h3>
                <p className="section-note">
                  ✅ These expenses have been approved and balances are updated
                </p>
                <ExpenseList
                  expenses={approvedExpenses}
                  currentUserId={user?.id}
                  onRespond={handleExpenseResponse}
                />
              </div>
            )}

            {rejectedExpenses.length > 0 && (
              <div className="expense-section">
                <h3 className="section-title">
                  <span className="badge badge-rejected">Rejected</span>
                  <span className="section-count">({rejectedExpenses.length})</span>
                </h3>
                <ExpenseList
                  expenses={rejectedExpenses}
                  currentUserId={user?.id}
                  onRespond={handleExpenseResponse}
                />
              </div>
            )}

            {expenses.length === 0 && (
              <div className="empty-state">
                <h3>No expenses yet</h3>
                <p>Add your first expense to start tracking</p>
                <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
                  ➕ Add Expense
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <BalanceView balances={balances} currentUserId={user?.id} />
        )}

        {activeTab === 'settlements' && (
          <div className="settlements-tab">
            <SettlementsList
              settlements={settlements}
              currentUserId={user?.id}
              onResponse={handleSettlementResponse}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showExpenseForm && (
        <ExpenseForm
          groupId={groupId}
          members={group.members}
          onClose={() => setShowExpenseForm(false)}
          onSuccess={handleExpenseCreated}
        />
      )}

      {showSettlementForm && (
        <SettlementForm
          groupId={groupId}
          members={group.members}
          balances={balances}
          currentUserId={user?.id}
          onClose={() => setShowSettlementForm(false)}
          onSettled={handleBalanceSettled}
          isModal={true}
        />
      )}
    </div>
  )
}

export default Group
