
import { useState } from 'react'
import './App.css'

function JadeerMark({ className = '' }) {
  return (
    <span className={`jadeer-mark ${className}`} aria-hidden="true">
      <span className="square square-1" />
      <span className="square square-2" />
      <span className="square square-3" />
      <span className="square square-4" />
    </span>
  )
}

function JadeerLoader() {
  return <JadeerMark className="login-mark" />
}

function App() {
  const [theme, setTheme] = useState('light')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    alert('Login is not connected yet. Authentication will be added later.')
  }

  return (
    <main className={`login-page ${theme}`} data-theme={theme}>
      <div className="architecture-image" aria-hidden="true" />

      <header className="page-header">
        <a className="brand" href="/" aria-label="Jadeer home">
          
          <span className="brand-name">Jadeer</span>
          <span className="brand-arabic" lang="ar" dir="rtl">
            جــــــــــدير
          </span>
          <span className="brand-tagline" lang="ar" dir="rtl">
            للتسويق والاستثمار العقاري
          </span>
        </a>

        <div className="brand-promise">
          <span>BETTER PROPERTIES</span>
          <span>A BRIGHTER FUTURE</span>

          

          <button
            className="theme-toggle"
            type="button"
            onClick={() =>
              setTheme((current) =>
                current === 'light' ? 'dark' : 'light'
              )
            }
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '☾' : '☀'}
            <span>
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </span>
          </button>
        </div>
      </header>

      <section className="login-card">
        <JadeerLoader />

        <div className="card-heading">
          <p className="eyebrow">JADEER WORKSPACE</p>
          <h1>Welcome Back</h1>
          <p className="description">
            Sign in to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>

          <div className="password-field">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="form-options">
            <label className="remember-option">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="text-button"
              onClick={() =>
                alert('Password recovery will be added later.')
              }
            >
              Forgot password?
            </button>
          </div>

          <button className="sign-in-button" type="submit">
            Sign In <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="security-note">
          <span className="security-dot" />
          Authorized company personnel only
        </div>
      </section>

      <footer className="page-footer">
        <span>
          ⌂ <span>Residential</span>
        </span>
        <i />
        <span>
          ▦ <span>Commercial</span>
        </span>
        <i />
        <span>
          ◇ <span>Land</span>
        </span>
      </footer>

      <JadeerMark className="signature-mark" />
    </main>
  )
}

export default App
