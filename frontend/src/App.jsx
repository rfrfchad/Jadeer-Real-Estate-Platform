import { useEffect, useState } from 'react'
import './App.css'
import AgentDashboard from './AgentDashboard'
import AdminDashboard from './AdminDashboard'

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

// Demo directory only: replace these placeholder records with the company's
// owner database/API when the backend is implemented. No real contact data is used.
const demoOwnerDirectory = {
  '14-395-third': { name: 'مالك تجريبي لقطعة 395', phone: '010-XXX-XXXX' },
  '14-304-fourth-right': { name: 'مالك تجريبي لقطعة 304 (يمين)', phone: '010-XXX-XXXX' },
  '14-304-fourth-left': { name: 'مالك تجريبي لقطعة 304 (يسار)', phone: '010-XXX-XXXX' },
  '14-304-fourth-rear': { name: 'مالك تجريبي لقطعة 304 (خلفي)', phone: '010-XXX-XXXX' },
  '14-403-fourth': { name: 'مالك تجريبي لقطعة 403', phone: '010-XXX-XXXX' },
  '14-240-second': { name: 'مالك تجريبي لقطعة 240', phone: '010-XXX-XXXX' },
  '14-222-ground': { name: 'مالك تجريبي لقطعة 222', phone: '010-XXX-XXXX' },
  '14-51-third': { name: 'مالك تجريبي لقطعة 51', phone: '010-XXX-XXXX' },
  '14-97-third': { name: 'مالك تجريبي لقطعة 97', phone: '010-XXX-XXXX' },
  '14-60-second': { name: 'مالك تجريبي لقطعة 60', phone: '010-XXX-XXXX' },
  '21-868-ground': { name: 'مالك تجريبي لقطعة 868', phone: '010-XXX-XXXX' },
  '21-883-third': { name: 'مالك تجريبي لقطعة 883', phone: '010-XXX-XXXX' },
  '21-789-fourth': { name: 'مالك تجريبي لقطعة 789', phone: '010-XXX-XXXX' },
  '21-834-fourth': { name: 'مالك تجريبي لقطعة 834', phone: '010-XXX-XXXX' },
}

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const makeAttendanceRecord = (date = new Date()) => ({
  id: `agent-demo-${getLocalDateKey(date)}`,
  agentId: 'agent-demo',
  agentName: 'مستخدم الوكيل',
  dateKey: getLocalDateKey(date),
  dateLabel: date.toLocaleDateString('ar-EG'),
  checkInTime: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
  checkInTimestamp: date.toISOString(),
  checkOutTime: '',
  sharesDone: 0,
  approvedApartments: 0,
  status: 'in_progress',
  finalized: false,
})

