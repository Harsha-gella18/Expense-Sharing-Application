import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            💰 Expense Sharing
          </Link>
          
          <nav className="nav">
            <Link to="/" className={isActive('/')}>
              Dashboard
            </Link>
            <Link to="/groups" className={isActive('/groups')}>
              Groups
            </Link>
          </nav>

          <div className="user-menu">
            <span className="user-name">{user?.username}</span>
            <button onClick={logout} className="btn btn-small btn-outline">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
