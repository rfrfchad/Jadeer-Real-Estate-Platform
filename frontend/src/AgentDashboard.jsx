import { useEffect, useState } from 'react'
import './AgentDashboard.css'

// Arabic-Indic digits (٠١٢٣…). Replace with `String(value)` to keep Western digits.
const numberFormatter = new Intl.NumberFormat('ar-EG', { useGrouping: false })
const n = (value) => numberFormatter.format(value)

// Keeps "٠ / ٣٠٠" in a stable order inside RTL text.
const Fraction = ({ done, total }) => (
  <span dir="ltr" className="agent-fraction">
    {n(done)} / {n(total)}
  </span>
)

// Page ids stay in English (used for logic); only labels are Arabic.
const pages = {
  dashboard: {
    label: 'لوحة التحكم',
    icon: '⌂',
  },
  properties: {
    label: 'العقارات',
    icon: '▦',
    description: 'تصفّح العقارات المتاحة وابحث باستخدام الفلاتر.',
  },
  requests: {
    label: 'طلباتي',
    icon: '▤',
    description: 'قدّم تعديلات على العقارات وتابع الطلبات التي تنتظر مراجعة الإدارة.',
  },
  tasks: {
    label: 'المهام',
    icon: '✓',
  },
  attendance: {
    label: 'الحضور',
    icon: '◷',
    description: 'اطّلع على سجلات حضورك وحالتك اليومية.',
  },
  messages: {
    label: 'الرسائل',
    icon: '✉',
    description: 'تواصل مع الموظفين الآخرين.',
  },
}

const menuItems = Object.keys(pages).map((id) => ({
  id,
  label: pages[id].label,
  icon: pages[id].icon,
}))

const quickAccessPages = [
  'properties',
  'requests',
  'tasks',
  'attendance',
  'messages',
]

const propertyCategories = [
  { title: 'شقق متاحة', count: 68, icon: '⌂' },
  { title: 'أراضٍ متاحة', count: 42, icon: '▦' },
  { title: 'أراضٍ مميزة متاحة', count: 18, icon: '◇' },
]

