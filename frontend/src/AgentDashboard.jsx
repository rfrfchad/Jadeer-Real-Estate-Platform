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

  addProperty: {

    label: 'إضافة عقار',

    icon: '＋',

    description: 'أرسل طلب إضافة شقة أو أرض لمراجعة الإدارة واعتمادها.',

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

const submittedPropertyToListing = (submission) => {
  const data = submission.data || {}
  const type = submission.type || 'apartment'
  const rawZone = type === 'beitWatan' ? (data.regionLabel || 'بيت الوطن') : data.zone
  const numericZone = String(rawZone ?? '').trim()
  const filterZone = type === 'beitWatan'
    ? 'beitWatan'
    : ['14', '21', '22', '29'].includes(numericZone)
      ? numericZone
      : 'other'
  const area = Number(data.area) || 0
  const price = Number(data.totalPrice ?? data.amount) || 0
  const finishCategory = type === 'apartment'
    ? (data.finish === 'نص تشطيب' ? 'نص تشطيب' : data.finish === 'سوبر لوكس' ? 'سوبر لوكس' : data.finish === 'طوب' ? 'طوب' : 'غير ذلك')
    : 'غير ذلك'

  return {
    id: `submitted-${submission.id}`,
    submissionId: submission.id,
    type,
    typeLabel: type === 'apartment' ? 'شقة' : type === 'land' ? 'أرض' : 'أرض بيت الوطن',
    zone: rawZone,
    zoneFilter: filterZone,
    regionLabel: type === 'beitWatan' ? (data.regionLabel || 'بيت الوطن') : '',
    building: data.pieceNumber || '',
    floor: data.floor || '',
    area,
    facing: data.facing || '',
    finish: data.finish || data.landStatus || '',
    finishCategory,
    facade: data.facadeFinish || '',
    features: data.features || '',
    basement: data.basement || 'غير محدد',
    basementShare: data.basementShare ?? '',
    elevator: data.elevator || 'غير محدد',
    elevatorShare: data.elevatorShare ?? '',
    meterPrice: type === 'apartment' && area > 0 ? Math.round(price / area) : 0,
    price,
    payment: data.paymentNotes || data.notes || '',
    developer: data.developer || 'غير محددة',
    deadline: data.deadline || '',
    paidUsd: data.paidUsd ?? '',
    landStatus: data.landStatus || '',
    ownerName: data.ownerName || '',
    ownerPhone: data.ownerPhone || '',
  }
}

const displayZone = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const text = String(value)
  return /^\d+(\.\d+)?$/.test(text) ? n(Number(text)) : text
}

const blankPropertyForm = () => ({
  zone: '14', zoneOther: '', pieceNumber: '', floor: 'الأرضي', area: '', facing: 'أمامي يمين',
  finish: 'نص تشطيب', finishOther: '', facadeFinish: 'خلصانة', facadeOther: '', features: '', basement: 'شامل بدروم', basementShare: '',
  elevator: 'شامل أسانسير', elevatorShare: '', elevatorOther: '', totalPrice: '', ownerName: '', ownerPhone: '', developer: '', paymentNotes: '',
  landStatus: 'خالصة', deadline: '', landFeatures: '', landAmount: '', landOwnerName: '', landOwnerPhone: '', landPaymentNotes: '',
  regionType: 'الأكثر تميز', neighborhood: 'الأولى', neighborhoodSection: 'A', sector: 'N-A',
  paidUsd: '', amount: '', beitFeatures: '', beitOwnerName: '', beitOwnerPhone: '', beitNotes: '',
})

