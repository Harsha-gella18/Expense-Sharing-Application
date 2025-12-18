import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { groupsAPI } from '../services/api'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinGroupModal from '../components/JoinGroupModal'
import './Groups.css'

function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getAll()
      setGroups(response.data.groups)
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups])
    setShowCreateModal(false)
    toast.success('Group created successfully!')
  }

  const handleGroupJoined = () => {
    setShowJoinModal(false)
    toast.success('Join request sent successfully!')
    fetchGroups()
  }

  if (loading) {
    return <div className="loading">Loading groups...</div>
  }

  return (
    <div className="groups-page">
      <div className="groups-header">
        <h1>My Groups</h1>
        <div className="groups-actions">
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

      {groups.length === 0 ? (
        <div className="empty-state">
          <h3>No groups yet</h3>
          <p>Create a new group or join an existing one to get started</p>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <Link 
              key={group._id} 
              to={`/groups/${group._id}`}
              className="group-card"
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
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}

      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onGroupJoined={handleGroupJoined}
        />
      )}
    </div>
  )
}

export default Groups