export default function AgentDashboard() {
  const [activePage, setActivePage] = useState('dashboard')
  const [theme, setTheme] = useState('light')
  const [sharesDone, setSharesDone] = useState('')

  // Switch the whole document to Arabic / RTL (also moves the page scrollbar),
  // and restore the previous values when the dashboard unmounts.
  useEffect(() => {
    const root = document.documentElement
    const previousDir = root.getAttribute('dir')
    const previousLang = root.getAttribute('lang')

    root.setAttribute('dir', 'rtl')
    root.setAttribute('lang', 'ar')

    return () => {
      if (previousDir === null) root.removeAttribute('dir')
      else root.setAttribute('dir', previousDir)

      if (previousLang === null) root.removeAttribute('lang')
      else root.setAttribute('lang', previousLang)
    }
  }, [])

  // Temporary sample data until the backend and database are connected.
  const [additionalTasks] = useState([
    {
      id: 1,
      title: 'تحديث قوائم الشقق',
      description: 'راجع وحدّث معلومات الشقق المُسندة إليك.',
      dueDate: 'اليوم',
      status: 'مُسندة',
    },
  ])

  const dailySharesTarget = 300
  const apartmentsTarget = 3

  // Only approved apartments saved to the database will count later.
  const apartmentsAdded = 0

  const sharesCount = Number(sharesDone || 0)
  const sharesProgress = Math.min(
    (sharesCount / dailySharesTarget) * 100,
    100
  )

  const apartmentsProgress = Math.min(
    (apartmentsAdded / apartmentsTarget) * 100,
    100
  )

  const dailyTasksComplete =
    sharesCount >= dailySharesTarget &&
    apartmentsAdded >= apartmentsTarget

  const navigateTo = (page) => {
    setActivePage(page)
  }

  const handleSharesChange = (event) => {
    // Accept Arabic-Indic digits typed from an Arabic keyboard as well.
    const value = event.target.value
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

    if (value === '') {
      setSharesDone('')
      return
    }

    if (/^\d+$/.test(value) && Number(value) <= dailySharesTarget) {
      setSharesDone(value)
    }
  }

  const renderDashboard = () => (
    <>
      <div className="agent-page-header">
        <div>
          <h1>لوحة التحكم</h1>
          <p>أهلًا بعودتك! إليك نظرة عامة على يومك.</p>
        </div>
      </div>

      <section className="agent-dashboard-grid">
        <div className="agent-card agent-metric-card">
          <div className="agent-card-top">
            <span>هدف المشاركات اليومي</span>
            <span className="agent-card-icon">↖</span>
          </div>
          <h2>
            <Fraction done={sharesCount} total={dailySharesTarget} />
          </h2>
          <p>المشاركات المكتملة اليوم</p>
        </div>

        <div className="agent-card agent-metric-card">
          <div className="agent-card-top">
            <span>الشقق المضافة</span>
            <span className="agent-card-icon">⌂</span>
          </div>
          <h2>
            <Fraction done={apartmentsAdded} total={apartmentsTarget} />
          </h2>
          <p>الشقق المعتمدة التي أُضيفت اليوم</p>
        </div>

        <div className="agent-card agent-metric-card">
          <div className="agent-card-top">
            <span>مهام إضافية</span>
            <span className="agent-card-icon">✓</span>
          </div>
          <h2>{n(additionalTasks.length)}</h2>
          <p>مهام أسندتها الإدارة</p>
        </div>
      </section>

      <section className="agent-section">
        <div className="agent-section-header">
          <div>
            <h2>العقارات المتاحة</h2>
            <p>تصفّح فئات العقارات الحالية.</p>
          </div>

          <button
            className="agent-text-button"
            onClick={() => navigateTo('properties')}
          >
            عرض الكل
          </button>
        </div>

        <div className="agent-property-grid">
          {propertyCategories.map((property) => (
            <div className="agent-card agent-property-card" key={property.title}>
              <div className="agent-property-icon">{property.icon}</div>
              <h3>{property.title}</h3>
              <p className="agent-property-count">
                {n(property.count)} <span>عقار</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="agent-section">
        <div className="agent-section-header">
          <div>
            <h2>الطلبات</h2>
            <p>تابع طلباتك المتعلقة بالعقارات.</p>
          </div>

          <button
            className="agent-text-button"
            onClick={() => navigateTo('requests')}
          >
            عرض الطلبات
          </button>
        </div>

        <div className="agent-request-grid">
          <div className="agent-card agent-request-card">
            <h3>الطلبات المعلّقة</h3>
            <p>راجع حالة الطلبات التي قدّمتها.</p>
            <span className="agent-status-label">بانتظار المراجعة</span>
          </div>

          <div className="agent-card agent-request-card">
            <h3>طلب تعديل</h3>
            <p>قدّم تعديلًا على عقار لاعتماده من الإدارة.</p>
            <button
              className="agent-primary-button"
              onClick={() => navigateTo('requests')}
            >
              فتح الطلبات
            </button>
          </div>
        </div>
      </section>

      <section className="agent-section">
        <div className="agent-section-header">
          <div>
            <h2>وصول سريع</h2>
            <p>افتح القسم الذي تحتاجه.</p>
          </div>
        </div>

        <div className="agent-quick-actions">
          {quickAccessPages.map((page) => (
            <button
              key={page}
              className="agent-quick-action"
              onClick={() => navigateTo(page)}
            >
              {pages[page].label}
              <span>←</span>
            </button>
          ))}
        </div>
      </section>
    </>
  )

  const renderTasks = () => (
    <div className="agent-tasks-page">
      <div className="agent-page-header">
        <div>
          <h1>مهامي</h1>
          <p>تابع متطلباتك اليومية والمهام التي أسندتها لك الإدارة.</p>
        </div>
      </div>

      <section className="agent-task-group">
        <div className="agent-task-heading">
          <div>
            <h2>المهام اليومية المطلوبة</h2>
            <p>أنجز الهدفين قبل نهاية يوم عملك.</p>
          </div>

          <span
            className={`agent-status-label ${
              dailyTasksComplete ? 'completed' : 'pending'
            }`}
          >
            {dailyTasksComplete ? 'مكتملة' : 'قيد التنفيذ'}
          </span>
        </div>

        {/* Task 1: Daily shares */}
        <div className="agent-card agent-task-card">
          <div className="agent-task-card-header">
            <div>
              <h3>إنجاز {n(dailySharesTarget)} مشاركة</h3>
              <p>
                سجّل عدد المشاركات التي أنجزتها. يمكن للإدارة مراجعة العدد
                الذي تُرسله.
              </p>
            </div>

            <span className="agent-task-number">٠١</span>
          </div>

          <div className="agent-task-progress-info">
            <span>التقدّم اليومي</span>
            <strong>
              <Fraction done={sharesCount} total={dailySharesTarget} />
            </strong>
          </div>

          <div
            className="agent-task-progress"
            role="progressbar"
            aria-label="تقدّم المشاركات اليومية"
            aria-valuenow={sharesCount}
            aria-valuemin={0}
            aria-valuemax={dailySharesTarget}
          >
            <div
              className="agent-task-progress-fill"
              style={{ width: `${sharesProgress}%` }}
            />
          </div>

          <label className="agent-task-input-label" htmlFor="shares-done">
            عدد المشاركات المنجزة
          </label>

          <input
            id="shares-done"
            className="agent-task-input"
            type="number"
            inputMode="numeric"
            min="0"
            max={dailySharesTarget}
            step="1"
            placeholder="أدخل عدد مشاركاتك"
            value={sharesDone}
            onChange={handleSharesChange}
          />

          <p className="agent-task-note">
            الهدف: {n(dailySharesTarget)} مشاركة يوميًا. ستراجع الإدارة
            العدد الذي تُرسله.
          </p>

          {sharesCount >= dailySharesTarget && (
            <p className="agent-task-success">
              تم الوصول إلى هدف المشاركات اليومي.
            </p>
          )}
        </div>

        {/* Task 2: Approved apartments */}
        <div className="agent-card agent-task-card">
          <div className="agent-task-card-header">
            <div>
              <h3>إضافة {n(apartmentsTarget)} شقق</h3>
              <p>
                تُحتسب ضمن هذا الهدف فقط الشقق التي اعتمدتها الإدارة
                وحُفظت في قاعدة البيانات.
              </p>
            </div>

            <span className="agent-task-number">٠٢</span>
          </div>

          <div className="agent-task-progress-info">
            <span>التقدّم اليومي</span>
            <strong>
              <Fraction done={apartmentsAdded} total={apartmentsTarget} />
            </strong>
          </div>

          <div
            className="agent-task-progress"
            role="progressbar"
            aria-label="تقدّم الشقق المعتمدة"
            aria-valuenow={apartmentsAdded}
            aria-valuemin={0}
            aria-valuemax={apartmentsTarget}
          >
            <div
              className="agent-task-progress-fill"
              style={{ width: `${apartmentsProgress}%` }}
            />
          </div>

          <p className="agent-task-note">
            سيُربط هذا العدد بقاعدة البيانات لاحقًا. لن تُحتسب الشقق
            التي تنتظر الاعتماد أو غير المحفوظة.
          </p>
        </div>

        <div className="agent-card agent-attendance-note">
          <h3>شرط الحضور</h3>
          <p>
            في نهاية يوم العمل، يجب إكمال الهدفين اليوميين لاستيفاء شروط
            الحضور. سيحتسب النظام حالة الحضور النهائية عند ربط الواجهة
            الخلفية.
          </p>
        </div>
      </section>

      {/* Additional Admin tasks */}
      <section className="agent-task-group">
        <div className="agent-task-heading">
          <div>
            <h2>مهام إضافية</h2>
            <p>مهام أخرى أسندتها الإدارة.</p>
          </div>
        </div>

        {additionalTasks.length === 0 ? (
          <div className="agent-card agent-task-card">
            <p>لا توجد مهام إضافية مُسندة.</p>
          </div>
        ) : (
          additionalTasks.map((task) => (
            <div className="agent-card agent-task-card" key={task.id}>
              <div className="agent-task-card-header">
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </div>

                <span className="agent-status-label">{task.status}</span>
              </div>

              <p className="agent-task-note">
                الموعد النهائي: {task.dueDate}
              </p>
            </div>
          ))
        )}

        <p className="agent-task-note">
          المهام الإضافية لا تؤثر على الحضور، وهي منفصلة عن هدفيك
          اليوميين المطلوبين.
        </p>
      </section>
    </div>
  )

  const renderOtherPage = () => (
    <div className="agent-placeholder-page">
      <div className="agent-page-header">
        <div>
          <h1>{pages[activePage].label}</h1>
          <p>{pages[activePage].description}</p>
        </div>
      </div>

      <div className="agent-card">
        <h2>{pages[activePage].label}</h2>
        <p>
          هذا القسم مُجهّز للخطوة التالية من التطوير. ستُضاف وظائفه
          لاحقًا.
        </p>
      </div>
    </div>
  )

  return (
    <div className={`agent-dashboard ${theme}`} dir="rtl" lang="ar">
      <aside className="agent-sidebar">
        <div className="agent-sidebar-brand">
          <div className="agent-logo-squares" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="agent-brand-text">
            <strong>جــــــدير  Jadeer</strong>
          </div>
        </div>

        <div className="agent-sidebar-label">مساحة العمل</div>

        <nav className="agent-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`agent-nav-item ${
                activePage === item.id ? 'active' : ''
              }`}
              onClick={() => navigateTo(item.id)}
            >
              <span className="agent-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="agent-sidebar-footer">
          <div className="agent-user-info">
            <div className="agent-avatar">م</div>
            <div>
              <strong>مستخدم الوكيل</strong>
              <span>وكيل عقاري</span>
            </div>
          </div>

          <button
            className="agent-signout-button"
            onClick={() => {
              window.location.href = '/'
            }}
          >
            ↩ تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="agent-main">
        <header className="agent-topbar">
          <div className="agent-breadcrumb">
            مساحة العمل <span>/</span> {pages[activePage].label}
          </div>

          <button
            className="agent-theme-toggle"
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === 'light' ? 'dark' : 'light'
              )
            }
            aria-label={`التبديل إلى ${
              theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'
            }`}
          >
            <span>{theme === 'light' ? '☾' : '☀'}</span>
            <span>{theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}</span>
          </button>
        </header>

        <div className="agent-page-content">
          {activePage === 'dashboard' && renderDashboard()}
          {activePage === 'tasks' && renderTasks()}
          {!['dashboard', 'tasks'].includes(activePage) && renderOtherPage()}
        </div>
      </main>
    </div>
  )
}
