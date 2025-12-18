import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { groupsAPI, expensesAPI, balancesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import CreateExpenseModal from '../components/CreateExpenseModal'
import ExpensesList from '../components/ExpensesList'
import BalancesList from '../components/BalancesList'
import SettleBalanceModal from '../components/SettleBalanceModal'
import './GroupDetail.css'

function GroupDetail() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('expenses')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showSettleModal, setShowSettleModal] = useState(false)

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        groupsAPI.getAll(),
        expensesAPI.getGroupExpenses(groupId),
        balancesAPI.getGroupBalances(groupId)
      ])

      const currentGroup = groupRes.data.groups.find(g => g._id === groupId)
      if (!currentGroup) {
        toast.error('Group not found')
        navigate('/groups')
        return
      }

      setGroup(currentGroup)
      setExpenses(expensesRes.data.expenses || [])
      setBalances(balancesRes.data.balances || [])
    } catch (error) {
      console.error('Error fetching group data:', error)
      toast.error('Failed to load group data')
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseCreated = () => {
    setShowExpenseModal(false)
    fetchGroupData()
    toast.success('Expense created successfully!')
  }

  const handleExpenseResponse = async (expenseId, action) => {
    try {
      await expensesAPI.respond(expenseId, action)
      toast.success(`Expense ${action.toLowerCase()}ed successfully!`)
      fetchGroupData()
    } catch (error) {
      toast.error('Failed to respond to expense')
    }
  }

  const handleBalanceSettled = () => {
    setShowSettleModal(false)
    fetchGroupData()
    toast.success('Balance settled successfully!')
  }

  if (loading) {
    return <div className="loading">Loading group...</div>
  }

  if (!group) {
    return <div className="empty-state">Group not found</div>
  }

  return (
    <div className="group-detail">
      <div className="group-detail-header">
        <button className="back-btn" onClick={() => navigate('/groups')}>
          ← Back to Groups
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

      <div className="group-members-section card">
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

      <div className="group-tabs">
        <button
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          📝 Expenses
        </button>
        <button
          className={`tab-btn ${activeTab === 'balances' ? 'active' : ''}`}
          onClick={() => setActiveTab('balances')}
        >
          💰 Balances
        </button>
      </div>

      <div className="group-actions-bar">
        {activeTab === 'expenses' && (
          <button
            className="btn btn-primary"
            onClick={() => setShowExpenseModal(true)}
          >
            ➕ Add Expense
          </button>
        )}
        {activeTab === 'balances' && (
          <button
            className="btn btn-secondary"
            onClick={() => setShowSettleModal(true)}
          >
            💸 Settle Balance
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'expenses' ? (
          <ExpensesList
            expenses={expenses}
            currentUserId={user?.id}
            onRespond={handleExpenseResponse}
          />
        ) : (
          <BalancesList balances={balances} currentUserId={user?.id} />
        )}
      </div>

      {showExpenseModal && (
        <CreateExpenseModal
          groupId={groupId}
          members={group.members}
          onClose={() => setShowExpenseModal(false)}
          onExpenseCreated={handleExpenseCreated}
        />
      )}

      {showSettleModal && (
        <SettleBalanceModal
          groupId={groupId}
          members={group.members}
          balances={balances}
          currentUserId={user?.id}
          onClose={() => setShowSettleModal(false)}
          onBalanceSettled={handleBalanceSettled}
        />
      )}
    </div>
  )
}

export default GroupDetail
