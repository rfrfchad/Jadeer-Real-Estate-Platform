import { useEffect, useMemo, useState } from 'react'
import './AdminDashboard.css'

const numberFormatter = new Intl.NumberFormat('ar-EG', { useGrouping: false })
const n = (value) => numberFormatter.format(value)
const priceFormatter = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 })
const formatPrice = (value) => `${priceFormatter.format(value || 0)} ج.م`
const displayNumberOrText = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const text = String(value)
  return /^\d+(\.\d+)?$/.test(text) ? n(Number(text)) : text
}

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const menuItems = [
  { id: 'overview', label: 'لوحة التحكم', icon: '⌂' },
  { id: 'requests', label: 'طلبات أرقام المُلّاك', icon: '▤' },
  { id: 'propertySubmissions', label: 'طلبات إضافة العقارات', icon: '＋' },
  { id: 'properties', label: 'إدارة العقارات', icon: '▦' },
  { id: 'employees', label: 'الموظفون والصلاحيات', icon: '♙' },
  { id: 'messages', label: 'الرسائل', icon: '✉' },
  { id: 'attendance', label: 'الحضور', icon: '◷' },
  { id: 'settings', label: 'الإعدادات', icon: '⚙' },
]

export default function AdminDashboard({
  theme = 'light',
  setTheme = () => {},
  ownerRequests = [],
  ownerMessages = [],
  staffMessages = [],
  onSendStaffMessage = () => {},
  propertySubmissionRequests = [],
  attendanceRecords = [],
  approvedApartmentsToday = 0,
  onFinalizeAttendance = () => {},
  onApproveRequest = () => {},
  onRejectRequest = () => {},
  onApprovePropertySubmission = () => {},
  onRejectPropertySubmission = () => {},
  onSwitchToAgent = () => {},
}) {
  const [activePage, setActivePage] = useState('overview')
  const [requestFilter, setRequestFilter] = useState('pending')
  const [requestSearch, setRequestSearch] = useState('')
  const [propertySubmissionFilter, setPropertySubmissionFilter] = useState('pending')
  const [propertySubmissionSearch, setPropertySubmissionSearch] = useState('')
  const [propertyRejectionReasons, setPropertyRejectionReasons] = useState({})
  const [attendanceSelectedDate, setAttendanceSelectedDate] = useState(() => getLocalDateKey())
  const [attendanceSearch, setAttendanceSearch] = useState('')
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all')
  const [expandedAttendanceRecordId, setExpandedAttendanceRecordId] = useState(null)
  const [staffMessageDraft, setStaffMessageDraft] = useState('')

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

  const pendingCount = ownerRequests.filter((request) => request.status === 'pending').length
  const approvedCount = ownerRequests.filter((request) => request.status === 'approved').length
  const rejectedCount = ownerRequests.filter((request) => request.status === 'rejected').length

  const visibleRequests = useMemo(() => {
    const query = requestSearch.trim().replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).toLowerCase()
    return ownerRequests.filter((request) => {
      if (requestFilter !== 'all' && request.status !== requestFilter) return false
      const property = request.property || {}
      const searchable = [
        request.agentName,
        property.zone,
        property.building,
        property.floor,
        property.facing,
        request.note,
        request.status,
      ].join(' ').toLowerCase()
      return searchable.includes(query)
    })
  }, [ownerRequests, requestFilter, requestSearch])

  const pendingPropertySubmissionCount = propertySubmissionRequests.filter((request) => request.status === 'pending').length
  const approvedPropertySubmissionCount = propertySubmissionRequests.filter((request) => request.status === 'approved').length
  const rejectedPropertySubmissionCount = propertySubmissionRequests.filter((request) => request.status === 'rejected').length

  const visiblePropertySubmissions = useMemo(() => {
    const query = propertySubmissionSearch.trim().replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).toLowerCase()
    return propertySubmissionRequests.filter((request) => {
      if (propertySubmissionFilter !== 'all' && request.status !== propertySubmissionFilter) return false
      const data = request.data || {}
      const searchable = [
        request.agentName, request.type, request.status, data.zone, data.regionLabel, data.regionType,
        data.pieceNumber, data.floor, data.area, data.facing, data.finish, data.facadeFinish,
        data.landStatus, data.ownerName, data.ownerPhone, data.developer, data.features, data.totalPrice, data.amount,
      ].join(' ').toLowerCase()
      return searchable.includes(query)
    })
  }, [propertySubmissionRequests, propertySubmissionFilter, propertySubmissionSearch])

  const statusLabel = (status) => {
    if (status === 'approved') return 'تمت الموافقة'
    if (status === 'rejected') return 'مرفوض'
    return 'قيد المراجعة'
  }

  const renderOverview = () => (
    <>
      <div className="admin-page-heading">
        <div>
          <h1>لوحة تحكم الإدارة</h1>
          <p>نظرة عامة على الطلبات والعمليات اليومية في جدير.</p>
        </div>
        <span className="admin-date-label">إدارة النظام</span>
      </div>

      <section className="admin-stats-grid">
        <article className="admin-card admin-stat-card">
          <div className="admin-stat-top"><span>طلبات بانتظار المراجعة</span><span className="admin-stat-icon pending-icon">◷</span></div>
          <strong>{n(pendingCount)}</strong>
          <p>تحتاج إلى قرار من الإدارة</p>
        </article>
        <article className="admin-card admin-stat-card">
          <div className="admin-stat-top"><span>طلبات تمت الموافقة عليها</span><span className="admin-stat-icon approved-icon">✓</span></div>
          <strong>{n(approvedCount)}</strong>
          <p>تم إرسال بيانات المالك للوكيل</p>
        </article>
        <article className="admin-card admin-stat-card">
          <div className="admin-stat-top"><span>طلبات مرفوضة</span><span className="admin-stat-icon rejected-icon">×</span></div>
          <strong>{n(rejectedCount)}</strong>
          <p>لم تتم مشاركة بيانات المالك</p>
        </article>
        <article className="admin-card admin-stat-card">
          <div className="admin-stat-top"><span>رسائل بيانات المُلّاك</span><span className="admin-stat-icon">✉</span></div>
          <strong>{n(ownerMessages.length)}</strong>
          <p>تم إنشاؤها بعد الموافقة</p>
        </article>
        <article className="admin-card admin-stat-card">
          <div className="admin-stat-top"><span>طلبات إضافة العقارات</span><span className="admin-stat-icon pending-icon">＋</span></div>
          <strong>{n(pendingPropertySubmissionCount)}</strong>
          <p>عقارات جديدة بانتظار الاعتماد</p>
        </article>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div><h2>تحتاج إلى انتباهك</h2><p>طلبات الوكلاء التي تنتظر قرار الإدارة.</p></div>
          <button type="button" className="admin-text-button" onClick={() => { setActivePage('requests'); setRequestFilter('pending') }}>عرض الطلبات ←</button>
        </div>
        {pendingCount === 0 ? (
          <div className="admin-card admin-empty-card">
            <span className="admin-empty-icon">✓</span>
            <h3>لا توجد طلبات معلّقة</h3>
            <p>ستظهر هنا طلبات أرقام المُلّاك الجديدة التي يرسلها الوكلاء.</p>
          </div>
        ) : (
          <div className="admin-pending-preview">
            {ownerRequests.filter((request) => request.status === 'pending').slice(0, 3).map((request) => (
              <article className="admin-card admin-preview-request" key={request.id}>
                <div>
                  <strong>قطعة {n(request.property?.building)} — المنطقة {n(request.property?.zone)}</strong>
                  <p>{request.agentName} · {request.submittedAt}</p>
                </div>
                <button type="button" className="admin-secondary-button" onClick={() => { setActivePage('requests'); setRequestFilter('pending') }}>مراجعة</button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div><h2>طلبات إضافة عقارات جديدة</h2><p>مراجعة بيانات الشقق والأراضي قبل إضافتها إلى قائمة العقارات المتاحة.</p></div>
          <button type="button" className="admin-text-button" onClick={() => setActivePage('propertySubmissions')}>مراجعة الطلبات ←</button>
        </div>
        <div className="admin-card admin-preview-request">
          <div><strong>{n(pendingPropertySubmissionCount)} طلب إضافة بانتظار المراجعة</strong><p>{n(approvedPropertySubmissionCount)} معتمد · {n(rejectedPropertySubmissionCount)} مرفوض</p></div>
          <button type="button" className="admin-secondary-button" onClick={() => { setPropertySubmissionFilter('pending'); setActivePage('propertySubmissions') }}>فتح القائمة</button>
        </div>
      </section>

      <section className="admin-info-banner">
        <span className="admin-info-mark">i</span>
        <div>
          <strong>استرجاع بيانات المالك تلقائياً</strong>
          <p>عند الموافقة على الطلب، يجلب النظام بيانات المالك من دليل المُلّاك التجريبي ويرسلها إلى رسائل الوكيل. سيُستبدل هذا الدليل بقاعدة بيانات الشركة عند ربط الخلفية.</p>
        </div>
      </section>
    </>
  )

  const renderRequests = () => (
    <>
      <div className="admin-page-heading">
        <div>
          <h1>طلبات أرقام المُلّاك</h1>
          <p>راجع بيانات الطلب، ثم وافق أو ارفض. لا يلزم إدخال اسم المالك أو رقمه يدوياً.</p>
        </div>
        <span className="admin-total-pill">{n(ownerRequests.length)} طلب</span>
      </div>

      <div className="admin-request-toolbar">
        <label className="admin-search-box">
          <span aria-hidden="true">⌕</span>
          <input value={requestSearch} onChange={(event) => setRequestSearch(event.target.value)} placeholder="ابحث بالوكيل أو رقم القطعة أو المنطقة..." aria-label="بحث في الطلبات" />
        </label>
        <label className="admin-filter-select">
          <span>حالة الطلب</span>
          <select value={requestFilter} onChange={(event) => setRequestFilter(event.target.value)}>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">تمت الموافقة</option>
            <option value="rejected">مرفوض</option>
            <option value="all">كل الطلبات</option>
          </select>
        </label>
      </div>

      {visibleRequests.length === 0 ? (
        <div className="admin-card admin-empty-card">
          <span className="admin-empty-icon">▤</span>
          <h2>{ownerRequests.length === 0 ? 'لا توجد طلبات حتى الآن' : 'لا توجد نتائج مطابقة'}</h2>
          <p>{ownerRequests.length === 0 ? 'أنشئ طلباً تجريبياً من لوحة الوكيل ليظهر هنا.' : 'جرّب تغيير حالة الطلب أو كلمات البحث.'}</p>
          {ownerRequests.length === 0 && <button type="button" className="admin-primary-button" onClick={onSwitchToAgent}>العودة إلى لوحة الوكيل</button>}
        </div>
      ) : (
        <div className="admin-request-list">
          {visibleRequests.map((request) => {
            const property = request.property || {}
            return (
              <article className="admin-card admin-request-card" key={request.id}>
                <div className="admin-request-card-top">
                  <div>
                    <p className="admin-request-eyebrow">طلب رقم المالك · {request.submittedAt}</p>
                    <h2>قطعة {displayNumberOrText(property.building)} — المنطقة {displayNumberOrText(property.zone)}</h2>
                    <p className="admin-request-agent">مقدّم الطلب: <strong>{request.agentName || 'وكيل تجريبي'}</strong></p>
                  </div>
                  <span className={`admin-status ${request.status}`}>{statusLabel(request.status)}</span>
                </div>

                <div className="admin-property-summary-grid">
                  <div><span>{property.type && property.type !== 'apartment' ? 'نوع العقار وموقعه' : 'الدور والاتجاه'}</span><strong>{property.type && property.type !== 'apartment' ? `${property.typeLabel || 'أرض'} · ${property.regionLabel || displayNumberOrText(property.zone)}` : `${property.floor || '—'} · ${property.facing || '—'}`}</strong></div>
                  <div><span>المساحة</span><strong>{property.area ? `${n(property.area)} م²` : '—'}</strong></div>
                  <div><span>السعر الإجمالي</span><strong>{property.price ? formatPrice(property.price) : '—'}</strong></div>
                </div>

                {request.note && <div className="admin-agent-note"><span>ملاحظة الوكيل</span><p>{request.note}</p></div>}

                {request.status === 'pending' && (
                  <div className="admin-request-actions">
                    <p>عند الموافقة، سيجلب النظام بيانات المالك تلقائياً من الدليل التجريبي ويرسلها مباشرة إلى رسائل الوكيل.</p>
                    <div>
                      <button type="button" className="admin-primary-button" onClick={() => onApproveRequest(request.id)}>✓ الموافقة وجلب بيانات المالك</button>
                      <button type="button" className="admin-danger-button" onClick={() => onRejectRequest(request.id)}>رفض الطلب</button>
                    </div>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="admin-decision-result approved-result">
                    <strong>تمت الموافقة وإرسال بيانات المالك</strong>
                    {request.ownerName && <span>{request.ownerName}</span>}
                    {request.ownerPhone && <span dir="ltr">{request.ownerPhone}</span>}
                    {request.reviewedAt && <small>تاريخ القرار: {request.reviewedAt}</small>}
                    {request.ownerDataIsDemo && <small>ملاحظة: بيانات الاتصال الظاهرة تجريبية وليست بيانات فعلية.</small>}
                  </div>
                )}
                {request.status === 'rejected' && <div className="admin-decision-result rejected-result"><strong>تم رفض الطلب</strong>{request.reviewedAt && <small>تاريخ القرار: {request.reviewedAt}</small>}</div>}
              </article>
            )
          })}
        </div>
      )}
    </>
  )

  const renderPropertySubmissions = () => {
    const typeLabel = (type) => type === 'apartment' ? 'شقة' : type === 'land' ? 'أرض عادية' : 'أرض بيت الوطن'
    const statusText = (status) => status === 'approved' ? 'تمت الموافقة' : status === 'rejected' ? 'مرفوض' : 'بانتظار المراجعة'
    const formatZone = (value) => {
      if (value === null || value === undefined || value === '') return '—'
      const text = String(value)
      return /^\d+(\.\d+)?$/.test(text) ? n(Number(text)) : text
    }
    const fieldList = (request) => {
      const data = request.data || {}
      const price = data.totalPrice ?? data.landAmount ?? data.amount
      const fields = [
        ['المنطقة', data.regionLabel || data.zone || data.regionType],
        ['رقم القطعة', data.pieceNumber],
        ['الدور', data.floor],
        ['المساحة', data.area ? `${n(data.area)} م²` : ''],
        ['الواجهة / الاتجاه', data.facing],
        ['تشطيب الشقة', data.finishOther || data.finish],
        ['تشطيب الواجهة', data.facadeOther || data.facadeFinish],
        ['حالة الأرض', data.landStatus],
        ['المهلة المتبقية', data.deadline],
        ['المميزات', data.features || data.landFeatures || data.beitFeatures],
        ['البدروم', data.basement ? `${data.basement}${data.basementShare ? ` — ${formatPrice(data.basementShare)}` : ''}` : ''],
        ['الأسانسير', data.elevator ? `${data.elevator}${data.elevatorShare ? ` — ${formatPrice(data.elevatorShare)}` : ''}` : ''],
        [request.type === 'apartment' ? 'سعر الشقة كامل' : request.type === 'land' ? 'سعر الأرض كامل' : 'المبلغ', price !== undefined && price !== '' ? formatPrice(price) : ''],
        ['سعر المتر', request.type === 'apartment' ? (data.meterPrice ? formatPrice(data.meterPrice) : (data.area && price ? formatPrice(Math.round(Number(price) / Number(data.area))) : '')) : ''],
        ['المدفوع بالدولار', data.paidUsd !== null && data.paidUsd !== undefined && data.paidUsd !== '' ? `${n(data.paidUsd)} $` : ''],
        ['اسم المالك', data.ownerName || data.landOwnerName || data.beitOwnerName],
        ['رقم المالك', data.ownerPhone || data.landOwnerPhone || data.beitOwnerPhone],
        ['شركة التطوير', data.developer],
        ['تفاصيل الدفع / ملاحظات', data.paymentNotes || data.landPaymentNotes || data.beitNotes || data.notes],
      ]
      return fields.filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    }

    return (
      <>
        <div className="admin-page-heading">
          <div><h1>طلبات إضافة العقارات</h1><p>راجع كل بيانات العقار وبيانات المالك، ثم اعتمد الطلب أو ارفضه قبل نشره في المخزون.</p></div>
          <span className="admin-total-pill">{n(propertySubmissionRequests.length)} طلب</span>
        </div>

        <div className="admin-request-toolbar">
          <label className="admin-search-box"><span aria-hidden="true">⌕</span><input value={propertySubmissionSearch} onChange={(event) => setPropertySubmissionSearch(event.target.value)} placeholder="ابحث برقم القطعة أو المنطقة أو اسم الوكيل..." aria-label="بحث في طلبات إضافة العقارات" /></label>
          <label className="admin-filter-select"><span>حالة الطلب</span><select value={propertySubmissionFilter} onChange={(event) => setPropertySubmissionFilter(event.target.value)}><option value="pending">بانتظار المراجعة</option><option value="approved">تمت الموافقة</option><option value="rejected">مرفوض</option><option value="all">كل الطلبات</option></select></label>
        </div>

        {visiblePropertySubmissions.length === 0 ? (
          <div className="admin-card admin-empty-card"><span className="admin-empty-icon">＋</span><h2>{propertySubmissionRequests.length === 0 ? 'لا توجد طلبات إضافة حتى الآن' : 'لا توجد نتائج مطابقة'}</h2><p>{propertySubmissionRequests.length === 0 ? 'عندما يرسل الوكيل طلب إضافة شقة أو أرض سيظهر هنا لمراجعته.' : 'جرّب تغيير حالة الطلب أو كلمات البحث.'}</p><button type="button" className="admin-secondary-button" onClick={onSwitchToAgent}>العودة إلى لوحة الوكيل</button></div>
        ) : (
          <div className="admin-request-list">
            {visiblePropertySubmissions.map((request) => {
              const fields = fieldList(request)
              const data = request.data || {}
              return (
                <article className="admin-card admin-property-submission-card" key={request.id}>
                  <div className="admin-request-card-top">
                    <div><p className="admin-request-eyebrow">{typeLabel(request.type)} · {request.submittedAt}</p><h2>قطعة {formatZone(data.pieceNumber)}{data.regionLabel || data.zone ? ` — ${data.regionLabel || `المنطقة ${formatZone(data.zone)}`}` : ''}</h2><p className="admin-request-agent">مقدّم الطلب: <strong>{request.agentName || 'وكيل تجريبي'}</strong></p></div>
                    <span className={`admin-status ${request.status}`}>{statusText(request.status)}</span>
                  </div>

                  <div className="admin-submission-fields">
                    {fields.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
                  </div>

                  {request.status === 'pending' && (
                    <div className="admin-property-submission-actions">
                      <label className="admin-rejection-reason"><span>سبب الرفض (اختياري إذا قررت الرفض)</span><textarea rows="2" value={propertyRejectionReasons[request.id] || ''} onChange={(event) => setPropertyRejectionReasons((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="اكتب سبب الرفض ليظهر للوكيل" /></label>
                      <div><button type="button" className="admin-primary-button" onClick={() => onApprovePropertySubmission(request.id)}>✓ الموافقة وإضافة العقار</button><button type="button" className="admin-danger-button" onClick={() => onRejectPropertySubmission(request.id, propertyRejectionReasons[request.id] || '')}>رفض الطلب</button></div>
                    </div>
                  )}
                  {request.status === 'approved' && <div className="admin-decision-result approved-result"><strong>تم اعتماد العقار وإضافته إلى قائمة العقارات المتاحة.</strong>{request.reviewedAt && <small>تاريخ القرار: {request.reviewedAt}</small>}</div>}
                  {request.status === 'rejected' && <div className="admin-decision-result rejected-result"><strong>تم رفض طلب الإضافة.</strong>{request.rejectionReason && <small>السبب: {request.rejectionReason}</small>}{request.reviewedAt && <small>تاريخ القرار: {request.reviewedAt}</small>}</div>}
                </article>
              )
            })}
          </div>
        )}
        <p className="admin-submission-disclaimer">العقارات المعلقة أو المرفوضة لا تظهر في قائمة العقارات المتاحة للوكيل. بيانات المالك ظاهرة للإدارة ضمن المراجعة فقط.</p>
      </>
    )
  }

  const renderAttendance = () => {
    const today = getLocalDateKey()
    const statusText = (status) => status === 'present' ? 'حاضر' : status === 'absent' ? 'غائب' : 'قيد العمل'
    const statusClass = (status) => status === 'present' ? 'approved' : status === 'absent' ? 'rejected' : 'pending'
    const selectedDateRecords = [...attendanceRecords]
      .filter((record) => record.dateKey === attendanceSelectedDate)
      .sort((a, b) => String(a.agentName || '').localeCompare(String(b.agentName || ''), 'ar'))
    const searchValue = attendanceSearch.trim().toLocaleLowerCase('ar-EG')
    const visibleAttendanceRecords = selectedDateRecords.filter((record) => {
      if (attendanceStatusFilter === 'present' && record.status !== 'present') return false
      if (attendanceStatusFilter === 'absent' && record.status !== 'absent') return false
      if (attendanceStatusFilter === 'in_progress' && record.finalized) return false
      const haystack = `${record.agentName || ''} ${record.agentId || ''} ${record.dateKey || ''}`.toLocaleLowerCase('ar-EG')
      return haystack.includes(searchValue)
    })
    const presentCount = selectedDateRecords.filter((record) => record.status === 'present').length
    const absentCount = selectedDateRecords.filter((record) => record.status === 'absent').length
    const inProgressCount = selectedDateRecords.filter((record) => !record.finalized).length
    const selectedDateLabel = attendanceSelectedDate
      ? new Date(`${attendanceSelectedDate}T12:00:00`).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : '—'

    const getApprovedApartmentsForRecord = (record) => {
      const approvedFromSubmissions = propertySubmissionRequests.filter((request) =>
        request.type === 'apartment' &&
        request.status === 'approved' &&
        request.approvedDateKey === record.dateKey &&
        (!request.agentId || request.agentId === record.agentId)
      ).length
      if (record.dateKey === today) return Math.max(Number(record.approvedApartments || 0), approvedFromSubmissions)
      return Number(record.approvedApartments ?? approvedFromSubmissions)
    }

    const getSubmissionActivityForRecord = (record) => propertySubmissionRequests.filter((request) => {
      const sameAgent = request.agentId
        ? request.agentId === record.agentId
        : (request.agentName || 'مستخدم الوكيل') === (record.agentName || 'مستخدم الوكيل')
      const hadActivityOnDate = request.submittedDateKey === record.dateKey || request.approvedDateKey === record.dateKey
      return sameAgent && hadActivityOnDate
    })

    const getDurationLabel = (record) => {
      if (!record.checkInTimestamp) return 'غير متاح في السجلات القديمة'
      const endTime = record.checkOutTimestamp ? new Date(record.checkOutTimestamp) : (record.finalized ? null : new Date())
      const startTime = new Date(record.checkInTimestamp)
      if (!endTime || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) return '—'
      const totalMinutes = Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 60000))
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${n(hours)} ساعة و${n(minutes)} دقيقة`
    }

    const selectedRecord = attendanceRecords.find((record) => record.id === expandedAttendanceRecordId && record.dateKey === attendanceSelectedDate)
    const selectedRecordApprovedApartments = selectedRecord ? getApprovedApartmentsForRecord(selectedRecord) : 0
    const selectedRecordSubmissions = selectedRecord ? getSubmissionActivityForRecord(selectedRecord) : []

    return (
      <>
        <div className="admin-page-heading">
          <div>
            <h1>الحضور والانصراف</h1>
            <p>اختر يومًا لمراجعة حضور جميع الوكلاء، ثم افتح سجل أي وكيل للاطلاع على تفاصيل يومه.</p>
          </div>
          <span className="admin-total-pill">{n(attendanceRecords.length)} سجل إجمالي</span>
        </div>

        <section className="admin-attendance-toolbar admin-card">
          <label className="admin-attendance-date-field">
            <span>تاريخ الحضور</span>
            <input
              type="date"
              value={attendanceSelectedDate}
              onChange={(event) => {
                setAttendanceSelectedDate(event.target.value)
                setExpandedAttendanceRecordId(null)
              }}
              aria-label="اختيار تاريخ الحضور"
            />
          </label>
          <label className="admin-attendance-search-field">
            <span>بحث عن موظف</span>
            <input
              type="search"
              value={attendanceSearch}
              onChange={(event) => setAttendanceSearch(event.target.value)}
              placeholder="ابحث باسم الموظف أو رقم الحساب..."
              aria-label="البحث في سجلات الحضور"
            />
          </label>
          <label className="admin-attendance-status-field">
            <span>حالة الحضور</span>
            <select value={attendanceStatusFilter} onChange={(event) => setAttendanceStatusFilter(event.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="present">حاضر</option>
              <option value="absent">غائب</option>
              <option value="in_progress">قيد العمل</option>
            </select>
          </label>
        </section>

        <div className="admin-attendance-selected-date">
          <strong>{selectedDateLabel}</strong>
          <span>{n(selectedDateRecords.length)} موظف مسجل في هذا اليوم</span>
        </div>

        <section className="admin-stats-grid admin-attendance-stats">
          <article className="admin-card admin-stat-card">
            <div className="admin-stat-top"><span>حاضر</span><span className="admin-stat-icon approved-icon">✓</span></div>
            <strong>{n(presentCount)}</strong><p>استوفوا الهدفين وأُغلق يومهم</p>
          </article>
          <article className="admin-card admin-stat-card">
            <div className="admin-stat-top"><span>غائب</span><span className="admin-stat-icon rejected-icon">!</span></div>
            <strong>{n(absentCount)}</strong><p>لم يستوفوا الهدفين عند الإغلاق</p>
          </article>
          <article className="admin-card admin-stat-card">
            <div className="admin-stat-top"><span>قيد العمل</span><span className="admin-stat-icon">◷</span></div>
            <strong>{n(inProgressCount)}</strong><p>لم يتم إغلاق يوم العمل بعد</p>
          </article>
        </section>

        <section className="admin-attendance-section">
          <div className="admin-section-title">
            <div><h2>حضور الموظفين في اليوم المحدد</h2><p>اضغط على «عرض التفاصيل» لمراجعة ساعات العمل والمهام والعقارات الخاصة بالوكيل في هذا اليوم.</p></div>
          </div>
          {selectedDateRecords.length === 0 ? (
            <div className="admin-card admin-empty-card">
              <span className="admin-empty-icon">◷</span>
              <h2>لا توجد سجلات لهذا التاريخ</h2>
              <p>لا توجد سجلات في جلسة الاختبار الحالية لهذا اليوم. افتح مساحة الوكيل لتسجيل حضور تجريبي، أو اختر تاريخًا لديه سجلات.</p>
              <button type="button" className="admin-secondary-button" onClick={onSwitchToAgent}>العودة إلى لوحة الوكيل</button>
            </div>
          ) : visibleAttendanceRecords.length === 0 ? (
            <div className="admin-card admin-empty-card"><h2>لا توجد نتائج مطابقة</h2><p>جرّب تعديل البحث أو فلتر الحالة.</p></div>
          ) : (
            <div className="admin-card admin-attendance-table-wrap">
              <table className="admin-attendance-table">
                <thead>
                  <tr>
                    <th>الموظف</th><th>الحضور</th><th>الانصراف</th><th>المشاركات</th><th>الشقق المعتمدة</th><th>الحالة</th><th>التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAttendanceRecords.map((record) => {
                    const approvedApartments = getApprovedApartmentsForRecord(record)
                    const isExpanded = expandedAttendanceRecordId === record.id
                    return (
                      <tr key={record.id} className={isExpanded ? 'selected-row' : ''}>
                        <td><strong>{record.agentName || 'وكيل عقاري'}</strong><small>{record.agentId || '—'}</small></td>
                        <td>{record.checkInTime || '—'}</td>
                        <td>{record.checkOutTime || '—'}</td>
                        <td><bdi dir="ltr">{n(record.sharesDone || 0)} / {n(300)}</bdi></td>
                        <td><bdi dir="ltr">{n(approvedApartments)} / {n(3)}</bdi></td>
                        <td><span className={`admin-status ${statusClass(record.status)}`}>{statusText(record.status)}</span></td>
                        <td><button type="button" className="admin-attendance-detail-button" aria-expanded={isExpanded} onClick={() => setExpandedAttendanceRecordId(isExpanded ? null : record.id)}>{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'} <span>{isExpanded ? '−' : '+'}</span></button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedRecord && (
          <section className="admin-attendance-expanded admin-card">
            <div className="admin-attendance-expanded-heading">
              <div><span className="admin-request-eyebrow">تفاصيل سجل اليوم</span><h2>{selectedRecord.agentName || 'وكيل عقاري'}</h2><p>{selectedDateLabel} · {selectedRecord.agentId || '—'}</p></div>
              <button type="button" className="admin-secondary-button" onClick={() => setExpandedAttendanceRecordId(null)}>إغلاق التفاصيل</button>
            </div>

            <div className="admin-attendance-detail-grid">
              <div><span>وقت الحضور</span><strong>{selectedRecord.checkInTime || '—'}</strong></div>
              <div><span>وقت الانصراف</span><strong>{selectedRecord.checkOutTime || 'لم يُسجل بعد'}</strong></div>
              <div><span>مدة العمل التقريبية</span><strong>{getDurationLabel(selectedRecord)}</strong></div>
              <div><span>الحالة النهائية</span><strong><span className={`admin-status ${statusClass(selectedRecord.status)}`}>{statusText(selectedRecord.status)}</span></strong></div>
            </div>

            <div className="admin-attendance-targets">
              <div className="admin-attendance-target">
                <div><span>المشاركات</span><strong><bdi dir="ltr">{n(selectedRecord.sharesDone || 0)} / {n(300)}</bdi></strong></div>
                <div className="admin-attendance-progress"><span style={{ width: `${Math.min((Number(selectedRecord.sharesDone || 0) / 300) * 100, 100)}%` }} /></div>
                <small>{Number(selectedRecord.sharesDone || 0) >= 300 ? 'تم تحقيق هدف المشاركات' : `متبقي ${n(Math.max(300 - Number(selectedRecord.sharesDone || 0), 0))} مشاركة`}</small>
              </div>
              <div className="admin-attendance-target">
                <div><span>الشقق المعتمدة</span><strong><bdi dir="ltr">{n(selectedRecordApprovedApartments)} / {n(3)}</bdi></strong></div>
                <div className="admin-attendance-progress"><span style={{ width: `${Math.min((selectedRecordApprovedApartments / 3) * 100, 100)}%` }} /></div>
                <small>{selectedRecordApprovedApartments >= 3 ? 'تم تحقيق هدف الشقق' : `متبقي ${n(Math.max(3 - selectedRecordApprovedApartments, 0))} شقق معتمدة`}</small>
              </div>
            </div>

            <div className="admin-attendance-activity">
              <div className="admin-section-title"><div><h3>طلبات العقارات المرتبطة بهذا اليوم</h3><p>الطلبات المرسلة أو التي صدر قرار بشأنها في تاريخ السجل.</p></div><span className="admin-total-pill">{n(selectedRecordSubmissions.length)} طلب</span></div>
              {selectedRecordSubmissions.length === 0 ? (
                <p className="admin-attendance-no-activity">لا توجد طلبات عقارات مسجلة لهذا الوكيل في هذا اليوم.</p>
              ) : (
                <div className="admin-attendance-property-activity-list">
                  {selectedRecordSubmissions.map((request) => {
                    const data = request.data || {}
                    const propertyTypeLabel = request.type === 'apartment' ? 'شقة' : request.type === 'land' ? 'أرض' : 'أرض بيت الوطن'
                    const plotNumber = data.pieceNumber || data.building || '—'
                    const statusLabel = request.status === 'approved' ? 'معتمد' : request.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'
                    return (
                      <article key={request.id}>
                        <div><strong>{propertyTypeLabel} · قطعة {displayNumberOrText(plotNumber)}</strong><small>{data.zone || data.regionLabel || data.regionType || 'المنطقة غير محددة'}{data.area ? ` · ${displayNumberOrText(data.area)} م²` : ''}</small></div>
                        <span className={`admin-status ${statusClass(request.status === 'approved' ? 'present' : request.status === 'rejected' ? 'absent' : 'in_progress')}`}>{statusLabel}</span>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedRecord.finalized ? (
              <div className={`admin-decision-result ${selectedRecord.status === 'present' ? 'approved-result' : 'rejected-result'}`}>
                <strong>{selectedRecord.status === 'present' ? 'تم استيفاء متطلبات الحضور.' : 'لم يكتمل أحد الهدفين أو كلاهما؛ الحالة غائب.'}</strong>
                <small>وقت الإغلاق: {selectedRecord.finalizedAt || selectedRecord.checkOutTime || '—'}</small>
              </div>
            ) : selectedRecord.dateKey === today ? (
              <div className="admin-attendance-finalize">
                <p>للاختبار، يمكنك إنهاء يوم العمل لحساب الحالة بناءً على ٣٠٠ مشاركة و٣ شقق معتمدة.</p>
                <button type="button" className="admin-primary-button" onClick={() => onFinalizeAttendance(selectedRecord.id)}>إنهاء اليوم وحساب الحضور</button>
              </div>
            ) : (
              <p className="admin-attendance-disclaimer">هذا السجل غير مغلق. في النظام الفعلي سيحسب الخادم الحالة عند نهاية يوم العمل.</p>
            )}
          </section>
        )}

        <p className="admin-attendance-disclaimer">هذه واجهة تجريبية تعتمد على السجلات المتاحة في جلسة المتصفح. ستظهر سجلات جميع الموظفين والأيام بمجرد توصيل حسابات الموظفين وقاعدة البيانات. مدة العمل تقريبية وتعتمد على الطوابع الزمنية المتاحة.</p>
      </>
    )
  }

  const handleSubmitStaffMessage = (event) => {
    event.preventDefault()
    const body = staffMessageDraft.trim()
    if (!body) return
    onSendStaffMessage(body)
    setStaffMessageDraft('')
  }

  const renderMessages = () => (
    <div className="admin-messages-page">
      <div className="admin-page-heading">
        <div>
          <h1>الرسائل</h1>
          <p>مراسلات العمل مع الوكلاء ومتابعة الاستفسارات اليومية.</p>
        </div>
        <span className="admin-total-pill">محادثة تجريبية واحدة</span>
      </div>

      <section className="admin-card admin-staff-chat">
        <div className="admin-staff-chat-header">
          <div className="admin-staff-chat-avatar" aria-hidden="true">و</div>
          <div>
            <strong>مستخدم الوكيل</strong>
            <span>وكيل عقاري · محادثة داخلية تجريبية</span>
          </div>
          <span className="admin-status approved">محادثة داخلية</span>
        </div>

        <div className="admin-staff-chat-thread" aria-live="polite">
          {staffMessages.length === 0 ? (
            <div className="admin-staff-chat-empty">
              <span aria-hidden="true">✉</span>
              <strong>لا توجد رسائل بعد</strong>
              <p>أرسل رسالة للوكيل أو انتظر رسالة جديدة منه. ستظهر الرسائل في هذا المكان.</p>
            </div>
          ) : (
            staffMessages.map((message) => {
              const isMine = message.senderRole === 'admin'
              return (
                <article
                  key={message.id}
                  className={`admin-chat-bubble ${isMine ? 'mine' : 'received'}`}
                >
                  <div className="admin-chat-bubble-meta">
                    <strong>{isMine ? 'أنت · الإدارة' : (message.senderName || 'مستخدم الوكيل')}</strong>
                    <time>{message.sentAt}</time>
                  </div>
                  <p>{message.body}</p>
                </article>
              )
            })
          )}
        </div>

        <form className="admin-staff-chat-composer" onSubmit={handleSubmitStaffMessage}>
          <label className="admin-sr-only" htmlFor="admin-staff-message">اكتب رسالة للوكيل</label>
          <textarea
            id="admin-staff-message"
            rows="2"
            value={staffMessageDraft}
            onChange={(event) => setStaffMessageDraft(event.target.value)}
            placeholder="اكتب رسالة للوكيل..."
            maxLength={1500}
          />
          <button type="submit" className="admin-primary-button" disabled={!staffMessageDraft.trim()}>
            إرسال الرسالة <span aria-hidden="true">↗</span>
          </button>
        </form>
      </section>

      <p className="admin-attendance-disclaimer">هذه مراسلات تجريبية بين حساب الإدارة والوكيل التجريبي. ستُربط بحسابات الموظفين وصلاحياتهم وقاعدة البيانات لاحقًا.</p>
    </div>
  )

  const renderPlaceholder = () => {
    const content = {
      properties: { title: 'إدارة العقارات', description: 'مراجعة بيانات العقارات وإدارة الإضافة والتعديل والحذف.' },
      employees: { title: 'الموظفون والصلاحيات', description: 'إدارة حسابات الوكلاء والموظفين وتحديد الصلاحيات.' },
      attendance: { title: 'الحضور', description: 'مراجعة الحضور اليومي وسجلات استيفاء المهام المطلوبة.' },
      settings: { title: 'الإعدادات', description: 'إعدادات النظام والتنبيهات وإدارة البيانات.' },
    }[activePage]
    return (
      <>
        <div className="admin-page-heading"><div><h1>{content.title}</h1><p>{content.description}</p></div></div>
        <div className="admin-card admin-coming-soon"><span>✦</span><h2>{content.title}</h2><p>تم تجهيز مكان هذا القسم في الواجهة. سنضيف وظائفه خطوة بخطوة بعد تثبيت سير عمل طلبات العقارات.</p></div>
      </>
    )
  }

  const title = menuItems.find((item) => item.id === activePage)?.label || 'لوحة التحكم'

  return (
    <div className={`admin-dashboard ${theme}`} dir="rtl" lang="ar">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-logo-squares" aria-hidden="true"><i /><i /><i /><i /></span>
          <strong>جــــــدير <span>Jadeer</span></strong>
        </div>
        <div className="admin-sidebar-caption">مساحة الإدارة</div>
        <nav className="admin-nav" aria-label="قائمة الإدارة">
          {menuItems.map((item) => (
            <button key={item.id} type="button" className={`admin-nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
              <span className="admin-nav-icon">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user"><span className="admin-user-avatar">إ</span><span><strong>مسؤول النظام</strong><small>صلاحيات الإدارة</small></span></div>
          <button type="button" className="admin-return-button" onClick={onSwitchToAgent}>↩ العودة إلى لوحة الوكيل</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">مساحة الإدارة <span>/</span> {title}</div>
          <div className="admin-topbar-actions">
            <button type="button" className="admin-switch-button" onClick={onSwitchToAgent}>لوحة الوكيل ↩</button>
            <button type="button" className="admin-theme-toggle" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'التبديل إلى الوضع الداكن' : 'التبديل إلى الوضع الفاتح'}>
              <span>{theme === 'light' ? '☾' : '☀'}</span><span>{theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}</span>
            </button>
          </div>
        </header>
        <div className="admin-content">
          {activePage === 'overview' && renderOverview()}
          {activePage === 'requests' && renderRequests()}
          {activePage === 'propertySubmissions' && renderPropertySubmissions()}
          {activePage === 'attendance' && renderAttendance()}
          {activePage === 'messages' && renderMessages()}
          {!['overview', 'requests', 'propertySubmissions', 'attendance', 'messages'].includes(activePage) && renderPlaceholder()}
        </div>
      </main>
    </div>
  )
}
