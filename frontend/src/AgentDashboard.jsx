import { useEffect, useState } from 'react'

import './AgentDashboard.css'



// Arabic-Indic digits (٠١٢٣…). Replace with `String(value)` to keep Western digits.

const numberFormatter = new Intl.NumberFormat('ar-EG', { useGrouping: false })

const n = (value) => numberFormatter.format(value)

const priceFormatter = new Intl.NumberFormat('ar-EG', {
  maximumFractionDigits: 0,
})

const formatPrice = (value) => `${priceFormatter.format(value)} ج.م`

const normalizePriceInput = (value) =>
  String(value ?? '')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[^\d]/g, '')

const normalizeSearch = (value) =>
  String(value ?? '')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[ً-ٰٟ]/g, '')
    .trim()
    .toLowerCase()



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





// Sample listing records from Jadeer's supplied sheet. The repeated row for zone 21 / building 868 was removed.
const sampleProperties = [
  {
    id: '14-395-third', zone: 14, building: 395, floor: 'الثالث', area: 145,
    facing: 'أمامي', finish: 'سوبر لوكس', finishCategory: 'سوبر لوكس', facade: 'خلصانة',
    features: 'على المحور المركزي مباشرة، أسانسير اتحاد ملاك، شامل بدروم',
    basement: 'شامل بدروم', basementShare: 0, elevator: 'اتحاد ملاك', elevatorShare: 0,
    meterPrice: 16897, price: 2450000, payment: 'البيع كاش - قابل للتفاوض', developer: 'غير محددة',
  },
  {
    id: '14-304-fourth-right', zone: 14, building: 304, floor: 'الرابع', area: 150,
    facing: 'أمامي يمين', finish: 'نص تشطيب', finishCategory: 'نص تشطيب', facade: 'خلصانة',
    features: 'على المحور المركزي مباشرة', basement: 'غير محدد', basementShare: 0,
    elevator: 'غير محدد', elevatorShare: 0, meterPrice: 13500, price: 2025000,
    payment: 'متاح الدفع على 6 شهور، ويمكن التفاوض على الكاش', developer: 'غير محددة',
  },
  {
    id: '14-304-fourth-left', zone: 14, building: 304, floor: 'الرابع', area: 150,
    facing: 'أمامي يسار', finish: 'نص تشطيب', finishCategory: 'نص تشطيب', facade: 'خلصانة',
    features: 'على المحور المركزي مباشرة', basement: 'غير محدد', basementShare: 0,
    elevator: 'غير محدد', elevatorShare: 0, meterPrice: 13500, price: 2025000,
    payment: 'متاح الدفع على 6 شهور، ويمكن التفاوض على الكاش', developer: 'غير محددة',
  },
  {
    id: '14-304-fourth-rear', zone: 14, building: 304, floor: 'الرابع', area: 140,
    facing: 'خلفي', finish: 'نص تشطيب', finishCategory: 'نص تشطيب', facade: 'خلصانة',
    features: 'على المحور المركزي مباشرة', basement: 'غير محدد', basementShare: 0,
    elevator: 'غير محدد', elevatorShare: 0, meterPrice: 13500, price: 1890000,
    payment: 'متاح الدفع على 6 شهور، ويمكن التفاوض على الكاش', developer: 'غير محددة',
  },
  {
    id: '14-403-fourth', zone: 14, building: 403, floor: 'الرابع', area: 155,
    facing: 'أمامي يمين', finish: 'نص تشطيب', finishCategory: 'نص تشطيب', facade: 'خلصانة',
    features: 'ثاني نمرة من المحور، فاصل مع 21، باب حديد، عدادات', basement: 'بدون بدروم', basementShare: 0,
    elevator: 'شامل أسانسير', elevatorShare: 0, meterPrice: 13548, price: 2100000,
    payment: 'البيع كاش', developer: 'غير محددة',
  },
  {
    id: '14-240-second', zone: 14, building: 240, floor: 'الثاني', area: 135,
    facing: 'أمامي', finish: 'طوب', finishCategory: 'طوب', facade: 'غير محددة',
    features: 'أمام مول بصمة وبناء ومسجد المنطقة', basement: 'شامل بدروم', basementShare: 0,
    elevator: 'غير محدد', elevatorShare: 0, meterPrice: 12000, price: 1620000,
    payment: 'متبقي 200 ألف عند الاستلام، والسعر شامل باكية جراج', developer: 'التميز',
  },
  {
    id: '14-222-ground', zone: 14, building: 222, floor: 'الأرضي', area: 133,
    facing: 'أمامي', finish: 'نص تشطيب', finishCategory: 'نص تشطيب', facade: 'مبني 3 أدوار',
    features: 'على المحور مباشرة، جبس بورد، تحت الإنشاء، تأسيس كهرباء وسباكة ومحارة',
    basement: 'غير محدد', basementShare: 0, elevator: 'غير محدد', elevatorShare: 0,
    meterPrice: 15000, price: 1995000, payment: 'كاش', developer: 'عقار جروب',
  },
  {
    id: '14-51-third', zone: 14, building: 51, floor: 'الثالث', area: 198,
    facing: 'خلفي', finish: 'نص تشطيب', finishCategory: 'نص تشطيب', facade: 'خلصانة',
    features: 'سلم رخام، واجهة خالصة، مقابل الدوران، شامل بدروم وأسانسير مدفوعين',
    basement: 'شامل بدروم', basementShare: 0, elevator: 'شامل أسانسير', elevatorShare: 0,
    meterPrice: 12000, price: 2376000, payment: 'كاش من المالك', developer: 'أهالي',
  },
  {
    id: '14-97-third', zone: 14, building: 97, floor: 'الثالث', area: 150,
    facing: 'خلفي', finish: 'ع الطوب', finishCategory: 'طوب', facade: 'خلصانة',
    features: 'حصة أسانسير، واجهة خالصة', basement: 'غير محدد', basementShare: 0,
    elevator: 'شامل أسانسير', elevatorShare: 0, meterPrice: 10000, price: 1500000,
    payment: 'كاش من المالك', developer: 'غير محددة',
  },
  {
    id: '14-60-second', zone: 14, building: 60, floor: 'الثاني', area: 126,
    facing: 'أمامي', finish: 'طوب', finishCategory: 'طوب', facade: 'الواجهة متبقي لها 4 شهور',
    features: 'ثاني نمرة من الأكسدة، شامل بدروم وأسانسير', basement: 'شامل بدروم', basementShare: 0,
    elevator: 'شامل أسانسير', elevatorShare: 0, meterPrice: 11000, price: 1386000,
    payment: 'كاش من المالك', developer: 'عقار',
  },
  {
    id: '21-868-ground', zone: 21, building: 868, floor: 'الأرضي', area: 190,
    facing: 'أمامي', finish: 'طوب', finishCategory: 'طوب', facade: 'متبقي 3 شهور على الواجهة',
    features: 'حديقة خاصة ومدخل خاص', basement: 'غير محدد', basementShare: 0,
    elevator: 'غير محدد', elevatorShare: 0, meterPrice: 13500, price: 2565000,
    payment: 'البيع كاش', developer: 'غير محددة',
  },
  {
    id: '21-883-third', zone: 21, building: 883, floor: 'الثالث', area: 140,
    facing: 'أمامي', finish: 'نص تشطيب', finishCategory: 'نص تشطيب', facade: 'خلصانة',
    features: 'ثاني نمرة من الأكسدة، بسعر الطوب، شامل بدروم وأسانسير', basement: 'شامل بدروم', basementShare: 0,
    elevator: 'شامل أسانسير', elevatorShare: 0, meterPrice: 12000, price: 1680000,
    payment: 'متبقي 200 ألف للشركة، والمبلغ المذكور للدفع 1,410,000', developer: 'أمانكو',
  },
  {
    id: '21-789-fourth', zone: 21, building: 789, floor: 'الرابع', area: 195,
    facing: 'أمامي يسار', finish: 'نص تشطيب عبارة عن جبس بورد', finishCategory: 'نص تشطيب', facade: 'خلصانة',
    features: 'على الفاصل مباشرة', basement: 'غير محدد', basementShare: 0,
    elevator: 'غير محدد', elevatorShare: 0, meterPrice: 15385, price: 3000000,
    payment: 'البيع كاش', developer: 'غير محددة',
  },
  {
    id: '21-834-fourth', zone: 21, building: 834, floor: 'الرابع', area: 167,
    facing: 'ناصية أمامي', finish: 'طوب', finishCategory: 'طوب', facade: 'الواجهة خالصة',
    features: 'ثالث نمرة من الفاصل', basement: 'غير محدد', basementShare: 0,
    elevator: 'غير محدد', elevatorShare: 0, meterPrice: 11000, price: 1837000,
    payment: 'كاش', developer: 'غير محددة',
  },
]
export default function AgentDashboard() {

  const [activePage, setActivePage] = useState('dashboard')

  const [theme, setTheme] = useState('light')

  const [sharesDone, setSharesDone] = useState('')
  const [propertySearch, setPropertySearch] = useState('')
  const [propertyZone, setPropertyZone] = useState('all')
  const [propertyFloor, setPropertyFloor] = useState('all')
  const [propertyFinish, setPropertyFinish] = useState('all')
  const [propertyFacing, setPropertyFacing] = useState('all')
  const [propertyMinPrice, setPropertyMinPrice] = useState('')
  const [propertyMaxPrice, setPropertyMaxPrice] = useState('')
  const [ownerRequests, setOwnerRequests] = useState([])
  const [ownerMessages, setOwnerMessages] = useState([])
  const [requestProperty, setRequestProperty] = useState(null)
  const [ownerRequestNote, setOwnerRequestNote] = useState('')
  const [reviewRequestId, setReviewRequestId] = useState(null)
  const [reviewOwnerName, setReviewOwnerName] = useState('')
  const [reviewOwnerPhone, setReviewOwnerPhone] = useState('')
  const [reviewError, setReviewError] = useState('')




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

  const getActiveOwnerRequest = (propertyId) =>
    ownerRequests.find(
      (request) =>
        request.propertyId === propertyId &&
        (request.status === 'pending' || request.status === 'approved')
    )

  const handleStartOwnerRequest = (property) => {
    const activeRequest = getActiveOwnerRequest(property.id)
    if (activeRequest) return
    setRequestProperty(property)
    setOwnerRequestNote('')
  }

  const handleSubmitOwnerRequest = (event) => {
    event.preventDefault()
    if (!requestProperty || getActiveOwnerRequest(requestProperty.id)) return

    const newRequest = {
      id: `owner-request-${Date.now()}`,
      propertyId: requestProperty.id,
      property: {
        zone: requestProperty.zone,
        building: requestProperty.building,
        floor: requestProperty.floor,
        facing: requestProperty.facing,
        area: requestProperty.area,
        price: requestProperty.price,
      },
      agentName: 'مستخدم الوكيل',
      note: ownerRequestNote.trim(),
      status: 'pending',
      submittedAt: new Date().toLocaleString('ar-EG'),
    }

    setOwnerRequests((current) => [newRequest, ...current])
    setRequestProperty(null)
    setOwnerRequestNote('')
    setActivePage('requests')
  }

  const handleOpenAdminReview = (request) => {
    setReviewRequestId(request.id)
    setReviewOwnerName('')
    setReviewOwnerPhone('')
    setReviewError('')
  }

  const handleRejectOwnerRequest = (requestId) => {
    setOwnerRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, status: 'rejected', reviewedAt: new Date().toLocaleString('ar-EG') }
          : request
      )
    )
  }

  const handleApproveOwnerRequest = (event) => {
    event.preventDefault()
    const name = reviewOwnerName.trim()
    const phone = reviewOwnerPhone.trim()

    if (!name || !phone) {
      setReviewError('أدخل اسم المالك ورقم هاتفه لإتمام الموافقة.')
      return
    }

    const request = ownerRequests.find((item) => item.id === reviewRequestId)
    if (!request) return

    const reviewedAt = new Date().toLocaleString('ar-EG')
    setOwnerRequests((current) =>
      current.map((item) =>
        item.id === reviewRequestId
          ? { ...item, status: 'approved', ownerName: name, ownerPhone: phone, reviewedAt }
          : item
      )
    )

    const property = request.property
    const newMessage = {
      id: `owner-message-${Date.now()}`,
      requestId: request.id,
      ownerName: name,
      ownerPhone: phone,
      propertySummary: `مالك قطعة ${n(property.building)}، الدور ${property.floor}، ${property.facing}`,
      zone: property.zone,
      building: property.building,
      floor: property.floor,
      facing: property.facing,
      area: property.area,
      receivedAt: reviewedAt,
    }
    setOwnerMessages((current) => [newMessage, ...current.filter((item) => item.requestId !== request.id)])
    setReviewRequestId(null)
    setReviewError('')
    setActivePage('messages')
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



  const renderProperties = () => {
    const searchValue = normalizeSearch(propertySearch)
    const filteredProperties = sampleProperties.filter((property) => {
      if (propertyZone !== 'all' && String(property.zone) !== propertyZone) return false
      if (propertyFloor !== 'all' && property.floor !== propertyFloor) return false
      if (propertyFinish !== 'all' && property.finishCategory !== propertyFinish) return false
      if (propertyFacing !== 'all' && property.facing !== propertyFacing) return false

      const minimumPrice = propertyMinPrice === '' ? null : Number(propertyMinPrice)
      const maximumPrice = propertyMaxPrice === '' ? null : Number(propertyMaxPrice)
      if (minimumPrice !== null && property.price < minimumPrice) return false
      if (maximumPrice !== null && property.price > maximumPrice) return false

      if (!searchValue) return true

      const searchableText = normalizeSearch([
        property.zone,
        property.building,
        property.floor,
        property.area,
        property.facing,
        property.finish,
        property.facade,
        property.features,
        property.basement,
        property.elevator,
        property.payment,
        property.developer,
        property.price,
        property.meterPrice,
      ].join(' '))

      return searchableText.includes(searchValue)
    })

    const resetPropertyFilters = () => {
      setPropertySearch('')
      setPropertyZone('all')
      setPropertyFloor('all')
      setPropertyFinish('all')
      setPropertyFacing('all')
      setPropertyMinPrice('')
      setPropertyMaxPrice('')
    }

    return (
      <div className="agent-properties-page">
        <div className="agent-page-header">
          <div>
            <h1>العقارات المتاحة</h1>
            <p>ابحث في الشقق المتاحة حسب المنطقة والعمارة والدور والتشطيب.</p>
          </div>
          <span className="agent-property-total">{n(filteredProperties.length)} من {n(sampleProperties.length)} شقة</span>
        </div>

        <section className="agent-property-toolbar" aria-label="البحث والتصفية">
          <label className="agent-property-search">
            <span className="agent-filter-label">بحث</span>
            <span className="agent-search-input-wrap">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={propertySearch}
                onChange={(event) => setPropertySearch(event.target.value)}
                placeholder="ابحث برقم العمارة أو المنطقة أو السعر أو المميزات..."
                aria-label="ابحث في العقارات"
              />
            </span>
          </label>

          <div className="agent-property-filters">
            <label className="agent-property-filter">
              <span className="agent-filter-label">المنطقة</span>
              <select value={propertyZone} onChange={(event) => setPropertyZone(event.target.value)}>
                <option value="all">كل المناطق</option>
                <option value="14">المربع الذهبي - 14</option>
                <option value="21">المربع الذهبي - 21</option>
              </select>
            </label>

            <label className="agent-property-filter">
              <span className="agent-filter-label">الدور</span>
              <select value={propertyFloor} onChange={(event) => setPropertyFloor(event.target.value)}>
                <option value="all">كل الأدوار</option>
                <option value="الأرضي">الأرضي</option>
                <option value="الثاني">الثاني</option>
                <option value="الثالث">الثالث</option>
                <option value="الرابع">الرابع</option>
              </select>
            </label>

            <label className="agent-property-filter">
              <span className="agent-filter-label">التشطيب</span>
              <select value={propertyFinish} onChange={(event) => setPropertyFinish(event.target.value)}>
                <option value="all">كل أنواع التشطيب</option>
                <option value="سوبر لوكس">سوبر لوكس</option>
                <option value="نص تشطيب">نصف تشطيب</option>
                <option value="طوب">على الطوب</option>
              </select>
            </label>

            <label className="agent-property-filter">
              <span className="agent-filter-label">الاتجاه</span>
              <select value={propertyFacing} onChange={(event) => setPropertyFacing(event.target.value)}>
                <option value="all">كل الاتجاهات</option>
                <option value="أمامي">أمامي</option>
                <option value="أمامي يمين">أمامي يمين</option>
                <option value="أمامي يسار">أمامي يسار</option>
                <option value="خلفي">خلفي</option>
                <option value="ناصية أمامي">ناصية أمامي</option>
              </select>
            </label>

            <div className="agent-price-range-filter">
              <span className="agent-filter-label">نطاق السعر الإجمالي (ج.م)</span>
              <div className="agent-price-range-inputs">
                <label className="agent-price-field">
                  <span>من</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    value={propertyMinPrice}
                    onChange={(event) => setPropertyMinPrice(normalizePriceInput(event.target.value))}
                    placeholder="أقل سعر"
                    aria-label="أقل سعر إجمالي بالجنيه المصري"
                  />
                </label>
                <label className="agent-price-field">
                  <span>إلى</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    value={propertyMaxPrice}
                    onChange={(event) => setPropertyMaxPrice(normalizePriceInput(event.target.value))}
                    placeholder="أعلى سعر"
                    aria-label="أعلى سعر إجمالي بالجنيه المصري"
                  />
                </label>
              </div>
            </div>

            <button type="button" className="agent-property-reset" onClick={resetPropertyFilters}>
              إعادة ضبط
            </button>
          </div>
        </section>

        {filteredProperties.length === 0 ? (
          <div className="agent-card agent-properties-empty">
            <span className="agent-empty-icon">⌕</span>
            <h2>لا توجد نتائج مطابقة</h2>
            <p>جرّب تغيير كلمات البحث أو تعديل الفلاتر.</p>
            <button type="button" className="agent-primary-button" onClick={resetPropertyFilters}>عرض كل الشقق</button>
          </div>
        ) : (
          <div className="agent-listing-grid">
            {filteredProperties.map((property) => (
              <article className="agent-card agent-listing-card" key={property.id}>
                <div className="agent-listing-map">
                  <img
                    src={`/maps/zone-${property.zone}-building-${property.building}.png`}
                    alt={`خريطة توضيحية للمنطقة ${n(property.zone)} والعمارة ${n(property.building)} مع تحديد رقم العمارة`}
                    loading="lazy"
                  />
                  <span className={`agent-map-zone zone-${property.zone}`}>المنطقة {n(property.zone)}</span>
                  <span className="agent-map-building">العمارة {n(property.building)}</span>
                  <span className="agent-map-caption">الموقع على الخريطة</span>
                </div>

                <div className="agent-listing-body">
                  <div className="agent-listing-heading">
                    <div>
                      <p className="agent-listing-kicker">المربع الذهبي · المنطقة {n(property.zone)}</p>
                      <h2>شقة {n(property.area)} م²</h2>
                    </div>
                    <span className="agent-listing-facing">{property.facing}</span>
                  </div>

                  <div className="agent-listing-tags">
                    <span>{property.floor}</span>
                    <span>{property.finish}</span>
                    <span>واجهة: {property.facade}</span>
                  </div>

                  <div className="agent-listing-price-row">
                    <div>
                      <span className="agent-listing-price-label">السعر الإجمالي</span>
                      <strong className="agent-listing-price">{formatPrice(property.price)}</strong>
                    </div>
                    <div className="agent-listing-meter">
                      <span>سعر المتر</span>
                      <strong>{formatPrice(property.meterPrice)}</strong>
                    </div>
                  </div>

                  <div className="agent-listing-feature">
                    <span className="agent-listing-feature-icon" aria-hidden="true">✦</span>
                    <p>{property.features}</p>
                  </div>

                  <div className="agent-listing-inclusions">
                    <div><span>البدروم</span><strong>{property.basement}</strong></div>
                    <div><span>الأسانسير</span><strong>{property.elevator}</strong></div>
                    <div><span>شركة التطوير</span><strong>{property.developer}</strong></div>
                  </div>

                  <div className="agent-listing-payment-details" id={`payment-${property.id}`}>
                    <span>تفاصيل الدفع</span>
                    <p>{property.payment}</p>
                  </div>

                  <button
                    type="button"
                    className="agent-owner-request-button"
                    disabled={Boolean(getActiveOwnerRequest(property.id))}
                    onClick={() => handleStartOwnerRequest(property)}
                  >
                    <span aria-hidden="true">✉</span>
                    <span>
                      {getActiveOwnerRequest(property.id)?.status === 'pending'
                        ? 'طلب رقم المالك قيد المراجعة'
                        : getActiveOwnerRequest(property.id)?.status === 'approved'
                          ? 'تمت الموافقة — راجع الرسائل'
                          : 'طلب رقم المالك'}
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="agent-properties-disclaimer">
          البيانات المعروضة عيّنة أولية من السجلات المرسلة، وسيتم ربطها بقاعدة البيانات لاحقًا. لا تظهر بيانات المالك إلا بعد موافقة الإدارة.
        </p>

        {requestProperty && (
          <div className="agent-modal-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRequestProperty(null)
          }}>
            <section className="agent-modal" role="dialog" aria-modal="true" aria-labelledby="owner-request-title">
              <div className="agent-modal-header">
                <div>
                  <p className="agent-modal-kicker">طلب داخلي</p>
                  <h2 id="owner-request-title">طلب رقم المالك</h2>
                </div>
                <button type="button" className="agent-modal-close" aria-label="إغلاق" onClick={() => setRequestProperty(null)}>×</button>
              </div>

              <div className="agent-request-property-summary">
                <strong>قطعة {n(requestProperty.building)} · المنطقة {n(requestProperty.zone)}</strong>
                <span>شقة {n(requestProperty.area)} م² · الدور {requestProperty.floor} · {requestProperty.facing}</span>
                <span>{formatPrice(requestProperty.price)}</span>
              </div>

              <form onSubmit={handleSubmitOwnerRequest}>
                <label className="agent-modal-field">
                  <span>ملاحظة للإدارة (اختياري)</span>
                  <textarea
                    value={ownerRequestNote}
                    onChange={(event) => setOwnerRequestNote(event.target.value)}
                    rows="3"
                    placeholder="اكتب سبب طلب رقم المالك أو أي تفاصيل إضافية..."
                  />
                </label>
                <p className="agent-modal-note">سيصل الطلب إلى الإدارة للمراجعة. لن تظهر بيانات المالك في حسابك إلا بعد الموافقة.</p>
                <div className="agent-modal-actions">
                  <button type="button" className="agent-secondary-button" onClick={() => setRequestProperty(null)}>إلغاء</button>
                  <button type="submit" className="agent-primary-button">إرسال الطلب</button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    )
  }

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



  const renderRequests = () => (
    <div className="agent-requests-page">
      <div className="agent-page-header">
        <div>
          <h1>طلباتي</h1>
          <p>تابع طلبات أرقام المُلّاك وحالة مراجعتها من الإدارة.</p>
        </div>
        <span className="agent-property-total">{n(ownerRequests.length)} طلب</span>
      </div>

      <div className="agent-demo-notice">
        <strong>معاينة تجريبية لسير العمل</strong>
        <p>لأن حساب الإدارة وقاعدة البيانات لم يُنشآ بعد، تظهر هنا أزرار تجريبية لمحاكاة قرار الإدارة. ستُنقل هذه الإجراءات إلى لوحة الإدارة لاحقًا.</p>
      </div>

      {ownerRequests.length === 0 ? (
        <div className="agent-card agent-properties-empty">
          <span className="agent-empty-icon">▤</span>
          <h2>لا توجد طلبات حتى الآن</h2>
          <p>من صفحة العقارات، اضغط «طلب رقم المالك» على الشقة المطلوبة.</p>
          <button type="button" className="agent-primary-button" onClick={() => navigateTo('properties')}>تصفّح العقارات</button>
        </div>
      ) : (
        <div className="agent-request-list">
          {ownerRequests.map((request) => (
            <article className="agent-card agent-owner-request-card" key={request.id}>
              <div className="agent-owner-request-topline">
                <div>
                  <p className="agent-listing-kicker">طلب رقم المالك · {request.submittedAt}</p>
                  <h2>قطعة {n(request.property.building)} — المنطقة {n(request.property.zone)}</h2>
                </div>
                <span className={`agent-status-label ${request.status === 'approved' ? 'completed' : request.status === 'pending' ? 'pending' : 'rejected'}`}>
                  {request.status === 'pending' ? 'قيد المراجعة' : request.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                </span>
              </div>

              <p className="agent-owner-request-summary">
                شقة {n(request.property.area)} م² · الدور {request.property.floor} · {request.property.facing} · {formatPrice(request.property.price)}
              </p>
              {request.note && <p className="agent-owner-request-note">ملاحظة الوكيل: {request.note}</p>}
              {request.reviewedAt && <p className="agent-owner-request-note">تاريخ القرار: {request.reviewedAt}</p>}

              {request.status === 'pending' && (
                <div className="agent-demo-admin-actions">
                  <span>إجراءات الإدارة التجريبية</span>
                  <div>
                    <button type="button" className="agent-primary-button" onClick={() => handleOpenAdminReview(request)}>موافقة وإضافة بيانات المالك</button>
                    <button type="button" className="agent-danger-button" onClick={() => handleRejectOwnerRequest(request.id)}>رفض الطلب التجريبي</button>
                  </div>
                </div>
              )}

              {request.status === 'approved' && (
                <button type="button" className="agent-text-button agent-open-messages-button" onClick={() => navigateTo('messages')}>
                  تم إرسال بيانات المالك — فتح الرسائل ←
                </button>
              )}
              {request.status === 'rejected' && <p className="agent-request-rejected-note">لم تتم مشاركة بيانات المالك. يمكنك تقديم طلب جديد من صفحة العقارات إذا لزم الأمر.</p>}
            </article>
          ))}
        </div>
      )}

      {reviewRequestId && (
        <div className="agent-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setReviewRequestId(null)
        }}>
          <section className="agent-modal" role="dialog" aria-modal="true" aria-labelledby="owner-review-title">
            <div className="agent-modal-header">
              <div>
                <p className="agent-modal-kicker">محاكاة إجراء الإدارة</p>
                <h2 id="owner-review-title">الموافقة على طلب رقم المالك</h2>
              </div>
              <button type="button" className="agent-modal-close" aria-label="إغلاق" onClick={() => setReviewRequestId(null)}>×</button>
            </div>
            <p className="agent-modal-note">أدخل بيانات تجريبية أو بيانات مصرح لك بمشاركتها. بعد الموافقة، ستظهر هذه المعلومات للوكيل في صفحة الرسائل.</p>
            <form onSubmit={handleApproveOwnerRequest}>
              <label className="agent-modal-field">
                <span>اسم المالك</span>
                <input value={reviewOwnerName} onChange={(event) => setReviewOwnerName(event.target.value)} required placeholder="اسم المالك" />
              </label>
              <label className="agent-modal-field">
                <span>رقم هاتف المالك</span>
                <input value={reviewOwnerPhone} onChange={(event) => setReviewOwnerPhone(event.target.value)} required inputMode="tel" type="tel" placeholder="رقم الهاتف" />
              </label>
              {reviewError && <p className="agent-form-error" role="alert">{reviewError}</p>}
              <div className="agent-modal-actions">
                <button type="button" className="agent-secondary-button" onClick={() => setReviewRequestId(null)}>إلغاء</button>
                <button type="submit" className="agent-primary-button">تأكيد الموافقة وإرسال البيانات للرسائل</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )

  const renderMessages = () => (
    <div className="agent-messages-page">
      <div className="agent-page-header">
        <div>
          <h1>الرسائل</h1>
          <p>بيانات التواصل مع المُلّاك التي وافقت الإدارة على مشاركتها معك.</p>
        </div>
        <span className="agent-property-total">{n(ownerMessages.length)} محادثة</span>
      </div>

      {ownerMessages.length === 0 ? (
        <div className="agent-card agent-properties-empty">
          <span className="agent-empty-icon">✉</span>
          <h2>لا توجد رسائل حتى الآن</h2>
          <p>عند موافقة الإدارة على طلب رقم المالك، ستظهر بياناته هنا مباشرة.</p>
          <button type="button" className="agent-primary-button" onClick={() => navigateTo('properties')}>العودة إلى العقارات</button>
        </div>
      ) : (
        <div className="agent-owner-message-list">
          {ownerMessages.map((message) => (
            <article className="agent-card agent-owner-message-card" key={message.id}>
              <div className="agent-owner-message-avatar" aria-hidden="true">{message.ownerName.trim().charAt(0) || 'م'}</div>
              <div className="agent-owner-message-content">
                <div className="agent-owner-message-heading">
                  <div>
                    <h2>{message.ownerName}</h2>
                    <p>{message.propertySummary}</p>
                  </div>
                  <span className="agent-status-label completed">معتمد من الإدارة</span>
                </div>
                <div className="agent-owner-contact-number" dir="ltr">{message.ownerPhone}</div>
                <div className="agent-owner-message-meta">
                  <span>المنطقة {n(message.zone)}</span>
                  <span>قطعة {n(message.building)}</span>
                  <span>{n(message.area)} م²</span>
                  <span>{message.receivedAt}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="agent-properties-disclaimer">هذا نموذج أولي داخل المتصفح؛ ستأتي الرسائل الفعلية من النظام بعد ربط حسابات الوكلاء والإدارة وقاعدة البيانات.</p>
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
          {activePage === 'properties' && renderProperties()}
          {activePage === 'requests' && renderRequests()}
          {activePage === 'messages' && renderMessages()}
          {activePage === 'tasks' && renderTasks()}
          {!['dashboard', 'properties', 'requests', 'messages', 'tasks'].includes(activePage) && renderOtherPage()}

        </div>

      </main>

    </div>

  )

}
