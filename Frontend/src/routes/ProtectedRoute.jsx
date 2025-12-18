import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/" replace />
}

export default ProtectedRoute
