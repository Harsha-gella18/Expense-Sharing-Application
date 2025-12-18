import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'
import { useNavigate } from 'react-router-dom'
import CreateGroup from '../components/CreateGroup'
import JoinGroup from '../components/JoinGroup'
import './Dashboard.css'

function Dashboard() {
  const { user } = useAuth()
  const { groups, fetchGroups, loading } = useGroup()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`)
  }

  const handleGroupCreated = async (group) => {
    setShowCreateModal(false)
    if (group) {
      await fetchGroups()
      navigate(`/groups/${group.id}`)
    }
  }

  const handleGroupJoined = async () => {
    setShowJoinModal(false)
    await fetchGroups()
  }

  if (loading && groups.length === 0) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p className="dashboard-subtitle">
            Manage your shared expenses easily
          </p>
        </div>
        <div className="dashboard-actions-inline">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Create Group
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowJoinModal(true)}
          >
            🔗 Join Group
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{groups.length}</div>
            <div className="stat-label">Active Groups</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">Track</div>
            <div className="stat-label">Shared Expenses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">Balance</div>
            <div className="stat-label">Settle Balances</div>
          </div>
        </div>
      </div>

      <div className="groups-section">
        <h2>Your Groups</h2>
        {groups.length === 0 ? (
          <div className="empty-state">
            <h3>No groups yet</h3>
            <p>Create a new group or join an existing one to get started</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                Create Group
              </button>
              <button className="btn btn-secondary" onClick={() => setShowJoinModal(true)}>
                Join Group
              </button>
            </div>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => (
              <div 
                key={group._id} 
                className="group-card"
                onClick={() => handleGroupClick(group._id)}
              >
                <div className="group-header">
                  <h3>{group.name}</h3>
                  <span className="group-code">Code: {group.joinCode}</span>
                </div>
                <div className="group-info">
                  <div className="group-stat">
                    <span className="stat-icon">👥</span>
                    <span>{group.members?.length || 0} members</span>
                  </div>
                  <div className="group-stat">
                    <span className="stat-icon">📅</span>
                    <span>
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="group-members">
                  {group.members?.slice(0, 5).map((member) => (
                    <div key={member._id} className="member-avatar" title={member.userId?.username}>
                      {member.userId?.username?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {group.members?.length > 5 && (
                    <div className="member-avatar">+{group.members.length - 5}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroup
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleGroupCreated}
        />
      )}

      {showJoinModal && (
        <JoinGroup
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleGroupJoined}
        />
      )}
    </div>
  )
}

export default Dashboard