function App() {
  const [theme, setTheme] = useState('light')
  const [dashboardTheme, setDashboardTheme] = useState('light')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showDashboard, setShowDashboard] = useState(true)
  const [workspaceRole, setWorkspaceRole] = useState('agent')

  // Shared in-memory prototype state lets the Agent and Admin previews see the same requests/messages.
  const [ownerRequests, setOwnerRequests] = useState([])
  const [ownerMessages, setOwnerMessages] = useState([])
  const [staffMessages, setStaffMessages] = useState([])
  const [propertySubmissionRequests, setPropertySubmissionRequests] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])

  const todayDateKey = getLocalDateKey()
  const approvedApartmentsToday = propertySubmissionRequests.filter((request) =>
    request.type === 'apartment' && request.status === 'approved' && request.approvedDateKey === todayDateKey
  ).length

  // Frontend prototype: create one daily check-in when the Agent workspace is opened.
  // The production version should create this record on authenticated server login.
  useEffect(() => {
    if (!showDashboard || workspaceRole !== 'agent') return
    const now = new Date()
    setAttendanceRecords((current) => {
      const dateKey = getLocalDateKey(now)
      const exists = current.some((record) => record.agentId === 'agent-demo' && record.dateKey === dateKey)
      return exists ? current : [makeAttendanceRecord(now), ...current]
    })
  }, [showDashboard, workspaceRole])

  function handleSharesProgressChange(value) {
    const now = new Date()
    const dateKey = getLocalDateKey(now)
    setAttendanceRecords((current) => {
      const exists = current.some((record) => record.agentId === 'agent-demo' && record.dateKey === dateKey)
      if (!exists) return [{ ...makeAttendanceRecord(now), sharesDone: value }, ...current]
      return current.map((record) =>
        record.agentId === 'agent-demo' && record.dateKey === dateKey && !record.finalized
          ? { ...record, sharesDone: value }
          : record
      )
    })
  }

  function handleFinalizeAttendance(recordId) {
    const recordToFinalize = attendanceRecords.find((record) => record.id === recordId)
    if (!recordToFinalize || recordToFinalize.finalized) return

    const dateKey = recordToFinalize.dateKey
    const approvedApartments = propertySubmissionRequests.filter((request) =>
      request.type === 'apartment' && request.status === 'approved' && request.approvedDateKey === dateKey
    ).length
    const sharesDone = Number(recordToFinalize.sharesDone || 0)
    const isPresent = sharesDone >= 300 && approvedApartments >= 3
    const now = new Date()

    setAttendanceRecords((current) => current.map((record) =>
      record.id === recordId
        ? {
            ...record,
            sharesDone,
            approvedApartments,
            status: isPresent ? 'present' : 'absent',
            finalized: true,
            checkOutTime: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            checkOutTimestamp: now.toISOString(),
            finalizedAt: now.toLocaleString('ar-EG'),
          }
        : record
    ))
  }

  function handleSubmit(event) {
    event.preventDefault()
    alert('Login is not connected yet. Authentication will be added later.')
  }

  function handleRejectOwnerRequest(requestId) {
    const reviewedAt = new Date().toLocaleString('ar-EG')
    setOwnerRequests((current) => current.map((request) =>
      request.id === requestId && request.status === 'pending'
        ? { ...request, status: 'rejected', reviewedAt }
        : request
    ))
  }

  function handleApproveOwnerRequest(requestId) {
    const request = ownerRequests.find((item) => item.id === requestId)
    if (!request || request.status !== 'pending') return

    const submittedPropertyRequest = propertySubmissionRequests.find(
      (item) => item.status === 'approved' && `submitted-${item.id}` === request.propertyId
    )
    const submittedOwner = submittedPropertyRequest?.data || {}
    const owner = demoOwnerDirectory[request.propertyId] || (submittedOwner.ownerPhone
      ? { name: submittedOwner.ownerName || `مالك قطعة ${submittedOwner.pieceNumber || ''}`, phone: submittedOwner.ownerPhone }
      : null)
    if (!owner) {
      alert('لم يتم العثور على سجل مالك لهذا العقار في الدليل التجريبي.')
      return
    }

    const reviewedAt = new Date().toLocaleString('ar-EG')
    setOwnerRequests((current) => current.map((item) =>
      item.id === requestId
        ? {
            ...item,
            status: 'approved',
            ownerName: owner.name,
            ownerPhone: owner.phone,
            ownerDataIsDemo: true,
            reviewedAt,
          }
        : item
    ))

    const property = request.property || {}
    const isNonApartment = property.type && property.type !== 'apartment'
    const propertySummary = isNonApartment
      ? `${property.typeLabel || 'أرض'} قطعة ${property.building}، ${property.regionLabel || `المنطقة ${property.zone}`}، مساحة ${property.area} م²`
      : `مالك قطعة ${property.building}، الدور ${property.floor || '—'}، ${property.facing || '—'}`
    const newMessage = {
      id: `owner-message-${Date.now()}`,
      requestId: request.id,
      ownerName: owner.name,
      ownerPhone: owner.phone,
      ownerDataIsDemo: true,
      propertySummary,
      zone: property.zone,
      building: property.building,
      floor: property.floor,
      facing: property.facing,
      area: property.area,
      receivedAt: reviewedAt,
    }
    setOwnerMessages((current) => [newMessage, ...current.filter((item) => item.requestId !== request.id)])
  }

  function handleSendStaffMessage(senderRole, body) {
    const messageBody = String(body ?? '').trim()
    if (!messageBody) return

    const now = new Date()
    const message = {
      id: `staff-message-${now.getTime()}-${staffMessages.length}`,
      senderRole,
      senderId: senderRole === 'admin' ? 'admin-demo' : 'agent-demo',
      senderName: senderRole === 'admin' ? 'مسؤول النظام' : 'مستخدم الوكيل',
      body: messageBody,
      sentAt: now.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
      sentAtTimestamp: now.toISOString(),
    }
    setStaffMessages((current) => [...current, message])
  }

  function handleSubmitProperty(submission) {
    const record = {
      id: `property-submission-${Date.now()}`,
      type: submission.type,
      data: submission.data,
      agentId: 'agent-demo',
      agentName: 'مستخدم الوكيل',
      status: 'pending',
      submittedDateKey: getLocalDateKey(),
      submittedAt: new Date().toLocaleString('ar-EG'),
    }
    setPropertySubmissionRequests((current) => [record, ...current])
  }

  function handleApprovePropertySubmission(requestId) {
    const now = new Date()
    const reviewedAt = now.toLocaleString('ar-EG')
    const approvedDateKey = getLocalDateKey(now)
    setPropertySubmissionRequests((current) => current.map((request) =>
      request.id === requestId && request.status === 'pending'
        ? { ...request, status: 'approved', reviewedAt, approvedDateKey, rejectionReason: '' }
        : request
    ))
  }

  function handleRejectPropertySubmission(requestId, reason = '') {
    const reviewedAt = new Date().toLocaleString('ar-EG')
    setPropertySubmissionRequests((current) => current.map((request) =>
      request.id === requestId && request.status === 'pending'
        ? { ...request, status: 'rejected', reviewedAt, rejectionReason: String(reason || '').trim() }
        : request
    ))
  }

  if (showDashboard) {
    const commonDashboardProps = {
      theme: dashboardTheme,
      setTheme: setDashboardTheme,
      ownerRequests,
      ownerMessages,
      staffMessages,
      propertySubmissionRequests,
      attendanceRecords,
      approvedApartmentsToday,
      onFinalizeAttendance: handleFinalizeAttendance,
    }

    if (workspaceRole === 'admin') {
      return (
        <AdminDashboard
          {...commonDashboardProps}
          onApproveRequest={handleApproveOwnerRequest}
          onRejectRequest={handleRejectOwnerRequest}
          onApprovePropertySubmission={handleApprovePropertySubmission}
          onRejectPropertySubmission={handleRejectPropertySubmission}
          onSendStaffMessage={(body) => handleSendStaffMessage('admin', body)}
          onSwitchToAgent={() => setWorkspaceRole('agent')}
        />
      )
    }

    return (
      <AgentDashboard
        {...commonDashboardProps}
        setOwnerRequests={setOwnerRequests}
        onSubmitProperty={handleSubmitProperty}
        onSharesProgressChange={handleSharesProgressChange}
        onSendStaffMessage={(body) => handleSendStaffMessage('agent', body)}
        onSwitchToAdmin={() => setWorkspaceRole('admin')}
      />
    )
  }

  return (
    <main className={`login-page ${theme}`} data-theme={theme}>
      <div className="architecture-image" aria-hidden="true" />

      <header className="page-header">
        <a className="brand" href="/" aria-label="Jadeer home">
          <span className="brand-name">Jadeer | جــــــــدير</span>
          <span className="brand-tagline" lang="ar" dir="rtl">
            لــلــتـــــــســــــويــــــــــــــــــــق والاســتــثـــــــــــــــــــمــــار الــعـــقـــــــــــــاري
          </span>
        </a>

        <div className="brand-promise">
          <span>BETTER PROPERTIES</span>
          <span>A BRIGHTER FUTURE</span>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '☾' : '☀'}
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
        </div>
      </header>

      <section className="login-card">
        <JadeerLoader />
        <div className="card-heading">
          <p className="eyebrow">JADEER WORKSPACE</p>
          <h1>Welcome Back</h1>
          <p className="description">Sign in to access your account.</p>
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
            <button className="password-toggle" type="button" onClick={() => setShowPassword((current) => !current)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="form-options">
            <label className="remember-option">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-button" onClick={() => alert('Password recovery will be added later.')}>Forgot password?</button>
          </div>

          <button className="sign-in-button" type="submit">Sign In <span aria-hidden="true">→</span></button>
        </form>

        <div className="security-note"><span className="security-dot" />Authorized company personnel only</div>
      </section>

      <footer className="page-footer">
        <span>⌂ <span>Residential</span></span><i />
        <span>▦ <span>Commercial</span></span><i />
        <span>◇ <span>Land</span></span>
      </footer>
      <JadeerMark className="signature-mark" />
    </main>
  )
}

export default App
