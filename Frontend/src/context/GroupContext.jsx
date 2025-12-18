import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const GroupContext = createContext(null)

export const useGroup = () => {
  const context = useContext(GroupContext)
  if (!context) {
    throw new Error('useGroup must be used within GroupProvider')
  }
  return context
}

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([])
  const [currentGroup, setCurrentGroup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all user groups
  const fetchGroups = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/groups')
      setGroups(response.data.groups)
      return { success: true, data: response.data.groups }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch groups'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Create new group
  const createGroup = async (groupData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.post('/groups', groupData)
      const newGroup = response.data.group
      setGroups(prev => [newGroup, ...prev])
      return { success: true, data: newGroup }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create group'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Join group with code
  const joinGroup = async (joinCode) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.post('/groups/join', { joinCode: parseInt(joinCode) })
      await fetchGroups() // Refresh groups list
      return { success: true, data: response.data }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to join group'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Respond to join request
  const respondToJoinRequest = async (groupId, requestId, action) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.post(
        `/groups/${groupId}/join-requests/${requestId}/respond`,
        { action }
      )
      await fetchGroups() // Refresh to get updated members
      return { success: true, data: response.data }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to respond to request'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Get specific group details
  const getGroupById = (groupId) => {
    return groups.find(g => g._id === groupId)
  }

  const value = {
    groups,
    currentGroup,
    setCurrentGroup,
    loading,
    error,
    fetchGroups,
    createGroup,
    joinGroup,
    respondToJoinRequest,
    getGroupById,
  }

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
}