export default function AgentDashboard({
  theme = 'light',
  setTheme = () => {},
  ownerRequests = [],
  setOwnerRequests = () => {},
  ownerMessages = [],
  propertySubmissionRequests = [],
  onSubmitProperty = () => {},
  onSwitchToAdmin = () => {},
}) {

  const [activePage, setActivePage] = useState('dashboard')

  const [sharesDone, setSharesDone] = useState('')
  const [propertySearch, setPropertySearch] = useState('')
  const [propertyZone, setPropertyZone] = useState('all')
  const [propertyFloor, setPropertyFloor] = useState('all')
  const [propertyFinish, setPropertyFinish] = useState('all')
  const [propertyFacing, setPropertyFacing] = useState('all')
  const [propertyMinPrice, setPropertyMinPrice] = useState('')
  const [propertyMaxPrice, setPropertyMaxPrice] = useState('')
  const [requestProperty, setRequestProperty] = useState(null)
  const [ownerRequestNote, setOwnerRequestNote] = useState('')
  const [propertyType, setPropertyType] = useState('all')
  const [newPropertyType, setNewPropertyType] = useState('apartment')
  const [newPropertyForm, setNewPropertyForm] = useState(blankPropertyForm)
  const [propertySubmitError, setPropertySubmitError] = useState('')
  const [propertySubmitSuccess, setPropertySubmitSuccess] = useState('')




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

  const updateNewPropertyField = (field, value) => {
    setNewPropertyForm((current) => ({ ...current, [field]: value }))
    setPropertySubmitError('')
    setPropertySubmitSuccess('')
  }

  const handleNewPropertyTypeChange = (event) => {
    const nextType = event.target.value
    const blankForm = blankPropertyForm()
    if (nextType === 'land') blankForm.zone = ''
    setNewPropertyType(nextType)
    setNewPropertyForm(blankForm)
    setPropertySubmitError('')
    setPropertySubmitSuccess('')
  }

  const handleNewPropertySubmit = (event) => {
    event.preventDefault()
    const form = newPropertyForm
    const numeric = (value) => Number(String(value ?? '').replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/,/g, '').trim()) || 0
    let data = {}

    if (newPropertyType === 'apartment') {
      const area = numeric(form.area)
      const totalPrice = numeric(form.totalPrice)
      const zoneValue = normalizePriceInput(form.zone === 'other' ? form.zoneOther.trim() : form.zone)
      if (!zoneValue || !form.pieceNumber.trim() || area <= 0 || totalPrice <= 0 || !form.ownerPhone.trim()) {
        setPropertySubmitError('راجع رقم القطعة والمساحة والسعر الإجمالي ورقم المالك.')
        return
      }
      if (form.basement === 'حصة خارجية ملزمة الدفع' && numeric(form.basementShare) <= 0) {
        setPropertySubmitError('أدخل قيمة حصة البدروم المطلوبة.')
        return
      }
      if ((form.elevator === 'اتحاد ملاك' || form.elevator === 'تبع الشركة') && numeric(form.elevatorShare) <= 0) {
        setPropertySubmitError('أدخل قيمة حصة الأسانسير المطلوبة.')
        return
      }
      data = {
        zone: zoneValue,
        pieceNumber: form.pieceNumber.trim(), floor: form.floor, area, facing: form.facing,
        finish: form.finish === 'غير ذلك' && form.finishOther.trim() ? `غير ذلك: ${form.finishOther.trim()}` : form.finish,
        finishOther: form.finish === 'غير ذلك' ? form.finishOther.trim() : '',
        facadeFinish: form.facadeFinish === 'غير ذلك' && form.facadeOther.trim() ? `غير ذلك: ${form.facadeOther.trim()}` : form.facadeFinish,
        facadeOther: form.facadeFinish === 'غير ذلك' ? form.facadeOther.trim() : '', features: form.features.trim(),
        basement: form.basement, basementShare: form.basement === 'حصة خارجية ملزمة الدفع' ? numeric(form.basementShare) : null,
        elevator: form.elevator === 'غير ذلك' && form.elevatorOther.trim() ? `غير ذلك: ${form.elevatorOther.trim()}` : form.elevator,
        elevatorOther: form.elevator === 'غير ذلك' ? form.elevatorOther.trim() : '',
        elevatorShare: ['اتحاد ملاك', 'تبع الشركة'].includes(form.elevator) ? numeric(form.elevatorShare) : null,
        totalPrice, meterPrice: Math.round(totalPrice / area), ownerName: form.ownerName.trim(),
        ownerPhone: form.ownerPhone.trim(), developer: form.developer.trim(), paymentNotes: form.paymentNotes.trim(),
      }
    } else if (newPropertyType === 'land') {
      const area = numeric(form.area)
      const amount = numeric(form.landAmount)
      const zoneValue = normalizePriceInput(form.zone.trim())
      if (!zoneValue || !form.pieceNumber.trim() || area <= 0 || amount <= 0 || !form.landOwnerPhone.trim()) {
        setPropertySubmitError('راجع المنطقة ورقم القطعة والمساحة والسعر الكامل ورقم المالك.')
        return
      }
      data = {
        zone: zoneValue, pieceNumber: form.pieceNumber.trim(), area, landStatus: form.landStatus,
        deadline: form.deadline.trim(), features: form.landFeatures.trim(), amount,
        ownerName: form.landOwnerName.trim(), ownerPhone: form.landOwnerPhone.trim(),
        paymentNotes: form.landPaymentNotes.trim(),
      }
    } else {
      const area = numeric(form.area)
      const amount = numeric(form.amount)
      if (!form.pieceNumber.trim() || area <= 0 || amount <= 0 || !form.beitOwnerPhone.trim()) {
        setPropertySubmitError('راجع رقم القطعة والمساحة والمبلغ ورقم المالك.')
        return
      }
      let regionLabel = form.regionType
      if (form.regionType === 'الأكثر تميز') {
        regionLabel += ` · المجاورة ${form.neighborhood}`
        if (form.neighborhood !== 'الثانية') regionLabel += ` · ${form.neighborhoodSection}`
      } else if (form.regionType === 'البنفسج') {
        regionLabel += ` · القطاع ${form.sector}`
      } else {
        regionLabel += ` · القطاع ${form.sector}`
      }
      data = {
        regionType: form.regionType, neighborhood: form.regionType === 'الأكثر تميز' ? form.neighborhood : '',
        neighborhoodSection: form.regionType === 'الأكثر تميز' && form.neighborhood !== 'الثانية' ? form.neighborhoodSection : '',
        sector: form.regionType !== 'الأكثر تميز' ? form.sector : '', regionLabel,
        pieceNumber: form.pieceNumber.trim(), area, paidUsd: form.paidUsd === '' ? null : numeric(form.paidUsd),
        amount, features: form.beitFeatures.trim(), ownerName: form.beitOwnerName.trim(),
        ownerPhone: form.beitOwnerPhone.trim(), notes: form.beitNotes.trim(),
      }
    }

    onSubmitProperty({ type: newPropertyType, data })
    setNewPropertyForm(blankPropertyForm())
    setPropertySubmitError('')
    setPropertySubmitSuccess('تم إرسال طلب إضافة العقار إلى الإدارة بنجاح.')
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
        type: requestProperty.type || 'apartment',
        typeLabel: requestProperty.typeLabel || 'شقة',
        regionLabel: requestProperty.regionLabel || '',
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
    const approvedSubmittedProperties = propertySubmissionRequests
      .filter((submission) => submission.status === 'approved')
      .map(submittedPropertyToListing)
    const allProperties = [...sampleProperties, ...approvedSubmittedProperties]
    const filteredProperties = allProperties.filter((property) => {
      const listingType = property.type || 'apartment'
      if (propertyType !== 'all' && listingType !== propertyType) return false
      const zoneFilterValue = property.zoneFilter || (['14', '21', '22', '29'].includes(String(property.zone)) ? String(property.zone) : 'other')
      if (propertyZone !== 'all' && zoneFilterValue !== propertyZone) return false
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
        property.regionLabel,
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
        property.landStatus,
        property.deadline,
        property.paidUsd,
        property.price,
        property.meterPrice,
        property.typeLabel,
      ].join(' '))

      return searchableText.includes(searchValue)
    })

    const resetPropertyFilters = () => {
      setPropertySearch('')
      setPropertyType('all')
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
          <span className="agent-property-total">{n(filteredProperties.length)} من {n(allProperties.length)} عقار</span>
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
              <span className="agent-filter-label">نوع العقار</span>
              <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
                <option value="all">كل أنواع العقارات</option>
                <option value="apartment">شقق</option>
                <option value="land">أراضي</option>
                <option value="beitWatan">أراضي بيت الوطن</option>
              </select>
            </label>

            <label className="agent-property-filter">
              <span className="agent-filter-label">المنطقة</span>
              <select value={propertyZone} onChange={(event) => setPropertyZone(event.target.value)}>
                <option value="all">كل المناطق</option>
                <option value="14">المربع الذهبي - 14</option>
                <option value="21">المربع الذهبي - 21</option>
                <option value="22">المربع الذهبي - 22</option>
                <option value="29">المربع الذهبي - 29</option>
                <option value="other">منطقة أخرى</option>
                <option value="beitWatan">بيت الوطن</option>
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
              property.type && property.type !== 'apartment' ? (
                <article className="agent-card agent-listing-card" key={property.id}>
                  <div className="agent-listing-map">
                    {property.type === 'beitWatan' ? (
                      <div className="agent-listing-map-placeholder">
                        <span aria-hidden="true">⌖</span>
                        <strong>خريطة بيت الوطن</strong>
                        <small>ستُضاف الخريطة المناسبة لاحقًا</small>
                      </div>
                    ) : (
                      <img
                        src={`/maps/zone-${property.zone}-building-${property.building}.png`}
                        alt={`خريطة توضيحية للمنطقة ${displayZone(property.zone)} والقطعة ${displayZone(property.building)}`}
                        loading="lazy"
                        onError={(event) => {
                          if (event.currentTarget.dataset.fallback !== 'true') {
                            event.currentTarget.dataset.fallback = 'true'
                            event.currentTarget.src = '/maps/golden-square-map.png'
                          } else {
                            event.currentTarget.style.display = 'none'
                          }
                        }}
                      />
                    )}
                    <span className={`agent-map-zone zone-${property.zone}`}>{property.type === 'beitWatan' ? 'بيت الوطن' : `المنطقة ${displayZone(property.zone)}`}</span>
                    <span className="agent-map-building">القطعة {displayZone(property.building)}</span>
                    <span className="agent-map-caption">موقع العقار</span>
                  </div>
                  <div className="agent-listing-body">
                    <div className="agent-listing-heading">
                      <div>
                        <p className="agent-listing-kicker">{property.typeLabel} · {property.regionLabel || `المنطقة ${displayZone(property.zone)}`}</p>
                        <h2>{property.type === 'beitWatan' ? `أرض بيت الوطن ${n(property.area)} م²` : `أرض ${n(property.area)} م²`}</h2>
                      </div>
                      <span className="agent-listing-facing">{property.landStatus || property.sector || 'أرض'}</span>
                    </div>
                    <div className="agent-listing-tags">
                      {property.deadline && <span>المهلة المتبقية: {property.deadline}</span>}
                      {property.sector && <span>القطاع: {property.sector}</span>}
                      {property.neighborhood && <span>المجاورة: {property.neighborhood}</span>}
                    </div>
                    <div className="agent-listing-price-row">
                      <div>
                        <span className="agent-listing-price-label">{property.type === 'land' ? 'سعر الأرض كامل' : 'المبلغ'}</span>
                        <strong className="agent-listing-price">{formatPrice(property.price)}</strong>
                      </div>
                      {property.type === 'beitWatan' && property.paidUsd !== '' && property.paidUsd != null && (
                        <div className="agent-listing-meter"><span>المدفوع بالدولار</span><strong dir="ltr">{n(property.paidUsd)} $</strong></div>
                      )}
                    </div>
                    {property.features && <div className="agent-listing-feature"><span className="agent-listing-feature-icon" aria-hidden="true">✦</span><p>{property.features}</p></div>}
                    <div className="agent-listing-inclusions">
                      {property.type === 'land' && <div><span>حالة الأرض</span><strong>{property.landStatus || 'غير محددة'}</strong></div>}
                      {property.type === 'land' && <div><span>المهلة المتبقية</span><strong>{property.deadline || 'غير محددة'}</strong></div>}
                      {property.type === 'beitWatan' && <div><span>المنطقة</span><strong>{property.regionLabel || 'بيت الوطن'}</strong></div>}
                      <div><span>المساحة</span><strong>{n(property.area)} م²</strong></div>
                    </div>
                    <div className="agent-listing-payment-details">
                      <span>تفاصيل الدفع / ملاحظات</span>
                      <p>{property.payment || 'لا توجد تفاصيل إضافية.'}</p>
                    </div>
                    <button
                      type="button"
                      className="agent-owner-request-button"
                      disabled={Boolean(getActiveOwnerRequest(property.id))}
                      onClick={() => handleStartOwnerRequest(property)}
                    >
                      <span aria-hidden="true">✉</span>
                      <span>{getActiveOwnerRequest(property.id)?.status === 'pending' ? 'طلب رقم المالك قيد المراجعة' : getActiveOwnerRequest(property.id)?.status === 'approved' ? 'تمت الموافقة — راجع الرسائل' : 'طلب رقم المالك'}</span>
                    </button>
                  </div>
                </article>
              ) : (
              <article className="agent-card agent-listing-card" key={property.id}>
                <div className="agent-listing-map">
                  <img
                    src={`/maps/zone-${property.zone}-building-${property.building}.png`}
                    alt={`خريطة توضيحية للمنطقة ${displayZone(property.zone)} والعمارة ${displayZone(property.building)} مع تحديد رقم العمارة`}
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.dataset.fallback !== 'true') {
                        event.currentTarget.dataset.fallback = 'true'
                        event.currentTarget.src = '/maps/golden-square-map.png'
                      } else {
                        event.currentTarget.style.display = 'none'
                      }
                    }}
                  />
                  <span className={`agent-map-zone zone-${property.zone}`}>المنطقة {displayZone(property.zone)}</span>
                  <span className="agent-map-building">العمارة {displayZone(property.building)}</span>
                  <span className="agent-map-caption">الموقع على الخريطة</span>
                </div>

                <div className="agent-listing-body">
                  <div className="agent-listing-heading">
                    <div>
                      <p className="agent-listing-kicker">المربع الذهبي · المنطقة {displayZone(property.zone)}</p>
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
              )
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

  const renderAddProperty = () => {
    const activeRequests = propertySubmissionRequests.filter((request) => request.agentName === 'مستخدم الوكيل')
    const apartmentMeterPrice = Number(newPropertyForm.area) > 0 && Number(newPropertyForm.totalPrice) > 0
      ? Math.round(Number(newPropertyForm.totalPrice) / Number(newPropertyForm.area))
      : 0

    const requestStatusLabel = (status) => status === 'approved' ? 'تمت الموافقة' : status === 'rejected' ? 'مرفوض' : 'بانتظار المراجعة'

    return (
      <div className="agent-add-property-page">
        <div className="agent-page-header">
          <div>
            <h1>إضافة عقار جديد</h1>
            <p>أدخل بيانات العقار كما هو متبع في المكتب، ثم أرسل الطلب إلى الإدارة للمراجعة.</p>
          </div>
        </div>

        <div className="agent-property-type-picker" role="group" aria-label="نوع العقار">
          <button type="button" className={newPropertyType === 'apartment' ? 'active' : ''} onClick={() => handleNewPropertyTypeChange({ target: { value: 'apartment' } })}>
            <span aria-hidden="true">⌂</span><strong>شقة</strong><small>بيانات الشقة والتشطيب والخدمات</small>
          </button>
          <button type="button" className={newPropertyType === 'land' ? 'active' : ''} onClick={() => handleNewPropertyTypeChange({ target: { value: 'land' } })}>
            <span aria-hidden="true">▦</span><strong>أرض عادية</strong><small>حالة الأرض والمهلة والسعر</small>
          </button>
          <button type="button" className={newPropertyType === 'beitWatan' ? 'active' : ''} onClick={() => handleNewPropertyTypeChange({ target: { value: 'beitWatan' } })}>
            <span aria-hidden="true">◇</span><strong>أرض بيت الوطن</strong><small>المنطقة والمجاورة أو القطاع</small>
          </button>
        </div>

        <form className="agent-property-form" onSubmit={handleNewPropertySubmit}>
          {newPropertyType === 'apartment' && (
            <>
              <section className="agent-form-section">
                <div className="agent-form-section-title"><span>١</span><div><h2>بيانات الشقة</h2><p>البيانات الأساسية وموقع الشقة.</p></div></div>
                <div className="agent-form-grid">
                  <label className="agent-form-field"><span>المنطقة <b>*</b></span>
                    <select value={newPropertyForm.zone} onChange={(event) => updateNewPropertyField('zone', event.target.value)}>
                      <option value="14">14</option><option value="21">21</option><option value="22">22</option><option value="29">29</option><option value="other">أخرى</option>
                    </select>
                  </label>
                  {newPropertyForm.zone === 'other' && <label className="agent-form-field"><span>تحديد المنطقة <b>*</b></span><input required inputMode="numeric" value={newPropertyForm.zoneOther} onChange={(event) => updateNewPropertyField('zoneOther', normalizePriceInput(event.target.value))} placeholder="اكتب رقم المنطقة" /></label>}
                  <label className="agent-form-field"><span>رقم القطعة <b>*</b></span><input required value={newPropertyForm.pieceNumber} onChange={(event) => updateNewPropertyField('pieceNumber', event.target.value)} placeholder="رقم القطعة" /></label>
                  <label className="agent-form-field"><span>الدور <b>*</b></span><select required value={newPropertyForm.floor} onChange={(event) => updateNewPropertyField('floor', event.target.value)}><option value="الأرضي">أرضي</option><option value="الثاني">الثاني</option><option value="الثالث">الثالث</option><option value="الرابع">الرابع</option></select></label>
                  <label className="agent-form-field"><span>المساحة (م²) <b>*</b></span><input required min="1" type="number" value={newPropertyForm.area} onChange={(event) => updateNewPropertyField('area', event.target.value)} placeholder="المساحة بالمتر" /></label>
                  <label className="agent-form-field"><span>الواجهة / اتجاه الشقة <b>*</b></span><select required value={newPropertyForm.facing} onChange={(event) => updateNewPropertyField('facing', event.target.value)}><option>أمامي يمين</option><option>أمامي يسار</option><option>أمامي ناصية</option><option>جانبي</option><option>خلفي</option><option>دبل فيس</option></select></label>
                  <label className="agent-form-field"><span>تشطيب الشقة <b>*</b></span><select required value={newPropertyForm.finish} onChange={(event) => updateNewPropertyField('finish', event.target.value)}><option>طوب</option><option>نص تشطيب</option><option>سوبر لوكس</option><option>غير ذلك</option></select></label>
                  {newPropertyForm.finish === 'غير ذلك' && <label className="agent-form-field"><span>توضيح التشطيب</span><input value={newPropertyForm.finishOther || ''} onChange={(event) => updateNewPropertyField('finishOther', event.target.value)} placeholder="اكتب نوع التشطيب" /></label>}
                  <label className="agent-form-field"><span>تشطيب الواجهة <b>*</b></span><select required value={newPropertyForm.facadeFinish} onChange={(event) => updateNewPropertyField('facadeFinish', event.target.value)}><option>خلصانة</option><option>شغالين فيها</option><option>تحت الإنشاء</option><option>غير ذلك</option></select></label>
                  {newPropertyForm.facadeFinish === 'غير ذلك' && <label className="agent-form-field"><span>توضيح حالة الواجهة</span><input value={newPropertyForm.facadeOther || ''} onChange={(event) => updateNewPropertyField('facadeOther', event.target.value)} placeholder="اكتب الحالة" /></label>}
                  <label className="agent-form-field agent-form-field-wide"><span>المميزات</span><textarea rows="3" value={newPropertyForm.features} onChange={(event) => updateNewPropertyField('features', event.target.value)} placeholder="الموقع والمميزات وأي تفاصيل مهمة" /></label>
                </div>
              </section>

              <section className="agent-form-section">
                <div className="agent-form-section-title"><span>٢</span><div><h2>البدروم والأسانسير</h2><p>تظهر خانة المبلغ عند اختيار الحصة التي تحتاج إلى دفع.</p></div></div>
                <div className="agent-form-grid">
                  <label className="agent-form-field"><span>البدروم <b>*</b></span><select required value={newPropertyForm.basement} onChange={(event) => updateNewPropertyField('basement', event.target.value)}><option>شامل بدروم</option><option>حصة خارجية ملزمة الدفع</option><option>بدون بدروم</option></select></label>
                  {newPropertyForm.basement === 'حصة خارجية ملزمة الدفع' && <label className="agent-form-field"><span>قيمة حصة البدروم (ج.م) <b>*</b></span><input required min="1" type="number" value={newPropertyForm.basementShare} onChange={(event) => updateNewPropertyField('basementShare', event.target.value)} placeholder="قيمة الحصة" /></label>}
                  <label className="agent-form-field"><span>الأسانسير <b>*</b></span><select required value={newPropertyForm.elevator} onChange={(event) => updateNewPropertyField('elevator', event.target.value)}><option>شامل أسانسير</option><option>اتحاد ملاك</option><option>تبع الشركة</option><option>غير ذلك</option></select></label>
                  {['اتحاد ملاك', 'تبع الشركة'].includes(newPropertyForm.elevator) && <label className="agent-form-field"><span>قيمة حصة الأسانسير (ج.م) <b>*</b></span><input required min="1" type="number" value={newPropertyForm.elevatorShare} onChange={(event) => updateNewPropertyField('elevatorShare', event.target.value)} placeholder="قيمة حصة الأسانسير" /></label>}
                  {newPropertyForm.elevator === 'غير ذلك' && <label className="agent-form-field"><span>توضيح الأسانسير</span><input value={newPropertyForm.elevatorOther || ''} onChange={(event) => updateNewPropertyField('elevatorOther', event.target.value)} placeholder="اكتب التفاصيل" /></label>}
                </div>
              </section>

              <section className="agent-form-section">
                <div className="agent-form-section-title"><span>٣</span><div><h2>السعر وبيانات المالك</h2><p>يتم حساب سعر المتر تلقائيًا من السعر الإجمالي والمساحة.</p></div></div>
                <div className="agent-form-grid">
                  <label className="agent-form-field"><span>سعر الشقة كامل (ج.م) <b>*</b></span><input required min="1" type="number" value={newPropertyForm.totalPrice} onChange={(event) => updateNewPropertyField('totalPrice', event.target.value)} placeholder="إجمالي السعر" /></label>
                  <div className="agent-form-field"><span>سعر المتر المحسوب</span><div className="agent-form-calculated">{apartmentMeterPrice > 0 ? formatPrice(apartmentMeterPrice) : 'يُحسب بعد إدخال المساحة والسعر'}</div></div>
                  <label className="agent-form-field"><span>اسم المالك (اختياري)</span><input value={newPropertyForm.ownerName} onChange={(event) => updateNewPropertyField('ownerName', event.target.value)} placeholder="اسم المالك" /></label>
                  <label className="agent-form-field"><span>رقم المالك <b>*</b></span><input required type="tel" dir="ltr" value={newPropertyForm.ownerPhone} onChange={(event) => updateNewPropertyField('ownerPhone', event.target.value)} placeholder="رقم الهاتف" /></label>
                  <label className="agent-form-field"><span>شركة التطوير (اختياري)</span><input value={newPropertyForm.developer} onChange={(event) => updateNewPropertyField('developer', event.target.value)} placeholder="اسم الشركة" /></label>
                  <label className="agent-form-field agent-form-field-wide"><span>تفاصيل الدفع / ملاحظات</span><textarea rows="3" value={newPropertyForm.paymentNotes} onChange={(event) => updateNewPropertyField('paymentNotes', event.target.value)} placeholder="تفاصيل الدفع أو أي ملاحظات" /></label>
                </div>
              </section>
            </>
          )}

          {newPropertyType === 'land' && (
            <>
              <section className="agent-form-section">
                <div className="agent-form-section-title"><span>١</span><div><h2>بيانات الأرض</h2><p>أدخل المنطقة بالأرقام كما هو مستخدم في المكتب.</p></div></div>
                <div className="agent-form-grid">
                  <label className="agent-form-field"><span>المنطقة (رقم) <b>*</b></span><input required inputMode="numeric" value={newPropertyForm.zone} onChange={(event) => updateNewPropertyField('zone', normalizePriceInput(event.target.value))} placeholder="مثال: 14" /></label>
                  <label className="agent-form-field"><span>رقم القطعة <b>*</b></span><input required value={newPropertyForm.pieceNumber} onChange={(event) => updateNewPropertyField('pieceNumber', event.target.value)} placeholder="رقم القطعة" /></label>
                  <label className="agent-form-field"><span>المساحة (م²) <b>*</b></span><input required min="1" type="number" value={newPropertyForm.area} onChange={(event) => updateNewPropertyField('area', event.target.value)} placeholder="المساحة" /></label>
                  <label className="agent-form-field"><span>حالة الأرض <b>*</b></span><select required value={newPropertyForm.landStatus} onChange={(event) => updateNewPropertyField('landStatus', event.target.value)}><option>خالصة</option><option>خالصة وفيها رخصة</option><option>خالصة وفيها رخصة ومحفورة</option></select></label>
                  <label className="agent-form-field"><span>المهلة المتبقية</span><input value={newPropertyForm.deadline} onChange={(event) => updateNewPropertyField('deadline', event.target.value)} placeholder="المدة المتبقية" /></label>
                  <label className="agent-form-field"><span>سعر الأرض كامل (ج.م) <b>*</b></span><input required min="1" type="number" value={newPropertyForm.landAmount} onChange={(event) => updateNewPropertyField('landAmount', event.target.value)} placeholder="المبلغ الكامل" /></label>
                  <label className="agent-form-field"><span>اسم المالك</span><input value={newPropertyForm.landOwnerName} onChange={(event) => updateNewPropertyField('landOwnerName', event.target.value)} placeholder="اسم المالك" /></label>
                  <label className="agent-form-field"><span>رقم المالك <b>*</b></span><input required type="tel" dir="ltr" value={newPropertyForm.landOwnerPhone} onChange={(event) => updateNewPropertyField('landOwnerPhone', event.target.value)} placeholder="رقم الهاتف" /></label>
                  <label className="agent-form-field agent-form-field-wide"><span>المميزات</span><textarea rows="2" value={newPropertyForm.landFeatures} onChange={(event) => updateNewPropertyField('landFeatures', event.target.value)} placeholder="المميزات" /></label>
                  <label className="agent-form-field agent-form-field-wide"><span>تفاصيل الدفع (إمكانية التقسيط على 3 شهور) / ملاحظات</span><textarea rows="3" value={newPropertyForm.landPaymentNotes} onChange={(event) => updateNewPropertyField('landPaymentNotes', event.target.value)} placeholder="تفاصيل الدفع أو ملاحظات" /></label>
                </div>
              </section>
            </>
          )}

          {newPropertyType === 'beitWatan' && (
            <section className="agent-form-section">
              <div className="agent-form-section-title"><span>١</span><div><h2>بيانات أرض بيت الوطن</h2><p>اختيارات المنطقة الفرعية تتغير حسب نوع المنطقة.</p></div></div>
              <div className="agent-form-grid">
                <label className="agent-form-field"><span>المنطقة <b>*</b></span><select required value={newPropertyForm.regionType} onChange={(event) => { const regionType = event.target.value; setNewPropertyForm((current) => ({ ...current, regionType, neighborhood: 'الأولى', neighborhoodSection: 'A', sector: regionType === 'البنفسج' ? 'N-A' : 'E' })); setPropertySubmitError(''); setPropertySubmitSuccess('') }}><option>الأكثر تميز</option><option>البنفسج</option><option>المحور المركزي المرحلة 11</option></select></label>
                {newPropertyForm.regionType === 'الأكثر تميز' && <>
                  <label className="agent-form-field"><span>المجاورة <b>*</b></span><select value={newPropertyForm.neighborhood} onChange={(event) => updateNewPropertyField('neighborhood', event.target.value)}><option>الأولى</option><option>الثانية</option><option>الثالثة</option><option>الرابعة</option><option>الخامسة</option><option>السادسة</option></select></label>
                  {newPropertyForm.neighborhood !== 'الثانية' && <label className="agent-form-field"><span>الاختيار A / B <b>*</b></span><select value={newPropertyForm.neighborhoodSection} onChange={(event) => updateNewPropertyField('neighborhoodSection', event.target.value)}><option value="A">A</option><option value="B">B</option></select></label>}
                </>}
                {newPropertyForm.regionType === 'البنفسج' && <label className="agent-form-field"><span>القطاع <b>*</b></span><select value={newPropertyForm.sector} onChange={(event) => updateNewPropertyField('sector', event.target.value)}>{['N-A','N-B','N-C','N-D','N-E','N-F','N-G'].map((sector) => <option key={sector}>{sector}</option>)}</select></label>}
                {newPropertyForm.regionType === 'المحور المركزي المرحلة 11' && <label className="agent-form-field"><span>القطاع <b>*</b></span><select value={newPropertyForm.sector} onChange={(event) => updateNewPropertyField('sector', event.target.value)}>{['E','B','C','D'].map((sector) => <option key={sector}>{sector}</option>)}</select></label>}
                <label className="agent-form-field"><span>رقم القطعة <b>*</b></span><input required value={newPropertyForm.pieceNumber} onChange={(event) => updateNewPropertyField('pieceNumber', event.target.value)} placeholder="رقم القطعة" /></label>
                <label className="agent-form-field"><span>المساحة (م²) <b>*</b></span><input required min="1" type="number" value={newPropertyForm.area} onChange={(event) => updateNewPropertyField('area', event.target.value)} placeholder="المساحة" /></label>
                <label className="agent-form-field"><span>المدفوع بالدولار (اختياري)</span><input min="0" type="number" value={newPropertyForm.paidUsd} onChange={(event) => updateNewPropertyField('paidUsd', event.target.value)} placeholder="المبلغ المدفوع بالدولار" /></label>
                <label className="agent-form-field"><span>المبلغ (ج.م) <b>*</b></span><input required min="1" type="number" value={newPropertyForm.amount} onChange={(event) => updateNewPropertyField('amount', event.target.value)} placeholder="المبلغ" /></label>
                <label className="agent-form-field"><span>اسم المالك (اختياري)</span><input value={newPropertyForm.beitOwnerName} onChange={(event) => updateNewPropertyField('beitOwnerName', event.target.value)} placeholder="اسم المالك" /></label>
                <label className="agent-form-field"><span>رقم المالك <b>*</b></span><input required type="tel" dir="ltr" value={newPropertyForm.beitOwnerPhone} onChange={(event) => updateNewPropertyField('beitOwnerPhone', event.target.value)} placeholder="رقم الهاتف" /></label>
                <label className="agent-form-field agent-form-field-wide"><span>المميزات (اختياري)</span><textarea rows="2" value={newPropertyForm.beitFeatures} onChange={(event) => updateNewPropertyField('beitFeatures', event.target.value)} placeholder="المميزات" /></label>
                <label className="agent-form-field agent-form-field-wide"><span>ملاحظات (اختياري)</span><textarea rows="3" value={newPropertyForm.beitNotes} onChange={(event) => updateNewPropertyField('beitNotes', event.target.value)} placeholder="ملاحظات" /></label>
              </div>
            </section>
          )}

          {propertySubmitError && <div className="agent-form-feedback error" role="alert">{propertySubmitError}</div>}
          {propertySubmitSuccess && <div className="agent-form-feedback success" role="status">{propertySubmitSuccess}</div>}
          <div className="agent-property-submit-row">
            <p>سيظل العقار خارج قائمة العقارات المتاحة حتى تراجعه الإدارة وتوافق عليه.</p>
            <button type="submit" className="agent-primary-button">إرسال طلب الإضافة للإدارة <span aria-hidden="true">←</span></button>
          </div>
        </form>

        <section className="agent-submitted-properties-section">
          <div className="agent-section-header"><div><h2>طلبات الإضافة التي أرسلتها</h2><p>تابع حالة كل طلب بعد مراجعته من الإدارة.</p></div><span className="agent-property-total">{n(activeRequests.length)} طلب</span></div>
          {activeRequests.length === 0 ? (
            <div className="agent-card agent-properties-empty"><span className="agent-empty-icon">▤</span><h2>لا توجد طلبات إضافة حتى الآن</h2><p>عند إرسال أول عقار سيظهر هنا بحالة المراجعة.</p></div>
          ) : (
            <div className="agent-property-submission-list">
              {activeRequests.map((request) => {
                const data = request.data || {}
                const typeLabel = request.type === 'apartment' ? 'شقة' : request.type === 'land' ? 'أرض عادية' : 'أرض بيت الوطن'
                const record = data.regionLabel || (data.zone ? `المنطقة ${data.zone}` : '')
                return (
                  <article className="agent-card agent-submitted-property-card" key={request.id}>
                    <div><p className="agent-listing-kicker">{typeLabel} · {request.submittedAt}</p><h3>قطعة {data.pieceNumber || '—'} {record ? `— ${record}` : ''}</h3><p>المساحة: {data.area ? `${n(data.area)} م²` : '—'} · المبلغ: {formatPrice(data.totalPrice || data.landAmount || data.amount || 0)}</p>{request.rejectionReason && <p className="agent-submission-rejection">سبب الرفض: {request.rejectionReason}</p>}{request.reviewedAt && <small>تاريخ القرار: {request.reviewedAt}</small>}</div>
                    <span className={`agent-status-label ${request.status === 'approved' ? 'completed' : request.status === 'rejected' ? 'rejected' : 'pending'}`}>{requestStatusLabel(request.status)}</span>
                  </article>
                )
              })}
            </div>
          )}
        </section>
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

      {ownerRequests.length === 0 ? (
        <div className="agent-card agent-properties-empty">
          <span className="agent-empty-icon">▤</span>
          <h2>لا توجد طلبات حتى الآن</h2>
          <p>من صفحة العقارات، اضغط «طلب رقم المالك» على العقار المطلوب.</p>
          <button type="button" className="agent-primary-button" onClick={() => navigateTo('properties')}>تصفّح العقارات</button>
        </div>
      ) : (
        <div className="agent-request-list">
          {ownerRequests.map((request) => (
            <article className="agent-card agent-owner-request-card" key={request.id}>
              <div className="agent-owner-request-topline">
                <div>
                  <p className="agent-listing-kicker">طلب رقم المالك · {request.submittedAt}</p>
                  <h2>قطعة {displayZone(request.property.building)} — المنطقة {displayZone(request.property.zone)}</h2>
                </div>
                <span className={`agent-status-label ${request.status === 'approved' ? 'completed' : request.status === 'pending' ? 'pending' : 'rejected'}`}>
                  {request.status === 'pending' ? 'قيد المراجعة' : request.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                </span>
              </div>

              <p className="agent-owner-request-summary">
                {request.property.type && request.property.type !== 'apartment'
                  ? `${request.property.typeLabel || 'أرض'} · ${request.property.regionLabel || `المنطقة ${displayZone(request.property.zone)}`} · مساحة ${n(request.property.area)} م² · ${formatPrice(request.property.price)}`
                  : `شقة ${n(request.property.area)} م² · الدور ${request.property.floor || '—'} · ${request.property.facing || '—'} · ${formatPrice(request.property.price)}`}
              </p>
              {request.note && <p className="agent-owner-request-note">ملاحظة الوكيل: {request.note}</p>}
              {request.reviewedAt && <p className="agent-owner-request-note">تاريخ القرار: {request.reviewedAt}</p>}

              {request.status === 'pending' && (
                <p className="agent-request-pending-note">تم إرسال الطلب إلى الإدارة. ستظهر بيانات المالك هنا في الرسائل عند الموافقة.</p>
              )}

              {request.status === 'approved' && (
                <button type="button" className="agent-text-button agent-open-messages-button" onClick={() => navigateTo('messages')}>
                  تمت الموافقة وإرسال بيانات المالك — فتح الرسائل ←
                </button>
              )}
              {request.status === 'rejected' && <p className="agent-request-rejected-note">لم تتم مشاركة بيانات المالك. يمكنك تقديم طلب جديد من صفحة العقارات إذا لزم الأمر.</p>}
            </article>
          ))}
        </div>
      )}
      <p className="agent-properties-disclaimer">تتم مراجعة الطلبات من خلال لوحة الإدارة. لا تظهر بيانات المالك إلا بعد الموافقة.</p>
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
                {message.ownerDataIsDemo && <p className="agent-demo-owner-data">بيانات توضيحية للاختبار فقط — لم تُربط قاعدة بيانات المُلّاك الفعلية بعد.</p>}
                <div className="agent-owner-message-meta">
                  <span>المنطقة {displayZone(message.zone)}</span>
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



          <div className="agent-topbar-actions">
            <button
              className="agent-role-switch"
              type="button"
              onClick={onSwitchToAdmin}
            >
              <span aria-hidden="true">▣</span>
              معاينة لوحة الإدارة
            </button>

            <button
              className="agent-theme-toggle"
              type="button"
              onClick={() => setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light')}
              aria-label={`التبديل إلى ${theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}`}
            >
              <span>{theme === 'light' ? '☾' : '☀'}</span>
              <span>{theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}</span>
            </button>
          </div>

        </header>



        <div className="agent-page-content">

          {activePage === 'dashboard' && renderDashboard()}
          {activePage === 'properties' && renderProperties()}
          {activePage === 'addProperty' && renderAddProperty()}
          {activePage === 'requests' && renderRequests()}
          {activePage === 'messages' && renderMessages()}
          {activePage === 'tasks' && renderTasks()}
          {!['dashboard', 'properties', 'addProperty', 'requests', 'messages', 'tasks'].includes(activePage) && renderOtherPage()}

        </div>

      </main>

    </div>

  )

}
