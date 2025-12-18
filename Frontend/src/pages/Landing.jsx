import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import './Landing.css'

function Landing() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      toast.success('Login successful!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
    
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await signup(username, email, password)
    
    if (result.success) {
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
    
    setLoading(false)
  }

  const closeModals = () => {
    setShowLogin(false)
    setShowSignup(false)
    setEmail('')
    setPassword('')
    setUsername('')
  }

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-header">
          <div className="logo-section">
            <span className="logo-icon">💰</span>
            <h1 className="logo-text">Expense Sharing</h1>
          </div>
        </div>

        <div className="hero-section">
          <h2 className="hero-title">Split Expenses with Friends</h2>
          <p className="hero-subtitle">
            The easiest way to share bills and manage group expenses. 
            Track who owes what, settle up, and keep everyone happy.
          </p>

          <div className="cta-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => setShowSignup(true)}
            >
              Get Started
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          </div>
        </div>

        <div className="features-section">
          <div className="feature">
            <span className="feature-icon">👥</span>
            <h3>Create Groups</h3>
            <p>Organize expenses by trips, roommates, or events</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Track Balances</h3>
            <p>See who owes whom at a glance</p>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <h3>Settle Up</h3>
            <p>Record payments and settle balances easily</p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>&times;</button>
            <h2 className="modal-title">Welcome Back</h2>
            <p className="modal-subtitle">Login to manage your shared expenses</p>
            
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="modal-footer">
              Don't have an account?{' '}
              <button 
                className="link-button"
                onClick={() => {
                  setShowLogin(false)
                  setShowSignup(true)
                }}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>&times;</button>
            <h2 className="modal-title">Create Account</h2>
            <p className="modal-subtitle">Start sharing expenses with your friends</p>
            
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-username" className="form-label">Username</label>
                <input
                  id="signup-username"
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Choose a username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email" className="form-label">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-password" className="form-label">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                  minLength="6"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="modal-footer">
              Already have an account?{' '}
              <button 
                className="link-button"
                onClick={() => {
                  setShowSignup(false)
                  setShowLogin(true)
                }}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Landing
